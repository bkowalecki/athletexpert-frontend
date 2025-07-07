import React, { useRef, useEffect } from "react";
import "../styles/SportsCarousel.css";

export interface Sport {
  title: string;
  logo: string;
}

interface SportsCarouselProps {
  sports: Sport[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  onSelect?: (sport: Sport) => void; // called on "choose" click
}

const ITEM_WIDTH = 150; // width in px (including margin/gap)
const GAP = 20; // px

const SportsCarousel: React.FC<SportsCarouselProps> = ({
  sports,
  currentIndex,
  setCurrentIndex,
  onSelect,
}) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Arrow navigation
  const handleCarousel = (direction: "left" | "right") => {
    setCurrentIndex((prev) =>
      direction === "left"
        ? prev === 0
          ? sports.length - 1
          : prev - 1
        : prev === sports.length - 1
        ? 0
        : prev + 1
    );
  };

  // Swipe support
  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(deltaX) > 36) {
        if (deltaX > 0) handleCarousel("left");
        else handleCarousel("right");
      }
      touchStartX.current = null;
    };
    node.addEventListener("touchstart", handleTouchStart);
    node.addEventListener("touchend", handleTouchEnd);
    return () => {
      node.removeEventListener("touchstart", handleTouchStart);
      node.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentIndex, setCurrentIndex, sports.length]);

  // Keyboard nav
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleCarousel("left");
      if (e.key === "ArrowRight") handleCarousel("right");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Center the current item by translating the container
  const getTranslateX = () => {
    // Items are ITEM_WIDTH wide, including margin
    // Centering logic: Center currentIndex
    const containerWidth = (ITEM_WIDTH + GAP) * sports.length;
    const visibleWidth = 3 * (ITEM_WIDTH + GAP);
    const leftOffset = ((currentIndex) * (ITEM_WIDTH + GAP));
    // Add a bit of fudge to keep it centered on all viewport sizes
    return `calc(50% - ${(ITEM_WIDTH / 2 + leftOffset)}px)`;
  };

  return (
    <div className="carousel-outer-wrapper">
      <div
        className="carousel-container"
        ref={carouselRef}
        aria-label="Choose a sport"
      >
        <button
          className="carousel-button left"
          onClick={() => handleCarousel("left")}
          tabIndex={0}
          aria-label="Previous sport"
          type="button"
        >
          <span className="carousel-arrow">&lt;</span>
        </button>
        <div
          className="carousel-item-container"
          style={{
            transform: `translateX(${getTranslateX()})`,
          }}
        >
          {sports.map((sport, idx) => {
            const prevIndex = (currentIndex - 1 + sports.length) % sports.length;
            const nextIndex = (currentIndex + 1) % sports.length;
            let itemClass = "carousel-item";
            if (idx === currentIndex) itemClass += " active";
            else if (idx === prevIndex) itemClass += " prev";
            else if (idx === nextIndex) itemClass += " next";
            return (
              <div
                key={idx}
                className={itemClass}
                onClick={() => idx === currentIndex && onSelect?.(sport)}
                style={{ cursor: idx === currentIndex ? "pointer" : "default" }}
                tabIndex={idx === currentIndex ? 0 : -1}
                aria-current={idx === currentIndex}
                role="button"
                aria-label={sport.title}
              >
                <img
                  src={sport.logo}
                  alt={sport.title}
                  className="quiz-icon"
                  draggable={false}
                />
                <p className="carousel-text">{sport.title}</p>
              </div>
            );
          })}
        </div>
        <button
          className="carousel-button right"
          onClick={() => handleCarousel("right")}
          tabIndex={0}
          aria-label="Next sport"
          type="button"
        >
          <span className="carousel-arrow">&gt;</span>
        </button>
      </div>
    </div>
  );
};

export default SportsCarousel;
