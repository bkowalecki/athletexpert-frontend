import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserContext } from "../components/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ProductsPage.css";
import FeaturedProductList from "./FeaturedProductList";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  affiliateLink: string;
  imgUrl: string;
  brand: string;
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
  const [savedProductIds, setSavedProductIds] = useState<number[]>([]);
  const { user } = useUserContext();

  // Fetch all products
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

  // Fetch user's saved products
  useEffect(() => {
    if (!user) return;

    const fetchSavedProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/users/saved-products`,
          { withCredentials: true }
        );
        setSavedProductIds(response.data.map((product: Product) => product.id));
      } catch (error) {
        console.error("❌ Error fetching saved products:", error);
      }
    };

    fetchSavedProducts();
  }, [user]);

  // Handle Save/Unsave Product
  const toggleSaveProduct = async (productId: number) => {
    if (!user) {
      toast.warn("⚠️ You need to log in to save products!", {
        position: "top-center",
      });
      return;
    }

    const isSaved = savedProductIds.includes(productId);
    setSaving(productId);

    try {
      const response = await axios({
        method: isSaved ? "DELETE" : "POST",
        url: `${process.env.REACT_APP_API_URL}/users/saved-products/${productId}`,
        withCredentials: true,
      });

      if (response.status === 200) {
        setSavedProductIds((prev) =>
          isSaved ? prev.filter((id) => id !== productId) : [...prev, productId]
        );

        toast.success(isSaved ? "Product removed!" : "Product saved!", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      toast.error("❌ Error saving product. Try again.");
    } finally {
      setSaving(null);
    }
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedRetailer, setSelectedRetailer] = useState("");
  const [sortOption, setSortOption] = useState("default");

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
  }, [searchQuery, selectedBrand, selectedRetailer, sortOption, products]);

  return (
    <div className="products-page">
      <h1>Explore</h1>

      {/* Search & Filters */}
      <div className="filters-container">
        <input
          type="text"
          placeholder="Search"
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
          value={selectedRetailer}
          onChange={(e) => setSelectedRetailer(e.target.value)}
        >
          <option value="">Retailers</option>
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
            <div
              key={product.id || `product-${index}`}
              className="product-card"
            >
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
              <div className="products-page-product-card-info">
                <h3>{product.name}</h3>
                <p className="product-price">${product.price.toFixed(2)}</p>
                <a
                  href={product.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="products-page-product-buy-button"
                >
                  🛒 View on Amazon
                </a>
                {user && (
                  <button
                    className={`save-button ${
                      savedProductIds.includes(product.id) ? "unsave" : ""
                    }`}
                    onClick={() => toggleSaveProduct(product.id)}
                    disabled={saving === product.id}
                  >
                    {saving === product.id
                      ? "Saving..."
                      : savedProductIds.includes(product.id)
                      ? "Unsave"
                      : "Save"}
                  </button>
                )}
              </div>
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
