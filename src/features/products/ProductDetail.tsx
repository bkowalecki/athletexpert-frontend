import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FaStar, FaChevronLeft, FaExternalLinkAlt } from "react-icons/fa";
import "../../styles/ProductDetail.css";
import { trackEvent } from "../../util/analytics";
import type { Product } from "../../types/products";
import ProductCard from "../products/ProductCard";
import { fetchProductById, fetchRelatedProducts } from "../../api/product";

const mockReviews = [
  { reviewer: "Sam R.", rating: 5, comment: "Best gear I’ve ever used. Game changer!" },
  { reviewer: "Jordan P.", rating: 4, comment: "Comfortable, durable, and stylish. Worth the price." },
  { reviewer: "Drew F.", rating: 5, comment: "Love it! Delivery was quick and product was as described." },
];

const renderStars = (rating: number) => (
  <>
    {"★".repeat(rating)}
    {"☆".repeat(5 - rating)}
  </>
);

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const data = await fetchProductById(id!);
        if (!data || Object.keys(data).length === 0) throw new Error("No product data");
        setProduct(data);

        // Analytics
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
      } catch (error) {
        navigate("/404", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [id, navigate]);

  const loadRelatedProducts = async (productId: number | string) => {
    try {
      setRelatedLoading(true);
      const related = await fetchRelatedProducts(productId);
      setRelatedProducts(Array.isArray(related) ? related : []);
    } catch {
      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-container dark-bg">
        <div className="product-detail-loading">Loading...</div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="product-detail-container dark-bg" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <img
          src="/images/product-fallback.png"
          alt="Product not found"
          width={120}
          style={{ marginBottom: 24, opacity: 0.75, filter: "grayscale(0.8)" }}
        />
        <h2 style={{ margin: "0 0 0.5em 0" }}>Uh oh! Product not found.</h2>
        <p style={{ color: "#bbb", marginBottom: 20 }}>
          We couldn’t find this product. It might have been removed or never existed.<br />
          Try searching for another or explore all products below.
        </p>
        <Link
          to="/products"
          className="product-detail-back-link"
          style={{
            color: "#fff",
            background: "#A23C20",
            padding: "0.7em 1.4em",
            borderRadius: 9,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 17,
            boxShadow: "0 3px 14px 0 rgba(0,0,0,0.09)",
          }}
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  const showAmazonBadge = product.retailer === "Amazon" || !!product.asin;
  const showTrendingBadge = !!product.trending;
  const features =
    Array.isArray(product.sports) && product.sports.length > 0
      ? product.sports
      : ["All Sports"];
  const specs = [
    { label: "Brand", value: product.brand },
    { label: "Retailer", value: product.retailer },
    { label: "ASIN", value: product.asin ?? "N/A" },
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

  return (
    <div className="product-detail-container dark-bg">
      <Helmet>
        <title>{product.name} | AthleteXpert</title>
        <meta name="description" content={product.description ?? product.name} />
        <meta property="og:title" content={`${product.name} | AthleteXpert`} />
        <meta property="og:description" content={product.description ?? product.name} />
        <meta property="og:image" content={product.imgUrl || "/images/product-fallback.png"} />
        <meta property="og:url" content={`https://www.athletexpert.org/products/${product.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* --- BACK BUTTON --- */}
      <div className="product-detail-back">
        <Link to="/products" className="product-detail-back-link">
          {FaChevronLeft({ style: { marginRight: 8, fontSize: "1.1em" } })}
          Back to Products
        </Link>
      </div>

      <div className="product-detail-main">
        {/* --- IMAGE COLUMN --- */}
        <div className="product-detail-images">
          <div className="product-detail-image-wrapper highlight-border">
            {product.imgUrl ? (
              <img
                src={product.imgUrl || "/images/product-fallback.png"}
                alt={product.name}
                loading="lazy"
                width={350}
                height={350}
                onError={e =>
                  (e.currentTarget.src = "/images/product-fallback.png")
                }
              />
            ) : (
              <div className="product-detail-image-placeholder">No image</div>
            )}
            <div className="product-detail-badges">
              {showTrendingBadge && (
                <span className="badge badge-trending">Trending</span>
              )}
              {showAmazonBadge && (
                <span className="badge badge-amazon">Amazon</span>
              )}
            </div>
          </div>
          {/* Feature tags */}
          <div className="product-detail-features-row">
          </div>
        </div>

        {/* --- INFO COLUMN --- */}
        <div className="product-detail-info" aria-live="polite">
          <h1 className="product-detail-name">{product.name}</h1>
          <div className="product-detail-price-row">
            <span className="product-detail-price">
              {typeof product.price === "number"
                ? `$${product.price.toFixed(2)}`
                : "Price not available"}
            </span>
          </div>
          {product.description && (
            <p className="product-detail-description">{product.description}</p>
          )}
          <div className="product-detail-specs-grid">
            {specs.map(
              ({ label, value }) =>
                value && (
                  <div className="product-spec-item" key={label}>
                    <span className="spec-label">{label}:</span>{" "}
                    <span className="spec-value">{value}</span>
                  </div>
                )
            )}
          </div>
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="product-detail-affiliate-btn"
            aria-label={`View ${product.name} on Amazon`}
            onClick={handleAffiliateClick}
            style={{
              marginTop: 18,
              fontWeight: 700,
              background: "#A23C20",
              color: "#fff",
              fontSize: "1.13rem",
              padding: "0.9em 1.45em",
              borderRadius: 13,
              letterSpacing: "0.02em",
              display: "inline-flex",
              alignItems: "center",
              boxShadow: "0 2px 10px 0 rgba(162,60,32,0.15)",
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            View on Amazon&nbsp;
            {FaExternalLinkAlt({ style: { fontSize: "1.1em", verticalAlign: "-2px" } })}
          </a>
        </div>
      </div>

      {/* --- Divider --- */}
      <div className="product-detail-divider orange-gradient-divider" />

      {/* --- Related Products --- */}
      <div className="product-detail-related">
        <h3>Related Products</h3>
        <div className="product-related-grid">
          {relatedProducts.slice(0, 4).map((prod) => (
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
              style={{ marginBottom: 18 }}
            >
              <ProductCard {...prod} />
            </div>
          ))}
        </div>
      </div>

      {/* --- Reviews --- */}
      <div className="product-detail-reviews">
        <h2>
          {FaStar({ className: "star" })} Reviews
        </h2>
        {mockReviews.length > 0 ? (
          <ul className="product-detail-reviews-list">
            {mockReviews.map((review, idx) => (
              <li className="product-detail-review-item" key={idx}>
                <div className="product-detail-review-header">
                  <span className="product-detail-reviewer-name">
                    {review.reviewer}
                  </span>
                  <span className="product-detail-review-rating">
                    {renderStars(review.rating)}
                  </span>
                </div>
                <p className="product-detail-review-comment">{review.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="product-detail-no-reviews">
            No reviews yet. Be the first!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
