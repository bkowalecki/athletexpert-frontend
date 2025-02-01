import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet";
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

const fetchPosts = async (searchQuery: string, page: number): Promise<BlogPost[]> => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/blogs`, {
    params: {
      searchQuery,
      page,
      size: 9,
    },
  });
  return response.data.content;
};

const BlogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce applied here
  const [currentPage, setCurrentPage] = useState(0);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const { data, isLoading, refetch, isFetching } = useQuery<BlogPost[], Error>({
    queryKey: ["posts", debouncedSearchQuery, currentPage],
    queryFn: () => fetchPosts(debouncedSearchQuery, currentPage),
    staleTime: 5000,
    gcTime: 10000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData || [], // Retain old data to avoid flickering
  });

  useEffect(() => {
    if (data) {
      setPosts((prevPosts) =>
        currentPage === 0 ? data : [...prevPosts, ...data.filter(post => !prevPosts.some(p => p.id === post.id))]
      );
  
      if (data.length < 9) {
        setHasMorePosts(false);
      } else {
        setHasMorePosts(true);
      }
    }
  }, [data, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page when searching
    setHasMorePosts(true);
  };

  const loadMorePosts = () => {
    if (!isFetching) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // Utility for Debounce
  function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
  
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
  
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
  
    return debouncedValue;
  }

  return (
    <div className="blog-page-container">
      <Helmet>
        <title>Blog - AthleteXpert</title>
        <meta name="description" content="Discover the latest articles and insights on AthleteXpert." />
      </Helmet>

      <h2 className="blog-heading">Blog</h2>

      <div className="blog-search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search blog posts"
          className="blog-search-input"
          aria-label="Search blog posts"
        />
      </div>

      <div className="blog-post-list">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="blog-post-item skeleton-loader"></div>
          ))
        ) : (
          posts.map((post) => (
            <div key={post.id} className="blog-post-item">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="blog-image"
                loading="lazy"
              />
              <div className="blog-info">
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-author">By {post.author}</p>
                <p className="blog-date">{new Date(post.publishedDate).toLocaleDateString()}</p>
                <p className="blog-description">{DOMPurify.sanitize(post.summary)}</p>
                <Link to={`/blog/${post.slug}`} className="cta-button">
                  Read More
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {!isLoading && hasMorePosts && (
        <button onClick={loadMorePosts} className="load-more-button">
          {isFetching ? "Loading..." : "Load More"}
        </button>
      )}

{!isLoading && !isFetching && posts.length === 0 && searchQuery && (
  <div className="no-results">No blog posts found. Try a different search.</div>
)}
    </div>
  );
};

export default BlogPage;
