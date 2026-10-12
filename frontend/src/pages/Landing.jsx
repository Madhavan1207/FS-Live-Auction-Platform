import { Link } from "react-router-dom";
import FlapNumber from "../components/FlapNumber.jsx";

const closingSoon = [
  "Lot 014 — Brass Telescope, closing in 12m",
  "Lot 022 — Oak Writing Desk, closing in 26m",
  "Lot 031 — Polaroid SX-70, closing in 41m",
  "Lot 008 — Persian Runner Rug, closing in 58m",
];

function Marquee() {
  const row = [...closingSoon, ...closingSoon]; // duplicated for seamless loop
  return (
    <div className="marquee-row bg-felt-dark border-y border-brass/20 overflow-hidden py-2.5">
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
        {row.map((text, i) => (
          <span key={i} className="text-brass/80 text-xs tracking-wide font-mono">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <main>
      {/* ---------- Hero ---------- */}
      <section className="relative bg-felt felt-grain overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
        {/* brass corner frame */}
        <div className="absolute inset-4 sm:inset-8 border border-brass/25 pointer-events-none rounded-sm" />

        <div className="relative max-w-6xl mx-auto px-6 sm:px-10 py-16 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-14 items-center w-full">
          <div>
            <span className="animate-stamp inline-block border-2 border-wax text-wax text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-sm rotate-[-8deg]">
              Live Now
            </span>

            <h1 className="mt-6 font-display italic text-5xl sm:text-6xl lg:text-7xl text-parchment leading-[1.05]">
              Every lot tells
              <br />a story.
            </h1>
            <p className="mt-5 text-brass-light/90 text-base sm:text-lg max-w-md font-sans">
              Local goods, real bidders, no reserve games. Watch the price move
              in real time and take the lot home yourself.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/get-started"
                className="px-6 py-3 bg-brass text-felt-dark font-semibold text-sm rounded-sm hover:bg-brass-light transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/browse"
                className="px-6 py-3 border border-brass/50 text-parchment font-semibold text-sm rounded-sm hover:bg-felt-light transition-colors"
              >
                Browse the Catalogue
              </Link>
            </div>
          </div>

          {/* Split-flap ticker card */}
          <div className="bg-felt-light/60 border border-brass/25 rounded-md p-6 sm:p-8 backdrop-blur-sm">
            <p className="text-brass/70 text-[11px] font-mono tracking-[0.25em] uppercase mb-3">
              Lot 014 · Current Top Bid
            </p>
            <FlapNumber value={247} prefix="$" />
            <p className="mt-4 text-parchment/60 text-xs font-mono">
              9 bids · closing in 12m
            </p>
          </div>
        </div>
      </section>

      <Marquee />
    </main>
  );
}
