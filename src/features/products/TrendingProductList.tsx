import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
import ProductCard from "../products/ProductCard";
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
  const { user } = useUserContext();
  const [savedProductIds, setSavedProductIds] = useState<number[]>([]);
  const [savingProductIds, setSavingProductIds] = useState<number[]>([]);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<Product[], Error>({
    queryKey: ["trendingProducts"],
    queryFn: fetchTrendingProducts,
    staleTime: 5000,
  });

  useEffect(() => {
    const fetchSaved = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/users/saved-products`,
          { withCredentials: true }
        );
        const ids = res.data.map((p: Product) => p.id);
        setSavedProductIds(ids);
      } catch (err) {
        console.error("Error fetching saved products");
      }
    };
    fetchSaved();
  }, [user]);

  const toggleSaveProduct = async (productId: number) => {
    if (!user) return toast.warn("Log in to save products!");

    const isSaved = savedProductIds.includes(productId);
    setSavingProductIds((prev) => [...prev, productId]);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/users/saved-products/${productId}`,
        {
          method: isSaved ? "DELETE" : "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        setSavedProductIds((prev) =>
          isSaved ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
        toast.success(isSaved ? "Product removed!" : "Product saved!");
      }
    } catch (err) {
      toast.error("❌ Error saving product.");
    } finally {
      setSavingProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

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
              isSaving={savingProductIds.includes(product.id)}
              onToggleSave={() => toggleSaveProduct(product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProductList;
