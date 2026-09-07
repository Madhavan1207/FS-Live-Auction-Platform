import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Landing from "./pages/Landing.jsx";
import GetStarted from "./pages/GetStarted.jsx";
import Browse from "./pages/Browse.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/item/:id" element={<ItemDetail />} />
      </Routes>
    </div>
  );
}
