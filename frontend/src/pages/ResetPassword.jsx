import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [NewPassword, setNewPassword] = useState("");

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8080/api/users/reset-password",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json"
           },
            body: JSON.stringify({
                email,
                password: NewPassword 
            })
        }
    );

      alert(await response.text());
      if (response.ok) {
        setEmail("");
        setNewPassword("");
        navigate("/login");
      }
    } catch {
      alert("Backend connection failed");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="New Password"
          value={NewPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
