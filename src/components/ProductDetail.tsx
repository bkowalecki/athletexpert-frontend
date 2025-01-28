import React from "react";
import "../styles/ProductDetail.css";

const ProductDetail: React.FC = () => {
  // Sample product data
  const product = {
    name: "High-Performance Running Shoes",
    description:
      "Designed for athletes seeking peak performance. Lightweight, durable, and comfortable for long-distance runs.",
    price: 120.99,
    images: [
      "/images/running-shoes1.jpg",
      "/images/running-shoes2.jpg",
      "/images/running-shoes3.jpg",
    ],
    reviews: [
      { reviewer: "Alex", rating: 5, comment: "Fantastic quality and fit!" },
      { reviewer: "Jordan", rating: 4, comment: "Great shoes but pricey." },
      { reviewer: "Taylor", rating: 3, comment: "Good but not ideal for marathons." },
    ],
  };

  return (
    <div className="product-detail-container">
      <div className="product-images">
        {product.images.map((image, index) => (
          <img key={index} src={image} alt={`${product.name} ${index + 1}`} />
        ))}
      </div>
      <div className="product-info">
        <h1 className="product-name">{product.name}</h1>
        <p className="product-description">{product.description}</p>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <button className="add-to-cart-button">Add to Cart</button>
      </div>
      <div className="product-reviews">
        <h2>Reviews</h2>
        {product.reviews.map((review, index) => (
          <div key={index} className="review-item">
            <p className="reviewer-name">{review.reviewer}</p>
            <p className="review-rating">Rating: {review.rating} / 5</p>
            <p className="review-comment">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetail;

// Add this line to make the file a module.
export {};
