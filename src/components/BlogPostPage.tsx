import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/BlogPostPage.css"; // Import the CSS for this component

interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  imageUrl: string;  // Assuming the blog post has an image URL field
  content: string;  // Assuming you have a content field for full post text
}

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();  // Get the slug from the URL
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    // Fetch the blog post by slug
    axios
      .get(`${process.env.REACT_APP_API_URL}/blogs/slug/${slug}`)
      .then((response) => {
        setPost(response.data);
      })
      .catch((error) => {
        console.error("Error fetching the blog post!", error);
      });
  }, [slug]);

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="blog-post-page">
      <div className="blog-post-header">
        <h1 className="blog-post-title">{post.title}</h1>
        <p className="blog-post-meta">
          By {post.author} on {new Date(post.publishedDate).toLocaleDateString()}
        </p>
      </div>
      
      {post.imageUrl && (
        <div className="blog-post-image-container">
          <img src={post.imageUrl} alt={post.title} className="blog-post-image" />
        </div>
      )}
      
      <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

    </div>
  );
};

export default BlogPostPage;
