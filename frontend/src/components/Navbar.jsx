import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  // useContext (via useAuth) instead of a `user` prop passed down from App —
  // this is the piece of Experiment 2 that lets any component in the tree
  // read/update who's logged in without prop drilling.
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="bg-felt-dark text-parchment border-b border-brass/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="font-display italic text-2xl tracking-tight">
          Live<span className="text-brass">Auction</span>
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-xs font-mono tracking-wide uppercase">
          <Link to="/browse" className="hover:text-brass transition-colors">
            Browse
          </Link>
          <Link to="/" className="hover:text-brass transition-colors">
            My Bids
          </Link>
          <Link to="/" className="hover:text-brass transition-colors">
            Sell
          </Link>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-mono text-brass-light/80">
              {user.name} · <span className="uppercase">{user.role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm font-medium rounded-sm border border-brass/40 hover:bg-white/5 transition-colors"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm font-medium rounded-sm hover:bg-white/5 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-1.5 text-sm font-semibold rounded-sm bg-brass text-felt-dark hover:bg-brass-light transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
