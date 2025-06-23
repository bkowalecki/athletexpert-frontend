import React from "react";
import { Link } from "react-router-dom";
import "../../styles/CategoryCard.css";

interface CategoryCardProps {
  title: string;
  description: string;
  linkTo: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, description, linkTo }) => {
  return (
    <Link to={linkTo} className="category-card dark-card">
      <div className="category-card-content">
        <h3>{title}</h3>
        <span className="shop-now">View Products →</span>
      </div>
    </Link>
  );
};

export default CategoryCard;
