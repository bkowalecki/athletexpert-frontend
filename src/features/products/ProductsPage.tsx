import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import ProductCard from "../products/ProductCard";
import "../../styles/ProductsPage.css";

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
  sports?: string[];
}

const fetchProducts = async (): Promise<Product[]> =>
  (await axios.get(`${process.env.REACT_APP_API_URL}/products`)).data;

const fetchSavedProducts = async (): Promise<number[]> =>
  (await axios.get(`${process.env.REACT_APP_API_URL}/users/saved-products`, { withCredentials: true }))
    .data.map((product: Product) => product.id);

const ProductsPage: React.FC = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    brand: "",
    sport: "",
    sortOption: "",
  });
  const [savedProductIds, setSavedProductIds] = useState<number[]>([]);
  const [saving, setSaving] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  const rowsPerPage = 3;

  // Fetch products using React Query
  const { data: products = [], isLoading, error } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5000,
  });

  // Fetch saved products when the user is logged in
  useEffect(() => {
    if (user) {
      fetchSavedProducts()
        .then(setSavedProductIds)
        .catch((err) => console.error("Error fetching saved products", err));
    }
  }, [user]);

  // Update visible product count based on screen size
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      const columns = width >= 1200 ? 4 : width >= 900 ? 3 : width >= 600 ? 2 : 1;
      setVisibleCount(columns * rowsPerPage);
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          (!searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (!filters.brand || product.brand === filters.brand) &&
          (!filters.sport || product.sports?.includes(filters.sport))
      )
      .sort((a, b) => {
        if (filters.sortOption === "priceLow") return a.price - b.price;
        if (filters.sortOption === "priceHigh") return b.price - a.price;
        return 0;
      });
  }, [products, searchQuery, filters]);

  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

  // Toggle save product
  const toggleSaveProduct = async (productId: number) => {
    if (!user) {
      toast.warn("Log in to save products!", { position: "top-center" });
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
        toast.success(isSaved ? "Product removed!" : "Product saved!", { position: "bottom-center", autoClose: 2000 });
      }
    } catch {
      toast.error("❌ Error saving product. Try again.");
    } finally {
      setSaving(null);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setVisibleCount(rowsPerPage * Math.ceil(visibleCount / rowsPerPage)); // Reset visible count
  };

  return (
    <div className="products-page">
      <Helmet>
        <title>AthleteXpert | Gear</title>
        <meta name="description" content="Discover the best gear for your sport on AthleteXpert." />
      </Helmet>
      <h1 className="products-page-title">Explore</h1>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="search-bar"
        />
        <button className="search-btn" onClick={() => setSearchQuery(inputQuery)}>
          Search
        </button>

        <select value={filters.brand} onChange={(e) => handleFilterChange("brand", e.target.value)}>
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

        <select value={filters.sport} onChange={(e) => handleFilterChange("sport", e.target.value)}>
          <option value="">All Sports</option>
          {[...new Set(products.flatMap((p) => p.sports || []))].map((sport, i) => (
            <option key={i} value={sport}>
              {sport}
            </option>
          ))}
        </select>

        <select value={filters.sortOption} onChange={(e) => handleFilterChange("sortOption", e.target.value)}>
          <option value="" disabled>
            Sort by...
          </option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
        </select>
      </div>

      {isLoading && <p className="loading-text">Loading products...</p>}
      {error && (
        <div className="products-error-container">
          <h2>😵 Oops! Something went wrong.</h2>
          <p>We couldn't load the products right now. Please try again later.</p>
          <button className="return-home-btn" onClick={() => navigate("/")}>
            Return Home
          </button>
        </div>
      )}

      <div className="product-grid">
        {visibleProducts.length > 0 ? (
          visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              brand={product.brand}
              price={product.price}
              imgUrl={product.imgUrl}
              affiliateLink={product.affiliateLink}
              isSaved={savedProductIds.includes(product.id)}
              isSaving={saving === product.id}
              onToggleSave={() => toggleSaveProduct(product.id)}
            />
          ))
        ) : (
          !isLoading && <p className="no-products-text">No products match your search.</p>
        )}
      </div>

      {visibleCount < filteredProducts.length && (
        <button className="load-more-button" onClick={() => setVisibleCount((prev) => prev + rowsPerPage)}>
          View More
        </button>
      )}
    </div>
  );
};

export default ProductsPage;