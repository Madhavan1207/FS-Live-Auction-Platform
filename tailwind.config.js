/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Auction-house palette: felt table, brass fittings, wax-seal red, catalogue paper
        felt: {
          DEFAULT: "#16332A",
          light: "#1F4638",
          dark: "#0D211B",
        },
        brass: {
          DEFAULT: "#C6A15B",
          light: "#E4C98A",
          dark: "#8F7238",
        },
        wax: "#9C3B2E",
        parchment: "#F3E9D2",
        ink: "#17231E",
        // Legacy alias kept so earlier experiment code doesn't break
        auction: {
          DEFAULT: "#16332A",
          light: "#C6A15B",
          accent: "#9C3B2E",
        },
      },
      fontFamily: {
        display: ["'Instrument Serif'", "serif"],
        mono: ["'Space Mono'", "monospace"],
        sans: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
