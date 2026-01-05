import React, { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen";
import ErrorScreen from "../../components/ErrorScreen";
import "../../styles/SearchResults.css";
import ProductCard from "../products/ProductCard";
import sportsDataRaw from "../../data/sports.json";
import { useSavedProducts } from "../../hooks/useSavedProducts";
import { fetchSearchIntent } from "../../util/aiSearchIntent";
import { trackEvent } from "../../util/analytics";

import { searchProducts } from "../../api/product";
import { searchBlogs } from "../../api/blog";
import type { Product } from "../../types/products";
import type { BlogPost } from "../../types/blogs";

interface Sport {
  title: string;
  backgroundImage: string;
}

const staticPages: { name: string; path: string }[] = [
  { name: "About", path: "/about" },
  { name: "Terms of Service", path: "/terms" },
  { name: "Privacy Policy", path: "/privacy" },
];

const trendingSearches = [
  "running shoes",
  "basketball shoes",
  "protein powder",
  "compression socks",
  "hydration backpack",
  "sports headphones",
];

const sportsData: Sport[] = Array.isArray(sportsDataRaw) ? (sportsDataRaw as Sport[]) : [];

const toSlug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const SearchResults: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [fixedQuery, setFixedQuery] = useState<string>("");
  const [aiIntent, setAiIntent] = useState<string[]>([]);
  const [aiPages, setAiPages] = useState<string[]>([]);
  const [isGibberish, setIsGibberish] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { savedProductIds, toggleSaveProduct } = useSavedProducts();
  const location = useLocation();
  const navigate = useNavigate();

  const intentCacheRef = useRef<Record<string, any>>({});
  const resultsCacheRef = useRef<Record<string, { products: Product[]; blogs: BlogPost[] }>>({});

  const searchQuery: string = new URLSearchParams(location.search).get("query")?.trim() ?? "";

  useEffect(() => {
    let cancelled = false;

    async function doSearch() {
      if (!searchQuery) {
        setProducts([]);
        setBlogs([]);
        setFixedQuery("");
        setAiIntent([]);
        setAiPages([]);
        setIsGibberish(false);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let ai;
        if (intentCacheRef.current[searchQuery]) {
          ai = intentCacheRef.current[searchQuery];
        } else {
          ai = await fetchSearchIntent(searchQuery);
          intentCacheRef.current[searchQuery] = ai;
        }
        if (cancelled) return;

        setFixedQuery(ai.fixedQuery || searchQuery);
        setAiIntent(ai.intent || []);
        setAiPages(ai.suggestedPages || []);
        setIsGibberish(Boolean(ai.isGibberish));

        trackEvent("search", {
          search_term: searchQuery,
          source: "results",
        });

        trackEvent("search_view", {
          query: searchQuery,
          fixedQuery: ai.fixedQuery,
          intent: ai.intent,
          isGibberish: ai.isGibberish,
        });

        // If corrected query differs, show "Did you mean" only until user clicks it
        if (
          ai.fixedQuery &&
          ai.fixedQuery.toLowerCase().trim() !== searchQuery.toLowerCase().trim() &&
          !ai.isGibberish
        ) {
          setProducts([]);
          setBlogs([]);
          setLoading(false);
          return;
        }

        const cacheKey = searchQuery;
        if (resultsCacheRef.current[cacheKey]) {
          const cached = resultsCacheRef.current[cacheKey];
          setProducts(cached.products);
          setBlogs(cached.blogs);
          setLoading(false);
          return;
        }

        let prodData: Product[] = [];
        let blogData: BlogPost[] = [];

        // only call endpoints if intent says so (keeps search fast)
        if (ai.intent?.includes("product")) {
          prodData = await searchProducts(searchQuery);
        }
        if (ai.intent?.includes("blog")) {
          blogData = await searchBlogs(searchQuery);
        }

        resultsCacheRef.current[cacheKey] = { products: prodData, blogs: blogData };

        if (cancelled) return;
        setProducts(prodData);
        setBlogs(blogData);
        setLoading(false);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Failed to load search results. Please try again.");
        setLoading(false);
      }
    }

    doSearch();
    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  function getRelevantSports(query: string): Sport[] {
    if (!query) return [];
    const words = query.toLowerCase().split(/\s+/);
    return sportsData.filter((sport) =>
      words.some((word) => sport.title.toLowerCase().includes(word))
    );
  }

  const matchingSports: Sport[] = useMemo(
    () => getRelevantSports(fixedQuery || searchQuery),
    [fixedQuery, searchQuery]
  );

  const matchingStaticPages: { name: string; path: string }[] = useMemo(
    () =>
      fixedQuery
        ? staticPages.filter((page) => page.name.toLowerCase().includes(fixedQuery.toLowerCase()))
        : [],
    [fixedQuery]
  );

  const hasAnyResults =
    products.length > 0 ||
    blogs.length > 0 ||
    matchingSports.length > 0 ||
    matchingStaticPages.length > 0;

  const shouldShowDidYouMean =
    fixedQuery &&
    searchQuery &&
    fixedQuery.toLowerCase().trim() !== searchQuery.toLowerCase().trim() &&
    !isGibberish;

  if (!searchQuery) {
    return (
      <div className="search-results-page-container">
        <h1 className="search-results-page-title">Search</h1>
        <p className="search-results-page-no-results-text">
          Type something to discover gear, blogs, and communities.
        </p>
        <p className="search-results-page-no-results-suggestion">
          Popular: “running shoes”, “compression shorts”, “hydration tips”
        </p>
      </div>
    );
  }

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={() => window.location.reload()} />;

  if (isGibberish) {
    return (
      <div className="search-results-page-container">
        <h1 className="search-results-page-title">Search</h1>
        <p className="search-results-page-no-results-text">
          We couldn’t recognize that search. Here’s what’s trending:
        </p>
        <div className="search-results-page-suggestions-block">
          <ul className="search-results-page-trending-list">
            {trendingSearches.map((term) => (
              <li
                key={term}
                className="search-results-page-trending-item"
                tabIndex={0}
                role="button"
                onClick={() => navigate(`/search?query=${encodeURIComponent(term)}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate(`/search?query=${encodeURIComponent(term)}`);
                }}
              >
                {term}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (aiIntent.includes("staticPage") && aiPages.length > 0) {
    return (
      <div className="search-results-page-container">
        <h1 className="search-results-page-title">Pages</h1>
        <ul className="search-results-page-list">
          {aiPages.map((page: string) => (
            <li
              key={page}
              className="search-results-page-item"
              onClick={() => navigate(`/${page.toLowerCase()}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="search-results-page-item-title">{page}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (shouldShowDidYouMean) {
    return (
      <div className="search-results-page-container">
        <h1 className="search-results-page-title">Results for: "{searchQuery}"</h1>
        <div className="search-results-page-didyoumean" style={{ textAlign: "center", marginBottom: "1rem" }}>
          Did you mean{" "}
          <span
            className="didyoumean-link"
            style={{
              color: "#A23C20",
              textDecoration: "underline",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            tabIndex={0}
            role="button"
            onClick={() => {
              trackEvent("search_suggestion_click", { suggestion: fixedQuery });
              navigate(`/search?query=${encodeURIComponent(fixedQuery)}`);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate(`/search?query=${encodeURIComponent(fixedQuery)}`);
            }}
          >
            {fixedQuery}
          </span>
          ?
        </div>
      </div>
    );
  }

  if (!hasAnyResults) {
    return (
      <div className="search-results-page-container">
        <h1 className="search-results-page-title">Results for: "{searchQuery}"</h1>
        <div className="search-results-page-no-results" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.85 }}>🧐</div>
          <h2 style={{ fontWeight: 800, color: "#fff", marginBottom: 8 }}>No results found</h2>
          <p className="search-results-page-no-results-text" style={{ marginBottom: 22 }}>
            We couldn't find anything for <b>{searchQuery}</b>.<br />
            Try a different search or explore trending topics:
          </p>
          <div className="search-results-page-suggestions-block">
            <ul className="search-results-page-trending-list">
              {trendingSearches.map((term) => (
                <li
                  key={term}
                  className="search-results-page-trending-item"
                  tabIndex={0}
                  role="button"
                  onClick={() => navigate(`/search?query=${encodeURIComponent(term)}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/search?query=${encodeURIComponent(term)}`);
                  }}
                >
                  {term}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ margin: "1.5em 0 1em" }}>
            <span style={{ color: "#bbb" }}>
              Still stuck?{" "}
              <a href="/contact" style={{ color: "#A23C20" }}>
                Let us know what you’re looking for
              </a>
            </span>
          </div>
          <a
            href="/"
            className="search-results-page-back-home"
            style={{
              display: "inline-block",
              marginTop: 8,
              padding: "0.55em 1.3em",
              background: "#A23C20",
              color: "#fff",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page-container">
      <h1 className="search-results-page-title">Results for: "{searchQuery}"</h1>
      <div className="search-results-page-grid">
        {matchingSports.length > 0 && (
          <section className="search-results-page-section">
            <h3 className="search-results-page-section-title">Communities</h3>
            <ul className="search-results-page-list">
              {matchingSports.map((sport: Sport) => (
                <li
                  key={sport.title}
                  className="search-results-page-item"
                  onClick={() => navigate(`/community/${toSlug(sport.title)}`)}
                  aria-label={`Visit ${sport.title} community page`}
                >
                  <img
                    src={sport.backgroundImage}
                    alt={sport.title}
                    className="search-results-page-image"
                    loading="lazy"
                    decoding="async"
                  />
                  <h4 className="search-results-page-item-title">{sport.title}</h4>
                </li>
              ))}
            </ul>
          </section>
        )}

        {products.length > 0 && (
          <section className="search-results-page-section">
            <h3 className="search-results-page-section-title">Products</h3>
            <div className="search-results-page-list">
              {products.map((product: Product, idx: number) => (
                <ProductCard
                  id={product.id}
                  key={product.id}
                  name={product.name}
                  brand={product.brand || ""}
                  price={product.price}
                  imgUrl={product.imgUrl}
                  slug={product.slug}
                  affiliateLink={product.affiliateLink}
                  isSaved={savedProductIds.includes(product.id)}
                  onToggleSave={() => toggleSaveProduct(product.id)}
                  listIndex={idx}
                  sourcePage="search"
                />
              ))}
            </div>
          </section>
        )}

        {blogs.length > 0 && (
          <section className="search-results-page-section">
            <h3 className="search-results-page-section-title">Blog Posts</h3>
            <ul className="search-results-page-list">
              {blogs.map((blog: BlogPost) => (
                <li
                  key={blog.id}
                  className="search-results-page-item"
                  onClick={() => navigate(`/blog/${blog.slug || blog.id}`)}
                  aria-label={`Read blog titled ${blog.title}`}
                >
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    loading="lazy"
                    decoding="async"
                    width="300"
                    height="180"
                    className="search-results-page-image"
                  />
                  <h4 className="search-results-page-item-title">{blog.title}</h4>
                  <p className="search-results-page-item-meta">
                    By {blog.author} on {new Date(blog.publishedDate).toLocaleDateString()}
                  </p>
                  <p className="search-results-page-item-summary">{blog.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {matchingStaticPages.length > 0 && (
          <section className="search-results-page-section">
            <h3 className="search-results-page-section-title">Pages</h3>
            <ul className="search-results-page-list">
              {matchingStaticPages.map((page) => (
                <li key={page.name} className="search-results-page-item" onClick={() => navigate(page.path)}>
                  <div className="search-results-page-item-title">{page.name}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
