import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import "../../styles/BlogSection.css";

interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  imageUrl: string;
  slug: string;
}

// API call to fetch the latest blogs (limit=3)
const fetchLatestBlogs = async (): Promise<BlogPost[]> => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/blog/latest?limit=3`
  );
  // Ensure only 3 posts are returned even if more are provided.
  return response.data.slice(0, 3);
};

const LatestBlogsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use react-query to fetch the latest blogs.
  const { data: posts, isLoading, isError } = useQuery<BlogPost[], Error>({
    queryKey: ["latestBlogs"],
    queryFn: fetchLatestBlogs,
    staleTime: 5000,
    retry: 1,
  });

  const nextSlide = () => {
    if (posts && posts.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
    }
  };

  const prevSlide = () => {
    if (posts && posts.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? posts.length - 1 : prevIndex - 1
      );
    }
  };

  if (isLoading) {
    return <div className="loading">Loading latest blogs...</div>;
  }

  if (isError || !posts) {
    return (
      <div className="error">
        Error loading latest blogs. Please try again later.
      </div>
    );
  }

  return (
    <section className="latest-blog-section-container">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="latest-blog-section-content"
      >
        <h2 className="latest-blog-heading">Latest</h2>

        {/* Desktop Grid View */}
        {posts.length > 0 && (
          <div className="latest-blog-grid">
            {posts.map((post) => (
              <div key={post.id} className="latest-blog-card">
                <div className="latest-blog-image-container">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="latest-blog-image"
                  />
                </div>
                <div className="latest-blog-info">
                  <h3 className="latest-blog-title">{post.title}</h3>
                  <p className="latest-blog-author">By {post.author}</p>
                  <p className="latest-blog-date">
                    {new Date(post.publishedDate).toLocaleDateString()}
                  </p>
                  <p className="latest-blog-summary">{post.summary}</p>
                </div>
                <div className="latest-blog-cta-container">
                  <Link to={`/blog/${post.slug}`} className="latest-blog-cta-button">
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Carousel View */}
        {posts.length > 0 && (
          <div className="latest-blog-carousel-wrapper">
            <button
              className="latest-blog-carousel-button left"
              onClick={prevSlide}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 100"
                fill="currentColor"
                width="24px"
                height="80px"
              >
                <path
                  d="M40 5 L10 50 L40 95"
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="none"
                />
              </svg>
            </button>
            <div className="latest-blog-carousel">
              <AnimatePresence mode="wait">
                <motion.div
                  key={posts[currentIndex].id}
                  initial={{ opacity: 0, x: "100%" }}
                  animate={{ opacity: 1, x: "0%" }}
                  exit={{ opacity: 0, x: "-100%" }}
                  transition={{ duration: 0.5 }}
                  className="latest-blog-carousel-item"
                >
                  <div className="latest-blog-card">
                    <div className="latest-blog-image-container">
                      <img
                        src={posts[currentIndex].imageUrl}
                        alt={posts[currentIndex].title}
                        className="latest-blog-image"
                      />
                    </div>
                    <div className="latest-blog-info">
                      <h3 className="latest-blog-title">
                        {posts[currentIndex].title}
                      </h3>
                      <p className="latest-blog-author">
                        By {posts[currentIndex].author}
                      </p>
                      <p className="latest-blog-date">
                        {new Date(
                          posts[currentIndex].publishedDate
                        ).toLocaleDateString()}
                      </p>
                      <p className="latest-blog-summary">
                        {posts[currentIndex].summary}
                      </p>
                    </div>
                    <div className="latest-blog-cta-container">
                      <Link
                        to={`/blog/${posts[currentIndex].slug}`}
                        className="latest-blog-cta-button"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <button
              className="latest-blog-carousel-button right"
              onClick={nextSlide}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 100"
                fill="currentColor"
                width="24px"
                height="80px"
              >
                <path
                  d="M10 5 L40 50 L10 95"
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="none"
                />
              </svg>
            </button>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default LatestBlogsSection;
