import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/ProductDetail.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  reviews: {
    reviewer: string;
    rating: number;
    comment: string;
  }[];
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get product ID from URL
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/products/${id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          console.warn(`⚠️ Product ID "${id}" not found. Redirecting to /404.`);
          navigate("/404", { replace: true });
          return;
        }

        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
          console.warn(`⚠️ No product data returned. Redirecting to /404.`);
          navigate("/404", { replace: true });
          return;
        }

        setProduct(data);
      } catch (error) {
        console.error("❌ Failed to fetch product:", error);
        navigate("/404", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  if (loading) return <div className="product-detail-loading">Loading...</div>;
  if (!product)
    return <div className="product-detail-error">Product not found.</div>;

  return (
    <div className="product-detail-container">
      <Helmet>
        <title>{product?.name} | AthleteXpert</title>
        <meta name="description" content={product?.description} />
      </Helmet>
      <div className="product-detail-main">
        <div className="product-detail-images">
          {product.images?.length ? (
            product.images.map((image, index) => (
              <div key={index} className="product-detail-image-wrapper">
                <img src={image} alt={`${product.name} Image ${index + 1}`} />
              </div>
            ))
          ) : (
            <p>No images available.</p>
          )}
        </div>
        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.name}</h1>
          <p className="product-detail-description">{product.description}</p>
          <p className="product-detail-price">${product.price.toFixed(2)}</p>
          <button className="product-detail-add-to-cart-button">
            Add to Cart
          </button>
        </div>
      </div>

      <div className="product-detail-reviews">
        <h2>Reviews</h2>
        {product.reviews.length > 0 ? (
          product.reviews.map((review, index) => (
            <div key={index} className="product-detail-review-item">
              <div className="product-detail-review-header">
                <span className="product-detail-reviewer-name">
                  {review.reviewer}
                </span>
                <span className="product-detail-review-rating">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
              </div>
              <p className="product-detail-review-comment">{review.comment}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
