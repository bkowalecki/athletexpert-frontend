import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/BlogSection.css";

interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  imageUrl: string;
  link: string;
  slug: string;
}

const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Fetch the latest blog posts (assuming API returns latest)
    axios
      .get(`${process.env.REACT_APP_API_URL}/blogs/latest?limit=3`)
      .then((response) => {
        setPosts(response.data.slice(0, 4)); // Limit the displayed posts to 4
      })
      .catch((error) => {
        console.error("Error fetching the latest blog posts!", error);
      });
  }, []);

  return (
    <div className="blog-list-container">
      <h2 className="heading">Blogs</h2>
      <ul className="blog-section-list">
        {posts.map((post) => (
          <li key={post.id} className="blog-section-item">
            <div className="blog-image-container">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="blog-section-image"
              />
            </div>
            <div className="blog-section-info">
              <h3 className="blog-section-title">{post.title}</h3>
              <p className="blog-section-author">By {post.author}</p>
              <p className="blog-section-date">
              <i className="fas fa-calendar-alt"></i> 
            
                {new Date(post.publishedDate).toLocaleDateString()}
              </p>
              <p className="blog-summary">{post.summary}</p>
            </div>
            <Link to={`/blog/${post.slug}`} className="blog-section-cta-button">
              Read More
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogSection;
