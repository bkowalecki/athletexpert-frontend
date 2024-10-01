import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/FeaturedProductList.css"; // Same CSS for Trending Product List

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
      .get(`${process.env.REACT_APP_API_URL}/featured-products/featured`)
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the products!", error);
      });
  }, []);

  return (
    <div className="product-list-container">
      <h2 className="heading">Featured</h2>
      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id} className="product-item">
            <div className="product-image-container">
              <img
                src={product.imgUrl}
                alt={product.name}
                className="product-image"
              />
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-brand">{product.brand}</p>
              <p className="product-price">
                {product.price ? `$${product.price.toFixed(2)}` : "N/A"}
              </p>
            </div>
            <a
              href={product.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button"
            >
              View on Amazon
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeaturedProductList;
