// src/types/products.ts

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  affiliateLink: string;
  imgUrl: string;
  brand: string;
  retailer: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  asin?: string;
  slug: string;
  tags?: string[];
  sports: string[];
  rating?: number;
  numReviews?: number;
  category?: string;
  features?: string[];
  source?: string;
  lastSyncedAt?: string;
  isValid?: boolean;
  upc?: string;
  ean?: string;
  gtin?: string;
  isAmazonFallback?: boolean; // only used on frontend fallbacks
  trending?: boolean; // in case backend sends it differently
}

export interface ProductCardProps {
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
  rating?: number;
  numReviews?: number;
  source?: string;
  lastSyncedAt?: string;
}

export type SortOption = "" | "priceLow" | "priceHigh";

export interface Filters {
  brand: string;
  sport: string;
  sortOption: SortOption;
}
