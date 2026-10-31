import { useEffect, useState } from "react";

function SentInterests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userid");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      setError("Please log in to view sent interests.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8080/api/interests/sent?senderId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setInterests(data))
      .catch((err) => {
        console.error("Sent interests error:", err);
        setError("Could not load sent interests.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading sent interests...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="sent-interests">
      <h2>Sent Interests</h2>

      {interests.length === 0 ? (
        <p>You haven't sent any interests yet.</p>
      ) : (
        interests.map((interest) => (
          <div key={interest.id} className="interest-card">
            <h3>{interest.receiverName || "Unknown user"}</h3>
            <p>Status: {interest.status || "PENDING"}</p>
            <p>
              sent:{" "}
              {interest.createdAt
                ? new Date(interest.createdAt).toLocaleString()
                : "Not available"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default SentInterests;
