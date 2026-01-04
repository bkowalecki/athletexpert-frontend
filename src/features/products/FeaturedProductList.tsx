// src/components/products/FeaturedProductList.tsx

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../products/ProductCard";
import { useSavedProducts } from "../../hooks/useSavedProducts";
import { fetchFeaturedProducts } from "../../api/product";
import type { Product } from "../../types/products";
import "../../styles/FeaturedProductList.css";
import { motion } from "framer-motion";

const FeaturedProductList: React.FC = () => {
  const { savedProductIds, toggleSaveProduct } = useSavedProducts();

  const savedSet = useMemo(
    () => new Set<number>(savedProductIds ?? []),
    [savedProductIds]
  );

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<Product[], Error>({
    queryKey: ["featuredProducts"],
    queryFn: fetchFeaturedProducts,
    staleTime: 60_000, // featured doesn't need to refresh constantly
    retry: 1,
  });

  return (
    <section
      className="featured-products-section"
      aria-labelledby="featured-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="featured-products-section-content"
      >
        <div className="featured-products-container">
          <h2 id="featured-title" className="featured-products-heading">
            Featured
          </h2>

          {isLoading && (
            <p className="featured-products-message">
              Loading featured products...
            </p>
          )}

          {isError && (
            <p className="featured-products-message error">
              Unable to load featured products. Please try again later.
            </p>
          )}

          {!isLoading && !isError && products.length === 0 && (
            <p className="featured-products-message">
              No featured products available right now.
            </p>
          )}

          <div className="featured-products-grid" aria-live="polite">
            {products.map((product) => {
              const productId = product.id;

              return (
                <ProductCard
                  key={
                    productId ?? product.asin ?? product.slug ?? product.name
                  }
                  id={productId}
                  name={product.name}
                  brand={product.brand}
                  price={
                    typeof product.price === "number" ? product.price : null
                  }
                  imgUrl={product.imgUrl}
                  affiliateLink={product.affiliateLink}
                  slug={product.slug}
                  isSaved={
                    typeof productId === "number" && savedSet.has(productId)
                  }
                  onToggleSave={
                    typeof productId === "number"
                      ? () => toggleSaveProduct(productId)
                      : undefined
                  }
                  isAmazonFallback={product.isAmazonFallback}
                  isTrending={Boolean((product as any).trending)}
                />
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default React.memo(FeaturedProductList);
