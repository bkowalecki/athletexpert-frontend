import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  FaChevronLeft,
  FaExpand,
  FaAmazon,
  FaUpRightFromSquare,
} from "react-icons/fa6";
import "../../styles/ProductDetail.css";
import { trackEvent } from "../../util/analytics";
import type { Product } from "../../types/products";
import ProductCard from "../products/ProductCard";
import { fetchProductBySlug, fetchRelatedProducts } from "../../api/product";

/** Helper to render react-icons without JSX to avoid TS2786 in some setups */
const el = (Icon: any, props?: Record<string, any>) => React.createElement(Icon, props);

const renderStars = (rating: number) => {
  const rounded = Math.round(rating);
  return (
    <span className="stars" aria-label={`${rounded} out of 5 stars`}>
      {"★".repeat(rounded)}
      {"☆".repeat(5 - rounded)}
    </span>
  );
};

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const navigate = useNavigate();

  const loadRelatedProducts = useCallback(async (productId: number | string) => {
    try {
      setRelatedLoading(true);
      const related = await fetchRelatedProducts(productId);
      setRelatedProducts(Array.isArray(related) ? related : []);
    } catch {
      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      try {
        const data = await fetchProductBySlug(slug);
        if (!data || Object.keys(data).length === 0) throw new Error("No product data");

        setProduct(data);
        setActiveImageIdx(0);

        trackEvent("product_detail_view", {
          product_id: data.id,
          product_name: data.name,
          brand: data.brand,
          retailer: data.retailer,
          price: data.price,
          sports: data.sports,
          asin: data.asin,
          trending: !!data.trending,
        });

        loadRelatedProducts(data.id);
      } catch {
        navigate("/404", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, navigate, loadRelatedProducts]);

  // Close zoom on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomImage(null);
    };
    if (zoomImage) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomImage]);

  if (loading) {
    return (
      <div className="product-detail-container dark-bg">
        <div className="product-detail-loading">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container dark-bg not-found">
        <img
          src="/images/product-fallback.png"
          alt="Product not found"
          width={120}
          className="not-found-image"
        />
        <h2>Uh oh! Product not found.</h2>
        <p className="muted">
          It may have been removed or never existed. Try another or explore all products.
        </p>
        <Link to="/products" className="product-detail-back-link">
          {el(FaChevronLeft, { style: { marginRight: 8 } })} Back to Products
        </Link>
      </div>
    );
  }

  const specs = [
    { label: "Brand", value: product.brand },
    { label: "Retailer", value: product.retailer },
    { label: "ASIN", value: product.asin ?? "N/A" },
    ...(product.dimensions ? [{ label: "Dimensions", value: product.dimensions }] : []),
  ];

  const handleAffiliateClick = () => {
    trackEvent("affiliate_click", {
      product_id: product.id,
      product_name: product.name,
      brand: product.brand,
      retailer: product.retailer,
      asin: product.asin,
      from: "product_detail",
    });
  };

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.imgUrl,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    aggregateRating:
      product.rating != null && (product.numReviews ?? 0) > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating ?? 0,
            reviewCount: product.numReviews ?? 0,
          }
        : undefined,
  };

  // images & features
  const images = [product.imgUrl, ...(product.images ?? [])].filter(
    (s): s is string => Boolean(s)
  );
  const activeImage = images[activeImageIdx] ?? product.imgUrl;
  const features = product.features ?? [];

  const showAffiliate = Boolean(product.affiliateLink);
  const affiliateLabel =
    product.retailer === "Amazon" || product.asin ? "View on Amazon" : "View Product";

  return (
    <div className="product-detail-container dark-bg">
      <Helmet>
        <title>{product.name} | AthleteXpert</title>
        <meta name="description" content={product.description ?? product.name} />
        <meta property="og:title" content={`${product.name} | AthleteXpert`} />
        <meta property="og:description" content={product.description ?? product.name} />
        <meta property="og:image" content={product.imgUrl || "/images/product-fallback.png"} />
        <meta property="og:url" content={`https://www.athletexpert.org/products/${product.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* Back */}
      <div className="product-detail-back">
        <Link to="/products" className="product-detail-back-link">
          {el(FaChevronLeft, { style: { marginRight: 8 } })} Back to Products
        </Link>
      </div>

      {/* Main content */}
      <div className="product-detail-main">
        {/* Left: Image Gallery */}
        <div className="product-detail-images">
          <button
            type="button"
            className="product-detail-image-wrapper highlight-border"
            onClick={() => setZoomImage(activeImage)}
            aria-label="Open image zoom"
          >
            <img
              src={activeImage || "/images/product-fallback.png"}
              alt={product.name}
              loading="lazy"
              onError={(e) => (e.currentTarget.src = "/images/product-fallback.png")}
            />
            <div className="product-detail-badges">
              {product.trending && <span className="badge">Trending</span>}
              {(product.retailer === "Amazon" || product.asin) && (
                <span className="badge badge-amazon">
                  {el(FaAmazon, { style: { marginRight: 6 } })} Amazon
                </span>
              )}
              {product.isPrime && <span className="badge badge-prime">Prime</span>}
            </div>
            <div className="product-zoom-icon">
              {el(FaExpand)}
            </div>
          </button>

          {images.length > 1 && (
            <div className="product-thumbnails" role="list">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  role="listitem"
                  className={`thumbnail ${i === activeImageIdx ? "is-active" : ""}`}
                  onClick={() => setActiveImageIdx(i)}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={src} alt={`${product.name} thumbnail ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {/* Sport tags */}
          {!!(product.sports ?? []).length && (
            <div className="product-detail-features-row">
              {(product.sports ?? []).map((sport) => (
                <span key={sport} className="product-feature-tag">
                  {sport}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.name}</h1>

          {/* Ratings */}
          {product.rating != null && (
            <div className="product-detail-rating-row">
              {renderStars(product.rating)}{" "}
              <span className="rating-text">
                {product.rating.toFixed(1)} / 5
                {(product.numReviews ?? 0) > 0 ? ` (${product.numReviews} reviews)` : ""}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="product-detail-price-row">
            {typeof product.listPrice === "number" &&
            typeof product.price === "number" &&
            product.price < product.listPrice ? (
              <>
                <span className="list-price">${product.listPrice.toFixed(2)}</span>
                <span className="product-detail-price">${product.price.toFixed(2)}</span>
                <span className="discount">
                  -
                  {Math.round(((product.listPrice - product.price) / product.listPrice) * 100)}%
                </span>
              </>
            ) : (
              <span className="product-detail-price">
                {typeof product.price === "number" ? `$${product.price.toFixed(2)}` : "Price not available"}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && <p className="product-detail-description">{product.description}</p>}

          {/* Features */}
          {(product.features?.length ?? 0) > 0 && (
            <ul className="product-features-list">
              {(product.features ?? []).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}

          {/* Specs */}
          {specs.length > 0 && (
            <div className="product-detail-specs-grid">
              {specs.map(({ label, value }) => (
                <div key={label} className="product-spec-item">
                  <span className="spec-label">{label}:</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Affiliate button */}
          {showAffiliate ? (
            <a
              href={product.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="product-detail-affiliate-btn"
              onClick={handleAffiliateClick}
            >
              {affiliateLabel} {el(FaUpRightFromSquare, { style: { marginLeft: 8 } })}
            </a>
          ) : (
            <button className="product-detail-affiliate-btn is-disabled" disabled>
              {affiliateLabel}
            </button>
          )}

          <p className="affiliate-disclaimer">
            As an Amazon Associate, we earn from qualifying purchases.
          </p>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomImage && (
        <div
          className="product-zoom-modal"
          onClick={() => setZoomImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image zoom"
        >
          <img
            src={zoomImage}
            alt={`Zoom of ${product.name}`}
            className="product-zoom-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Related */}
      <div className="product-detail-related">
        <h3>Related Products</h3>
        <div className="product-related-grid">
          {relatedLoading ? (
            <p className="muted">Loading related products...</p>
          ) : relatedProducts.length ? (
            relatedProducts.slice(0, 4).map((prod) => (
              <div
                key={prod.id}
                className="related-card-link"
                onClick={() =>
                  trackEvent("related_product_click", {
                    from_product_id: product.id,
                    from_product_name: product.name,
                    to_product_id: prod.id,
                    to_product_name: prod.name,
                  })
                }
              >
                <ProductCard {...prod} />
              </div>
            ))
          ) : (
            <p className="muted">No related products available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
