import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "../../styles/TrendingProductList.css";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number | null;
  imgUrl: string;
  affiliateLink: string;
}

const fetchTrendingProducts = async (): Promise<Product[]> => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/products/trending`
  );
  return response.data;
};

const TrendingProductList: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: products = [], isLoading, isError } = useQuery<Product[], Error>(
    {
      queryKey: ["trendingProducts"],
      queryFn: fetchTrendingProducts,
      staleTime: 5000,
    }
  );

  const nextSlide = () => {
    if (products.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }
  };

  const prevSlide = () => {
    if (products.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? products.length - 1 : prevIndex - 1
      );
    }
  };

  if (isLoading) {
    return <p className="loading">Loading trending products...</p>;
  }

  if (isError || products.length === 0) {
    return <p className="error">No trending products available.</p>;
  }

  // Get the current product safely.
  const currentProduct = products[currentIndex] || products[0];


  return (
    <section className="trending-products-section">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="trending-products-container"
      >
        <h2 className="trending-products-heading">Trending</h2>

        {/* Desktop Grid View */}
        <div className="trending-products-grid">
          {products.map((product) => (
            <div key={product.id} className="trending-product-item">
              <div className="trending-product-image-container">
                <img
                  src={product.imgUrl}
                  alt={product.name}
                  loading="lazy"
                  className="trending-product-image"
                />
              </div>
              <div className="trending-product-info">
                <h3 className="trending-product-name">{product.name}</h3>
                <p className="trending-product-brand">{product.brand}</p>
                <p className="trending-product-price">
                  {product.price != null
                    ? `$${product.price.toFixed(2)}`
                    : "N/A"}
                </p>
              </div>
              <a
                href={product.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="featured-product-cta-button"
              >
                View on Amazon
              </a>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="trending-carousel-wrapper">
          <button
            className="trending-carousel-button left"
            onClick={prevSlide}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 50 100"
              fill="currentColor"
              width="24px"
              height="80px"
            >
              <path
                d="M40 5 L10 50 L40 95"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
              />
            </svg>
          </button>
          <div className="trending-carousel">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="trending-carousel-item active"
              >
                <div className="trending-product-item">
                  <div className="trending-product-image-container">
                    <img
                      src={currentProduct.imgUrl}
                      alt={currentProduct.name}
                      loading="lazy"
                      className="trending-product-image"
                    />
                  </div>
                  <div className="trending-product-info">
                    <h3 className="trending-product-name">
                      {currentProduct.name}
                    </h3>
                    <p className="trending-product-brand">
                      {currentProduct.brand}
                    </p>
                    <p className="trending-product-price">
                      {currentProduct.price != null
                        ? `$${currentProduct.price.toFixed(2)}`
                        : "N/A"}
                    </p>
                  </div>
                  <a
                    href={currentProduct.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="trending-product-cta-button"
                  >
                    View on Amazon
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <button
            className="trending-carousel-button right"
            onClick={nextSlide}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 50 100"
              fill="currentColor"
              width="24px"
              height="80px"
            >
              <path
                d="M10 5 L40 50 L10 95"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default TrendingProductList;
