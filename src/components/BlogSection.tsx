import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/BlogSection.css"; // Updated CSS file name

interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  imageUrl: string;
  slug: string;
}

const LatestBlogsSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Fetch the latest blog posts (assuming API returns latest)
    axios
      .get(`${process.env.REACT_APP_API_URL}/blogs/latest?limit=3`)
      .then((response) => {
        setPosts(response.data.slice(0, 3)); // Limit the displayed posts to 3
      })
      .catch((error) => {
        console.error("Error fetching the latest blog posts!", error);
      });
  }, []);

  return (
    <section className="latest-blog-list-container">
      <h2 className="latest-blog-heading">Latest Blogs</h2>
      <div className="latest-blog-section-list">
        {posts.map((post) => (
          <div key={post.id} className="latest-blog-section-item">
            <div className="latest-blog-image-container">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="latest-blog-section-image"
              />
            </div>
            <div className="latest-blog-section-info">
              <h3 className="latest-blog-section-title">{post.title}</h3>
              <p className="latest-blog-section-author">By {post.author}</p>
              <p className="latest-blog-section-date">
                {new Date(post.publishedDate).toLocaleDateString()}
              </p>
              <p className="latest-blog-summary">{post.summary}</p>
            </div>
            <div className="latest-blog-cta-container">
              <Link to={`/blog/${post.slug}`} className="latest-blog-section-cta-button">
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LatestBlogsSection;
