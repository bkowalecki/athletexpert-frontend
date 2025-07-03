import React from "react";
import "../../styles/ProductGridSkeleton.css"; // You can use Tailwind, CSS, or styled-components

const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="product-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div className="product-skeleton-card" key={i}>
        <div className="skeleton-img" />
        <div className="skeleton-title" />
        <div className="skeleton-price" />
      </div>
    ))}
  </div>
);

export default ProductGridSkeleton;
