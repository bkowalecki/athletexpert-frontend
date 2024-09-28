import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/TrendingProductList.css";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number | null;
  imgUrl: string;
}

const TrendingProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/products/trending`)
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
      <h2 className="heading">Trending Products</h2>
      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id} className="product-item">  {/* Ensure unique key */}
            <img src={product.imgUrl} alt={product.name} className="product-image" />
            <h3>{product.name}</h3>
            <p>Brand: {product.brand}</p>
            <p>Category: {product.category}</p>
            <p>
              Price: $
              {product.price !== null && product.price !== undefined
                ? product.price.toFixed(2)
                : "N/A"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingProductList;
