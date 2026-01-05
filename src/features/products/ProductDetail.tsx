import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  FaChevronLeft,
  FaExpand,
  FaAmazon,
  FaUpRightFromSquare,
} from "react-icons/fa6";
import "../../styles/ProductDetail.css";
import { trackEvent, trackOutboundClick } from "../../util/analytics";
import type { Product } from "../../types/products";
import ProductCard from "../products/ProductCard";
import { fetchProductBySlug, fetchRelatedProducts } from "../../api/product";

/** Render react-icons safely */
const el = (Icon: any, props?: Record<string, any>) =>
  React.createElement(Icon, props);

const renderStars = (rating: number) => {
  const filled = Math.floor(rating);
  return (
    <span className="stars" aria-label={`${filled} out of 5 stars`}>
      {"★".repeat(filled)}
      {"☆".repeat(5 - filled)}
    </span>
  );
};

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const scrollPosRef = useRef(0);
  const prevBodyStyleRef = useRef("");

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
        if (!data || Object.keys(data).length === 0) throw new Error();

        setProduct(data);
        setActiveImageIdx(0);

        trackEvent("view_item", {
          item_id: data.id,
          item_name: data.name,
          item_brand: data.brand,
          item_category: data.retailer,
          price: data.price,
          sport: data.sports?.[0],
          asin: data.asin,
          is_trending: !!data.trending,
          source_page: "product_detail",
        });

        loadRelatedProducts(data.id);
      } catch {
        navigate("/404", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, navigate, loadRelatedProducts]);

  // Zoom modal scroll lock + ESC
  useEffect(() => {
    if (!zoomImage) return;

    scrollPosRef.current = window.scrollY;
    prevBodyStyleRef.current = document.body.style.cssText;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosRef.current}px`;
    document.body.style.width = "100%";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomImage(null);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.cssText = prevBodyStyleRef.current;
      window.scrollTo(0, scrollPosRef.current);
      window.removeEventListener("keydown", onKey);
    };
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
          It may have been removed or never existed. Try another product.
        </p>
        <Link to="/products" className="product-detail-back-link">
          {el(FaChevronLeft, { style: { marginRight: 8 } })} Back to Products
        </Link>
      </div>
    );
  }

  const images = [product.imgUrl, ...(product.images ?? [])].filter(Boolean) as string[];
  const activeImage = images[activeImageIdx] ?? product.imgUrl;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.imgUrl,
    description: product.description,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    aggregateRating:
      product.rating != null && (product.numReviews ?? 0) > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.numReviews,
          }
        : undefined,
  };

  const handleAffiliateClick = () => {
    trackOutboundClick(product.affiliateLink, {
      item_id: product.id,
      item_name: product.name,
      item_brand: product.brand,
      item_category: product.retailer,
      asin: product.asin,
      source_page: "product_detail",
    });
  };

  const affiliateLabel =
    product.retailer === "Amazon" || product.asin
      ? "View on Amazon"
      : "View Product";

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
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Back */}
      <div className="product-detail-back">
        <Link to="/products" className="product-detail-back-link">
          {el(FaChevronLeft, { style: { marginRight: 8 } })} Back to Products
        </Link>
      </div>

      {/* Main */}
      <div className="product-detail-main">
        {/* Images */}
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
              onError={(e) =>
                (e.currentTarget.src = "/images/product-fallback.png")
              }
            />
            <div className="product-detail-badges">
              {product.trending && <span className="badge">Trending</span>}
              {(product.retailer === "Amazon" || product.asin) && (
                <span className="badge badge-amazon">
                  {el(FaAmazon, { style: { marginRight: 6 } })} Amazon
                </span>
              )}
            </div>
            <div className="product-zoom-icon">{el(FaExpand)}</div>
          </button>

          {images.length > 1 && (
            <div className="product-thumbnails" role="list">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  role="listitem"
                  className={`thumbnail ${i === activeImageIdx ? "is-active" : ""}`}
                  onClick={() => setActiveImageIdx(i)}
                  aria-current={i === activeImageIdx}
                >
                  <img src={src} alt={`${product.name} thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.name}</h1>

          {product.rating != null && (
            <div className="product-detail-rating-row">
              {renderStars(product.rating)}
              <span className="rating-text">
                {product.rating.toFixed(1)} / 5
                {(product.numReviews ?? 0) > 0
                  ? ` (${product.numReviews} reviews)`
                  : ""}
              </span>
            </div>
          )}

          <div className="product-detail-price-row">
            {typeof product.price === "number"
              ? `$${product.price.toFixed(2)}`
              : "Price not available"}
          </div>

          {product.description && (
            <p className="product-detail-description">{product.description}</p>
          )}

          {(product.features?.length ?? 0) > 0 && (
            <ul className="product-features-list">
              {product.features!.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}

          {product.affiliateLink ? (
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

      {/* Zoom */}
      {zoomImage && (
        <div
          className="product-zoom-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Image zoom"
          onClick={() => setZoomImage(null)}
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
                <ProductCard
                  id={prod.id}
                  name={prod.name}
                  brand={prod.brand}
                  price={prod.price}
                  imgUrl={prod.imgUrl}
                  slug={prod.slug}
                  affiliateLink={prod.affiliateLink}
                />
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
