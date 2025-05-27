import React, { useState } from "react";
import "../../styles/ProductCard.css";
import { trackEvent } from "../../util/analytics";

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
  const [showModal, setShowModal] = useState(false);

  const handleProductClick = () => {
    trackEvent("product_view", { product_name: name, brand, retailer: "Amazon" });
  };

  const toggleModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
      <div className="ax-product-card" onClick={handleProductClick}>
        <div className="ax-product-card-image-wrapper" onClick={toggleModal}>
          <img
            src={imgUrl}
            alt={name}
            className="ax-product-card-image"
            loading="lazy"
          />
        </div>

        <div className="ax-product-card-info">
          <div className="ax-product-card-info-top">
            <h3 className="ax-product-card-name">{name}</h3>
            <p className="ax-product-card-brand">{brand}</p>
            <p className="ax-product-card-price">
              {price != null ? `$${price.toFixed(2)}` : "N/A"}
            </p>
          </div>

          <div className="ax-product-card-cta-row">
            {onToggleSave && (
              <button
                className={`ax-product-card-save-button ${isSaved ? "unsave" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave();
                }}
                disabled={isSaving}
                aria-label={isSaved ? "Unsave product" : "Save product"}
              >
                {isSaving ? "Saving..." : isSaved ? "Unsave" : "Save"}
              </button>
            )}
            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="ax-product-card-button"
              aria-label="View product on Amazon"
              onClick={(e) => e.stopPropagation()}
            >
              View on Amazon
            </a>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="ax-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="ax-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ax-modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <img src={imgUrl} alt={name} className="ax-modal-image" />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
