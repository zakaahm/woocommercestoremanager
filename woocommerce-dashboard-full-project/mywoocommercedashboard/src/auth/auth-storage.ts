// src/auth/auth-storage.ts

import { AuthData } from "./types";
import axios from "../api/axios";

const AUTH_KEY = "auth";

export function getAuth(): AuthData | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuth(auth: AuthData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  axios.defaults.baseURL = auth.baseUrl;
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  axios.defaults.baseURL = "";
}
