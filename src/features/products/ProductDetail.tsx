import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../../styles/ProductDetail.css";
import { FaStar, FaChevronLeft, FaExternalLinkAlt } from "react-icons/fa";
import type { Product } from "../../types/products";

// Mock reviews (swap out for real data in prod)
const mockReviews = [
  {
    reviewer: "Sam R.",
    rating: 5,
    comment: "Best gear I’ve ever used. Game changer!",
  },
  {
    reviewer: "Jordan P.",
    rating: 4,
    comment: "Comfortable, durable, and stylish. Worth the price.",
  },
  {
    reviewer: "Drew F.",
    rating: 5,
    comment: "Love it! Delivery was quick and product was as described.",
  },
];
const mockRelated = [
  {
    id: 1,
    name: "HydroPro Bottle",
    imgUrl: "/images/categories/water-bottle.jpg",
  },
  {
    id: 2,
    name: "SpeedRunner Shoes",
    imgUrl: "/images/categories/running-shoes.jpg",
  },
  {
    id: 3,
    name: "Elite Recovery Roller",
    imgUrl: "/images/categories/recovery.jpg",
  },
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/products/${id}`
        );
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        if (!data || Object.keys(data).length === 0)
          throw new Error("No product data");
        setProduct(data);
      } catch (error) {
        navigate("/404", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

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
          style={{
            width: 120,
            marginBottom: 24,
            opacity: 0.75,
            filter: "grayscale(0.8)"
          }}
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

  return (
    <div className="product-detail-container dark-bg">
      <Helmet>
        <title>{product.name} | AthleteXpert</title>
        <meta
          name="description"
          content={product.description ?? product.name}
        />
      </Helmet>
      {/* --- BACK BUTTON --- */}
      <div className="product-detail-back">
        <Link to="/products" className="product-detail-back-link">
          {FaChevronLeft &&
            (FaChevronLeft as any)({
              style: { marginRight: 8, fontSize: "1.1em" },
            })}
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
                onError={(e) =>
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
            {features.map((sport, idx) => (
              <span className="product-feature-tag" key={idx}>
                {sport}
              </span>
            ))}
          </div>
        </div>

        {/* --- INFO COLUMN --- */}
        <div className="product-detail-info">
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
          >
            View on Amazon&nbsp;
            {FaExternalLinkAlt &&
              (FaExternalLinkAlt as any)({
                style: { fontSize: "1.1em", verticalAlign: "-2px" },
              })}
          </a>
        </div>
      </div>

      {/* --- Divider --- */}
      <div className="product-detail-divider orange-gradient-divider" />

      {/* --- Related Products --- */}
      <div className="product-detail-related">
        <h3>Related Products</h3>
        <div className="product-related-grid">
          {mockRelated.map((prod) => (
            <Link
              to={`/products/${prod.id}`}
              key={prod.id}
              className="related-card-link"
            >
              <div className="related-card">
                <img src={prod.imgUrl} alt={prod.name} />
                <span>{prod.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* --- Reviews --- */}
      <div className="product-detail-reviews">
        <h2>{FaStar && (FaStar as any)({ className: "star" })} Reviews</h2>
        {mockReviews.length > 0 ? (
          mockReviews.map((review, idx) => (
            <div className="product-detail-review-item" key={idx}>
              <div className="product-detail-review-header">
                <span className="product-detail-reviewer-name">
                  {review.reviewer}
                </span>
                <span className="product-detail-review-rating">
                  {renderStars(review.rating)}
                </span>
              </div>
              <p className="product-detail-review-comment">{review.comment}</p>
            </div>
          ))
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
