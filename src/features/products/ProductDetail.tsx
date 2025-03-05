import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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
  const { id } = useParams<{ id: string }>(); // Get product ID from the URL
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Replace with your real API endpoint
    axios
      .get(`${process.env.REACT_APP_API_URL}/products/${id}`)
      .then((response) => {
        setProduct(response.data);
      })
      .catch((err) => {
        console.error("Error fetching product data:", err);
        setError("Failed to load product details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="product-detail-loading">Loading...</div>;
  if (error) return <div className="product-detail-error">{error}</div>;
  if (!product) return <div className="product-detail-error">Product not found.</div>;

  return (
    <div className="product-detail-container">
      <div className="product-detail-main">
        <div className="product-detail-images">
          {product.images.map((image, index) => (
            <div key={index} className="product-detail-image-wrapper">
              <img src={image} alt={`${product.name} ${index + 1}`} />
            </div>
          ))}
        </div>
        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.name}</h1>
          <p className="product-detail-description">{product.description}</p>
          <p className="product-detail-price">${product.price.toFixed(2)}</p>
          <button className="product-detail-add-to-cart-button">Add to Cart</button>
        </div>
      </div>
      <div className="product-detail-reviews">
        <h2>Reviews</h2>
        {product.reviews.map((review, index) => (
          <div key={index} className="product-detail-review-item">
            <div className="product-detail-review-header">
              <span className="product-detail-reviewer-name">{review.reviewer}</span>
              <span className="product-detail-review-rating">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </span>
            </div>
            <p className="product-detail-review-comment">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetail;
