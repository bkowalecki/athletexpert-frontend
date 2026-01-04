// src/api/blog.ts

import api from "./axios";
import type { BlogPost, BlogPostForm } from "../types/blogs";

/**
 * Fetch a blog post by slug
 */
export const fetchBlogPost = async (slug: string): Promise<BlogPost> => {
  const { data } = await api.get<BlogPost>(`/blog/slug/${encodeURIComponent(slug)}`);
  return data;
};

/**
 * Fetch related blogs by slug
 */
export const fetchRelatedBlogs = async (slug: string): Promise<BlogPost[]> => {
  const { data } = await api.get<BlogPost[]>(`/blog/related/${encodeURIComponent(slug)}`);
  return Array.isArray(data) ? data : [];
};

/**
 * Fetch paginated/searchable blogs
 */
export const fetchBlogs = async (
  searchQuery: string,
  page: number,
  sport: string
): Promise<BlogPost[]> => {
  const { data } = await api.get("/blog", {
    params: {
      searchQuery: searchQuery || undefined,
      page,
      size: 9,
      sport: sport || undefined,
    },
  });

  return Array.isArray(data?.content) ? data.content : [];
};

/**
 * Fetch all blogs (admin)
 */
export const fetchAllBlogs = async (): Promise<BlogPost[]> => {
  const { data } = await api.get<BlogPost[]>("/blog/admin/all");
  return Array.isArray(data) ? data : [];
};

/**
 * Fetch latest blogs
 */
export const fetchLatestBlogs = async (
  limit: number = 3
): Promise<BlogPost[]> => {
  const { data } = await api.get<BlogPost[]>("/blog/latest", {
    params: { limit },
  });
  return Array.isArray(data) ? data : [];
};

/**
 * Create blog (admin)
 */
export const createBlog = async (
  blog: BlogPostForm
): Promise<BlogPost> => {
  const { data } = await api.post<BlogPost>("/blog/admin/blog", blog);
  return data;
};

/**
 * Update blog (admin)
 */
export const updateBlog = async (
  id: number,
  blog: BlogPostForm
): Promise<BlogPost> => {
  const { data } = await api.put<BlogPost>(`/blog/admin/blog/${id}`, blog);
  return data;
};

/**
 * Delete blog (admin)
 */
export const deleteBlog = async (id: number): Promise<void> => {
  await api.delete(`/blog/${id}`);
};

/**
 * Fetch blogs by tag
 */
export const fetchBlogsByTag = async (tag: string): Promise<BlogPost[]> => {
  const { data } = await api.get<BlogPost[]>("/blog/by-tag", {
    params: { tag },
  });
  return Array.isArray(data) ? data : [];
};

/**
 * Search blogs
 */
export const searchBlogs = async (query: string): Promise<BlogPost[]> => {
  const { data } = await api.get<BlogPost[]>("/blog/search", {
    params: { query },
  });
  return Array.isArray(data) ? data : [];
};
