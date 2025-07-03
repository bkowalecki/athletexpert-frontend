import { useMemo } from "react";
import type { Product, Filters } from "../types/products";

export function useFilteredProducts(
  products: Product[],
  filters: Filters
): Product[] {
  return useMemo(() => {
    return products
      .filter(
        (product) =>
          (!filters.brand || product.brand === filters.brand) &&
          (!filters.sport || product.sports?.includes(filters.sport))
      )
      .sort((a, b) => {
        if (filters.sortOption === "priceLow") return a.price - b.price;
        if (filters.sortOption === "priceHigh") return b.price - a.price;
        return 0;
      });
  }, [products, filters]);
}
