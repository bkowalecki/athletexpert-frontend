import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ProductCard from "../products/ProductCard";
import { useSavedProducts } from "../../hooks/useSavedProducts";
import "../../styles/FeaturedProductList.css";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number | null;
  imgUrl: string;
  affiliateLink: string;
}

const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/products/featured`
  );
  return response.data;
};

const FeaturedProductList: React.FC = () => {
  const { savedProductIds, toggleSaveProduct } = useSavedProducts();

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<Product[], Error>({
    queryKey: ["featuredProducts"],
    queryFn: fetchFeaturedProducts,
    staleTime: 10_000, // Slightly longer cache to reduce unnecessary refetches
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
          <p className="featured-products-message">No featured products available right now.</p>
        )}

        <div className="featured-products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              brand={product.brand}
              price={product.price}
              imgUrl={product.imgUrl}
              affiliateLink={product.affiliateLink}
              isSaved={savedProductIds.includes(product.id)}
              onToggleSave={() => toggleSaveProduct(product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductList;
