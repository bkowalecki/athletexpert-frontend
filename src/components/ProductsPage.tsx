import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ProductsPage.css";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  imgUrl: string;
  affiliateLink: string;
  retailer: string;
  isSaved?: boolean;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 500]);
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);
  const [savedProducts, setSavedProducts] = useState<number[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url =
          searchQuery.trim() === ""
            ? `${process.env.REACT_APP_API_URL}/products`
            : `${process.env.REACT_APP_API_URL}/products/search?query=${searchQuery}`;
  
        const response = await axios.get(url, { withCredentials: true });
  
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("🚨 Error fetching products:", error);
        setProducts([]);
      }
    };
  
    fetchProducts();
  }, [searchQuery]);

  const handleSaveProduct = async (productId: number) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/saved-products/${productId}`,
        {},
        { withCredentials: true }
      );
  
      if (response.status === 200) {
        setSavedProducts((prev) => [...prev, productId]);
        console.log("✅ Product saved successfully!");
      }
    } catch (error) {
      console.error("🚨 Error saving product:", error);
    }
  };
  

  return (
    <div className="products-page">
      <header className="products-header">
        <h1>Explore the Best Gear</h1>
        <p>Find, compare, and shop products from top retailers.</p>
        <Link to="/quiz" className="cta-button">🎯 Take the Gear Quiz</Link>
      </header>

      {/* Search & Filters */}
      <div className="products-filters">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />

        <div className="filter-group">
          <label>Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
          <input
            type="range"
            min="0"
            max="1000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.imgUrl} alt={product.name} className="product-image" />
            <h3>{product.name}</h3>
            <p>{product.brand}</p>
            <p className="product-price">${product.price.toFixed(2)}</p>

            <div className="product-actions">
              <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="buy-button">
                Buy Now
              </a>

              <button
                className={`save-button ${savedProducts.includes(product.id) ? "saved" : ""}`}
                onClick={() => handleSaveProduct(product.id)}
              >
                {savedProducts.includes(product.id) ? "★ Saved" : "☆ Save"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
