export interface Product {
  id: number;
  name: string;
  sku?: string;
  regular_price?: string;
  sale_price?: string;
  stock_status?: "instock" | "outofstock" | "onbackorder";
  manage_stock?: boolean;
  stock_quantity?: number;
  description?: string;
  short_description?: string;
  status?: "publish" | "draft";
  images?: { src: string }[];
  categories?: { id: number; name: string }[];
}
