import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer"); // "buyer" | "seller"
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Experiment 6 connection: this now calls POST /api/auth/register,
      // which creates a real User document (password hashed by the model)
      // and returns a JWT — replacing Experiment 2's version, which never
      // touched a database at all.
      await registerUser({ name, email, password, role });
      navigate("/browse");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Create Account</h1>
        <p className="text-sm text-gray-500 text-center mt-1">
          Join as a buyer or start selling today.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-light"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-light"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I want to join as
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`py-2 rounded-md border-2 font-medium text-sm transition-colors ${
                  role === "buyer"
                    ? "border-auction bg-auction text-white"
                    : "border-gray-300 text-gray-600 hover:border-auction hover:text-auction"
                }`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`py-2 rounded-md border-2 font-medium text-sm transition-colors ${
                  role === "seller"
                    ? "border-auction bg-auction text-white"
                    : "border-gray-300 text-gray-600 hover:border-auction hover:text-auction"
                }`}
              >
                Seller
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-md bg-auction text-white font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-auction-light font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
