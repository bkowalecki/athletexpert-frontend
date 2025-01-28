import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/BlogPage.css";

interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  imageUrl: string;
  slug: string;
}

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [blogSearchQuery, setBlogSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const fetchPosts = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/blogs`,
        {
          params: {
            searchQuery: blogSearchQuery,
            page: page,
            size: 9, // Ensures consistent page size for pagination
          },
        }
      );
      const newPosts = response.data.content;

      // If fewer items than the page size are returned, there are no more posts.
      const noMorePosts = newPosts.length < 9;

      setPosts((prevPosts) =>
        page === 0 ? newPosts : [...prevPosts, ...newPosts]
      );
      setHasMorePosts(!noMorePosts);
    } catch (error) {
      console.error("Error fetching blog posts!", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(0); // Fetch initial posts
    setCurrentPage(0); // Reset page number
  }, [blogSearchQuery]); // Refetch when the search query changes

  const loadMorePosts = () => {
    if (!isLoading && hasMorePosts) {
      const nextPage = currentPage + 1;
      fetchPosts(nextPage);
      setCurrentPage(nextPage);
    }
  };

  return (
    <div className="blog-page-container">
      <h2 className="blog-heading">Blog</h2>

      {/* Search Input */}
      <div className="blog-search-container">
        <input
          type="text"
          value={blogSearchQuery}
          onChange={(e) => setBlogSearchQuery(e.target.value)}
          placeholder="Search blog posts"
          className="blog-search-input"
        />
      </div>

      {/* Blog Posts */}
      <div className="blog-post-list">
        {posts.map((post) => (
          <div key={post.id} className="blog-post-item">
            <img src={post.imageUrl} alt={post.title} className="blog-image" />
            <div className="blog-info">
              <h3>{post.title}</h3>
              <p>By {post.author}</p>
              <p>{new Date(post.publishedDate).toLocaleDateString()}</p>
              <p>{post.summary}</p>
              <Link to={`/blog/${post.slug}`} className="cta-button">
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMorePosts && !isLoading && (
        <button onClick={loadMorePosts} className="load-more-button">
          Load More
        </button>
      )}

      {/* Loading Indicator */}
      {isLoading && <div className="loading-indicator">Loading...</div>}

      {/* No Posts Found */}
      {!isLoading && posts.length === 0 && (
        <div className="no-results">No blog posts found. Try a different search.</div>
      )}
    </div>
  );
};

export default BlogPage;
