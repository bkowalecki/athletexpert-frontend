// ProductCard.tsx
import React from "react";
import "../../styles/ProductCard.css";
import { trackEvent } from "../../util/analytics"; // Adjust the import path as necessary

interface ProductCardProps {
  name: string;
  brand: string;
  price: number | null;
  imgUrl: string;
  affiliateLink: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
  isSaving?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  brand,
  price,
  imgUrl,
  affiliateLink,
  isSaved,
  onToggleSave,
  isSaving = false,
}) => {
    const handleProductClick = () => {
        trackEvent("product_click", {
          product_name: name,
          brand,
          retailer: "Amazon",
        });
        window.open(affiliateLink, "_blank", "noopener,noreferrer");
      };
    
  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img src={imgUrl} alt={name} className="product-image" />
      </div>
      <div className="product-details">
        <h3 className="product-name">{name}</h3>
        <p className="product-brand">{brand}</p>
        <p className="product-price">
          {price != null ? `$${price.toFixed(2)}` : "N/A"}
        </p>
        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="product-button"
        >
          View on Amazon →
        </a>
        {onToggleSave !== undefined && (
          <button
            className={`product-save-button ${isSaved ? "unsave" : ""}`}
            onClick={onToggleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : isSaved ? "Unsave" : "Save"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
