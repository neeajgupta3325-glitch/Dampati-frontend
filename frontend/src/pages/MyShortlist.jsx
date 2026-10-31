import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";


function MyShortlist() {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const userId = localStorage.getItem("userid");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!userId || !token) {
            setError("Please log in first.");
            setLoading(false);
            return;
        }

        fetch(
            `http://localhost:8080/api/shortlist?userId=${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

            .then(response => {
                if (!response.ok) {
                     throw new Error(`Request failed: ${response.status}`);
                }
                return response.json();
            })
            .then(data => setProfiles(data))
            .catch(() => setError("Could not load your shortlist."))
            .finally(() => setLoading(false));

    }, [userId, token]);

    async function removeProfile(id) {
        try {
            const response = await fetch(
                `http://localhost:8080/api/shortlist/${id}?userId=${userId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Remove failed");
            }

            setProfiles(previous =>
                previous.filter(profile => profile.id !== id)
            );
        } catch {
            alert("Could not remove this profile.");
        }
    }

    if (loading) return <p>Loading shortlist...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Shortlist</h1>

            <button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
            </button>

            {profiles.length === 0 ? (
                <p>You have not shortlisted any profiles yet.</p>
                ) : (
                    profiles.map(item => (
                        <div className="profile-card" key={item.id}>
                            <h3>{item.shortlistedUser?.name || "Unknown User"}</h3>
                            <p>
                                <strong>Gender:</strong>{" "}
                                {item.shortlistedUser?.gender || "Not specified"}
                            </p>
                            <p>
                                <strong>Location:</strong>{" "}
                                {item.shortlistedUser?.location || "Not specified"}
                            </p>
                            <p>
                                <strong>Education:</strong>{" "}
                                {item.shortlistedUser?.education || "Not specified"}
                            </p>
                            <p>
                                <strong>Occupation:</strong>{" "}
                                {item.shortlistedUser?.occupation || "Not specified"}
                            </p>
                            <button onClick={() => removeProfile(item.id)}>
                                Remove from Shortlist
                            </button>
                        </div>
                    ))
                )}
        </div>
    )
}

export default MyShortlist;