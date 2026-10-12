import { io } from "socket.io-client";
import { API_ORIGIN, ENABLE_REALTIME } from "./config.js";

// One shared connection for the whole app (Experiment 8). It connects to
// the same server as the REST API; every component that needs live data
// imports this same instance instead of opening its own connection.
//
// Experiment 9: when real-time is switched off (the Vercel deployment) the
// socket is created but never connects, so the browser does not keep
// retrying a connection the serverless backend cannot accept.
export const socket = io(API_ORIGIN, { autoConnect: ENABLE_REALTIME });