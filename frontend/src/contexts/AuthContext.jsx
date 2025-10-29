// src/contexts/AuthContext.jsx
import { createContext, useContext } from "react";
import { useCurrentUser } from "../hooks/useAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: user, isLoading, error, refetch } = useCurrentUser();

  const value = {
    user,
    isLoading,
    error, // 👈 Nên expose error để debug
    isAuthenticated: !!user && !error,
    refetch,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook để sử dụng AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
