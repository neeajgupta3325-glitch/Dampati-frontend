import { useEffect, useState } from "react";

function ReceivedInterests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);

  const fetchInterests = async () => {
    const userId = localStorage.getItem("userid");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      setError("Please log in to view received interests.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/interests/received?receiverId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      setInterests(data);
      setError("");
    } catch (err) {
      console.error("Received interests error:", err);
      setError("Could not load received interests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  const respondToInterest = async (interestId, status) => {
    const userId = localStorage.getItem("userid");
    const token = localStorage.getItem("token");

    setRespondingId(interestId);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/interests/${interestId}/respond?receiverId=${userId}&status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed: ${response.status}`);
      }

      await fetchInterests();
    } catch (err) {
      setError(err.message || "Could not respond to interest.");
    } finally {
      setRespondingId(null);
    }
  };

  if (loading) {
    return <p>Loading received interests...</p>;
  }

  return (
    <div className="received-interests">
      <h2>Received Interests</h2>

      {error && <p>{error}</p>}
      {interests.length === 0 ? (
        <p>You haven't received any interests yet.</p>
      ) : (
        interests.map((interest) => (
          <div key={interest.id} className="interest-card">
            <h3>{interest.senderName || "Unknown user"}</h3>
            <p>Status: {interest.status || "PENDING"}</p>
            <p>
              Received:{" "}
              {interest.createdAt
                ? new Date(interest.createdAt).toLocaleString()
                : "Not available"}
            </p>

            {interest.status?.toUpperCase() === "PENDING" && (
              <div>
                <button
                  onClick={() => respondToInterest(interest.id, "ACCEPTED")}
                  disabled={respondingId === interest.id}
                >
                  {respondingId === interest.id ? "Please wait..." : "Accept"}
                </button>
                <button
                  onClick={() => respondToInterest(interest.id, "DECLINED")}
                  disabled={respondingId === interest.id}
                >
                  {respondingId === interest.id ? "Please wait..." : "Decline"}
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ReceivedInterests;
