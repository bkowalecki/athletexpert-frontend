import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
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

  const { user, isSessionChecked } = useUserContext();
  const [savedBlogIds, setSavedBlogIds] = useState<number[]>([]);

  // Fetch saved blog IDs for the logged-in user
  useEffect(() => {
    const fetchSaved = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/users/profile`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSavedBlogIds(data.savedBlogIds || []);
      } catch {
        setSavedBlogIds([]);
      }
    };
    fetchSaved();
  }, [user]);

  // Save/Unsave logic
  const toggleSaveBlog = async (blogId: number) => {
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
      toast.error("❌ Error saving blog.");
    }
  };

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
