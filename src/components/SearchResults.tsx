import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/SearchResults.css';

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
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Get search query from URL params
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('query') || '';
    setQuery(searchQuery);

    // Fetch products and blogs
    const fetchResults = async () => {
      try {
        const productResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/products/search?query=${searchQuery}`
        );
        const blogResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/blogs/search?query=${searchQuery}`
        );

        setProducts(productResponse.data);
        setBlogs(blogResponse.data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="search-results-container">
      <h2 className="search-results-title">Search Results for: "{query}"</h2>

      {/* Product Results Section */}
      {products.length > 0 ? (
        <div className="results-section">
          <h3 className="section-title">Products</h3>
          <ul className="results-list">
            {products.map((product) => (
              <li key={product.id} className="results-item">
                <img src={product.imgUrl} alt={product.name} className="results-image" />
                <h4 className="results-item-title">{product.name}</h4>
                <p className="results-item-price">${product.price.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="no-results-message">No products found.</p>
      )}

      {/* Blog Results Section */}
      {blogs.length > 0 ? (
        <div className="results-section">
          <h3 className="section-title">Blog Posts</h3>
          <ul className="results-list">
            {blogs.map((blog) => (
              <li key={blog.id} className="results-item">
                <img src={blog.imageUrl} alt={blog.title} className="results-image" />
                <h4 className="results-item-title">{blog.title}</h4>
                <p className="results-item-meta">
                  By {blog.author} on {new Date(blog.publishedDate).toLocaleDateString()}
                </p>
                <p className="results-item-summary">{blog.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="no-results-message">No blog posts found.</p>
      )}
    </div>
  );
};

export default SearchResults;
