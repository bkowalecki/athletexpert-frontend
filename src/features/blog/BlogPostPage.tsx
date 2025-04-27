import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate(); // ⭐ Add navigate hook

  const { data: post, isLoading, isError } = useQuery<BlogPost, Error>({
    queryKey: ["blogPost", slug],
    queryFn: () => fetchBlogPost(slug as string),
    enabled: !!slug,
    retry: 1,
  });

  // ⭐ Automatically redirect to /404 if error or no post
  useEffect(() => {
    if (isError || (!isLoading && !post)) {
      console.warn(`⚠️ Blog post not found. Redirecting to /404.`);
      navigate("/404", { replace: true });
    }
  }, [isError, isLoading, post, navigate]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // ❌ Remove the old manual error block
  // if (isError || !post) { return <div className="error">...</div> }

  return (
    <div className="blog-post-page">
      <Helmet>
        <title>{post?.title} - AthleteXpert</title>
        <meta name="description" content="Read the full article on AthleteXpert." />
      </Helmet>

      <div className="back-link-container">
        <Link to="/blog" className="back-link">
          ← Back to Blog
        </Link>
      </div>

      {post?.imageUrl && (
        <div className="blog-post-image-container">
          <img src={post.imageUrl} alt={`Image for ${post.title}`} className="blog-post-image" />
        </div>
      )}

      <div className="blog-post-header">
        <h1 className="blog-post-title">{post?.title}</h1>
        <div className="blog-post-author-and-date">
          <p className="blog-post-meta">By {post?.author}</p>
          <p>{post?.publishedDate && new Date(post.publishedDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div
        className="blog-post-content"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post?.content || "") }}
      />
    </div>
  );
};

export default BlogPostPage;
