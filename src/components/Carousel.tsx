import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;

  /**
   * Optional: provide a stable key for each item (recommended).
   * If omitted, we fall back to item.id, then index (last resort).
   */
  getKey?: (item: T, index: number) => React.Key;
}

const Carousel = <T,>({ items, renderItem, getKey }: CarouselProps<T>) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If items array changes (especially shrinking), clamp index to prevent out-of-range
  useEffect(() => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev >= items.length ? 0 : prev));
  }, [items.length]);

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

  // Preserve existing behavior: render nothing if no items
  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  // Stable key for framer-motion to animate between items
  const motionKey = useMemo<React.Key>(() => {
    if (getKey) return getKey(currentItem, currentIndex);

    // Back-compat: try item.id if present (your old assumption)
    const maybeId = (currentItem as any)?.id;
    if (maybeId !== undefined && maybeId !== null) return maybeId;

    // Last resort: index (still stable per render, but less ideal if reordering)
    return currentIndex;
  }, [currentItem, currentIndex, getKey]);

  return (
    <div className="carousel-wrapper">
      <button
        type="button"
        className="carousel-button left"
        onClick={prevSlide}
        aria-label="Previous item"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 100"
          fill="currentColor"
          width="24px"
          height="80px"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M40 5 L10 50 L40 95"
            stroke="currentColor"
            strokeWidth="5"
            fill="none"
          />
        </svg>
      </button>

      <div className="carousel">
        <AnimatePresence mode="wait">
          <motion.div
            key={motionKey}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="carousel-item active"
          >
            {renderItem(currentItem)}
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        className="carousel-button right"
        onClick={nextSlide}
        aria-label="Next item"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 100"
          fill="currentColor"
          width="24px"
          height="80px"
          aria-hidden="true"
          focusable="false"
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
  );
};

export default Carousel;
