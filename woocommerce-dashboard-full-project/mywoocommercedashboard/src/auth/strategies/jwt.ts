import axios from "axios";
import { AuthData } from "../auth-provider";

let jwtToken = "";
let refreshToken = "";

export async function login(
  storeUrl: string,
  username: string,
  password: string
): Promise<AuthData> {
  const url = storeUrl.replace(/\/$/, "") + "/wp-json/jwt-auth/v1/token";
  const res = await axios.post(url, { username, password });
  jwtToken = res.data.token;
  refreshToken = res.data.refresh_token || ""; // optioneel

  return {
    storeUrl,
    type: "jwt",
    token: jwtToken
  };
}

export async function refreshJWT(storeUrl: string): Promise<string | null> {
  if (!refreshToken) return null;
  try {
    const url = storeUrl.replace(/\/$/, "") + "/wp-json/jwt-auth/v1/token/refresh";
    const res = await axios.post(url, { refresh_token: refreshToken });
    jwtToken = res.data.token;
    return jwtToken;
  } catch (err) {
    return null;
  }
}

export function getCurrentToken(): string {
  return jwtToken;
}
