import React, { useMemo, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BlogCardProps } from "@/types/blogs";
import { trackEvent } from "../../util/analytics";
import "../../styles/BlogCard.css";

const FALLBACK_IMAGE = "/images/blog-placeholder.jpg";

const BookmarkIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg viewBox="0 0 24 24" width={26} height={26} aria-hidden="true" focusable="false">
    <path
      d="M6.5 4.5C6.5 3.67 7.17 3 8 3h8c.83 0 1.5.67 1.5 1.5v15.13c0 .7-.79 1.13-1.38.74L12 17.13l-4.12 3.24c-.59.39-1.38-.04-1.38-.74V4.5Z"
      fill={filled ? "#a23c20" : "none"}
      stroke={filled ? "#fff" : "#a23c20"}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </svg>
);

const PinIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg viewBox="0 0 24 24" width={26} height={26} aria-hidden="true" focusable="false">
    <path
      d="M17.1218 1.87023C15.7573 0.505682 13.4779 0.76575 12.4558 2.40261L9.61062 6.95916C9.61033 6.95965 9.60913 6.96167 9.6038 6.96549C9.59728 6.97016 9.58336 6.97822 9.56001 6.9848C9.50899 6.99916 9.44234 6.99805 9.38281 6.97599C8.41173 6.61599 6.74483 6.22052 5.01389 6.87251C4.08132 7.22378 3.61596 8.03222 3.56525 8.85243C3.51687 9.63502 3.83293 10.4395 4.41425 11.0208L7.94975 14.5563L1.26973 21.2363C0.879206 21.6269 0.879206 22.26 1.26973 22.6506C1.66025 23.0411 2.29342 23.0411 2.68394 22.6506L9.36397 15.9705L12.8995 19.5061C13.4808 20.0874 14.2853 20.4035 15.0679 20.3551C15.8881 20.3044 16.6966 19.839 17.0478 18.9065C17.6998 17.1755 17.3043 15.5086 16.9444 14.5375C16.9223 14.478 16.9212 14.4114 16.9355 14.3603C16.9421 14.337 16.9502 14.3231 16.9549 14.3165C16.9587 14.3112 16.9606 14.31 16.9611 14.3098L21.5177 11.4645C23.1546 10.4424 23.4147 8.16307 22.0501 6.79853L17.1218 1.87023Z"
      fill={filled ? "#a23c20" : "#fff"}
      stroke="#fff"
      strokeWidth=".6"
    />
  </svg>
);

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  author,
  slug,
  imageUrl,
  publishedDate,
  summary,
  variant = "list",
  isSaved,
  isPinned,
  onSave,
  onUnsave,
  onPin,
}) => {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(imageUrl || FALLBACK_IMAGE);

  const href = useMemo(() => `/blog/${slug}`, [slug]);

  const handleActivate = useCallback(() => {
    trackEvent("blog_view", { blog_id: id, blog_title: title, author, slug });
    navigate(href);
  }, [author, href, id, navigate, slug, title]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.currentTarget !== e.target) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleActivate();
      }
    },
    [handleActivate]
  );

  const formattedDate = useMemo(() => {
    if (!publishedDate) return "";
    return new Date(publishedDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [publishedDate]);

  const cardClass = `blog-card blog-card-${variant}`;
  const titleId = `blog-card-title-${id}`;
  const summaryId = summary ? `blog-card-summary-${id}` : undefined;

  const handleBookmarkClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      isSaved ? onUnsave?.() : onSave?.();
    },
    [isSaved, onSave, onUnsave]
  );

  const handlePinClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onPin?.();
    },
    [onPin]
  );

  return (
    <div
      className={cardClass}
      onClick={handleActivate}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="article"
      aria-labelledby={titleId}
      aria-describedby={summaryId}
    >
      <div className="blog-card-bookmark-container">
        <button
          type="button"
          className={`blog-card-bookmark-btn${isSaved ? " saved" : ""}`}
          aria-label={isSaved ? "Unsave blog" : "Save blog"}
          aria-pressed={!!isSaved}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleBookmarkClick}
        >
          <BookmarkIcon filled={!!isSaved} />
        </button>
      </div>

      {variant === "profile" && (
        <div className="blog-card-pin-container">
          <button
            type="button"
            className={`blog-card-pin-btn${isPinned ? " pinned" : ""}`}
            aria-label={isPinned ? "Unpin blog" : "Pin blog"}
            aria-pressed={!!isPinned}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handlePinClick}
          >
            <PinIcon filled={!!isPinned} />
          </button>
        </div>
      )}

      <img
        src={imgSrc}
        alt={title}
        className={`blog-card-img blog-card-img-${variant}`}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        draggable={false}
        onError={() => setImgSrc(FALLBACK_IMAGE)}
      />

      <div className={`blog-card-content blog-card-content-${variant}`}>
        <h4 className={`blog-card-title blog-card-title-${variant}`} id={titleId}>
          <Link
            to={href}
            onClick={(e) => {
              e.stopPropagation();
              trackEvent("blog_view", { blog_id: id, blog_title: title, author, slug });
            }}
            className="blog-card-title"
          >
            {title}
          </Link>
        </h4>

        {publishedDate && (
          <div className="blog-card-meta-row">
            <span className="blog-card-author">{author}</span>
            <span className="blog-card-date">{formattedDate}</span>
          </div>
        )}

        {summary && (
          <p className="blog-card-summary" id={summaryId}>
            {summary}
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(BlogCard);
