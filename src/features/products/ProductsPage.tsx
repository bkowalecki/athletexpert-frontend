import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useDeferredValue,
} from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ErrorBoundary } from "react-error-boundary";

import type { Product, SortOption, Filters } from "../../types/products";
import {
  fetchProducts,
  searchProducts,
  fetchTrendingProducts,
} from "../../api/product";
import ProductCard from "../products/ProductCard";
import ProductGridSkeleton from "./ProductGridSkeleton";
import ErrorFallback from "../../components/ErrorFallback";
import { useSavedProducts } from "../../hooks/useSavedProducts";
import { useFilteredProducts } from "../../hooks/useFilteredProducts";
import { useRateLimiter } from "../../util/useRateLimiter";
import { trackEvent } from "../../util/analytics";

import "../../styles/ProductsPage.css";

/** ————— Helpers ————— **/
function cleanTitle(raw?: string): string {
  if (!raw) return "";
  let s = raw;
  s = s.replace(/\([^)]*\)/g, "").replace(/\[[^\]]*]/g, "");
  s = s.replace(/[|•]+/g, " ").replace(/\s{2,}/g, " ").trim();

  const trimPhrases = [
    /with .+$/i,
    /compatible with .+$/i,
    /for (men|women|kids|boys|girls).+$/i,
    /bundle.*$/i,
    /gift.*$/i,
  ];
  for (const rx of trimPhrases) s = s.replace(rx, "").trim();

  const MAX = 60;
  if (s.length > MAX) {
    const cut = s.lastIndexOf(" ", MAX);
    s = s.slice(0, cut > 40 ? cut : MAX).trim() + "…";
  }
  return s;
}

