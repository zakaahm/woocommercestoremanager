// src/api/endpoints.ts

export const PRODUCTS = "/products";
export const CATEGORIES = "/products/categories";
export const ATTRIBUTES = "/products/attributes";
export const MEDIA = "/media";
export const USERS_ME = "/wp/v2/users/me"; // Alleen voor JWT-auth validatie

// JWT Auth endpoints (WordPress plugins)
export const JWT_LOGIN = "/wp-json/jwt-auth/v1/token";
export const JWT_REFRESH = "/wp-json/jwt-auth/v1/token/refresh";
