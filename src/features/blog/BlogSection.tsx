import React, { useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import BlogCard from "./BlogCard";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
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

// API fetch helpers
const fetchLatestBlogs = async (): Promise<BlogPost[]> => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/blog/latest?limit=3`);
  if (!res.ok) throw new Error("Failed to fetch latest blogs");
  const data = await res.json();
  return data.slice(0, 3);
};

const fetchSavedBlogIds = async (): Promise<number[]> => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/users/profile`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  const data = await res.json();
  return data.savedBlogIds || [];
};

const LatestBlogsSection: React.FC = () => {
  const { data: posts, isLoading, isError } = useQuery<BlogPost[], Error>({
    queryKey: ["latestBlogs"],
    queryFn: fetchLatestBlogs,
    staleTime: 5000,
    retry: 1,
  });

  const { user, isSessionChecked } = useUserContext();
  const [savedBlogIds, setSavedBlogIds] = useState<number[]>([]);

  // Keep savedBlogIds in sync for logged-in user
  useEffect(() => {
    if (!user) {
      setSavedBlogIds([]);
      return;
    }
    fetchSavedBlogIds()
      .then(setSavedBlogIds)
      .catch(() => setSavedBlogIds([]));
  }, [user]);

  // Save/unsave logic (stable reference)
  const toggleSaveBlog = useCallback(
    async (blogId: number) => {
      if (!user) return toast.warn("Log in to save blogs!");

      const isSaved = savedBlogIds.includes(blogId);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/users/saved-blogs/${blogId}`,
          {
            method: isSaved ? "DELETE" : "POST",
            credentials: "include",
          }
        );
        if (res.ok) {
          setSavedBlogIds((prev) =>
            isSaved ? prev.filter((id) => id !== blogId) : [...prev, blogId]
          );
          toast.success(isSaved ? "Blog removed!" : "Blog saved!");
        }
      } catch {
        toast.error("Error saving blog.");
      }
    },
    [user, savedBlogIds]
  );

  if (!isSessionChecked) return null;
  if (isLoading) return <div className="loading">Loading latest blogs...</div>;
  if (isError || !posts) return <div className="error">Error loading blogs. Try again later.</div>;

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
          {posts.map((post) => (
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
