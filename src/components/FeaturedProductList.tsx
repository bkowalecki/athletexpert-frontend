import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/FeaturedProductList.css";  // Same CSS for Trending Product List

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number | null;
  imgUrl: string;
  amazonUrl: string;  // Add the affiliate link for "View on Amazon"
}

const FeaturedProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios
      .get("http://192.168.1.209:8080/api/featured-products/featured")
      .then((response) => {
        setProducts(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the products!", error);
      });
  }, []);

  return (
    <div className="product-list-container">
      <h2 className="heading">Featured Products</h2>
      <ul className="product-list">
        {products.map((product) => (
          <li 
            key={product.id} 
            className="product-item" 
            style={{ backgroundImage: `url(${product.imgUrl})`, backgroundSize:'cover' }}  // Dynamic background image
          >
            <h3>{product.name}</h3>
            <p>{product.brand}</p>
            <p>${product.price ? product.price.toFixed(2) : "N/A"}</p>
            {/* Add the CTA button */}
            <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer" className="cta-button">
              View on Amazon
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeaturedProductList;
