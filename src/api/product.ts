// src/api/product.ts

import api from "./axios";
import type { Product } from "../types/products";

// Small shared types
type ID = number | string;
type ReqOpts = { signal?: AbortSignal };

// Useful constants
const TRENDING_DEFAULT_LIMIT = 3;
const TRENDING_MAX_LIMIT = 6;

const asIdParam = (id: ID) => encodeURIComponent(String(id));
const asSlugParam = (slug: string) => encodeURIComponent(slug);

const clampLimit = (limit: number) => {
  const n = Number.isFinite(limit) ? Math.floor(limit) : TRENDING_DEFAULT_LIMIT;
  return Math.max(1, Math.min(TRENDING_MAX_LIMIT, n));
};

/**
 * NOTE:
 * If your Product type currently requires `id: number`,
 * consider making it optional: `id?: number`
 * because /trending-live items may be live (not stored) and have no DB id.
 */

// Fetch all products
export const fetchProducts = async (opts?: ReqOpts): Promise<Product[]> => {
  const { data } = await api.get<Product[]>("/products", { signal: opts?.signal });
  return Array.isArray(data) ? data : [];
};

// Fetch a single product by id (or stringified id)
export const fetchProductById = async (id: ID, opts?: ReqOpts): Promise<Product> => {
  const { data } = await api.get<Product>(`/products/${asIdParam(id)}`, {
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
  const { data } = await api.get<Product[]>(`/products/${asIdParam(productId)}/related`, {
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
export const createProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  const { data } = await api.post<Product>("/products/admin", product);
  return data;
};

// Update existing product (admin)
export const updateProduct = async (id: ID, product: Partial<Product>): Promise<Product> => {
  const { data } = await api.put<Product>(`/products/admin/${asIdParam(id)}`, product);
  return data;
};

// Delete product (admin)
export const deleteProduct = async (id: ID): Promise<void> => {
  await api.delete(`/products/admin/${asIdParam(id)}`);
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
  const clamped = clampLimit(limit);
  const { data } = await api.get<Product[]>("/products/trending-live", {
    params: { sport: sport?.trim() || undefined, limit: clamped },
    signal: opts?.signal,
  });
  return Array.isArray(data) ? data : [];
};

/**
 * Back-compat alias: previously hit /products/trending (DB).
 * Now defaults to the live endpoint.
 */
export const fetchTrendingProducts = async (opts?: ReqOpts): Promise<Product[]> => {
  const { data } = await api.get<Product[]>("/products/trending-live", {
    params: { limit: TRENDING_DEFAULT_LIMIT },
    signal: opts?.signal,
  });
  return Array.isArray(data) ? data : [];
};

// DB-backed trending (kept in case you ever need it)
export const fetchTrendingFromDb = async (opts?: ReqOpts): Promise<Product[]> => {
  const { data } = await api.get<Product[]>("/products/trending", { signal: opts?.signal });
  return Array.isArray(data) ? data : [];
};

// Fetch products by sport (DB-backed)
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
 * ensure server disambiguation (e.g., numeric slugs).
 */
export async function fetchProductBySlug(slug: string, opts?: ReqOpts): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${asSlugParam(slug)}`, {
    signal: opts?.signal,
  });
  return data;
}
