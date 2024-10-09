import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/SearchResults.css';

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
  sport: string; // Added sport field to match blog post filtering
}

const SearchResults: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Parse query from the URL
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
          `${process.env.REACT_APP_API_URL}/blogs?limit=50` // Fetching more blogs, limit based on your needs
        );

        setProducts(productResponse.data);
        setBlogs(filterBlogs(blogResponse.data, searchQuery));
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    fetchResults();
  }, [query]);

  // Filter blog posts by sport and search query (similar to BlogPage filtering)
  const filterBlogs = (blogs: BlogPost[], searchQuery: string): BlogPost[] => {
    const lowerCaseSearchQuery = searchQuery.toLowerCase();

    return blogs.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(lowerCaseSearchQuery) || 
                            post.summary.toLowerCase().includes(lowerCaseSearchQuery);
      const matchesSport = post.sport.toLowerCase().includes(lowerCaseSearchQuery); // Matches the sport field
      
      return matchesSearch || matchesSport; // Return if either title/summary or sport matches
    });
  };

  return (
    <div className="search-results-container">
      <h2 className="search-results-title">Search Results for: "{query}"</h2>

      {/* Product Results Section */}
      <div className="product-results">
        <h3 className="product-results-title">Products</h3>
        {products.length > 0 ? (
          <ul className="product-list">
            {products.map((product) => (
              <li key={product.id} className="product-item">
                <img src={product.imgUrl} alt={product.name} className="product-image" />
                <h4 className="product-name">{product.name}</h4>
                <p className="product-price">${product.price.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-results-message">No products to display.</p>
        )}
      </div>

      {/* Blog Results Section */}
      <div className="blog-results">
        <h3 className="blog-results-title">Blog Posts</h3>
        {blogs.length > 0 ? (
          <ul className="blog-list">
            {blogs.map((blog) => (
              <li key={blog.id} className="blog-item">
                <img src={blog.imageUrl} alt={blog.title} className="blog-image" />
                <h4 className="blog-title">{blog.title}</h4>
                <p className="blog-meta">
                  By {blog.author} on {new Date(blog.publishedDate).toLocaleDateString()}
                </p>
                <p className="blog-summary">{blog.summary}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-results-message">No blog posts to display.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
