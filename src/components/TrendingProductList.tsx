import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/TrendingProductList.css";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number | null;
  imgurl: string;  // Changed from imgurl for consistency
  amazon_url: string; // Changed from amazon_url for consistency
}

const TrendingProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/products/trending`)
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the products!", error);
      });
  }, []);

  return (
    <section className="trending-products-section">
      <h2 className="trending-products-heading">Trending</h2>
      <div className="trending-products-grid">
        {products.map((product) => (
          
          <div key={product.id} className="trending-products-item">
            <div className="trending-products-image-container">
              <img
                src={product.imgurl}
                alt={product.name}
                className="trending-products-image"
              />
            </div>
            <div className="trending-products-info">
              <h3 className="trending-products-name">{product.name}</h3>
              <p className="trending-products-brand">{product.brand}</p>
              <p className="trending-products-price">
                {product.price ? `$${product.price.toFixed(2)}` : "N/A"}
              </p>
            </div>
            <a
              href={product.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="trending-products-cta-button"
            >
              View on Amazon
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingProductList;
