// src/auth/hooks.ts
// (ja, de naam is niet ideaal, maar we volgen jouw structuur)

import { useAuth } from "./auth-provider";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";

/* =========================================================
   AUTH HOOKS
========================================================= */

/**
 * True als gebruiker ingelogd is.
 */
export function useIsAuthenticated(): boolean {
  const { auth } = useAuth();
  return auth !== null;
}

/**
 * Geeft auth data terug of null.
 */
export function useAuthOptional() {
  const { auth } = useAuth();
  return auth;
}

/**
 * Geeft auth data terug (verwacht dat routing auth al checkt).
 */
export function useAuthRequired() {
  const { auth } = useAuth();
  return auth;
}

/**
 * Geeft de WooCommerce store URL terug (of null).
 */
export function useStoreUrl(): string | null {
  const { auth } = useAuth();
  return auth?.storeUrl ?? null;
}

/**
 * Geeft de WooCommerce store URL terug (vereist login).
 */
export function useStoreUrlRequired(): string {
  const { auth } = useAuth();

  if (!auth?.storeUrl) {
    throw new Error("Store URL requested but user is not authenticated");
  }

  return auth.storeUrl;
}

/**
 * Geeft het auth type terug.
 */
export function useAuthType(): "jwt" | "woo-rest" | null {
  const { auth } = useAuth();
  return auth?.type ?? null;
}

/* =========================================================
   PRODUCTS – REACT QUERY HOOK
========================================================= */

export type Product = {
  id: number;
  name: string;
  price: string;
};

/**
 * Haalt producten op met server-side pagination (WooCommerce).
 */
export function useProducts(page: number, perPage: number) {
  return useQuery({
    queryKey: ["products", page, perPage],
    queryFn: async () => {
      const response = await axios.get<Product[]>("/products", {
        params: {
          page,
          per_page: perPage
        }
      });

      return {
        data: response.data,
        total: Number(response.headers["x-wp-total"]),
        totalPages: Number(response.headers["x-wp-totalpages"])
      };
    },
    keepPreviousData: true
  });
}
