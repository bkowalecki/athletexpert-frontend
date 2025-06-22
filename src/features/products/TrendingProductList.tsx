import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ProductCard from "../products/ProductCard";
import { useSavedProducts } from "../../hooks/useSavedProducts";
import "../../styles/TrendingProductList.css";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number | null;
  imgUrl: string;
  affiliateLink: string;
}

const fetchTrendingProducts = async (): Promise<Product[]> => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/products/trending`
  );
  return response.data;
};

const TrendingProductList: React.FC = () => {
  const { savedProductIds, toggleSaveProduct } = useSavedProducts();

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<Product[], Error>({
    queryKey: ["trendingProducts"],
    queryFn: fetchTrendingProducts,
    staleTime: 5000,
  });

  if (isLoading) return <p className="loading">Loading trending products...</p>;
  if (isError || products.length === 0)
    return <p className="error">No trending products available.</p>;

  return (
    <section className="trending-products-section">
      <div className="trending-products-container">
        <h2 className="trending-products-heading">Trending</h2>
        <div className="trending-products-grid">
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

export default TrendingProductList;
