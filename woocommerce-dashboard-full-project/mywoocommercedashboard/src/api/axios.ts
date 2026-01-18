import axios from "axios";
import { AuthData } from "../auth/auth-provider";

let auth: AuthData | null = null;

export function setAxiosAuth(authData: AuthData | null) {
  auth = authData;
}

const api = axios.create();

api.interceptors.request.use(config => {
  if (!auth) return config;

  // Base URL uit onboarding
  config.baseURL = `${auth.storeUrl}/wp-json/wc/v3`;

  // Woo REST auth
  if (auth.type === "woo-rest" && auth.consumerKey && auth.consumerSecret) {
    config.auth = {
      username: auth.consumerKey,
      password: auth.consumerSecret
    };
  }

  return config;
});

export default api;
