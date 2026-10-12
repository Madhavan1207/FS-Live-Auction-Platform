import { createContext, useContext, useEffect, useState } from "react";

// Experiment 6 connection: this used to just hold a plain {name, role}
// object pushed in by Login/Signup with no backend involved at all. Now
// it calls the real /api/auth endpoints, stores the JWT the backend
// issues, and attaches that token to every request that needs it (see
// mockApi.js's authFetch).

import { API_BASE_URL } from "../config.js";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Lazy-init from localStorage so a page refresh doesn't log the user
  // out — Experiment 2's version reset on every refresh since it only
  // lived in React state.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));

  // On first load, if we have a saved token, confirm it's still valid
  // (not expired / user not deleted) by calling /api/auth/me, instead of
  // blindly trusting whatever was in localStorage.
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Session expired");
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        // Token is invalid/expired — clear the stale session.
        setUser(null);
        setToken(null);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      });
    // Only run once on mount — deliberately not re-checking on every
    // render, just validating whatever was there at load time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persistSession(userData, jwt) {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("auth_token", jwt);
  }

  async function loginUser(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    persistSession(data.user, data.token);
  }

  async function registerUser({ name, email, password, role }) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    persistSession(data.user, data.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loginUser,
    registerUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}