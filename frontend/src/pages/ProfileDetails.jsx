import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function ProfileDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:8080/api/profiles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load profiles");
        }
        return response.json();
      })
      .then((data) => {
        const selectedProfile = data.find(
          (item) => String(item.id) === String(id),
        );

        if (!selectedProfile) {
          throw new Error("Profile not found");
        }

        setProfile(selectedProfile);
      })
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading profile details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="profile-card">
      <h1>Profile Details</h1>

      <h2>{profile.name || "Unknown User"}</h2>
      <p>
        <strong>Gender:</strong>
        {profile.gender || "Not specified"}
      </p>
      <p>
        <strong>Date of Birth:</strong>
        {profile.dateOfBirth || "Not specified"}
      </p>
      <p>
        <strong>Religion:</strong>
        {profile.religion || "Not specified"}
      </p>
      <p>
        <strong>Mother Tongue:</strong>
        {profile.motherTongue || "Not specified"}
      </p>
      <p>
        <strong>Location:</strong>
        {profile.location || "Not specified"}
      </p>
      <p>
        <strong>Education:</strong>
        {profile.education || "Not specified"}
      </p>
      <p>
        <strong>Occupation:</strong>
        {profile.occupation || "Not specified"}
      </p>

      <button onClick={() => navigate(-1)}>Back to Search Profiles</button>
    </div>
  );
}

export default ProfileDetails;
