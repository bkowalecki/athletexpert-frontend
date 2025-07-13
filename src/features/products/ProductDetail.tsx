import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FaStar, FaChevronLeft, FaExternalLinkAlt, FaExpand } from "react-icons/fa";
import "../../styles/ProductDetail.css";
import { trackEvent } from "../../util/analytics";
import type { Product } from "../../types/products";
import ProductCard from "../products/ProductCard";
import { fetchProductBySlug, fetchRelatedProducts } from "../../api/product";

const mockReviews = [
  { reviewer: "Sam R.", rating: 5, comment: "Best gear I’ve ever used. Game changer!" },
  { reviewer: "Jordan P.", rating: 4, comment: "Comfortable, durable, and stylish. Worth the price." },
  { reviewer: "Drew F.", rating: 5, comment: "Love it! Delivery was quick and product was as described." },
];

const renderStars = (rating: number) => (
  <span style={{ color: "#FFD700", fontSize: "1.1em" }}>
    {"★".repeat(rating)}{"☆".repeat(5 - rating)}
  </span>
);

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [zoomOpen, setZoomOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
  
    setLoading(true);
  
    (async () => {
      try {
        const data = await fetchProductBySlug(slug);
  
        if (!data || Object.keys(data).length === 0) throw new Error("No product data");
        setProduct(data);
  
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
  }, [slug, navigate]);


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
        <div className="product-detail-loading">Loading product...</div>
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
          style={{ marginBottom: 24, opacity: 0.75 }}
        />
        <h2>Uh oh! Product not found.</h2>
        <p style={{ color: "#bbb", marginBottom: 20 }}>
          It may have been removed or never existed. Try another or explore all products.
        </p>
        <Link to="/products" className="product-detail-back-link">
          ← Back to Products
        </Link>
      </div>
    );
  }

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

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.imgUrl,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      reviewCount: "3",
    },
  };

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
          {FaChevronLeft({ style: { marginRight: 8 } })} Back to Products
        </Link>
      </div>

      {/* Main content */}
      <div className="product-detail-main">
        {/* Left: Image */}
        <div className="product-detail-images">
          <div className="product-detail-image-wrapper highlight-border" onClick={() => setZoomOpen(true)}>
            <img
              src={product.imgUrl || "/images/product-fallback.png"}
              alt={product.name}
              loading="lazy"
              onError={e => (e.currentTarget.src = "/images/product-fallback.png")}
            />
            <div className="product-detail-badges">
              {product.trending && <span className="badge badge-trending">Trending</span>}
              {(product.retailer === "Amazon" || product.asin) && (
                <span className="badge badge-amazon">Amazon</span>
              )}
            </div>
            <div className="product-zoom-icon">{FaExpand({ style: { marginLeft: 8 } })}</div>
          </div>
          {/* Sport tags */}
          <div className="product-detail-features-row">
            {(product.sports ?? []).map((sport) => (
              <span key={sport} className="product-feature-tag">{sport}</span>
            ))}
          </div>
        </div>

        {/* Right: Info */}
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
            {specs.map(({ label, value }) => (
              <div key={label} className="product-spec-item">
                <span className="spec-label">{label}:</span>
                <span className="spec-value">{value}</span>
              </div>
            ))}
          </div>

          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="product-detail-affiliate-btn"
            onClick={handleAffiliateClick}
          >
            View on Amazon {FaExternalLinkAlt({ style: { marginLeft: 8 } })}
          </a>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomOpen && (
        <div className="product-zoom-modal" onClick={() => setZoomOpen(false)}>
          <img
            src={product.imgUrl}
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
            <p>Loading related products...</p>
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
            <p>No related products available.</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="product-detail-reviews">
        <h2>{FaStar({ className: "star" })} Reviews</h2>
        {mockReviews.length > 0 ? (
          <ul className="product-detail-reviews-list">
            {mockReviews.map((review, idx) => (
              <li key={idx} className="product-detail-review-item">
                <div className="product-detail-review-header">
                  <span className="product-detail-reviewer-name">{review.reviewer}</span>
                  <span className="product-detail-review-rating">{renderStars(review.rating)}</span>
                </div>
                <p className="product-detail-review-comment">{review.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="product-detail-no-reviews">No reviews yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
