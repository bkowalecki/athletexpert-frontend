// NEW ProductCard.tsx
import React from "react";
import "../../styles/ProductCard.css";
import TransparentImage from "../../components/common/TransparentImage"; // Adjust the path as needed

interface ProductCardProps {
  name: string;
  brand: string;
  price: number | null;
  imgUrl: string;
  affiliateLink: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  brand,
  price,
  imgUrl,
  affiliateLink,
}) => {
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
      </div>
      <a
        href={affiliateLink}
        target="_blank"
        rel="noopener noreferrer"
        className="product-button"
      >
        Check Price →
      </a>
    </div>
  );
};

export default ProductCard;
