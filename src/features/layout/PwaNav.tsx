import React, { useEffect, useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../../styles/PwaNav.css";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/community", label: "Community", icon: "👥" },
  { path: "/products", label: "Products", icon: "🛍️" },
  { path: "/blog", label: "Blog", icon: "📝" },
  { path: "/profile", label: "Profile", icon: "👤" },
];

const MOBILE_BREAKPOINT = 768;

const PwaNav: React.FC = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // --- Hook MUST be before any early return ---
  const isActive = useCallback(
    (path: string) =>
      path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(path),
    [location.pathname]
  );

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    update();
    window.addEventListener("resize", update);
    setIsHydrated(true);

    return () => window.removeEventListener("resize", update);
  }, []);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (navigator as any).standalone);

  const shouldShow = isHydrated && isMobile && isStandalone;
  if (!shouldShow) return null;

  return (
    <nav
      className="pwa-nav"
      role="navigation"
      aria-label="Primary mobile navigation"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`pwa-nav-item ${active ? "active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="pwa-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="pwa-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default React.memo(PwaNav);
