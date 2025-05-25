import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ProductCard from "../products/ProductCard";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
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
  const { user } = useUserContext();
  const [savedProductIds, setSavedProductIds] = useState<number[]>([]);
  const [savingProductIds, setSavingProductIds] = useState<number[]>([]);

  const { data: products = [] } = useQuery<Product[], Error>({
    queryKey: ["featuredProducts"],
    queryFn: fetchFeaturedProducts,
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
    if (!user) return toast.warn("⚠️ Log in to save products!");

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

  return (
    <section className="featured-products-section">
      <div className="featured-products-container">
        <h2 className="featured-products-heading">Featured</h2>

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
              isSaving={savingProductIds.includes(product.id)}
              onToggleSave={() => toggleSaveProduct(product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductList;