import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

const Carousel = <T,>({ items, renderItem }: CarouselProps<T>) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (items.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }
  };

  const prevSlide = () => {
    if (items.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? items.length - 1 : prevIndex - 1
      );
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="carousel-wrapper">
      <button className="carousel-button left" onClick={prevSlide}>
        {/* Replace with your SVG or icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 100" fill="currentColor" width="24px" height="80px">
          <path d="M40 5 L10 50 L40 95" stroke="currentColor" strokeWidth="5" fill="none" />
        </svg>
      </button>
      <div className="carousel">
        <AnimatePresence mode="wait">
          <motion.div
            key={(items[currentIndex] as any).id} // Assumes each item has a unique "id" property
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="carousel-item active"
          >
            {renderItem(items[currentIndex])}
          </motion.div>
        </AnimatePresence>
      </div>
      <button className="carousel-button right" onClick={nextSlide}>
        {/* Replace with your SVG or icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 100" fill="currentColor" width="24px" height="80px">
          <path d="M10 5 L40 50 L10 95" stroke="currentColor" strokeWidth="5" fill="none" />
        </svg>
      </button>
    </div>
  );
};

export default Carousel;
