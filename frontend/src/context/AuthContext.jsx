import { createContext, useContext, useState } from "react";

// Global auth/user state, shared across Navbar, Login, Signup and
// ItemDetail via useContext instead of being prop-drilled through App.
//
// NOTE ON SCOPE: this only tracks *who the app currently thinks is logged
// in*, in memory, on the client. There is no password check, no token, and
// nothing persisted. Real authentication (hashed passwords + JWT issued by
// the backend, verified on protected routes) is Experiment 6. This
// experiment is only about wiring one piece of state through the app with
// useContext instead of passing a `user` prop down through every level.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user: null (logged out) | { name, email, role: "buyer" | "seller" | "admin" }
  const [user, setUser] = useState(null);

  function login(userInfo) {
    setUser(userInfo);
  }

  function logout() {
    setUser(null);
  }

  const value = { user, login, logout, isAuthenticated: Boolean(user) };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}
