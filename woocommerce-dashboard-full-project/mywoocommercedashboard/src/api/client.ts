import { instance } from "./axios";
import { AuthData } from "../auth/auth-provider";
import { refreshJWT, getCurrentToken } from "../auth/strategies/jwt";

export const buildApiClient = (auth: AuthData) => {
  const baseURL = auth.storeUrl.replace(/\/$/, "") + "/wp-json/wc/v3";
  const client = instance.create({ baseURL });

  client.interceptors.request.use(async (config) => {
    if (auth.type === "woo-rest") {
      config.params = {
        ...config.params,
        consumer_key: auth.consumerKey,
        consumer_secret: auth.consumerSecret
      };
    } else if (auth.type === "jwt") {
      const token = getCurrentToken();
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response?.status === 403 &&
        auth.type === "jwt" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        const newToken = await refreshJWT(auth.storeUrl);
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};
