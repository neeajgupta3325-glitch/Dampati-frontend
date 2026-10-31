import { useState, useEffect } from "react";

function PartnerPreferences() {
    
       const [formData, setFormData] = useState({
        preferredGender: "",
        preferredReligion: "",
        preferredMotherTongue: "",
        preferredLocation: "",
        preferredEducation: "",
        preferredOccupation: "",
        minAge: "",
        maxAge: "",
    });
     
    const [preferenceId, setPreferenceId] = useState(null);

   

    useEffect(() => {
    const userId = localStorage.getItem("userid");
    const token = localStorage.getItem("token");
    
    if(!userId || !token) return;

    fetch(`http://localhost:8080/api/preferences/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            if(!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;
            setPreferenceId(data.id);

            setFormData({
                preferredGender: data.preferredGender || "",
                preferredReligion: data.preferredReligion || "",
                preferredMotherTongue: data.preferredMotherTongue || "",
                preferredLocation: data.preferredLocation || "",
                preferredEducation: data.preferredEducation || "",
                preferredOccupation: data.preferredOccupation || "",
                minAge: data.minAge ?? "",
                maxAge: data.maxAge ?? ""
            });
        })
        .catch(error => console.error("Load preferences error:", error));
    }, []);

  
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

        const handleSubmit = async (e) => {
            e.preventDefault();

            const userId = localStorage.getItem("userid");
            const token = localStorage.getItem("token");

            const data = {
                ...formData,
                minAge: Number(formData.minAge),
                maxAge: Number(formData.maxAge)
            };

            const url = preferenceId
                ? `http://localhost:8080/api/preferences/${preferenceId}`
                : `http://localhost:8080/api/preferences?userId=${userId}`;

            const method = preferenceId ? "PUT" : "POST";

            try {
                const response = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const savedPreferences = await response.json();
                    setPreferenceId(savedPreferences.id);
                    alert("Partner preferences saved succesfully!");
                } else {
                    const message = await response.text();
                    console.error("Save error:", response.status, message);
                    alert(`Failed to save preferences. Status: ${response.status}`);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Could not connect to the backend.");
                
            }
        };

    return (
        <div>
            <h1>Partner Preferences</h1>
            <form onSubmit={handleSubmit}>
                <select
                name="preferredGender"
                value={formData.preferredGender}
                onChange={handleChange}
                >
                    <option value="">Preferred Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>

                <input
                    name="preferredReligion"
                    value={formData.preferredReligion}
                    onChange={handleChange}
                    placeholder="Preferred Religion"
                />

                <input 
                    name="preferredMotherTongue"
                    value={formData.preferredMotherTongue}
                    onChange={handleChange}
                    placeholder="Preferred Mother Tongue"
                />
                
                <input 
                    name="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={handleChange}
                    placeholder="Preferred Location"
                />

                <input 
                    name="preferredEducation"
                    value={formData.preferredEducation}
                    onChange={handleChange}
                    placeholder="Preferred Education"
                />

                <input
                    name="preferredOccupation"
                    value={formData.preferredOccupation}
                    onChange={handleChange}
                    placeholder="Preferred Occupation"
                />

                <input
                    type="number"
                    name="minAge"
                    value={formData.minAge}
                    onChange={handleChange}
                    placeholder="Minimum Age"
                />

                <input
                    type="number"
                    name="maxAge"
                    value={formData.maxAge}
                    onChange={handleChange}
                    placeholder="Maximum Age"
                />

                <button type="submit">
                    save Preferences
                </button>
            </form>
        </div>
    );
}

export default PartnerPreferences;