import { useMemo } from "react";
import type { Product, Filters } from "../types/products";

export function useFilteredProducts(
  products: Product[],
  filters: Filters
): Product[] {
  return useMemo(() => {
    const filtered = products.filter(
      (product) =>
        (!filters.brand || product.brand === filters.brand) &&
        (!filters.sport || product.sports?.includes(filters.sport))
    );

    if (filters.sortOption === "priceLow") {
      return [...filtered].sort((a, b) => {
        if (a.price == null && b.price == null) return 0;
        if (a.price == null) return 1; // nulls last
        if (b.price == null) return -1;
        return a.price - b.price;
      });
    }

    if (filters.sortOption === "priceHigh") {
      return [...filtered].sort((a, b) => {
        if (a.price == null && b.price == null) return 0;
        if (a.price == null) return 1; // nulls last
        if (b.price == null) return -1;
        return b.price - a.price;
      });
    }

    return filtered;
  }, [products, filters]);
}
