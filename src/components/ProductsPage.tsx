import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserContext } from "../components/UserContext";
import "../styles/ProductsPage.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  affiliateLink: string;
  imgUrl: string;
  brand: string;
  categories: string;
  retailer: string;
  trending: boolean;
  featured: boolean;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const { user } = useUserContext();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRetailer, setSelectedRetailer] = useState("");
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/products`
        );
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("🚨 Error fetching products:", error);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle Product Save
  const handleSaveProduct = async (productId: number) => {
    if (!user) {
      console.warn("⚠️ User not logged in. Redirecting to /auth...");
      window.location.href = "/auth";
      return;
    }

    setSaving(productId);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/saved-products/${productId}`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        console.log("✅ Product saved successfully!");
      }
    } catch (error) {
      console.error("🚨 Error saving product:", error);
      alert("Failed to save product. Try again.");
    } finally {
      setSaving(null);
    }
  };

  // Apply Search & Filters
  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedBrand) {
      filtered = filtered.filter((product) => product.brand === selectedBrand);
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.categories === selectedCategory
      );
    }

    if (selectedRetailer) {
      filtered = filtered.filter(
        (product) => product.retailer === selectedRetailer
      );
    }

    if (sortOption === "priceLow") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortOption === "priceHigh") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }, [
    searchQuery,
    selectedBrand,
    selectedCategory,
    selectedRetailer,
    sortOption,
    products,
  ]);

  return (
    <div className="products-page">
      <h1>Find Your Perfect Gear</h1>

      {/* Search & Filters */}
      <div className="filters-container">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="">All Brands</option>
          {[...new Set(products.map((p) => p.brand))].map((brand, index) =>
            brand ? (
              <option key={`${brand}-${index}`} value={brand}>
                {brand}
              </option>
            ) : null
          )}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {[...new Set(products.map((p) => p.categories))].map(
            (category, index) =>
              category ? (
                <option key={`${category}-${index}`} value={category}>
                  {category}
                </option>
              ) : null
          )}
        </select>

        <select
          value={selectedRetailer}
          onChange={(e) => setSelectedRetailer(e.target.value)}
        >
          <option value="">All Retailers</option>
          {[...new Set(products.map((p) => p.retailer))].map(
            (retailer, index) =>
              retailer ? (
                <option key={`${retailer}-${index}`} value={retailer}>
                  {retailer}
                </option>
              ) : null
          )}
        </select>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="default">Sort By</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
        </select>
      </div>

      {/* Loading & Error Messages */}
      {loading && <p className="loading-text">Loading products...</p>}
      {error && <p className="error-text">{error}</p>}

      {/* Product Grid */}
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <div key={product.id || `product-${index}`} className="product-card">
              {product.trending && (
                <span className="trending-badge">🔥 Trending</span>
              )}
              {product.featured && (
                <span className="featured-badge">⭐ Featured</span>
              )}
              <img
                src={product.imgUrl}
                alt={product.name}
                className="product-image"
              />
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              {/* <a
                href={product.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="buy-button"
              >
                Buy Now
              </a> */}
              {user && (
                <button
                  className="save-button"
                  onClick={() => handleSaveProduct(product.id)}
                  disabled={saving === product.id}
                >
                  {saving === product.id ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          ))
        ) : !loading ? (
          <p className="no-products-text">No products match your search.</p>
        ) : null}
      </div>
    </div>
  );
};

export default ProductsPage;
