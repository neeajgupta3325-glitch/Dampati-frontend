import { useState } from "react";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
function Login() {
    const navigate = useNavigate();
    const [ formData, setFormData ] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch("http://localhost:8080/api/users/login",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });
        const text = await response.text();

        let user = {};
        try{
            user = JSON.parse(text);
        } catch {
            console.log("Server response:", text);
            
        }

        if(response.ok && user.user) {
            localStorage.setItem("token",user.token);
            localStorage.setItem("userid", user.user.id);
            console.log("Logged in user:", user);
            alert("Login successful!");
            navigate("/dashboard")
        } else {
            alert(user.message || "Invalid email or password");
        }
    } catch (error) {
        console.error(error);
        alert("Backend server is not running")
    }
};

    return (
        <div className="login-container">
        <div className="login-card">
        <h2>Welcome to Dampati</h2>

        <form className="login-form" onSubmit={handleSubmit}>
        <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        />

        <input
        type="password"
        name="password"
        placeholder="password"
        value={formData.password}
        onChange={handleChange}
        required
        />

        <button type="submit">Login</button>
        </form>
        <Link to="/forgot-password" >Forgot Password</Link>
        </div>
    </div>
    );    
}


export default Login;

