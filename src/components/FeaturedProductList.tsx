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

  // Fetch featured products on mount
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

  // Set drag constraints once carousel dimensions are known
  useEffect(() => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.offsetWidth;
      const totalWidth = carouselRef.current.scrollWidth;
      setDragConstraints({ right: 0, left: -(totalWidth - containerWidth) });
    }
  }, [products]);

  // When a dot is clicked, update current index (for mobile)
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
            animate={{ x: -currentIndex * (carouselRef.current?.offsetWidth || 0) }}
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
                      {product.price != null ? `$${product.price.toFixed(2)}` : "N/A"}
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
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductList;
