import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";

// -------------- Third-Party Libs --------------
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ErrorBoundary } from "react-error-boundary";

// -------------- Types --------------
import type { Product, SortOption, Filters } from "../../types/products";

// -------------- UI Components --------------
import ProductCard from "../products/ProductCard";
// import CategoryCard from "./CategoryCard";
import ProductGridSkeleton from "./ProductGridSkeleton";
import ErrorFallback from "../../components/ErrorFallback";

// -------------- Hooks --------------
import { useSavedProducts } from "../../hooks/useSavedProducts";
import { useFilteredProducts } from "../../hooks/useFilteredProducts";
import { useRateLimiter } from "../../util/useRateLimiter";

// -------------- Data --------------
// import productCategories from "../../data/productCategories";

// -------------- Styles --------------
import "../../styles/ProductsPage.css";

// ---------------------------------------------------------------------------
// API Calls & Utility Functions
// ---------------------------------------------------------------------------

const fetchProducts = async (): Promise<Product[]> =>
  (await axios.get(`${process.env.REACT_APP_API_URL}/products`)).data;

const searchProducts = async (query: string): Promise<Product[]> => {
  if (!query.trim()) return [];
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/products/search`,
    { params: { query } }
  );
  return res.data;
};

const sanitizeQuery = (q: string) =>
  q.replace(/[^a-zA-Z0-9\s-]/g, "").trim().slice(0, 40);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const ProductsPage: React.FC = () => {
  // ------------ Navigation & Refs ------------
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // ------------ State ------------
  const [inputQuery, setInputQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [filters, setFilters] = useState<Filters>({
    brand: "",
    sport: "",
    sortOption: "",
  });

  // ------------ Hooks ------------
  const { canProceed, record } = useRateLimiter(10, 60_000);
  const { savedProductIds, toggleSaveProduct } = useSavedProducts();

  // ------------ Data Fetching ------------
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5000,
  });

  // ------------ Filtering & Visible Products ------------
  const productsToShow = searchResults !== null ? searchResults : products;
  const filteredProducts = useFilteredProducts(productsToShow, filters);
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  // ------------ Brands & Sports for Filters ------------
  const allBrands = useMemo(
    () => [...new Set(productsToShow.map((p) => p.brand).filter(Boolean))],
    [productsToShow]
  );
  const allSports = useMemo(
    () => [...new Set(productsToShow.flatMap((p) => p.sports || []))],
    [productsToShow]
  );

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleFilterChange = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: key === "sortOption" ? (value as SortOption) : value,
      }));
      setVisibleCount(20);
    },
    []
  );

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canProceed()) {
      toast.error("You're searching too fast! Please wait a minute.");
      return;
    }
    record();

    const cleanedInput = sanitizeQuery(inputQuery);

    if (!cleanedInput || cleanedInput.length < 3) {
      toast.error("Please enter at least 3 valid characters to search.");
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setSearchQuery(cleanedInput);
    setVisibleCount(20);
    setIsSearching(true);

    try {
      const results = await searchProducts(cleanedInput);
      setSearchResults(results);
    } catch (err: any) {
      if (err.response && err.response.status === 429) {
        toast.error("You're searching too fast! Please wait a minute.");
      } else {
        toast.error("Failed to fetch products. Please try again.");
      }
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setInputQuery("");
    setSearchQuery("");
    setSearchResults(null);
    setVisibleCount(20);
    refetch();
  };

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 20);
  }, []);

  // -------------------------------------------------------------------------
  // Infinite Scroll Effect
  // -------------------------------------------------------------------------
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !debounceTimeout) {
        debounceTimeout = setTimeout(() => {
          loadMore();
          debounceTimeout = null;
        }, 300);
      }
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      observer.disconnect();
    };
  }, [loadMore]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

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

      {/* <div className="category-grid" aria-label="Product Categories">
        {productCategories.map((cat) => (
          <CategoryCard key={cat.title} {...cat} />
        ))}
      </div> */}

      <form
        className="filters-container"
        onSubmit={handleSearchSubmit}
        role="search"
        aria-label="Product search"
      >
        <input
          type="text"
          placeholder="Search"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="search-bar"
          aria-label="Search products"
        />
        <button className="search-btn" type="submit" disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </button>
        {searchResults !== null && (
          <button
            className="clear-search-btn"
            type="button"
            onClick={handleClearSearch}
            style={{ marginLeft: 8 }}
          >
            Clear Search
          </button>
        )}

        <select
          value={filters.brand}
          onChange={(e) => handleFilterChange("brand", e.target.value)}
          aria-label="Filter by brand"
        >
          <option value="">All Brands</option>
          {allBrands.map(
            (brand, index) =>
              brand && (
                <option key={`${brand}-${index}`} value={brand}>
                  {brand}
                </option>
              )
          )}
        </select>

        <select
          value={filters.sport}
          onChange={(e) => handleFilterChange("sport", e.target.value)}
          aria-label="Filter by sport"
        >
          <option value="">All Sports</option>
          {allSports.map((sport, i) => (
            <option key={i} value={sport}>
              {sport}
            </option>
          ))}
        </select>

        <select
          value={filters.sortOption}
          onChange={(e) => handleFilterChange("sortOption", e.target.value)}
          aria-label="Sort products"
        >
          <option value="" disabled>
            Sort by...
          </option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
        </select>
      </form>

      {(isLoading || isSearching) && <ProductGridSkeleton count={visibleCount} />}
      {error && (
        <div className="products-error-container">
          <h2>😵 Oops! Something went wrong.</h2>
          <p>We couldn't load the products right now. Please try again later.</p>
          <button className="return-home-btn" onClick={() => navigate("/")}>
            Return Home
          </button>
        </div>
      )}

      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          setSearchResults(null);
          refetch();
        }}
      >
        <div className="product-grid" aria-live="polite">
          {visibleProducts.length > 0
            ? visibleProducts.map((product, idx) => (
                <ProductCard
                id={product.id ?? `amazon-${idx}-${product.name}`} 
                key={product.id ?? `amazon-${idx}-${product.name}`}
                  name={product.name}
                  brand={product.brand}
                  price={product.price}
                  imgUrl={product.imgUrl}
                  affiliateLink={product.affiliateLink}
                  isSaved={
                    product.id ? savedProductIds.includes(product.id) : false
                  }
                  onToggleSave={() =>
                    product.id && toggleSaveProduct(product.id)
                  }
                />
              ))
            : !isLoading &&
              !isSearching && (
                <p className="no-products-text">
                  No products match your search.
                </p>
              )}
        </div>
      </ErrorBoundary>

      <div ref={sentinelRef} style={{ height: "1px" }} />
    </div>
  );
};

export default ProductsPage;
