import React, { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BlogCard from "./BlogCard";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
import type { BlogPost } from "../../types/blogs";
import { fetchLatestBlogs } from "../../api/blog";
import {
  fetchSavedBlogIds,
  toggleSaveBlog as toggleSaveBlogApi,
} from "../../api/user";
import "../../styles/BlogSection.css";

const LATEST_BLOG_LIMIT = 3;

const LatestBlogsSection: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  const {
    data: posts,
    isLoading,
    isError,
  } = useQuery<BlogPost[], Error>({
    queryKey: ["latestBlogs", LATEST_BLOG_LIMIT],
    queryFn: () => fetchLatestBlogs(LATEST_BLOG_LIMIT),
    staleTime: 5_000,
    retry: 1,
  });

  const userKey = user?.username ?? "guest";

  const { data: savedBlogIds = [] } = useQuery<number[]>({
    queryKey: ["savedBlogs", userKey],
    queryFn: fetchSavedBlogIds,
    enabled: !!user,
    staleTime: 60_000,
  });

  const savedSet = useMemo(() => new Set(savedBlogIds), [savedBlogIds]);

  const toggleSaveBlog = useCallback(
    async (blogId: number) => {
      if (!user) {
        toast.warn("Log in to save blogs!");
        return;
      }

      const isSaved = savedSet.has(blogId);
      const queryKey = ["savedBlogs", userKey] as const;

      // Optimistic update
      const prev = queryClient.getQueryData<number[]>(queryKey) ?? [];
      const next = isSaved ? prev.filter((id) => id !== blogId) : [...prev, blogId];
      queryClient.setQueryData<number[]>(queryKey, next);

      try {
        await toggleSaveBlogApi(blogId, isSaved);
        toast.success(isSaved ? "Blog removed!" : "Blog saved!");
      } catch {
        // Rollback
        queryClient.setQueryData<number[]>(queryKey, prev);
        toast.error("Error saving blog.");
      }
    },
    [user, savedSet, queryClient, userKey]
  );

  if (isLoading) return <div className="loading">Loading latest blogs...</div>;
  if (isError || !posts)
    return <div className="error">Error loading blogs. Try again later.</div>;

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
          {posts.slice(0, LATEST_BLOG_LIMIT).map((post) => (
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
              isSaved={savedSet.has(post.id)}
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
