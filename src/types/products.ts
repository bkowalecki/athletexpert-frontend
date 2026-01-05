// src/types/products.ts

export type SortOption = "" | "priceLow" | "priceHigh";

export interface Filters {
  /** empty string means "any" */
  brand: string;
  /** empty string means "any" */
  sport: string;
  sortOption: SortOption;
}

/**
 * Canonical DB-backed product. In your app, most components assume an ID exists.
 */
export interface Product {
  id: number;
  name: string;

  description?: string;

  /** Price can be null when unknown/unavailable */
  price: number | null;

  /** Amazon list price (before discount) */
  listPrice?: number | null;

  affiliateLink: string;
  imgUrl: string;
  images?: string[];

  brand: string;

  /** Some feeds might omit retailer; keep optional to avoid brittle typing */
  retailer?: string;

  slug: string;

  tags?: string[];

  /** Some APIs may not include sports for every result */
  sports?: string[];

  rating?: number | null;
  numReviews?: number | null;

  category?: string;
  features?: string[];

  source?: string;
  lastSyncedAt?: string;

  isValid?: boolean;

  upc?: string;
  ean?: string;
  gtin?: string;

  asin?: string;

  isAmazonFallback?: boolean;

  /** UI flags (your code uses both forms in different places) */
  isFeatured?: boolean;
  isTrending?: boolean;
  trending?: boolean;

  dimensions?: string;
  isPrime?: boolean;
}

/**
 * For "live" / external products that may not exist in your DB yet.
 * Important: these do NOT have a guaranteed numeric `id`.
 */
export interface LiveProduct
  extends Omit<Product, "id" | "slug"> {
  /** Live items may have no DB id */
  id?: undefined;
  /** Prefer stable identifiers from source */
  asin: string;
  /** Slug may not exist on live items */
  slug?: string;
}

/** Union for places that handle both DB + live products */
export type AnyProduct = Product | LiveProduct;

export interface ProductCardProps {
  /** Card must always have a stable id for React keys; allow string for ASIN */
  id: number | string;
  name: string;
  brand: string;
  price: number | null;
  imgUrl: string;
  affiliateLink: string;
  slug: string;

  isSaved?: boolean;
  onToggleSave?: () => void;
  isSaving?: boolean;

  isAmazonFallback?: boolean;
  isTrending?: boolean;

  rating?: number | null;
  numReviews?: number | null;

  source?: string;
  lastSyncedAt?: string;

  asin?: string;

  imageLoading?: "lazy" | "eager";
  fetchPriority?: "auto" | "high" | "low";

  listIndex?: number;
  sourcePage?: string;
  onCardClick?: () => void;
}
