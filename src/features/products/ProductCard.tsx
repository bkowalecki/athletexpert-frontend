import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import type { MouseEvent, KeyboardEvent } from "react";
import "../../styles/ProductCard.css";
import { trackEvent } from "../../util/analytics";

// (Optional) import Product type from types if you want full props reuse

export interface ProductCardProps {
  id: number | string; // Allow both number and string for flexibility
  name: string;
  brand: string;
  price: number | null;
  imgUrl: string;
  affiliateLink: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
  isSaving?: boolean;
  // New: Optional visual flags for trending, Amazon fallback, etc.
  isAmazonFallback?: boolean;
  isTrending?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  brand,
  price,
  imgUrl,
  affiliateLink,
  isSaved,
  onToggleSave,
  isSaving = false,
  isAmazonFallback,
  isTrending,
}) => {
  // Modal state & scroll management
  const [showModal, setShowModal] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const modalImageRef = useRef<HTMLImageElement | null>(null);

  // Open/close modal & manage scroll
  const toggleModal = (open: boolean) => {
    if (open) {
      setScrollPosition(window.scrollY);
      document.body.style.cssText = `position: fixed; top: -${window.scrollY}px; width: 100%;`;
    } else {
      document.body.style.cssText = "";
      window.scrollTo(0, scrollPosition);
    }
    setShowModal(open);
  };

  // Close modal on ESC
  useEffect(() => {
    if (!showModal) return;
  
    const handleKeyDown = (e: Event) => {
      if ("key" in e && (e as unknown as KeyboardEvent).key === "Escape") {
        toggleModal(false);
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    modalImageRef.current?.focus?.();
  
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);
  
  
  
  
  

  // Click card fires product view event
  const handleCardClick = () => {
    trackEvent("product_view", { product_name: name, brand, isAmazonFallback, isTrending });
  };

  return (
    <>
      <div
        className="ax-product-card"
        tabIndex={0}
        role="group"
        aria-label={`Product card: ${name} by ${brand}`}
        onClick={handleCardClick}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCardClick();
          }
        }}
      >
        {/* Optional badge for Amazon Fallback, Trending, etc. */}
        <div className="ax-product-card-badges">
          {isTrending && <span className="ax-badge ax-badge-trending">Trending</span>}
          {isAmazonFallback && <span className="ax-badge ax-badge-amazon">Amazon</span>}
        </div>
        {/* Product image, opens modal on click */}
        <div
          className="ax-product-card-image-wrapper"
          tabIndex={0}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            toggleModal(true);
          }}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              toggleModal(true);
            }
          }}
          aria-label={`Preview image of ${name}`}
          role="button"
        >
          <img
            src={imgUrl}
            alt={name}
            className="ax-product-card-image"
            loading="lazy"
            draggable={false}
          />
        </div>
        {/* Product info */}
        <div className="ax-product-card-info">
          <div className="ax-product-card-info-top">
          <Link to={`/products/${id}`}>
            <h3 className="ax-product-card-name">{name}</h3>
            </Link>
            <p className="ax-product-card-brand">{brand}</p>
            <p className="ax-product-card-price">{price != null ? `$${price.toFixed(2)}` : "N/A"}</p>
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
              tabIndex={0}
            >
              View on Amazon
            </a>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="ax-modal-backdrop"
          onClick={() => toggleModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Preview of ${name}`}
        >
          <div className="ax-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="ax-modal-close"
              onClick={() => toggleModal(false)}
              aria-label="Close image preview"
            >
              ×
            </button>
            <img
              src={imgUrl}
              alt={`Preview of ${name}`}
              className="ax-modal-image"
              tabIndex={0}
              ref={modalImageRef}
            />
          </div>
        </div>
      )}
    </>
  );
};

// (Optional: React.memo(ProductCard) for long lists!)
// export default React.memo(ProductCard);
export default ProductCard;
