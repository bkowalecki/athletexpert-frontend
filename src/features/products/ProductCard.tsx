import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
} from "react";
import { Link } from "react-router-dom";
import type { ProductCardProps } from "../../types/products";
import "../../styles/ProductCard.css";
import { trackEvent } from "../../util/analytics";
import { safeUrl } from "../../util/safeUrl";

const FALLBACK_IMAGE = "/images/product-fallback.png";

const ProductCard: React.FC<
  ProductCardProps & {
    asin?: string;
    source?: string;
    lastSyncedAt?: string;
  }
> = ({
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
  const scrollPositionRef = useRef(0);
  const previousBodyStyleRef = useRef<string>("");
  const modalCloseBtnRef = useRef<HTMLButtonElement | null>(null);

  // Fallback image logic
  const [imgSrc, setImgSrc] = useState(safeUrl(imgUrl) || FALLBACK_IMAGE);
  useEffect(() => {
    setImgSrc(safeUrl(imgUrl) || FALLBACK_IMAGE);
  }, [imgUrl]);

  const openModal = useCallback(() => {
    scrollPositionRef.current = window.scrollY;
    previousBodyStyleRef.current = document.body.style.cssText;

    document.body.style.position = "fixed";
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.width = "100%";

    setShowModal(true);

    // Focus close button for accessibility
    setTimeout(() => modalCloseBtnRef.current?.focus(), 0);
  }, []);

  const closeModal = useCallback(() => {
    document.body.style.cssText = previousBodyStyleRef.current;
    window.scrollTo(0, scrollPositionRef.current);
    setShowModal(false);
  }, []);

  useEffect(() => {
    if (!showModal) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal, closeModal]);

  const handleCardView = () => {
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
      lastSyncedAt,
    });
  };

  const hasInternalPage = Boolean(id && slug);

  const safeAffiliateLink = safeUrl(affiliateLink);

  return (
    <>
      <div
        className="ax-product-card"
        tabIndex={0}
        role="group"
        aria-label={`Product card: ${name}${brand ? ` by ${brand}` : ""}`}
        onClick={handleCardView}
        onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") handleCardView();
        }}
      >
        {/* Image with modal/fallback */}
        <div
          className="ax-product-card-image-wrapper"
          tabIndex={0}
          role="button"
          aria-label={`Preview image of ${name}`}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            openModal();
          }}
          onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              openModal();
            }
          }}
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
                className={`ax-product-card-save-button${
                  isSaved ? " unsave" : ""
                }`}
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
              href={safeAffiliateLink}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="ax-product-card-button"
              aria-label="View product on Amazon"
              aria-disabled={!safeAffiliateLink}
              onClick={(e) => {
                if (!safeAffiliateLink) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                e.stopPropagation();
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
          role="dialog"
          aria-modal="true"
          aria-label={`Preview of ${name}`}
          onClick={closeModal}
        >
          <div
            className="ax-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={modalCloseBtnRef}
              className="ax-modal-close"
              onClick={closeModal}
              aria-label="Close image preview"
            >
              ×
            </button>

            <img
              src={imgSrc}
              alt={`Preview of ${name}`}
              className="ax-modal-image"
              onError={() => setImgSrc(FALLBACK_IMAGE)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(ProductCard);
