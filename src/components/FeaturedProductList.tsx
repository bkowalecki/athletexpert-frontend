import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "../styles/FeaturedProductList.css";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number | null;
  imgUrl: string;
  affiliateLink: string;
}

const FeaturedProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/products/featured`)
      .then((response) => {
        if (response.data.length > 0) {
          setProducts(response.data);
        }
      })
      .catch((error) => {
        console.error("🚨 Error fetching featured products!", error);
        setProducts([]);
      });
  }, []);

  // Calculate drag constraints based on carousel width
  useEffect(() => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.offsetWidth;
      const totalWidth = carouselRef.current.scrollWidth;
      setDragConstraints({ right: 0, left: -(totalWidth - containerWidth) });
    }
  }, [products]);

  // Update currentIndex when drag ends based on drag offset
  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    const width = carouselRef.current?.offsetWidth || 0;
    const delta = -info.offset.x / width;
    let newIndex = currentIndex + Math.round(delta);
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= products.length) newIndex = products.length - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    if (products.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }
  };

  const prevSlide = () => {
    if (products.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="featured-products-section">
      <div className="featured-products-container">
        <h2 className="featured-products-heading">Featured</h2>

        {/* Desktop Grid View */}
        <div className="featured-products-grid desktop-view">
          {products.map((product) => (
            <div key={product.id} className="featured-product-item">
              <div className="featured-product-image-container">
                <img
                  src={product.imgUrl}
                  alt={product.name}
                  className="featured-product-image"
                />
              </div>
              <div className="featured-product-info">
                <h3 className="featured-product-name">{product.name}</h3>
                <p className="featured-product-brand">{product.brand}</p>
                <p className="featured-product-price">
                  {product.price ? `$${product.price.toFixed(2)}` : "N/A"}
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
        <div className="featured-carousel-wrapper mobile-view" ref={carouselRef}>
          <motion.div
            className="featured-carousel"
            drag="x"
            dragConstraints={dragConstraints}
            onDragEnd={handleDragEnd}
            animate={{
              x: -currentIndex * (carouselRef.current?.offsetWidth || 0),
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {products.map((product) => (
              <div key={product.id} className="featured-carousel-item">
                <div className="featured-product-item">
                  <div className="featured-product-image-container">
                    <img
                      src={product.imgUrl}
                      alt={product.name}
                      className="featured-product-image"
                    />
                  </div>
                  <div className="featured-product-info">
                    <h3 className="featured-product-name">
                      {product.name}
                    </h3>
                    <p className="featured-product-brand">
                      {product.brand}
                    </p>
                    <p className="featured-product-price">
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
              </div>
            ))}
          </motion.div>
          <div className="carousel-dots">
            {products.map((_, index) => (
              <div
                key={index}
                className={`dot ${currentIndex === index ? "active" : ""}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
          <button className="featured-carousel-button left" onClick={prevSlide}>
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
          <button className="featured-carousel-button right" onClick={nextSlide}>
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
      </div>
    </section>
  );
};

export default FeaturedProductList;
