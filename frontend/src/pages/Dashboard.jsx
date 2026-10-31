import { useNavigate } from "react-router-dom"

function Dashboard() {
    const navigate = useNavigate();
    return (
        <div>
            <h1>Welcome to Dampati</h1>
            <p>Your matrimonial dashboard</p>

            <div>
                <button onClick={(() => navigate("/profile"))}>My Profile</button>
                <button onClick={(() => navigate("/partner-preferences"))}>Partner Preferences</button>
                <button onClick={(() => navigate("/search-profile"))}>Search Profiles</button>
                <button onClick={(() => navigate("/my-interests"))}>My Interests</button>
                <button onClick={(() => navigate("/My-shortlist"))}>My Shortlist</button>
                <button onClick={(() => navigate("/received-interests"))}>Received Interests</button>
                <button onClick={(() => navigate("/sent-interests"))} >Sent Interests</button>
                <button onClick={(() => navigate("/chats"))}>Messages</button>
            </div>
        </div>
    )
}

export default Dashboard