function dedupeProducts(items: Product[]): Product[] {
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const p of items) {
    const key =
      (p.asin?.toLowerCase() ||
        p.slug?.toLowerCase() ||
        cleanTitle(p.name).toLowerCase()) +
      "|" +
      (p.brand?.toLowerCase() || "");
    if (!seen.has(key)) {
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}

const BUDGET_BUCKETS = [
  { label: "Under $25", key: "u25", min: 0, max: 25 },
  { label: "$25–$50", key: "25-50", min: 25, max: 50 },
  { label: "$50–$100", key: "50-100", min: 50, max: 100 },
  { label: "$100+", key: "100+", min: 100, max: Number.POSITIVE_INFINITY },
];

const RETAILERS = ["Amazon", "Dick's Sporting Goods", "Other"];

const sanitizeQuery = (q: string) =>
  q.replace(/[^a-zA-Z0-9\s-]/g, "").trim().slice(0, 40);

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) => (
  <label className="sr-only">
    {label}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={`Filter by ${label}`}
      className="ax-select"
    >
      <option value="">All {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </label>
);

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // URL-backed state
  const [inputQuery, setInputQuery] = useState(searchParams.get("q") ?? "");
  const deferredQuery = useDeferredValue(inputQuery);

  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [visibleCount, setVisibleCount] = useState(16);

  const urlBudgetKey = searchParams.get("budget");
  const initialBudgetIdxRaw = urlBudgetKey
    ? BUDGET_BUCKETS.findIndex((b) => b.key === urlBudgetKey)
    : -1;

  const [budgetIdx, setBudgetIdx] = useState<number | null>(
    initialBudgetIdxRaw >= 0 ? initialBudgetIdxRaw : null
  );

  const [retailer, setRetailer] = useState<string>(
    searchParams.get("retailer") ?? ""
  );

  const [filters, setFilters] = useState<Filters>({
    brand: searchParams.get("brand") ?? "",
    sport: searchParams.get("sport") ?? "",
    sortOption: (searchParams.get("sort") as SortOption) ?? "",
  });

  const { canProceed, record } = useRateLimiter(10, 60_000);
  const { savedProductIds, toggleSaveProduct } = useSavedProducts();
  const savedIdSet = useMemo(
    () => new Set<number>(savedProductIds ?? []),
    [savedProductIds]
  );

  const titleCacheRef = useRef(new Map<string, string>());
  const getCleanTitle = useCallback((p: Product) => {
    const key = String(p.id ?? p.asin ?? p.slug ?? p.name);
    let cached = titleCacheRef.current.get(key);
    if (!cached) {
      cached = cleanTitle(p.name);
      titleCacheRef.current.set(key, cached);
    }
    return cached;
  }, []);

  const toggleHandlersRef = useRef(new Map<number, () => void>());
  const getToggleHandler = useCallback(
    (id: number) => {
      const existing = toggleHandlersRef.current.get(id);
      if (existing) return existing;
      const fn = () => toggleSaveProduct(id);
      toggleHandlersRef.current.set(id, fn);
      return fn;
    },
    [toggleSaveProduct]
  );

  // ======= Data fetching (React Query v5) =======
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Product[], Error, Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    select: (items: Product[] | undefined): Product[] =>
      dedupeProducts(items ?? []),
  });

  const { data: trendingFallback = [] } = useQuery<Product[], Error, Product[]>(
    {
      queryKey: ["trending-fallback"],
      queryFn: fetchTrendingProducts,
      enabled: !isLoading && !error && products.length === 0,
      staleTime: 120_000,
      placeholderData: keepPreviousData,
      select: (items: Product[] | undefined): Product[] => items ?? [],
    }
  );

  // Base dataset
  const baseList: Product[] = useMemo(() => {
    if (searchResults && searchResults.length) return searchResults;
    if (products.length) return products;
    return trendingFallback;
  }, [searchResults, products, trendingFallback]);

  // Facet options
  const allBrands = useMemo(
    () =>
      [...new Set(baseList.map((p) => p.brand).filter(Boolean) as string[])].sort(),
    [baseList]
  );

  const allSports = useMemo(
    () => [...new Set(baseList.flatMap((p) => p.sports ?? []))].sort(),
    [baseList]
  );

  // Apply your custom filtering first
  const baseFiltered = useFilteredProducts(baseList, filters);

  // Budget
  const budgetFiltered = useMemo(() => {
    if (budgetIdx === null) return baseFiltered;
    const { min, max } = BUDGET_BUCKETS[budgetIdx];
    return baseFiltered.filter(
      (p) => typeof p.price === "number" && p.price >= min && p.price < max
    );
  }, [baseFiltered, budgetIdx]);

  // Retailer
  const retailerFiltered = useMemo(() => {
    if (!retailer) return budgetFiltered;
    if (retailer === "Other") {
      return budgetFiltered.filter(
        (p) =>
          p.retailer &&
          p.retailer !== "Amazon" &&
          p.retailer !== "Dick's Sporting Goods"
      );
    }
    return budgetFiltered.filter((p) => p.retailer === retailer);
  }, [budgetFiltered, retailer]);

  // Local sort
  const sortedProducts = useMemo(() => {
    if (!filters.sortOption) return retailerFiltered;
    const arr = [...retailerFiltered];
    if (filters.sortOption === "priceLow") {
      arr.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (filters.sortOption === "priceHigh") {
      arr.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    }
    return arr;
  }, [retailerFiltered, filters.sortOption]);

  // Slice
  const visibleProducts = useMemo(
    () => sortedProducts.slice(0, visibleCount),
    [sortedProducts, visibleCount]
  );

  // ——— URL sync helper ———
  const setParam = useCallback(
    (k: string, v: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (v && v.length) next.set(k, v);
      else next.delete(k);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Keep URL in sync (sanitized where relevant)
  useEffect(() => {
    const cleaned = sanitizeQuery(inputQuery);
    setParam("q", cleaned ? cleaned : null);
  }, [inputQuery, setParam]);

  useEffect(() => setParam("brand", filters.brand || null), [filters.brand, setParam]);
  useEffect(() => setParam("sport", filters.sport || null), [filters.sport, setParam]);
  useEffect(() => setParam("sort", filters.sortOption || null), [filters.sortOption, setParam]);

  useEffect(() => {
    const key = budgetIdx === null ? null : BUDGET_BUCKETS[budgetIdx].key;
    setParam("budget", key);
  }, [budgetIdx, setParam]);

  useEffect(() => setParam("retailer", retailer || null), [retailer, setParam]);

  const handleFilterChange = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: key === "sortOption" ? (value as SortOption) : value,
      }));
      setVisibleCount(16);
      trackEvent("product_filter_change", { [key]: value });
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setInputQuery("");
    setSearchResults(null);
    setVisibleCount(16);
    refetch();
  }, [refetch]);

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

    setVisibleCount(16);
    setIsSearching(true);
    trackEvent("product_search", { query: cleanedInput });

    try {
      const results = await searchProducts(cleanedInput);
      setSearchResults(dedupeProducts(results ?? []));
    } catch {
      toast.error("Failed to fetch products. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearAllFilters = () => {
    setFilters({ brand: "", sport: "", sortOption: "" });
    setBudgetIdx(null);
    setRetailer("");
    setSearchResults(null);
    setInputQuery("");
    setVisibleCount(16);
    setSearchParams({}, { replace: true });
  };

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 24);
  }, []);

  // Infinite scroll
  useEffect(() => {
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    const cb: IntersectionObserverCallback = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !debounceTimeout) {
        debounceTimeout = setTimeout(() => {
          loadMore();
          debounceTimeout = null;
        }, 300);
      }
    };

    const observer = new IntersectionObserver(cb, {
      root: null,
      rootMargin: "1200px 0px",
      threshold: 0,
    });

    const node = sentinelRef.current;
    if (node) observer.observe(node);

    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      observer.disconnect();
    };
  }, [loadMore]);

  // Active filter chips (quick removal)
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onClear: () => void }[] = [];

    if (filters.brand)
      chips.push({
        key: "brand",
        label: `Brand: ${filters.brand}`,
        onClear: () => handleFilterChange("brand", ""),
      });

    if (filters.sport)
      chips.push({
        key: "sport",
        label: `Sport: ${filters.sport}`,
        onClear: () => handleFilterChange("sport", ""),
      });

    if (filters.sortOption)
      chips.push({
        key: "sort",
        label:
          filters.sortOption === "priceLow"
            ? "Sort: $ Low → High"
            : "Sort: $ High → Low",
        onClear: () => handleFilterChange("sortOption", ""),
      });

    if (budgetIdx !== null) {
      chips.push({
        key: "budget",
        label: `Budget: ${BUDGET_BUCKETS[budgetIdx].label}`,
        onClear: () => setBudgetIdx(null),
      });
    }

    if (retailer) {
      chips.push({
        key: "retailer",
        label: `Retailer: ${retailer}`,
        onClear: () => setRetailer(""),
      });
    }

    if (inputQuery.trim()) {
      chips.push({
        key: "q",
        label: `Search: “${inputQuery.trim()}”`,
        onClear: handleClearSearch,
      });
    }

    return chips;
  }, [filters, budgetIdx, retailer, inputQuery, handleFilterChange, handleClearSearch]);

  const canSearch =
    sanitizeQuery(inputQuery).length >= 3 && !isSearching;

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
      <p className="products-page-subtitle">Find top-rated gear.</p>

      {/* Sticky filter bar */}
      <div className="filters-sticky">
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
          <button className="search-btn" type="submit" disabled={!canSearch}>
            {isSearching ? "Searching..." : "Search"}
          </button>

          {searchResults !== null && (
            <button
              className="clear-search-btn"
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              title="Clear search"
            >
              Clear
            </button>
          )}

          <FilterSelect
            label="Brand"
            value={filters.brand}
            onChange={(val) => handleFilterChange("brand", val)}
            options={allBrands}
          />

          <FilterSelect
            label="Sport"
            value={filters.sport}
            onChange={(val) => handleFilterChange("sport", val)}
            options={allSports}
          />

          <label className="sr-only">
            Sort
            <select
              value={filters.sortOption}
              onChange={(e) => handleFilterChange("sortOption", e.target.value)}
              aria-label="Sort products"
              className="ax-select"
            >
              <option value="">Sort by…</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </label>

          <div className="filters-actions">
            <button
              type="button"
              className="clear-all-btn"
              onClick={clearAllFilters}
              disabled={activeChips.length === 0}
              title="Clear all filters"
            >
              Clear all
            </button>
          </div>
        </form>

        {/* Quick Filters + Retailer */}
        <div className="quick-filters-row">
          <div className="budget-chips" aria-label="Budget">
            {BUDGET_BUCKETS.map((b, idx) => (
              <button
                key={b.key}
                type="button"
                className={`chip ${budgetIdx === idx ? "chip--active" : ""}`}
                onClick={() => setBudgetIdx((prev) => (prev === idx ? null : idx))}
                aria-pressed={budgetIdx === idx}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="retailer-select">
            <label className="sr-only" htmlFor="retailerSelect">
              Retailer
            </label>
            <select
              id="retailerSelect"
              value={retailer}
              onChange={(e) => setRetailer(e.target.value)}
              aria-label="Filter by retailer"
              className="ax-select"
            >
              <option value="">All Retailers</option>
              {RETAILERS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="active-chips" aria-live="polite">
            {activeChips.map((c) => (
              <button
                key={c.key}
                className="active-chip"
                onClick={c.onClear}
                title={`Remove ${c.label}`}
              >
                {c.label} <span aria-hidden>×</span>
              </button>
            ))}
          </div>
        )}
      </div>

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
        <div className="results-row">
          <p className="results-count">
            Showing {visibleProducts.length} of {sortedProducts.length} results
          </p>
        </div>

        <div className="product-grid" aria-live="polite">
          {visibleProducts.length > 0 ? (
            visibleProducts.map((product, idx) => {
              const key =
                product.asin ??
                (typeof product.id === "number" ? String(product.id) : undefined) ??
                product.slug ??
                `${product.name}-${idx}`;

              return (
                <ProductCard
                  key={key}
                  id={product.id}
                  name={getCleanTitle(product)}
                  brand={product.brand}
                  price={product.price}
                  imgUrl={product.imgUrl}
                  slug={product.slug}
                  affiliateLink={product.affiliateLink}
                  isSaved={typeof product.id === "number" && savedIdSet.has(product.id)}
                  onToggleSave={
                    typeof product.id === "number"
                      ? getToggleHandler(product.id)
                      : undefined
                  }
                  isAmazonFallback={product.isAmazonFallback}
                  isTrending={Boolean((product as any).isTrending ?? product.trending)}
                  rating={product.rating}
                  numReviews={product.numReviews}
                  source={product.source}
                  lastSyncedAt={product.lastSyncedAt}
                />
              );
            })
          ) : (
            <div className="no-products-text">
              <p>No gear found.</p>
              <ul style={{ marginTop: 6 }}>
                <li>Try broader keywords (e.g. “running shoes”)</li>
                <li>Clear a filter (brand, sport, budget, retailer)</li>
                <li>Check trending for inspiration</li>
              </ul>
            </div>
          )}
        </div>
      </ErrorBoundary>

      {visibleProducts.length < sortedProducts.length && (
        <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
          <button className="load-more-btn" type="button" onClick={loadMore}>
            Load more
          </button>
        </div>
      )}

      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
};

export default ProductsPage;
