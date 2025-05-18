import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ProductCard from "../products/ProductCard";
import "../../styles/FeaturedProductList.css";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number | null;
  imgUrl: string;
  affiliateLink: string;
}

const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/products/featured`
  );
  return response.data;
};

const FeaturedProductList: React.FC = () => {
  const { data: products = [] } = useQuery<Product[], Error>({
    queryKey: ["featuredProducts"],
    queryFn: fetchFeaturedProducts,
    staleTime: 5000,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.offsetWidth;
      const totalWidth = carouselRef.current.scrollWidth;
      setDragConstraints({ right: 0, left: -(totalWidth - containerWidth) });
    }
  }, [products]);

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
            <ProductCard
              key={product.id}
              name={product.name}
              brand={product.brand}
              price={product.price}
              imgUrl={product.imgUrl}
              affiliateLink={product.affiliateLink}
            />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div
          className="featured-carousel-wrapper mobile-view"
          ref={carouselRef}
        >
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
                <ProductCard
                  name={product.name}
                  brand={product.brand}
                  price={product.price}
                  imgUrl={product.imgUrl}
                  affiliateLink={product.affiliateLink}
                />
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
      </div>
    </section>
  );
};

export default FeaturedProductList;
