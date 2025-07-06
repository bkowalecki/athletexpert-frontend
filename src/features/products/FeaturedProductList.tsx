// src/components/products/FeaturedProductList.tsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../products/ProductCard";
import { useSavedProducts } from "../../hooks/useSavedProducts";
import { fetchFeaturedProducts } from "../../api/product";
import type { Product } from "../../types/products";
import "../../styles/FeaturedProductList.css";

const FeaturedProductList: React.FC = () => {
  const { savedProductIds, toggleSaveProduct } = useSavedProducts();

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<Product[], Error>({
    queryKey: ["featuredProducts"],
    queryFn: fetchFeaturedProducts,
    staleTime: 10_000,
    retry: 1,
  });

  return (
    <section className="featured-products-section">
      <div className="featured-products-container">
        <h2 className="featured-products-heading">Featured</h2>

        {isLoading && (
          <p className="featured-products-message">Loading featured products...</p>
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

        <div className="featured-products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              brand={product.brand}
              price={typeof product.price === "number" ? product.price : 0}
              imgUrl={product.imgUrl}
              affiliateLink={product.affiliateLink}
              isSaved={!!product.id && savedProductIds.includes(product.id)}
              onToggleSave={() => toggleSaveProduct(product.id)}
              isAmazonFallback={product.isAmazonFallback}
              isTrending={product.trending}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductList;
