import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import PartnerPreferences from "./pages/PartnerPreferences";
import SearchProfile from "./pages/SearchProfile";
import MyShortlist from "./pages/MyShortlist";
import ProfileDetails from "./pages/ProfileDetails";
import ReceivedInterests from "./pages/ReceivedInterests";
import SentInterests from "./pages/SentInterests";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import Messages from "./pages/Message";
import ChatList from "./pages/ChatList";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/partner-preferences" element={<PartnerPreferences />} />
        <Route path="/search-profile" element={<SearchProfile />} />
        <Route path="/my-shortlist" element={<MyShortlist />}></Route>
        <Route path="/profile-details/:id" element={<ProfileDetails />}></Route>
        <Route path="/sent-interests" element={<SentInterests />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/verify-otp" element={<VerifyOtp />}></Route>
        <Route path="/reset-password" element={<ResetPassword />}></Route>
        <Route path="/messages" element={<Messages />}></Route>
        <Route path="/chats" element={<ChatList />}></Route>
        <Route
          path="/received-interests"
          element={<ReceivedInterests />}
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
