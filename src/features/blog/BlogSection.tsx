import React, { useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import BlogCard from "./BlogCard";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
import { BlogPost } from "../../types/blogs";
import { fetchLatestBlogs } from "../../api/blog";
import { fetchSavedBlogIds, toggleSaveBlog as toggleSaveBlogApi } from "../../api/user";
import "../../styles/BlogSection.css";

const LatestBlogsSection: React.FC = () => {
  // 1. Blogs
  const { data: posts, isLoading, isError } = useQuery<BlogPost[], Error>({
    queryKey: ["latestBlogs"],
    queryFn: () => fetchLatestBlogs(3),
    staleTime: 5000,
    retry: 1,
  });

  // 2. Saved blog IDs (for user save/unsave)
  const { user, isSessionChecked } = useUserContext();
  const [savedBlogIds, setSavedBlogIds] = useState<number[]>([]);

  useEffect(() => {
    if (!user) {
      setSavedBlogIds([]);
      return;
    }
    fetchSavedBlogIds()
      .then(setSavedBlogIds)
      .catch(() => setSavedBlogIds([]));
  }, [user]);

  // 3. Save/unsave blog logic
  const toggleSaveBlog = useCallback(
    async (blogId: number) => {
      if (!user) return toast.warn("Log in to save blogs!");
      const isSaved = savedBlogIds.includes(blogId);
      try {
        await toggleSaveBlogApi(blogId, isSaved);
        setSavedBlogIds((prev) =>
          isSaved ? prev.filter((id) => id !== blogId) : [...prev, blogId]
        );
        toast.success(isSaved ? "Blog removed!" : "Blog saved!");
      } catch {
        toast.error("Error saving blog.");
      }
    },
    [user, savedBlogIds]
  );

  // 4. Session check (if you want to HIDE this section until session/user is loaded)
  if (!isSessionChecked) return null;
  if (isLoading) return <div className="loading">Loading latest blogs...</div>;
  if (isError || !posts) return <div className="error">Error loading blogs. Try again later.</div>;

  // 5. Render
  return (
    <section className="latest-blog-section-container">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="latest-blog-section-content"
      >
        <h2 className="latest-blog-heading">
          <a href="/blog" className="latest-blog-link">Latest</a>
        </h2>
        <div className="latest-blog-grid">
          {posts.slice(0, 3).map((post) => (
            <BlogCard
              key={post.id}
              id={post.id}
              title={post.title}
              author={post.author}
              slug={post.slug}
              imageUrl={post.imageUrl}
              publishedDate={post.publishedDate}
              summary={post.summary}
              variant="latest"
              isSaved={savedBlogIds.includes(post.id)}
              onSave={() => toggleSaveBlog(post.id)}
              onUnsave={() => toggleSaveBlog(post.id)}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default LatestBlogsSection;
