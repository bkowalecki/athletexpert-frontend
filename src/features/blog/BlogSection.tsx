import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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

const fetchLatestBlogs = async (): Promise<BlogPost[]> => {
  const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/blog/latest?limit=3`);
  return data.slice(0, 3);
};

const LatestBlogsSection: React.FC = () => {
  const { data: posts, isLoading, isError } = useQuery<BlogPost[], Error>({
    queryKey: ["latestBlogs"],
    queryFn: fetchLatestBlogs,
    staleTime: 5000,
    retry: 1,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!posts) return;

    const container = document.querySelector(".latest-blog-scroll-row");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          const index = itemRefs.current.findIndex((el) => el === visible.target);
          if (index !== -1) setActiveIndex(index);
        }
      },
      { root: container, threshold: 0.5 }
    );

    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => itemRefs.current.forEach((el) => el && observer.unobserve(el));
  }, [posts]);

  if (isLoading) return <div className="loading">Loading latest blogs...</div>;
  if (isError || !posts) return <div className="error">Error loading blogs. Try again later.</div>;

  const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => (
    <Link
      to={`/blog/${post.slug}`}
      className="latest-blog-card"
      aria-label={`Read blog post: ${post.title}`}
      tabIndex={0} // Not strictly necessary but explicit
    >
      <div className="latest-blog-image-container">
        <img src={post.imageUrl} alt={post.title} className="latest-blog-image" />
      </div>
      <div className="latest-blog-info">
        <h3 className="latest-blog-title">{post.title}</h3>
        <p className="latest-blog-author">By {post.author}</p>
        <p className="latest-blog-date">
          {new Date(post.publishedDate).toLocaleDateString()}
        </p>
        <p className="latest-blog-summary">{post.summary}</p>
      </div>
      {/* No "Read More" button! */}
    </Link>
  );
  

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

        <div className="latest-blog-grid">
          {posts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>

        <div className="latest-blog-scroll-row">
          {posts.map((post, i) => (
            <div
              key={post.id}
              className="latest-blog-scroll-item"
              ref={(el) => (itemRefs.current[i] = el)}
            >
              <BlogCard post={post} />
            </div>
          ))}
        </div>

        <div className="latest-blog-indicators">
          {posts.map((_, i) => (
            <span
              key={i}
              className={`latest-blog-indicator-dot ${activeIndex === i ? "active" : ""}`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default LatestBlogsSection;