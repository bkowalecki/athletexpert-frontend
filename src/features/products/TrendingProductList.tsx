import React from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../products/ProductCard";
import { useSavedProducts } from "../../hooks/useSavedProducts";
import { fetchTrendingProducts } from "../../api/product";
import type { Product } from "../../types/products";
import "../../styles/TrendingProductList.css";

const TrendingProductList: React.FC = () => {
  const { savedProductIds, toggleSaveProduct } = useSavedProducts();

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<Product[], Error>({
    queryKey: ["trendingProducts"],
    queryFn: fetchTrendingProducts,
    staleTime: 10_000, // Cache for 10 seconds
    retry: 1,
  });

  return (
    <section className="trending-products-section">
      <div className="trending-products-container">
        <h2 className="trending-products-heading">Trending</h2>

        {isLoading && (
          <p className="trending-products-message">Loading trending products...</p>
        )}

        {isError && (
          <p className="trending-products-message error">
            Unable to load trending products. Please try again later.
          </p>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <p className="trending-products-message">
            No trending products available right now.
          </p>
        )}

        <div className="trending-products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              brand={product.brand}
              price={product.price}
              imgUrl={product.imgUrl}
              affiliateLink={product.affiliateLink}
              isSaved={savedProductIds.includes(product.id)}
              onToggleSave={() => toggleSaveProduct(product.id)}
              // Optionally: pass isTrending={true} for styling
              isTrending={!!product.trending}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProductList;
