// src/api/product.ts

import api from "./axios";
import type { Product } from "../types/products";

// Fetch all products (optionally paginated/filterable if your backend supports)
export const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await api.get("/products");
  return data;
};

// Fetch a single product by id
export const fetchProductById = async (id: number | string): Promise<Product> => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

// Fetch featured products
export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const { data } = await api.get("/products/featured");
  return data;
};

// Fetch related products for a given product
export const fetchRelatedProducts = async (productId: number | string): Promise<Product[]> => {
  const { data } = await api.get(`/products/${productId}/related`);
  return data;
};

// Search products (by query string)
export const searchProducts = async (query: string): Promise<Product[]> => {
  const { data } = await api.get("/products/search", { params: { query } });
  return data;
};

// Bulk fetch products by array of ids
export const bulkFetchProducts = async (ids: (number | string)[]): Promise<Product[]> => {
  const { data } = await api.post("/products/bulk-fetch", { ids });
  return data;
};

// Create new product (admin)
export const createProduct = async (product: Omit<Product, "id">) => {
  return api.post("/products/admin", product, { withCredentials: true });
};

// Update existing product (admin)
export const updateProduct = async (id: number | string, product: Partial<Product>) => {
  return api.put(`/products/admin/${id}`, product, { withCredentials: true });
};

// Delete product (admin)
export const deleteProduct = async (id: number | string) => {
  return api.delete(`/products/admin/${id}`, { withCredentials: true });
};

// Optionally: Fetch trending products
export const fetchTrendingProducts = async (): Promise<Product[]> => {
  const { data } = await api.get("/products/trending");
  return data;
};

// Optionally: Fetch products by sport
export const fetchProductsBySport = async (sport: string): Promise<Product[]> => {
  const { data } = await api.get("/products/by-sport", { params: { sport } });
  return data;
};

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const { data } = await api.get(`/products/${slug}`);
  return data;
}



