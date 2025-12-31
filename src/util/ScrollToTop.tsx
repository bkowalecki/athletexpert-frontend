// src/util/ScrollToTop.tsx

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
