import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const DEMO_USERS = [
  { id: "1", username: "admin", password: "admin123", role: "Admin" },
  { id: "2", username: "dispatch", password: "dispatch123", role: "Dispatcher" },
  { id: "3", username: "pilot", password: "pilot123", role: "Pilot" },
  { id: "4", username: "viewer", password: "viewer123", role: "Viewer" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("johq_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = (username, password) => {
    const found = DEMO_USERS.find(
      u => u.username === username && u.password === password
    );
    if (!found) return { ok: false, error: "Invalid credentials" };
    const safeUser = { id: found.id, username: found.username, role: found.role };
    setUser(safeUser);
    localStorage.setItem("johq_user", JSON.stringify(safeUser));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("johq_user");
  };

  const value = useMemo(() => ({ user, login, logout, DEMO_USERS }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
