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
  const [currentPage, setCurrentPage] = useState(0);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const { data, isLoading, refetch, isFetching } = useQuery<BlogPost[], Error>({
    queryKey: ["posts", searchQuery, currentPage],
    queryFn: () => fetchPosts(searchQuery, currentPage),
    staleTime: 5000,
    gcTime: 10000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setPosts((prevPosts) =>
        currentPage === 0 ? data : [...prevPosts, ...data]
      );

      if (data.length < 9) {
        setHasMorePosts(false); // Hide button if fewer than 9 posts are fetched
      } else {
        setHasMorePosts(true);
      }
    }
  }, [data, currentPage]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(0);
      setHasMorePosts(true); // Reset for new search
      refetch();
    },
    [refetch]
  );

  const loadMorePosts = () => {
    if (!isFetching) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

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

      {!isLoading && posts.length === 0 && (
        <div className="no-results">No blog posts found. Try a different search.</div>
      )}
    </div>
  );
};

export default BlogPage;
