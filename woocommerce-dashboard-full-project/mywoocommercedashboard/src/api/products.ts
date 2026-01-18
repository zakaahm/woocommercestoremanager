// src/api/products.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axios";
import { Product } from "../types/product";

// Fetch all paginated products
export async function fetchProducts(page: number, perPage: number) {
  const response = await axios.get<Product[]>("/products", {
    params: { page, per_page: perPage }
  });

  return {
    data: response.data,
    total: Number(response.headers["x-wp-total"]),
    totalPages: Number(response.headers["x-wp-totalpages"])
  };
}

// React Query hook: list products
export function useProducts(page = 1, perPage = 10) {
  return useQuery({
    queryKey: ["products", page],
    queryFn: () => fetchProducts(page, perPage)
  });
}

// React Query hook: get product by ID
export function useGetProduct(id?: string, options = {}) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axios.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
    ...options
  });
}

// React Query hook: create product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const res = await axios.post("/products", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
}

// React Query hook: update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Product> & { id: number }) => {
      const res = await axios.put(`/products/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
}

// React Query hook: delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axios.delete(`/products/${id}?force=true`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
}
export type Category = {
  id: number;
  name: string;
  slug: string;
};

export async function fetchCategories(): Promise<Category[]> {
  const res = await axios.get("/products/categories", {
    params: { per_page: 100 }
  });
  return res.data;
}

// src/api/attributes.ts

import axios from "./axios";

// WooCommerce attribute item (bijv. merk, kleur, maat)
export type Attribute = {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
};

// Term voor een attribute (de daadwerkelijke waarden, bijv. “IWC”)
export type AttributeTerm = {
  id: number;
  name: string;
  slug: string;
};

// Haal alle product attributes op
export async function fetchAttributes(): Promise<Attribute[]> {
  const res = await axios.get("/products/attributes", {
    params: { per_page: 50 }
  });
  return res.data;
}

// Haal de terms van één attribute op (waarden zoals merken)
export async function fetchAttributeTerms(attributeId: number): Promise<AttributeTerm[]> {
  const res = await axios.get(`/products/attributes/${attributeId}/terms`, {
    params: { per_page: 100 }
  });
  return res.data;
}
// type Brand
export type Brand = {
  id: number;
  name: string;
  slug: string;
};

// fetch all brands
export async function fetchBrands(): Promise<Brand[]> {
  const res = await axios.get("/products/brands", {
    params: { per_page: 100 }
  });
  return res.data;
}
