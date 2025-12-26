// src/components/trending/TrendingProductList.tsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../products/ProductCard";
import { useSavedProducts } from "../../hooks/useSavedProducts";
import { fetchTrendingLiveProducts } from "../../api/product";
import type { Product } from "../../types/products";
import "../../styles/TrendingProductList.css";

// 🟢 Import your skeleton
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
  const noop = () => {};

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
    <section className="trending-products-section">
      <div className="trending-products-container">
        <h2 className="trending-products-heading">
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
          <div className="trending-products-grid">
            {products.map((product, idx) => {
              const hasId = typeof product.id === "number";
              const isSaved = hasId
                ? savedProductIds.includes(product.id as number)
                : false;

              // choose a stable key: prefer ASIN, then DB id, then slug, then name+idx
              const key =
                product.asin ??
                (hasId ? String(product.id) : undefined) ??
                product.slug ??
                `${product.name}-${idx}`;

              return (
                <ProductCard
                  key={key}
                  id={product.id} // may be undefined for live items
                  name={product.name}
                  brand={product.brand}
                  price={product.price}
                  imgUrl={product.imgUrl}
                  affiliateLink={product.affiliateLink}
                  slug={product.slug}
                  isSaved={isSaved}
                  onToggleSave={hasId ? () => toggleSaveProduct(product.id as number) : noop}
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

export default TrendingProductList;
