import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // Import useLocation to track URL changes
import '../../styles/SearchResults.css';

// Interface for product data
interface Product {
  id: number;
  name: string;
  price: number;
  imgUrl: string;
}

// Interface for blog post data
interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  imageUrl: string;
  sport: string;
}

const SearchResults: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation(); // ✅ Reactively track URL changes
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("query") || ""; 

  useEffect(() => {
    if (!searchQuery.trim()) return; // Prevent fetching on empty query

    const fetchResults = async () => {
      setLoading(true);
      try {
        const [productResponse, blogResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/products/search`, {
            params: { query: searchQuery },
            withCredentials: true,
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/blogs/search`, {
            params: { query: searchQuery },
            withCredentials: true,
          }),
        ]);

        setProducts(productResponse.data);
        setBlogs(blogResponse.data);
      } catch (err) {
        setError("Failed to load search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.search]); // ✅ Re-fetch results when URL search query changes
  console.log("Product Image URL:", products); 
  return (
    <div className="search-results-page-container">
      <h2 className="search-results-page-title">Search Results for: "{searchQuery}"</h2>

      {/* Loading State */}
      {loading && <p className="search-results-page-loading">Loading search results...</p>}

      {/* Error State */}
      {error && <p className="search-results-page-error">{error}</p>}

      {/* No Results Styling */}
      {!loading && !error && products.length === 0 && blogs.length === 0 && (
        <div className="search-results-page-no-results">
          <img src="/images/no-results.svg" alt="No results found" className="search-results-page-no-results-img" />
          <p className="search-results-page-no-results-text">No results found for "{searchQuery}".</p>
          <p className="search-results-page-no-results-suggestion">Try searching for something else or browse our latest products and blogs!</p>
          <a href="/" className="search-results-page-back-home">Return to Homepage</a>
        </div>
      )}

      <div className="search-results-page-grid">
        {/* Product Results */}
        {products.length > 0 && (
          <section className="search-results-page-section">
            <h3 className="search-results-page-section-title">Products</h3>
            <ul className="search-results-page-list">
              {products.map((product) => (
                <li key={product.id} className="search-results-page-item">
                  <img src={product.imgUrl} alt={product.name} className="search-results-page-image" />
                  <h4 className="search-results-page-item-title">{product.name}</h4>
                  <p className="search-results-page-item-price">${product.price.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Blog Results */}
        {blogs.length > 0 && (
          <section className="search-results-page-section">
            <h3 className="search-results-page-section-title">Blog Posts</h3>
            <ul className="search-results-page-list">
              {blogs.map((blog) => (
                <li key={blog.id} className="search-results-page-item">
                  <img src={blog.imageUrl} alt={blog.title} className="search-results-page-image" />
                  <h4 className="search-results-page-item-title">{blog.title}</h4>
                  <p className="search-results-page-item-meta">By {blog.author} on {new Date(blog.publishedDate).toLocaleDateString()}</p>
                  <p className="search-results-page-item-summary">{blog.summary}</p>
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
