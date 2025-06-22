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

  const { data: products = [] } = useQuery<Product[], Error>({
    queryKey: ["featuredProducts"],
    queryFn: fetchFeaturedProducts,
    staleTime: 5000,
  });

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
              onToggleSave={() => toggleSaveProduct(product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductList;
