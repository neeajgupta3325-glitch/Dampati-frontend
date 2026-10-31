/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function ChatList() {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchChats = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in first.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/messages/chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load chats: ${response.status}`);
      }

      const data = await response.json();
      setChats(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchChats();
    const intervalId = setInterval(fetchChats, 2000);

    return () => clearInterval(intervalId);
  }, [fetchChats]);

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "20px auto",
        padding: "16px",
        background: "#111111",
        color: "#f5f5f5",
        border: "1px solid #292929",
        borderRadius: "12px",
        minHeight: "60vh",
      }}
    >
      {" "}
      <h2>My Chats</h2>
      <button onClick={() => navigate("/search-profile")}>+ New Chat</button>
      {error && <p>{error}</p>}
      {!error && chats.length === 0 && <p>No conversations yet.</p>}
      {chats.map((chat) => (
        <div
          key={chat.userId}
          onClick={() =>
            navigate(`/messages?receiverId=${chat.userId}`, { replace: true })
          }
          style={{
            padding: "15px",
            borderBottom: "1px solid #303039",
            cursor: "pointer",
          }}
        >
          <strong>{chat.name}</strong>
          {chat.unreadCount > 0 && (
            <span
              style={{
                marginLeft: "8px",
                background: "#b9f6ca",
                color: "#17231a",
                borderRadius: "12px",
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {chat.unreadCount}
            </span>
          )}
          <p
            style={{
              margin: "4px 0 0",
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <span>{chat.lastMessage}</span>
            <small style={{ opacity: 0.7, whiteSpace: "nowrap" }}>
              {chat.lastMessageTime
                ? new Date(chat.lastMessageTime).toDateString() ===
                  new Date().toDateString()
                  ? new Date(chat.lastMessageTime).toLocaleDateString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : new Date(chat.lastMessageTime).toLocaleDateString([], {
                      day: "2-digit",
                      month: "short",
                    })
                : ""}
            </small>
          </p>
        </div>
      ))}
    </div>
  );
}

export default ChatList;
