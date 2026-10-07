import { useNavigate } from "react-router-dom"

function Dashboard() {
    const navigate = useNavigate();
    return (
        <div>
            <h1>Welcome to Dampati</h1>
            <p>Your matrimonial dashboard</p>

            <div>
                <button onClick={(() => navigate("/profile"))}>My Profile</button>
                <button>Partner Preferences</button>
                <button>Search Profiles</button>
                <button>My Interests</button>
                <button>Shortlist</button>
                <button>Messages</button>
            </div>
        </div>
    )
}

export default Dashboard