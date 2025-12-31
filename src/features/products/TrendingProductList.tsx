// src/components/trending/TrendingProductList.tsx

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../products/ProductCard";
import { useSavedProducts } from "../../hooks/useSavedProducts";
import { fetchTrendingLiveProducts } from "../../api/product";
import type { Product } from "../../types/products";
import "../../styles/TrendingProductList.css";

// 🟢 Skeleton
import ProductGridSkeleton from "./ProductGridSkeleton";

type Props = {
  /** Optional: narrow trending by sport (e.g., "golf", "running", "basketball") */
  sport?: string;
  /** Optional: how many to show (default 3, backend max 6) */
  limit?: number;
  /** Optional: section title override */
  title?: string;
};

const TrendingProductList: React.FC<Props> = ({ sport, limit = 3, title }) => {
  const { savedProductIds, toggleSaveProduct } = useSavedProducts();

  const savedSet = useMemo(
    () => new Set<number>(savedProductIds ?? []),
    [savedProductIds]
  );

  const headingId = useMemo(() => {
    const key = sport ? `trending-${sport}` : "trending-all";
    return `${key}-${limit}`;
  }, [sport, limit]);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<Product[], Error>({
    queryKey: ["trending-live", sport ?? "all", limit],
    queryFn: () => fetchTrendingLiveProducts(sport, limit),
    staleTime: 60_000, // cache for 60s (server also caches)
    retry: 1,
  });

  return (
    <section className="trending-products-section" aria-labelledby={headingId}>
      <div className="trending-products-container">
        <h2 id={headingId} className="trending-products-heading">
          {title ?? (sport ? `Trending in ${sport}` : "Trending")}
        </h2>

        {/* 🟢 Skeleton while loading */}
        {isLoading && <ProductGridSkeleton count={limit} />}

        {isError && (
          <p className="trending-products-message error">
            Unable to load trending products. Please try again shortly.
          </p>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <p className="trending-products-message">
            No trending products available right now.
          </p>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div className="trending-products-grid" aria-live="polite">
            {products.map((product, idx) => {
              const hasId = typeof product.id === "number";
              const productId = hasId ? (product.id as number) : null;
              const isSaved = productId != null ? savedSet.has(productId) : false;

              // Prefer ASIN, then DB id, then slug, then name+idx
              const key =
                product.asin ??
                (productId != null ? String(productId) : undefined) ??
                product.slug ??
                `${product.name}-${idx}`;

              return (
                <ProductCard
                  key={key}
                  id={product.id} // may be undefined for live items
                  name={product.name}
                  brand={product.brand}
                  price={typeof product.price === "number" ? product.price : null}
                  imgUrl={product.imgUrl}
                  affiliateLink={product.affiliateLink}
                  slug={product.slug}
                  isSaved={isSaved}
                  onToggleSave={
                    productId != null ? () => toggleSaveProduct(productId) : undefined
                  }
                  // visually flag these as “trending”
                  isTrending={true}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(TrendingProductList);
