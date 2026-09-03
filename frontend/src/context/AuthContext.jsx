import { createContext, useContext, useEffect, useState } from "react";
import { adminApi, AUTH_STORAGE_KEY } from "../api/client.js";

const AuthContext = createContext(null);

function readToken() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))?.token || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .me()
      .then(setAdmin)
      .catch(() => {
        // token expired/invalid — clear it
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setToken(null);
        setAdmin(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const data = await adminApi.login(email, password);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: data.token }));
    setToken(data.token);
    setAdmin(data.admin);
    return data.admin;
  }

  function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setAdmin(null);
  }

  const value = { admin, token, loading, login, logout, setAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
