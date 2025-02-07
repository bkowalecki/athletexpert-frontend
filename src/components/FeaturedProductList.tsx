import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/FeaturedProductList.css";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number | null;
  imgUrl: string;
  amazonUrl: string;
}

const FeaturedProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/products/featured`)
      .then((response) => {
        console.log("✅ Featured Products API Response:", response.data);
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("🚨 Error fetching featured products!", error);
        setProducts([]); // Prevent infinite loading
      });
  }, []);

  return (
    <section className="featured-products-section">
      <h2 className="featured-products-heading">Featured</h2>
      <div className="featured-products-grid">
        {products.map((product) => (
          <div key={product.id} className="featured-products-item">
            <div className="featured-products-image-container">
              <img
                src={product.imgUrl}
                alt={product.name}
                className="featured-products-image"
              />
            </div>
            <div className="featured-products-info">
              <h3 className="featured-products-name">{product.name}</h3>
              <p className="featured-products-brand">{product.brand}</p>
              <p className="featured-products-price">
                {product.price ? `$${product.price.toFixed(2)}` : "N/A"}
              </p>
            </div>
            <a
              href={product.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="featured-products-cta-button"
            >
              View on Amazon
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProductList;
