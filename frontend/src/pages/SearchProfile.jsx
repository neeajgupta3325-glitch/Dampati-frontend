import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function SearchProfile() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [genderFilter, setGenderFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [religionFilter, setReligionFilter] = useState("");
  const [educationFilter, setEducationFilter] = useState("");
  const [shortlistedProfiles, setShortlistedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userid");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8080/api/profiles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Requsest failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setProfiles(data))
      .catch(() => setError("Could not load profiles. please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading profiles...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Search profiles</h1>
      <select
        value={genderFilter}
        onChange={(e) => setGenderFilter(e.target.value)}
      >
        <option value="">All Genders</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      <input
        type="text"
        placeholder="Search by location"
        value={locationFilter}
        onChange={(e) => setLocationFilter(e.target.value)}
      />

      <input
        type="text"
        placeholder="Search by religion"
        value={religionFilter}
        onChange={(e) => setReligionFilter(e.target.value)}
      />

      <input
        type="text"
        placeholder="Search by education"
        value={educationFilter}
        onChange={(e) => setEducationFilter(e.target.value)}
      />

      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>

      <button
        onClick={() => {
          setGenderFilter("");
          setLocationFilter("");
          setReligionFilter("");
          setEducationFilter("");
        }}
      >
        Clear Filters
      </button>

      {profiles.length === 0 ? (
        <p>No profiles found.</p>
      ) : (
        profiles
          .filter(
            (profile) =>
              (!genderFilter ||
                profile.gender?.toLowerCase() === genderFilter.toLowerCase()) &&
              (!locationFilter ||
                profile.location
                  ?.toLowerCase()
                  .includes(locationFilter.toLowerCase())) &&
              (!religionFilter ||
                profile.religion
                  ?.toLowerCase()
                  .includes(religionFilter.toLowerCase())) &&
              (!educationFilter ||
                profile.education
                  ?.toLowerCase()
                  .includes(educationFilter.toLowerCase())),
          )
          .map((profile) => (
            <div className="profile-card" key={profile.id}>
              <h3>{profile.name || "Unknown User"}</h3>
              <button
                onClick={() => navigate(`/profile-details/${profile.id}`)}
              >
                View Profile
              </button>

              <button
                onClick={() => {
                  if (!token) {
                    navigate("/login");
                    return;
                  }

                  if (String(userId) === String(profile.id)) {
                    alert("You cannot message yourself.");
                    return;
                  }

                  navigate(`/messages?receiverId=${profile.id}`, {
                    replace: true,
                  });
                }}
              >
                Message
              </button>

              <p>
                <strong>Gender:</strong> {profile.gender || "Not specified"}
              </p>
              <p>
                <strong>Religion:</strong> {profile.religion || "Not specified"}
              </p>
              <p>
                <strong>Location:</strong> {profile.location || "Not specified"}
              </p>
              <p>
                <strong>Education:</strong>{" "}
                {profile.education || "Not specified"}
              </p>
              <p>
                <strong>Occupation:</strong>{" "}
                {profile.occupation || "Not specified"}
              </p>
              <button
                onClick={async () => {
                  if (!userId || !token) {
                    alert("Please log in first.");
                    return;
                  }

                  try {
                    const response = await fetch(
                      `http://localhost:8080/api/shortlist?userId=${userId}&shortlistedUserId=${profile.id}`,
                      {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      },
                    );

                    if (response.ok) {
                      setShortlistedProfiles((previous) =>
                        previous.includes(profile.id)
                          ? previous
                          : [...previous, profile.id],
                      );
                      alert("Profile added to shortlist!");
                    } else {
                      const message = await response.text();
                      console.error("Shortlist error:", message);

                      if (response.status === 409) {
                        alert("This profile is already in your shortlist.");
                      } else {
                        alert(
                          `Could not add profile. Status: ${response.status}`,
                        );
                      }
                    }
                  } catch (error) {
                    console.error(error);
                    alert("Could not connect to the backend.");
                  }
                }}
              >
                {shortlistedProfiles.includes(profile.id)
                  ? "Shortlisted ✓"
                  : "Add to Shortlist"}
              </button>
              <button
                onClick={async () => {
                  if (!userId || !token) {
                    alert("Please log in first.");
                    return;
                  }

                  if (String(userId) === String(profile.id)) {
                    alert("You cannot send interest to your own profile.");
                    return;
                  }

                  try {
                    const response = await fetch(
                      `http://localhost:8080/api/interests?senderId=${userId}&receiverId=${profile.id}`,
                      {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      },
                    );

                    if (response.ok) {
                      alert("Interest sent successfully!");
                    } else {
                      const message = await response.text();
                      console.error("Send interest error:", message);

                      if (response.status === 409) {
                        // message.includes("already sent interest")
                        alert(
                          "You have already sent interest to this profile.",
                        );
                      } else {
                        alert(
                          `Interest could not be sent. Status: ${response.status}`,
                        );
                      }
                    }
                  } catch (error) {
                    console.error("Send interest error:", error);
                    alert("Could not connect to the backend.");
                  }
                }}
              >
                Send Interest
              </button>
              <hr />
            </div>
          ))
      )}
    </div>
  );
}

export default SearchProfile;
