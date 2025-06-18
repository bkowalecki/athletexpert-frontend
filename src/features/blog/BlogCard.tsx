import React from "react";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import "../../styles/BlogCard.css"; // Path depends on where you place it

interface BlogCardProps {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  imageUrl: string;
  slug: string;
  isSaved: boolean;
  onToggleSave: (id: number) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  author,
  publishedDate,
  summary,
  imageUrl,
  slug,
  isSaved,
  onToggleSave,
}) => {
  return (
    <div className="blog-card">
      <img src={imageUrl} alt={title} className="blog-card-image" loading="lazy" />
      <div className="blog-card-info">
        <h3 className="blog-card-title">{title}</h3>
        <p className="blog-card-author">By {author}</p>
        <p className="blog-card-date">{new Date(publishedDate).toLocaleDateString()}</p>
        <p className="blog-card-description">{DOMPurify.sanitize(summary)}</p>
        <div className="blog-card-actions">
          <Link to={`/blog/${slug}`} className="blog-read-more-btn">
            Read More
          </Link>
          <button
            className={`save-blog-btn ${isSaved ? "unsave" : ""}`}
            onClick={() => onToggleSave(id)}
          >
            {isSaved ? "Unsave" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
