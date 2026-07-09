"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Role = "public" | "admin" | "doctor";

interface AuthState {
  userRole: Role;
  doctorId: string | null;
  clinicId: string | null;
}

interface AuthContextType extends AuthState {
  loginAdmin: () => void;
  loginDoctor: (doctorId: string, clinicId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    userRole: "public",
    doctorId: null,
    clinicId: null,
  });

  useEffect(() => {
    const stored = localStorage.getItem("aethermed_auth");
    if (stored) {
      try {
        setAuthState(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse auth state");
      }
    }
  }, []);

  const loginAdmin = () => {
    const newState: AuthState = { userRole: "admin", doctorId: null, clinicId: null };
    setAuthState(newState);
    localStorage.setItem("aethermed_auth", JSON.stringify(newState));
  };

  const loginDoctor = (doctorId: string, clinicId: string) => {
    const newState: AuthState = { userRole: "doctor", doctorId, clinicId };
    setAuthState(newState);
    localStorage.setItem("aethermed_auth", JSON.stringify(newState));
  };

  const logout = () => {
    const newState: AuthState = { userRole: "public", doctorId: null, clinicId: null };
    setAuthState(newState);
    localStorage.removeItem("aethermed_auth");
    localStorage.removeItem('aether_user_bookings');
    localStorage.removeItem('aether_latest_metrics');
  };

  return (
    <AuthContext.Provider value={{ ...authState, loginAdmin, loginDoctor, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
