// src/api/blog.ts

import api from "./axios";
import { BlogPost, BlogPostForm } from "../types/blogs";

// Get a blog post by slug
export const fetchBlogPost = async (slug: string): Promise<BlogPost> => {
  const { data } = await api.get(`/blog/slug/${slug}`);
  return data;
};

// Get related blogs by slug
export const fetchRelatedBlogs = async (slug: string): Promise<BlogPost[]> => {
  const { data } = await api.get(`/blog/related/${slug}`);
  return data;
};

// Fetch paginated/searchable blog list for the main blog page
export const fetchBlogs = async (
    searchQuery: string,
    page: number,
    sport: string
  ): Promise<BlogPost[]> => {
    // Add any validation you want here (optional)
    const { data } = await api.get("/blog", {
      params: { searchQuery, page, size: 9, sport },
    });
    // Adjust this line if your backend returns data in a different shape!
    return Array.isArray(data?.content) ? data.content : [];
  };

// Get all blogs (admin)
export const fetchAllBlogs = async (): Promise<BlogPost[]> => {
  const { data } = await api.get(`/blog/admin/all`);
  return data;
};

// Fetch latest blogs (limit = number of posts to return)
export const fetchLatestBlogs = async (limit: number = 3): Promise<BlogPost[]> => {
    const { data } = await api.get(`/blog/latest`, { params: { limit } });
    return Array.isArray(data) ? data : [];
  };

// Create new blog (admin)
export const createBlog = async (blog: BlogPostForm) => {
    return api.post(`/blog/admin/blog`, blog);
  };
  
  // Update blog (admin)
  export const updateBlog = async (id: number, blog: BlogPostForm) => {
    return api.put(`/blog/admin/blog/${id}`, blog);
  };

// Delete blog (admin)
export const deleteBlog = async (id: number) => {
  return api.delete(`/blog/${id}`);
};

// Get blogs by tag
export const fetchBlogsByTag = async (tag: string): Promise<BlogPost[]> => {
  const { data } = await api.get(`/blog/by-tag`, { params: { tag } });
  return data;
};

// Search blogs
export const searchBlogs = async (query: string): Promise<BlogPost[]> => {
  const { data } = await api.get(`/blog/search`, { params: { query } });
  return data;
};

// Fetch a user's saved blog IDs
export const fetchSavedBlogIds = async (): Promise<number[]> => {
    const { data } = await api.get("/users/saved-blogs", { withCredentials: true });
    // If your backend sends an array of full blog objects, map to IDs:
    if (Array.isArray(data) && typeof data[0] === "object") return data.map((b: any) => b.id);
    return data; // If already an array of IDs
  };
  
  // Save or unsave a blog
  export const toggleSaveBlogApi = async (blogId: number, isSaved: boolean) => {
    await api({
      method: isSaved ? "DELETE" : "POST",
      url: `/users/saved-blogs/${blogId}`,
      withCredentials: true,
    });
  };
