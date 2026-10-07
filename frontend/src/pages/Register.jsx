import { useState } from "react";
import "../styles/Register.css";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        mobile: "",
        gender: "",
        dateOfBirth: "",
        religion: "",
        motherTongue: "",
        location: "",
        education: "",
        occupation: ""

    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
       const handleSubmit = async (e) => {
        e.preventDefault();

        if(formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try { 
      const response = await fetch("http://localhost:8080/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    mobile: formData.mobile,
                    gender: formData.gender,
                    dateOfBirth: formData.dateOfBirth,
                    religion: formData.religion,
                    motherTongueL: formData.motherTongue,
                    location: formData.location,
                    education: formData.education,
                    occupation: formData.occupation
                })
            });
            if (response.ok) {
                alert("Registration successful!");
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: ""
                });
            } else {
                alert("Registraion failed");
            }
        } catch (error) {
            console.error(error);
            alert("Backend server is not running");
        }
       };
       
       return(
        <div className="register-container">
            <div className="register-card">

            <h2>Create Your Damapti Account</h2>

            <form className="register-form" onSubmit={handleSubmit}>
                <input 
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                />

                <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                />

                <input 
                type="password"
                name="password"
                placeholder="password"
                value={formData.password}
                onChange={handleChange}
                required
                />

                <input 
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                />

                <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                required
                />

                <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                />
                
                <input
                type="text"
                name="religion"
                placeholder="Religion"
                value={formData.religion}
                onChange={handleChange}
                />

                <input
                type="text"
                name="motherTongue"
                placeholder="Mother Tongue"
                value={formData.motherTongue}
                onChange={handleChange}
                />
                <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                />

                <input
                type="text"
                name="education"
                placeholder="Education"
                value={formData.education}
                onChange={handleChange}
                />
                
                <input
                type="text"
                name="occupation"
                placeholder="Occupation"
                value={formData.occupation}
                onChange={handleChange}
                required
                />


                <button type="submit">Register</button>
            </form>
            </div>
        </div>
       );
}

export default Register