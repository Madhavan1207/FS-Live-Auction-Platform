import { Link } from "react-router-dom";

export default function GetStarted() {
  return (
    <section className="bg-felt felt-grain min-h-[calc(100vh-4rem)] flex items-center">
      <div className="max-w-3xl mx-auto px-6 py-20 w-full text-center">
        <span className="inline-block border-2 border-wax text-wax text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-sm rotate-[-8deg]">
          Step Inside
        </span>

        <h1 className="mt-6 font-display italic text-4xl sm:text-5xl text-parchment">
          How would you like to begin?
        </h1>
        <p className="mt-3 text-brass-light/80 font-sans max-w-md mx-auto">
          Already registered with the house, or joining the floor for the first time?
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            to="/login"
            className="group bg-felt-light/50 border border-brass/25 rounded-md p-8 text-left hover:border-brass hover:bg-felt-light/80 transition-colors"
          >
            <p className="text-brass text-[11px] font-mono tracking-[0.25em] uppercase mb-2">
              Returning
            </p>
            <h2 className="font-display italic text-2xl text-parchment">Log In</h2>
            <p className="mt-2 text-parchment/60 text-sm font-sans">
              Pick up right where you left off — active bids, watchlist, and all.
            </p>
            <span className="inline-block mt-5 text-brass text-sm font-semibold group-hover:translate-x-1 transition-transform">
              Continue →
            </span>
          </Link>

          <Link
            to="/signup"
            className="group bg-brass/90 border border-brass rounded-md p-8 text-left hover:bg-brass-light transition-colors"
          >
            <p className="text-felt-dark/70 text-[11px] font-mono tracking-[0.25em] uppercase mb-2">
              New Here
            </p>
            <h2 className="font-display italic text-2xl text-felt-dark">Start for Free</h2>
            <p className="mt-2 text-felt-dark/70 text-sm font-sans">
              Create an account in under a minute and place your first bid today.
            </p>
            <span className="inline-block mt-5 text-felt-dark text-sm font-semibold group-hover:translate-x-1 transition-transform">
              Create account →
            </span>
          </Link>
        </div>

        <Link
          to="/browse"
          className="inline-block mt-8 text-brass-light/60 text-xs font-mono tracking-wide hover:text-brass-light transition-colors"
        >
          Just browsing? Skip to the catalogue →
        </Link>
      </div>
    </section>
  );
}
