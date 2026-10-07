import { useEffect,  useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    
    
   useEffect(() => {
  const userId = localStorage.getItem("userid");
  const token = localStorage.getItem("token");
  

  fetch(`http://localhost:8080/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((response) => response.json())
    .then((data) => {
      setUser(data);
    })
    .catch((error) => {
      console.error(error);
    });
}, []);
    if (!user) {
        return <p>Loading...</p>;
    }
   return (
     <div>
        <h1>My Profile</h1>

        <button onClick={() => navigate("/edit-profile")}>
        Edit Profile
        </button>
        
        <p>Name: {user.name} </p>
        <p>Email: {user.email} </p>
        <p>Mobile: {user.mobile} </p>
        <p>Gender: {user.gender} </p>
        <p>Date of Birth: {user.dateOfBirth} </p>
        <p>Religion: {user.religion} </p>
        <p>Mother Tongue: {user.motherTongue} </p>
        <p>Location: {user.location} </p>
        <p>Education: {user.education} </p>
        <p>Occupation: {user.occupation} </p>
        <p>Profile information will apper here</p>
    </div>
   );
}

export default Profile;