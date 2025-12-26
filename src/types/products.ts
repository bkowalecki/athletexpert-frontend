// src/types/products.ts

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  listPrice?: number;        // Amazon "ListPrice" (before discount)
  affiliateLink: string;
  imgUrl: string;
  images?: string[];         // Amazon can return multiple image variants
  brand: string;
  retailer: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  asin?: string;
  slug: string;
  tags?: string[];
  sports: string[];
  rating?: number;           // Amazon "AverageRating"
  numReviews?: number;       // Amazon "TotalReviewCount"
  category?: string;
  features?: string[];       // Amazon "ItemInfo.Features"
  source?: string;
  lastSyncedAt?: string;
  isValid?: boolean;
  upc?: string;
  ean?: string;
  gtin?: string;
  isAmazonFallback?: boolean;
  trending?: boolean;
  dimensions?: string;       // From Amazon "ItemInfo.ProductInfo" or "ItemDimensions"
  isPrime?: boolean;         // Amazon Prime eligible
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
