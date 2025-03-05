import React from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet";
import "../../styles/BlogPostPage.css";

interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  sport: string;
  imageUrl: string;
  content: string;
}

// Function to fetch a blog post by its slug
const fetchBlogPost = async (slug: string): Promise<BlogPost> => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/blogs/slug/${slug}`
  );
  return response.data;
};

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Use object-style configuration for useQuery to avoid argument errors
  const { data: post, isLoading, isError } = useQuery<BlogPost, Error>({
    queryKey: ["blogPost", slug],
    queryFn: () => fetchBlogPost(slug as string),
    enabled: !!slug, // Only run if slug exists
    retry: 1,
  });

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (isError || !post) {
    return (
      <div className="error">
        Error loading blog post. Please try again later.
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      <Helmet>
        <title>{post.title} - AthleteXpert</title>
        <meta name="description" content="Read the full article on AthleteXpert." />
      </Helmet>

      <div className="back-link-container">
        <Link to="/blog" className="back-link">
          ← Back to Blog
        </Link>
      </div>

      {post.imageUrl && (
        <div className="blog-post-image-container">
          <img src={post.imageUrl} alt={post.title} className="blog-post-image" />
        </div>
      )}

      <div className="blog-post-header">
        <h1 className="blog-post-title">{post.title}</h1>
        <div className="blog-post-author-and-date">
          <p className="blog-post-meta">By {post.author}</p>
          <p>{new Date(post.publishedDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div
        className="blog-post-content"
        // Sanitize HTML content to prevent XSS vulnerabilities
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
      />
    </div>
  );
};

export default BlogPostPage;
