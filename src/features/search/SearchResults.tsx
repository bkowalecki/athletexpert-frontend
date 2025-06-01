import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/SearchResults.css";
import ProductCard from "../products/ProductCard";
import sportsDataRaw from "../../data/sports.json";

interface Sport {
  title: string;
  backgroundImage: string;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  imgUrl: string;
  affiliateLink: string;
}

interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  imageUrl: string;
  slug: string;
}

const staticPages = [
  { name: "About", path: "/about" },
  { name: "Terms of Service", path: "/terms" },
  { name: "Privacy Policy", path: "/privacy" },
];

const SearchResults: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedProductIds, setSavedProductIds] = useState<number[]>([]);
  const [savingProductIds, setSavingProductIds] = useState<number[]>([]);

  const { user } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();

  const searchQuery = useMemo(
    () => new URLSearchParams(location.search).get("query")?.trim().toLowerCase() ?? "",
    [location.search]
  );

  const isMobile = window.innerWidth <= 768;
  const isPwa = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
  const isMobilePwa = isMobile && isPwa;

  const sportsData = sportsDataRaw as Sport[];
  const matchingSports = useMemo(
    () => sportsData.filter((sport) => sport.title.toLowerCase().includes(searchQuery)),
    [searchQuery]
  );
  const matchingStaticPages = useMemo(
    () => staticPages.filter((page) => page.name.toLowerCase().includes(searchQuery)),
    [searchQuery]
  );

  useEffect(() => {
    if (!searchQuery) {
      setProducts([]);
      setBlogs([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, blogRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/products/search`, {
            params: { query: searchQuery },
            withCredentials: true,
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/blog/search`, {
            params: { query: searchQuery },
            withCredentials: true,
          }),
        ]);

        setProducts(productRes.data);
        setBlogs(blogRes.data);

        if (user) {
          const savedRes = await axios.get(`${process.env.REACT_APP_API_URL}/users/saved-products`, {
            withCredentials: true,
          });
          setSavedProductIds(savedRes.data.map((p: Product) => p.id));
        }
      } catch {
        setError("Failed to load search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, user]);

  const toggleSaveProduct = async (productId: number) => {
    if (!user) return toast.warn("⚠️ Log in to save products!");
    const isSaved = savedProductIds.includes(productId);
    setSavingProductIds((prev) => [...prev, productId]);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/saved-products/${productId}`, {
        method: isSaved ? "DELETE" : "POST",
        credentials: "include",
      });

      if (res.ok) {
        setSavedProductIds((prev) =>
          isSaved ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
        toast.success(isSaved ? "Product removed!" : "Product saved!");
      }
    } catch {
      toast.error("❌ Error saving product.");
    } finally {
      setSavingProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  if (!searchQuery) {
    return (
      <div className="search-results-page-container">
        <h1 className="search-results-page-title">Search</h1>

        {isMobilePwa && (
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search gear, blogs, and communities..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    navigate(`/search?query=${encodeURIComponent(target.value.trim())}`);
                  }
                }
              }}
              style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", borderRadius: "8px", border: "1px solid #ccc" }}
            />
          </div>
        )}

        <p className="search-results-page-no-results-text">
          Type something to discover gear, blogs, and communities.
        </p>
        <p className="search-results-page-no-results-suggestion">
          Popular: “running shoes”, “compression shorts”, “hydration tips”
        </p>
      </div>
    );
  }

  return (
    <div className="search-results-page-container">
      <h1 className="search-results-page-title">Results for: "{searchQuery}"</h1>

      {error && <p className="search-results-page-error">{error}</p>}

      {!loading && !error && products.length === 0 && blogs.length === 0 && (
        <div className="search-results-page-no-results">
          <p className="search-results-page-no-results-text">No results found.</p>
          <p className="search-results-page-no-results-suggestion">
            Try different keywords or browse our content.
          </p>
          <a href="/" className="search-results-page-back-home">Return to Homepage</a>
        </div>
      )}

      <div className="search-results-page-grid">
        {matchingSports.length > 0 && (
          <section className="search-results-page-section">
            <h3 className="search-results-page-section-title">Communities</h3>
            <ul className="search-results-page-list">
              {matchingSports.map((sport) => (
                <li
                  key={sport.title}
                  className="search-results-page-item"
                  onClick={() => navigate(`/community/${sport.title.toLowerCase()}`)}
                >
                  <img src={sport.backgroundImage} alt={sport.title} className="search-results-page-image" />
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
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  brand={product.brand || ""}
                  price={product.price}
                  imgUrl={product.imgUrl}
                  affiliateLink={product.affiliateLink}
                  isSaved={savedProductIds.includes(product.id)}
                  isSaving={savingProductIds.includes(product.id)}
                  onToggleSave={() => toggleSaveProduct(product.id)}
                />
              ))}
            </div>
          </section>
        )}

        {blogs.length > 0 && (
          <section className="search-results-page-section">
            <h3 className="search-results-page-section-title">Blog Posts</h3>
            <ul className="search-results-page-list">
              {blogs.map((blog) => (
                <li
                  key={blog.id}
                  className="search-results-page-item"
                  onClick={() => navigate(`/blog/${blog.slug || blog.id}`)}
                >
                  <img src={blog.imageUrl} alt={blog.title} className="search-results-page-image" />
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
                <li
                  key={page.name}
                  className="search-results-page-item"
                  onClick={() => navigate(page.path)}
                >
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
