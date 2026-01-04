// Ensures route changes reset scroll position, running after each pathname change to prevent mid-page landings during navigation.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";

    // Scroll the real scrolling element (most reliable)
    const el = document.scrollingElement || document.documentElement;

    el.scrollTo({ top: 0, left: 0, behavior });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
