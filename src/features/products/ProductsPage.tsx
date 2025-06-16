import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react"; // ✅ ensure this is at the top
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

const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/products`);
  return response.data;
};

const fetchSavedProducts = async (): Promise<number[]> => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/users/saved-products`,
    { withCredentials: true }
  );
  return response.data.map((product: Product) => product.id);
};

const ProductsPage: React.FC = () => {
  const [inputQuery, setInputQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedRetailer, setSelectedRetailer] = useState("");
  const [sortOption, setSortOption] = useState("");
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [savedProductIds, setSavedProductIds] = useState<number[]>([]);
  const [saving, setSaving] = useState<number | null>(null);
  const [selectedSport, setSelectedSport] = useState("");

  const rowsPerPage = 3;
  const [columns, setColumns] = useState(1);
  const [visibleCount, setVisibleCount] = useState(0);

  const getColumns = (): number => {
    const saved = localStorage.getItem("ax-columns");
    if (saved) return parseInt(saved, 10);

    const width = window.innerWidth;
    const cols = width >= 1200 ? 4 : width >= 900 ? 3 : width >= 600 ? 2 : 1;
    localStorage.setItem("ax-columns", cols.toString());
    return cols;
  };

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5000,
  });

  useEffect(() => {
    if (user) {
      fetchSavedProducts()
        .then(setSavedProductIds)
        .catch((err) => console.error("Error fetching saved products", err));
    }
  }, [user]);

  useEffect(() => {
    const updateLayout = () => {
      const currentCols = getColumns();
      setColumns(currentCols);
      setVisibleCount(currentCols * rowsPerPage);
      localStorage.setItem("ax-columns", currentCols.toString()); // 👈 Ensure latest
    };
    updateLayout(); // run once on load
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          (!searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (!selectedBrand || product.brand === selectedBrand) &&
          (!selectedRetailer || product.retailer === selectedRetailer) &&
          (!selectedSport || product.sports?.includes(selectedSport))
      )
      .sort((a, b) => {
        if (sortOption === "priceLow") return a.price - b.price;
        if (sortOption === "priceHigh") return b.price - a.price;
        return 0;
      });
  }, [products, searchQuery, selectedBrand, selectedRetailer, selectedSport, sortOption]);
  
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const toggleSaveProduct = async (productId: number) => {
    if (!user) {
      toast.warn("Log in to save products!", {
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
      <h1 className="products-page-title">Explore</h1>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="search-bar"
        />
        <button
          className="search-btn"
          onClick={() => {
            setSearchQuery(inputQuery);
            setVisibleCount(columns * rowsPerPage);
          }}
        >
          Search
        </button>

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

        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
        >
          <option value="">All Sports</option>
          {[...new Set(products.flatMap((p) => p.sports || []))].map(
            (sport, i) => (
              <option key={i} value={sport}>
                {sport}
              </option>
            )
          )}
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
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

      <div className="product-grid">
        {visibleProducts.length > 0
          ? visibleProducts.map((product) => (
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
          : !isLoading && (
              <p className="no-products-text">No products match your search.</p>
            )}
      </div>

      {visibleCount < filteredProducts.length && (
        <button
          className="load-more-button"
          onClick={() =>
            setVisibleCount((prev) => prev + columns * rowsPerPage)
          }
        >
          View More
        </button>
      )}
    </div>
  );
};

export default ProductsPage;
