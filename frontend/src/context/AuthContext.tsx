import React, { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";
import type { AuthUser, Role } from "../api/types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, registerNumber: string, role: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("oeps_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const persist = (token: string, u: AuthUser) => {
    localStorage.setItem("oeps_token", token);
    localStorage.setItem("oeps_user", JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const res = await client.post("/api/auth/login", { email, password });
    const { token, fullName, email: em, role } = res.data;
    persist(token, { fullName, email: em, role });
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    registerNumber: string,
    role: Role
  ) => {
    const res = await client.post("/api/auth/register", {
      fullName,
      email,
      password,
      registerNumber,
      role,
    });
    const { token, fullName: fn, email: em, role: r } = res.data;
    persist(token, { fullName: fn, email: em, role: r });
  };

  const logout = () => {
    localStorage.removeItem("oeps_token");
    localStorage.removeItem("oeps_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
