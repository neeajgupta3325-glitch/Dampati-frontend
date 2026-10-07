import { useEffect, useState } from "react";

function EditProfile() {

    const [formData, setFormData] = useState({

        name: "",
        email: "",
        mobile: "",
        gender: "",
        dateOfBirth: "",
        religion: "",
        motherTongue: "",
        location: "",
        education: "",
        occupation: ""
        
    });
    const userId = localStorage.getItem("userid");
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`http://localhost:8080/api/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => setFormData(data))
        .catch(error => console.error(error));
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmite = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `http://localhost:8080/api/users/${userId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                }
            );
            const result = await response.text();

            if (response.ok) {
                alert("Profile update successfully!");
                console.log(result);
            } else  {
                console.log("PUT Error:", response.status, result);
                alert("Failed to update profile");
                
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Edit Profile</h1>

            <form onSubmit={handleSubmite}>

                <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                />

                <input name="email" value={formData.email} onChange={handleChange} placeholder="Email"/>
                <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile" />
                <select name="gender" value={formData.gender} onChange={handleChange} >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                </select>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} placeholder="Date of Birth" />
                <input name="religion" value={formData.religion} onChange={handleChange} placeholder="Religion" />
                <input name="motherTongue" value={formData.motherTongue} onChange={handleChange} placeholder="Mother Tongue" />
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" />
                <input name="education" value={formData.education} onChange={handleChange} placeholder="Education" />
                <input name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Occupation" />

                <button type="submit">Update Profile</button>

            </form>
        </div>
    );
}

export default EditProfile;