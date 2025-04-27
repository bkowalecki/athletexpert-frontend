import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/ProductsPage.css";
import { Helmet } from "react-helmet";

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

// Fetch all products via react-query
const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/products`);
  return response.data;
};

// Fetch saved product IDs for the logged-in user
const fetchSavedProducts = async (): Promise<number[]> => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/users/saved-products`,
    { withCredentials: true }
  );
  return response.data.map((product: Product) => product.id);
};

const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedRetailer, setSelectedRetailer] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [savedProductIds, setSavedProductIds] = useState<number[]>([]);
  const [saving, setSaving] = useState<number | null>(null);

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5000,
  });

  // Fetch saved products if user is logged in
  useEffect(() => {
    if (user) {
      fetchSavedProducts()
        .then(setSavedProductIds)
        .catch((err) => console.error("Error fetching saved products", err));
    }
  }, [user]);

  // Filter & sort products based on search/filter state
  const filteredProducts = products
    .filter((product) => {
      let matches = true;
      if (searchQuery) {
        matches = product.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
      if (matches && selectedBrand) {
        matches = product.brand === selectedBrand;
      }
      if (matches && selectedRetailer) {
        matches = product.retailer === selectedRetailer;
      }
      return matches;
    })
    .sort((a, b) => {
      if (sortOption === "priceLow") return a.price - b.price;
      if (sortOption === "priceHigh") return b.price - a.price;
      return 0;
    });

  // Handle save/unsave product
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
          autoClose: 2000,
        });
      }
    } catch (err) {
      toast.error("❌ Error saving product. Try again.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="products-page">
      <Helmet>
        <title>AthleteXpert | Gear</title>
        <meta
          name="description"
          content="Discover the best gear for your sport on AthleteXpert."
        />
      </Helmet>
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
          {[...new Set(products.map((p) => p.brand))].map(
            (brand, index) =>
              brand && (
                <option key={`${brand}-${index}`} value={brand}>
                  {brand}
                </option>
              )
          )}
        </select>
        {/* Optionally include retailer filtering */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="default">Sort By</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
        </select>
      </div>

      {/* Loading & Error */}
      {isLoading && <p className="loading-text">Loading products...</p>}
      {error && (
        <div className="products-error-container">
          <h2>😵 Oops! Something went wrong.</h2>
          <p>
            We couldn't load the products right now. Please try again later.
          </p>
          <button
            className="return-home-btn"
            onClick={() => navigate("/")}
            style={{ marginTop: "20px" }}
          >
            Return Home
          </button>
        </div>
      )}

      {/* Product Grid */}
      <div className="product-grid">
        {filteredProducts.length > 0
          ? filteredProducts.map((product, index) => (
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
                  alt={`${product.name}`}
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
          : !isLoading && (
              <p className="no-products-text">No products match your search.</p>
            )}
      </div>
    </div>
  );
};

export default ProductsPage;
