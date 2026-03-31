import React, { createContext, useContext, useState } from "react";

type AuthContextType = {
  user: string | null;
  login: (username: string, password: string) => { ok: boolean; error?: string };
  register: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => ({ ok: false }),
  register: () => ({ ok: false }),
  logout: () => {},
});

const USERS: Record<string, string> = {
  user: "user",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  const login = (username: string, password: string) => {
    const u = username.trim().toLowerCase();
    if (USERS[u] && USERS[u] === password) {
      setUser(u);
      return { ok: true };
    }
    return { ok: false, error: "Invalid credentials. Access denied." };
  };

  const register = (username: string, password: string) => {
    const u = username.trim().toLowerCase();
    if (!u || !password) return { ok: false, error: "All fields are required." };
    if (USERS[u]) return { ok: false, error: "Archive ID already exists." };
    if (password.length < 4) return { ok: false, error: "Quantum Key too short." };
    USERS[u] = password;
    setUser(u);
    return { ok: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
