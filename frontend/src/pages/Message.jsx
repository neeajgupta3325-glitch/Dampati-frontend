/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";

const API = "http://localhost:8080";

function Messages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const receiverId = searchParams.get("receiverId") || "";
  const userId = Number(localStorage.getItem("userid"));
  const token = localStorage.getItem("token");

  const [receiverName, setReceiverName] = useState("Loading...");
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);

  const clientRef = useRef(null);
  const connectedRef = useRef(false);
  const bottomRef = useRef(null);
  const chatContainerRef = useRef(null);

  const validReceiver =
    /^\d+$/.test(receiverId) &&
    Number(receiverId) > 0 &&
    Number(receiverId) !== userId;

  const mergeMessages = useCallback((incoming) => {
    if (!Array.isArray(incoming)) return;

    setMessages((previous) => {
      const combined = [...previous];

      incoming.forEach((message) => {
        const index = combined.findIndex(
          (item) => String(item.id) === String(message.id),
        );

        if (index === -1) {
          combined.push(message);
        } else {
          combined[index] = { ...combined[index], ...message };
        }
      });

      return combined.sort(
        (a, b) =>
          new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime(),
      );
    });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!token || !validReceiver) return;

    const response = await fetch(
      `${API}/api/messages?receiverId=${encodeURIComponent(receiverId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      throw new Error(`Unable to load messages (${response.status})`);
    }

    mergeMessages(await response.json());
  }, [token, validReceiver, receiverId, mergeMessages]);

  // Load receiver details and conversation history.
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!validReceiver) {
      setReceiverName("");
      setMessages([]);
      setError("Invalid receiver. Open a conversation from Chat List.");
      return;
    }

    let cancelled = false;

    async function loadConversation() {
      try {
        const [userResponse, messageResponse] = await Promise.all([
          fetch(`${API}/api/users/${receiverId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `${API}/api/messages?receiverId=${encodeURIComponent(receiverId)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ]);

        if (!userResponse.ok) {
          throw new Error("Unable to load receiver profile.");
        }

        if (!messageResponse.ok) {
          throw new Error(
            `Unable to load messages (${messageResponse.status})`,
          );
        }

        const user = await userResponse.json();
        const history = await messageResponse.json();

        if (!cancelled) {
          setReceiverName(user.name || "Messages");
          mergeMessages(Array.isArray(history) ? history : []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    setMessages([]);
    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [receiverId, token, validReceiver, navigate, mergeMessages]);

  // Connect to authenticated WebSocket and receive live messages.
  useEffect(() => {
    if (!token || !validReceiver) return;

    const client = new Client({
      brokerURL: `${API.replace("http", "ws")}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        connectedRef.current = true;
        setConnected(true);
        setError("");

        client.subscribe("/user/queue/messages", (frame) => {
          try {
            const message = JSON.parse(frame.body);

            const senderId = Number(message.senderId ?? message.sender?.id);
            const targetId = Number(message.receiverId ?? message.receiver?.id);

            // Display only messages belonging to this conversation.
            const belongsToConversation =
              (senderId === userId && targetId === Number(receiverId)) ||
              (senderId === Number(receiverId) && targetId === userId);

            if (belongsToConversation) {
              mergeMessages([message]);
            }
          } catch {
            setError("Received an invalid message from the server.");
          }
        });

        // Refresh history after connecting to cover missed messages.
        fetchMessages().catch((err) => setError(err.message));
      },

      onDisconnect: () => {
        connectedRef.current = false;
        setConnected(false);
      },

      onWebSocketClose: () => {
        connectedRef.current = false;
        setConnected(false);
      },

      onStompError: (frame) => {
        setError(frame.headers?.message || "WebSocket connection error.");
      },

      onWebSocketError: () => {
        setError("WebSocket connection failed. Check the backend.");
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      connectedRef.current = false;
      setConnected(false);
      clientRef.current = null;
      client.deactivate();
    };
  }, [token, validReceiver, receiverId, userId, mergeMessages, fetchMessages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [receiverId, messages.length]);

  const sendMessage = () => {
    if (!validReceiver || !token) {
      setError("Invalid receiver. Return to Chat List.");
      return;
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError("Please enter a message.");
      return;
    }

    if (trimmedContent.length > 2000) {
      setError("Message cannot exceed 2000 characters.");
      return;
    }

    if (sending) return;

    if (!connectedRef.current || !clientRef.current?.connected) {
      setError("Connecting to chat. Please try again in a moment.");
      return;
    }

    setSending(true);
    setError("");

    try {
      clientRef.current.publish({
        destination: "/app/chat.send",
        headers: {},
        body: JSON.stringify({
          receiverId: Number(receiverId),
          content: trimmedContent,
        }),
      });

      setContent("");
    } catch {
      setError("Message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!validReceiver || !token) return;

    const hasUnseenIncoming = messages.some(
      (m) =>
        Number(m.senderId ?? m.sender?.id) === Number(receiverId) && !m.seen,
    );
    if (!hasUnseenIncoming) return;

    fetch(`${API}/api/messages/seen?partnerId=${receiverId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return;
        setMessages((prev) =>
          prev.map((m) =>
            Number(m.senderId ?? m.sender?.id) === Number(receiverId)
              ? { ...m, seen: true }
              : m,
          ),
        );
      })
      .catch(() => {});
  }, [validReceiver, token, receiverId, messages]);

  useEffect(() => {
    if (!receiverId || !token || connected) return;

    const intervalId = setInterval(() => {
      fetchMessages().catch(() => {});
    }, 5000);

    return () => clearInterval(intervalId);
  }, [receiverId, token, connected, fetchMessages]);

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "20px auto",
        padding: "16px",
        color: "#f5f5f5",
        background: "#111111",
        minHeight: "80vh",
        border: "1px solid #292929",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <button
          onClick={() => navigate("/chats")}
          style={{
            padding: "9px 12px",
            background: "#252525",
            color: "#fff",
            border: "1px solid #444",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Back to Chats
        </button>

        <span
          style={{
            fontSize: "12px",
            color: connected ? "#4ade80" : "#fbbf24",
          }}
        >
          {connected ? "● Live" : "● Connecting..."}
        </span>
      </div>

      <h2 style={{ marginBottom: "4px" }}>{receiverName || "Messages"}</h2>

      {error && (
        <p role="alert" style={{ color: "#ff7070", fontSize: "14px" }}>
          {error}
        </p>
      )}

      <div
        ref={chatContainerRef}
        aria-live="polite"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "15px",
          marginTop: "15px",
          minHeight: "250px",
          maxHeight: "450px",
          overflowY: "auto",
          background: "#1b1b21",
          border: "1px solid #303039",
          borderRadius: "10px",
          flex: 1,
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#aaa", textAlign: "center" }}>
            No messages yet. Start a conversation!
          </p>
        )}

        {messages.map((message, index) => {
          const senderId = Number(message.senderId ?? message.sender?.id);
          const isMine = senderId === userId;

          return (
            <div
              key={message.id ?? `${message.sentAt}-${index}`}
              style={{
                alignSelf: isMine ? "flex-end" : "flex-start",
                background: isMine ? "#b9f6ca" : "#303039",
                color: isMine ? "#17231a" : "#f5f5f5",
                padding: "10px 14px",
                borderRadius: "12px",
                maxWidth: "75%",
                overflowWrap: "anywhere",
              }}
            >
              <strong style={{ fontSize: "12px" }}>
                {isMine
                  ? "You"
                  : message.senderName || message.sender?.name || receiverName}
              </strong>

              <div style={{ margin: "4px 0" }}>{message.content}</div>

              <small style={{ opacity: 0.75 }}>
                {message.sentAt
                  ? new Date(message.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
                {isMine && (
                  <span
                    style={{
                      marginLeft: "6px",
                      color: message.seen ? "#2563eb" : "#6b7280",
                      fontWeight: "bold",
                    }}
                  >
                    {message.seen ? "✓✓" : "✓"}
                  </span>
                )}
              </small>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <input
          style={{
            flex: 1,
            minWidth: 0,
            padding: "12px",
            background: "#202127",
            color: "#fff",
            border: "1px solid #444",
            borderRadius: "8px",
            outline: "none",
          }}
          type="text"
          maxLength={2000}
          placeholder="Type your message..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          disabled={!validReceiver || sending || !connected}
          style={{
            padding: "10px 18px",
            background: !connected ? "#444" : "#b9f6ca",
            color: !connected ? "#ccc" : "#17231a",
            border: "none",
            borderRadius: "8px",
            cursor: connected ? "pointer" : "not-allowed",
          }}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default Messages;
