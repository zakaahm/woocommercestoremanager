import React, { createContext, useState, useContext, useEffect } from "react";
import { useLocalStorage } from "../utils/helpers";
import { login as jwtLogin } from "./strategies/jwt";
import { login as wooLogin } from "./strategies/woo-rest";
import { setAxiosAuth } from "../api/axios"; // 👈 DIT

export type AuthData = {
  storeUrl: string;
  type: "woo-rest" | "jwt";
  token: string;
  consumerKey?: string;
  consumerSecret?: string;
};

type AuthContextType = {
  auth: AuthData | null;
  setAuth: (auth: AuthData | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 🔹 1. Init auth uit localStorage
  const [storedAuth, setStoredAuth] =
    useLocalStorage<AuthData | null>("woo_dashboard_auth", null);

  const [auth, setAuthState] = useState<AuthData | null>(storedAuth);

  // 🔹 2. BIJ MOUNT: axios initialiseren met bestaande auth
  useEffect(() => {
    setAxiosAuth(storedAuth);
  }, [storedAuth]); // 👈 BELANGRIJK: dependency!

  // 🔹 3. Bij login / logout
  const setAuth = (auth: AuthData | null) => {
    setStoredAuth(auth);
    setAuthState(auth);
    setAxiosAuth(auth); // 👈 DIRECT syncen met axios
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

// Exporteer login functies
export const loginWithJWT = jwtLogin;
export const loginWithWooRest = wooLogin;
