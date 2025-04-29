import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/SearchResults.css";
import sportsDataRaw from "../../data/sports.json";

interface Sport {
  title: string;
  backgroundImage: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  imgUrl: string;
}

interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  imageUrl: string;
  slug: string; // You may need to ensure this field is available
}

const SearchResults: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("query") || "";

  const sportsData = sportsDataRaw as Sport[];
  const matchingSports = sportsData.filter((sport) =>
    sport.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!searchQuery.trim()) return;

    const fetchResults = async () => {
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
      } catch (err) {
        setError("Failed to load search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.search]);

  return (
    <div className="search-results-page-container">
      <h2 className="search-results-page-title">
        Results for: "{searchQuery}"
      </h2>
      <p className="search-results-count">
        Found {products.length + blogs.length + matchingSports.length} results
      </p>

      {loading && <p className="search-results-page-loading">Loading...</p>}
      {error && <p className="search-results-page-error">{error}</p>}

      {!loading && !error && products.length === 0 && blogs.length === 0 && (
        <div className="search-results-page-no-results">
          {/* <img src="/images/no-results.svg" alt="No results" className="search-results-page-no-results-img" /> */}
          <p className="search-results-page-no-results-text">
            No results found.
          </p>
          <p className="search-results-page-no-results-suggestion">
            Try different keywords or browse our content.
          </p>
          <a href="/" className="search-results-page-back-home">
            Return to Homepage
          </a>
        </div>
      )}

      <div className="search-results-page-grid">
        {matchingSports.length > 0 && (
          <section className="search-results-page-section">
            <h3 className="search-results-page-section-title">Communities</h3>
            <ul className="search-results-page-list">
              {matchingSports.map((sport, index) => (
                <li
                  key={sport.title}
                  className="search-results-page-item"
                  onClick={() =>
                    navigate(`/community/${sport.title.toLowerCase()}`)
                  }
                >
                  <img
                    src={sport.backgroundImage}
                    alt={sport.title}
                    className="search-results-page-image"
                  />
                  <h4 className="search-results-page-item-title">
                    {sport.title}
                  </h4>
                </li>
              ))}
            </ul>
          </section>
        )}

        {products.length > 0 && (
          <section className="search-results-page-section">
            <h3 className="search-results-page-section-title">Products</h3>
            <ul className="search-results-page-list">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="search-results-page-item"
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/product/${product.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/product/${product.id}`);
                  }}
                >
                  <img
                    src={product.imgUrl}
                    alt={product.name}
                    className="search-results-page-image"
                  />
                  <h4 className="search-results-page-item-title">
                    {product.name}
                  </h4>
                  <p className="search-results-page-item-price">
                    ${product.price.toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
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
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="search-results-page-image"
                  />
                  <h4 className="search-results-page-item-title">
                    {blog.title}
                  </h4>
                  <p className="search-results-page-item-meta">
                    By {blog.author} on{" "}
                    {new Date(blog.publishedDate).toLocaleDateString()}
                  </p>
                  <p className="search-results-page-item-summary">
                    {blog.summary}
                  </p>
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
