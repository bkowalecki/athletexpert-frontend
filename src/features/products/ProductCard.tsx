import React, {
  useEffect,
  useState,
  useRef,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
} from "react";
import { Link } from "react-router-dom";
import type { ProductCardProps } from "../../types/products";
import "../../styles/ProductCard.css";
import { trackEvent } from "../../util/analytics";

const FALLBACK_IMAGE = "/images/product-fallback.png";

const ProductCard: React.FC<ProductCardProps & {
  asin?: string;
  source?: string;
  lastSyncedAt?: string;
}> = ({
  id,
  name,
  brand,
  price,
  imgUrl,
  affiliateLink,
  slug,
  isSaved,
  onToggleSave,
  isSaving = false,
  isAmazonFallback,
  isTrending,
  asin,
  source,
  lastSyncedAt,
}) => {
  // Modal state & scroll mgmt
  const [showModal, setShowModal] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const modalImageRef = useRef<HTMLImageElement | null>(null);

  // Fallback image logic
  const [imgSrc, setImgSrc] = useState(imgUrl || FALLBACK_IMAGE);
  useEffect(() => {
    setImgSrc(imgUrl || FALLBACK_IMAGE);
  }, [imgUrl]);

  const toggleModal = (open: boolean) => {
    if (open) {
      setScrollPosition(window.scrollY);
      document.body.style.cssText = `position: fixed; top: -${window.scrollY}px; width: 100%;`;
      setShowModal(true);
      setTimeout(() => modalImageRef.current?.focus?.(), 50);
    } else {
      document.body.style.cssText = "";
      window.scrollTo(0, scrollPosition);
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  const handleCardClick = () => {
    trackEvent("product_view", {
      product_name: name,
      brand,
      isAmazonFallback,
      isTrending,
      retailer: "Amazon",
      asin,
      source,
      id,
      slug,
    });
  };

  const hasInternalPage = Boolean(id && slug);

  return (
    <>
      <div
        className="ax-product-card"
        tabIndex={0}
        role="group"
        aria-label={`Product card: ${name}${brand ? ` by ${brand}` : ""}`}
        onClick={handleCardClick}
        onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") handleCardClick();
        }}
      >
        {/* Image with modal/fallback */}
        <div
          className="ax-product-card-image-wrapper"
          tabIndex={0}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            toggleModal(true);
          }}
          onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
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
            src={imgSrc}
            alt={imgSrc === FALLBACK_IMAGE ? "No product image available" : name}
            className="ax-product-card-image"
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
          />
        </div>

        {/* Product info */}
        <div className="ax-product-card-info">
          <div className="ax-product-card-info-top">
            {hasInternalPage ? (
              <Link to={`/products/${slug}`}>
                <h3 className="ax-product-card-name">{name}</h3>
              </Link>
            ) : (
              <h3 className="ax-product-card-name">{name}</h3>
            )}
            {brand && <p className="ax-product-card-brand">{brand}</p>}
            <p className="ax-product-card-price">
              {price != null ? `$${price.toFixed(2)}` : "N/A"}
            </p>
          </div>

          <div className="ax-product-card-cta-row">
            {onToggleSave && (
              <button
                className={`ax-product-card-save-button${isSaved ? " unsave" : ""}`}
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
              rel="sponsored nofollow noopener noreferrer"
              className="ax-product-card-button"
              aria-label="View product on Amazon"
              onClick={(e) => {
                e.stopPropagation?.();
                trackEvent("affiliate_click", {
                  product_id: id,
                  product_name: name,
                  brand,
                  affiliateLink,
                  retailer: "Amazon",
                  asin,
                  source,
                  isTrending,
                });
              }}
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
          <div
            className="ax-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ax-modal-close"
              onClick={() => toggleModal(false)}
              aria-label="Close image preview"
            >
              ×
            </button>
            <img
              src={imgSrc}
              alt={`Preview of ${name}`}
              className="ax-modal-image"
              tabIndex={0}
              ref={modalImageRef}
              onError={() => setImgSrc(FALLBACK_IMAGE)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
