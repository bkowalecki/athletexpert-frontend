import React from "react";
import "../../styles/ProductGridSkeleton.css";

interface ProductGridSkeletonProps {
  count?: number;
}

const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({ count = 8 }) => {
  return (
    <div
      className="product-grid"
      role="status"
      aria-live="polite"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={`product-skeleton-${i}`}
          className="product-skeleton-card"
          aria-hidden="true"
        >
          <div className="skeleton-img" />
          <div className="skeleton-title" />
          <div className="skeleton-price" />
        </div>
      ))}
    </div>
  );
};

export default React.memo(ProductGridSkeleton);
