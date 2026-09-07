import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    // Scope note: there is no backend yet and no password check here — that
    // arrives with JWT auth in Experiment 6. For now this only demonstrates
    // useContext: submitting the form pushes a user object into the global
    // AuthContext so the rest of the app (Navbar, ItemDetail) reacts to it.
    login({ name: email.split("@")[0] || "Guest", email, role: "buyer" });
    navigate("/browse");
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Welcome Back</h1>
        <p className="text-sm text-gray-500 text-center mt-1">
          Log in to bid on live auctions.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-light"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-light"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-md bg-auction text-white font-semibold hover:bg-blue-900 transition-colors"
          >
            Log In
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-auction-light font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
