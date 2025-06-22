import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/BlogCard.css";

interface BlogCardProps {
  id: number;
  title: string;
  author: string;
  slug: string;
  imageUrl: string;
  publishedDate?: string;
  summary?: string;
  showUnsave?: boolean;
  onUnsave?: () => void;
  variant?: "default" | "compact" | "profile" | "search";
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  author,
  slug,
  imageUrl,
  publishedDate,
  summary,
  showUnsave = false,
  onUnsave,
  variant = "default",
}) => {
  const navigate = useNavigate();
  const handleClick = () => navigate(`/blog/${slug}`);

  const formattedDate = publishedDate
    ? new Date(publishedDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className={`blog-card blog-card-${variant}`} onClick={handleClick} role="article" aria-label={`Read blog: ${title}`}> 
      <img src={imageUrl} alt={title} className="blog-card-img" loading="lazy" />

      <div className="blog-card-content">
        <h4 className="blog-card-title">{title}</h4>
        {publishedDate && (
          <p className="blog-card-meta">
            By {author} · {formattedDate}
          </p>
        )}
        {summary && <p className="blog-card-summary">{summary}</p>}
        {showUnsave && onUnsave && (
          <button
            className="blog-card-unsave"
            onClick={(e) => {
              e.stopPropagation();
              onUnsave();
            }}
          >
            ✕ Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default BlogCard;
