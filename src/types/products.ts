// src/types/products.ts

export interface Product {
    id?: number;
    name: string;
    description?: string;
    price: number;
    affiliateLink: string;
    imgUrl: string;
    brand: string;
    retailer: string;
    trending?: boolean;
    featured?: boolean;
    sports?: string[];
    asin?: string;
    isAmazonFallback?: boolean;
  }

  export interface ProductCardProps {
    id: number | string;
    name: string;
    brand: string;
    price: number | null;
    imgUrl: string;
    affiliateLink: string;
    isSaved?: boolean;
    onToggleSave?: () => void;
    isSaving?: boolean;
    isAmazonFallback?: boolean;
    isTrending?: boolean;
  }
  
  export type SortOption = "" | "priceLow" | "priceHigh";
  
  export interface Filters {
    brand: string;
    sport: string;
    sortOption: SortOption;
  }
  