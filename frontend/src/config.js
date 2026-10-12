// Experiment 9: deployment settings. Until now the backend address was typed
// directly into three files as http://localhost:5000, which only works on
// your own machine. These values come from environment variables instead,
// so the same code runs locally (defaults below) and on Vercel (variables
// set in the Vercel dashboard).
//
//   VITE_API_URL           address of the deployed backend, no trailing slash
//   VITE_ENABLE_REALTIME   set to "false" on Vercel: serverless functions
//                          cannot hold WebSocket connections open
//
// `import.meta.env` is provided by Vite; it does not exist when the files are
// run by plain Node (the unit tests), hence the fallback to an empty object.
const env = import.meta.env ?? {};

export const API_ORIGIN = (env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
export const API_BASE_URL = `${API_ORIGIN}/api`;
export const ENABLE_REALTIME = env.VITE_ENABLE_REALTIME !== "false";