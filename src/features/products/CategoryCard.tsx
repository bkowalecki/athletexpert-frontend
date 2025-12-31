import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../../styles/CategoryCard.css";

interface CategoryCardProps {
  title: string;
  description: string;
  linkTo: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  linkTo,
}) => {
  const ariaLabel = useMemo(() => {
    const base = title?.trim() ? title.trim() : "Category";
    const desc = description?.trim();
    return desc ? `${base}. ${desc}. View products.` : `${base}. View products.`;
  }, [title, description]);

  const tooltip = description?.trim() || `View products in ${title}`;

  return (
    <Link
      to={linkTo}
      className="category-card dark-card"
      aria-label={ariaLabel}
      title={tooltip}
    >
      <div className="category-card-content">
        <h3>{title}</h3>
        <span className="shop-now">View Products →</span>
      </div>
    </Link>
  );
};

export default React.memo(CategoryCard);
