import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/products/featured`)
      .then((response) => {
        console.log(response);
        if (response.data.length > 0) {
          setProducts(response.data);
        }
      })
      .catch((error) => {
        console.error("🚨 Error fetching featured products!", error);
        setProducts([]);
      });
  }, []);

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

  return (
    <section className="featured-products-section">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="featured-products-container"
      >
        <h2 className="featured-products-heading">Featured</h2>

        {/* Desktop Grid View */}
        {products.length > 0 ? (
          <div className="featured-products-grid">
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
        ) : (
          <p className="no-products-text">No featured products available.</p>
        )}

        {/* Mobile Carousel */}
        {products.length > 0 && (
          <div className="featured-carousel-wrapper">
            <button
              className="featured-carousel-button left"
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
            <div className="featured-carousel">
              <AnimatePresence mode="wait">
                <motion.div
                  key={products[currentIndex]?.id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="featured-carousel-item active"
                >
                  <div className="featured-product-item">
                    <div className="featured-product-image-container">
                      <img
                        src={products[currentIndex]?.imgUrl}
                        alt={products[currentIndex]?.name}
                        className="featured-product-image"
                      />
                    </div>
                    <div className="featured-product-info">
                      <h3 className="featured-product-name">
                        {products[currentIndex]?.name}
                      </h3>
                      <p className="featured-product-brand">
                        {products[currentIndex]?.brand}
                      </p>
                      <p className="featured-product-price">
                        {products[currentIndex]?.price != null
                          ? `$${(products[currentIndex]?.price ?? 0).toFixed(2)}`
                          : "N/A"}
                      </p>
                    </div>
                    <a
                      href={products[currentIndex]?.affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="featured-product-cta-button"
                    >
                      View on Amazon
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <button
              className="featured-carousel-button right"
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
        )}
      </motion.div>
    </section>
  );
};

export default FeaturedProductList;
