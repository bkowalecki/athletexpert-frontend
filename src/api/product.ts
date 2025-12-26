// src/api/product.ts

import api from "./axios";
import type { Product } from "../types/products";

// Small shared types
type ID = number | string;
type ReqOpts = { signal?: AbortSignal };

// Centralize admin opts
const ADMIN_OPTS = { withCredentials: true } as const;

// Useful constants
const TRENDING_DEFAULT_LIMIT = 3;
const TRENDING_MAX_LIMIT = 6;

/**
 * NOTE: If your Product type currently requires `id: number`,
 * consider making it optional: `id?: number`
 * because /trending-live items may be live (not stored) and have no DB id.
 */

// Fetch all products (optionally paginated/filterable if your backend supports)
export const fetchProducts = async (opts?: ReqOpts): Promise<Product[]> => {
  const { data } = await api.get<Product[]>("/products", { signal: opts?.signal });
  return Array.isArray(data) ? data : [];
};

// Fetch a single product by id (or stringified id)
export const fetchProductById = async (id: ID, opts?: ReqOpts): Promise<Product> => {
  const { data } = await api.get<Product>(`/products/${encodeURIComponent(String(id))}`, {
    signal: opts?.signal,
  });
  return data;
};

// Fetch featured products
export const fetchFeaturedProducts = async (opts?: ReqOpts): Promise<Product[]> => {
  const { data } = await api.get<Product[]>("/products/featured", { signal: opts?.signal });
  return Array.isArray(data) ? data : [];
};

// Fetch related products for a given product
export const fetchRelatedProducts = async (productId: ID, opts?: ReqOpts): Promise<Product[]> => {
  const { data } = await api.get<Product[]>(`/products/${encodeURIComponent(String(productId))}/related`, {
    signal: opts?.signal,
  });
  return Array.isArray(data) ? data : [];
};

// Search products (by query string)
export const searchProducts = async (query: string, opts?: ReqOpts): Promise<Product[]> => {
  const q = query.trim();
  const { data } = await api.get<Product[]>("/products/search", {
    params: { query: q || undefined },
    signal: opts?.signal,
  });
  return Array.isArray(data) ? data : [];
};

// Bulk fetch products by array of ids
export const bulkFetchProducts = async (ids: ID[], opts?: ReqOpts): Promise<Product[]> => {
  if (!ids?.length) return [];
  const { data } = await api.post<Product[]>("/products/bulk-fetch", { ids }, { signal: opts?.signal });
  return Array.isArray(data) ? data : [];
};

// Create new product (admin)
export const createProduct = async (product: Omit<Product, "id">) => {
  return api.post("/products/admin", product, ADMIN_OPTS);
};

// Update existing product (admin)
export const updateProduct = async (id: ID, product: Partial<Product>) => {
  return api.put(`/products/admin/${encodeURIComponent(String(id))}`, product, ADMIN_OPTS);
};

// Delete product (admin)
export const deleteProduct = async (id: ID) => {
  return api.delete(`/products/admin/${encodeURIComponent(String(id))}`, ADMIN_OPTS);
};

/**
 * LIVE trending via PA-API (with server-side cache)
 *  - sport: optional, e.g. "golf", "running", "basketball"
 *  - limit: optional (default 3), max 6
 */
export const fetchTrendingLiveProducts = async (
  sport?: string,
  limit: number = TRENDING_DEFAULT_LIMIT,
  opts?: ReqOpts
): Promise<Product[]> => {
  const clamped = Math.max(1, Math.min(TRENDING_MAX_LIMIT, limit | 0));
  const { data } = await api.get<Product[]>("/products/trending-live", {
    params: { sport: sport?.trim() || undefined, limit: clamped },
    signal: opts?.signal,
  });
  return Array.isArray(data) ? data : [];
};

/**
 * Back-compat alias: previously hit /products/trending (DB).
 * Now we default to the live endpoint. If you still want the DB version,
 * keep a second function like `fetchTrendingFromDb` that calls /products/trending.
 */
export const fetchTrendingProducts = async (opts?: ReqOpts): Promise<Product[]> => {
  const { data } = await api.get<Product[]>("/products/trending-live", {
    params: { limit: TRENDING_DEFAULT_LIMIT },
    signal: opts?.signal,
  });
  return Array.isArray(data) ? data : [];
};

// Optionally: DB-backed trending only (kept in case you ever need it)
export const fetchTrendingFromDb = async (opts?: ReqOpts): Promise<Product[]> => {
  const { data } = await api.get<Product[]>("/products/trending", { signal: opts?.signal });
  return Array.isArray(data) ? data : [];
};

// Optionally: Fetch products by sport (DB-backed)
export const fetchProductsBySport = async (sport: string, opts?: ReqOpts): Promise<Product[]> => {
  const s = sport.trim();
  const { data } = await api.get<Product[]>("/products/by-sport", {
    params: { sport: s || undefined },
    signal: opts?.signal,
  });
  return Array.isArray(data) ? data : [];
};

/**
 * Fetch by slug.
 * If your backend uses the same /products/:param route for both id and slug,
 * make sure your server disambiguates numeric slugs appropriately.
 */
export async function fetchProductBySlug(slug: string, opts?: ReqOpts): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${encodeURIComponent(slug)}`, {
    signal: opts?.signal,
  });
  return data;
}
