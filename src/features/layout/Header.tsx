import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserContext } from "../../context/UserContext";
import { trackEvent } from "../../util/analytics";
import "../../styles/Header.css";
import HeaderSearchBar from "../search/HeaderSearchBar";

type MenuState = "closed" | "open" | "closing";

const navLinks = [
  { path: "/community", label: "Community" },
  { path: "/products", label: "Products" },
  { path: "/blog", label: "Blog" },
];

const MOBILE_BREAKPOINT = 875;

const Header: React.FC = () => {
  const { user, isSessionChecked } = useUserContext();
  const { isAuthenticated } = useAuth0();

  const [menuState, setMenuState] = useState<MenuState>("closed");
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Track scroll position for "no-jump" scroll locking
  const lockedScrollYRef = useRef<number>(0);

  // Responsive check (hydration-safe)
  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    setIsHydrated(true);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ Close menu on route change (prevents stuck scroll lock)
  useEffect(() => {
    if (!isMobile) return;
    if (menuState === "open") setMenuState("closing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /**
   * ✅ Scroll lock that DOES NOT jump to top
   * Strategy:
   * 1) On lock: store current scrollY, apply body styles (via class + top offset)
   * 2) On unlock: remove styles, restore scroll position
   */
  useEffect(() => {
    const shouldLock = isMobile && menuState === "open";

    if (shouldLock) {
      const y = window.scrollY || window.pageYOffset || 0;
      lockedScrollYRef.current = y;

      document.body.classList.add("modal-open");

      // Preserve current scroll position while locking
      // (Requires .modal-open { position: fixed; width: 100%; } in CSS — see note below)
      document.body.style.top = `-${y}px`;
      document.body.style.width = "100%";
    } else {
      // Only restore if we previously locked
      if (document.body.classList.contains("modal-open")) {
        document.body.classList.remove("modal-open");

        const y = lockedScrollYRef.current || 0;

        // Clear inline styles first so scroll restoration works reliably
        document.body.style.top = "";
        document.body.style.width = "";

        window.scrollTo({ top: y, left: 0, behavior: "auto" });
      }
    }

    return () => {
      // Cleanup on unmount
      if (document.body.classList.contains("modal-open")) {
        document.body.classList.remove("modal-open");
        const y = lockedScrollYRef.current || 0;
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo({ top: y, left: 0, behavior: "auto" });
      }
    };
  }, [isMobile, menuState]);

  // Blur the page content (but NOT the header) when menu is open
useEffect(() => {
  const appEl = document.querySelector(".App");
  if (!appEl) return;

  if (isMobile && menuState === "open") {
    appEl.classList.add("app-blurred");
  } else {
    appEl.classList.remove("app-blurred");
  }

  return () => {
    appEl.classList.remove("app-blurred");
  };
}, [isMobile, menuState]);


  // Outside click closes menu
  useEffect(() => {
    if (!isMobile || menuState !== "open") return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuState("closing");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMobile, menuState]);

  // ✅ ESC closes menu (nice mobile/keyboard UX)
  useEffect(() => {
    if (!isMobile || menuState !== "open") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuState("closing");
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobile, menuState]);

  const toggleMobileMenu = () => {
    setMenuState((prev) =>
      prev === "open" ? "closing" : prev === "closed" ? "open" : prev
    );
  };

  const closeMobileMenu = useCallback(() => {
    if (isMobile && menuState === "open") setMenuState("closing");
  }, [isMobile, menuState]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  /**
   * ✅ Unified nav click behavior:
   * - Always tracks + closes mobile menu
   * - If user clicks the link for the route they're already on -> scroll to top
   */
  const handleNavClick = useCallback(
    (path: string, label: string) => (e: React.MouseEvent) => {
      trackEvent("nav_click", { section: label });
      closeMobileMenu();

      if (location.pathname === path) {
        e.preventDefault(); // prevent router from ignoring same-route navigation
        scrollToTop();
      }
    },
    [location.pathname, closeMobileMenu, scrollToTop]
  );

  const handleProfileClick = useCallback(() => {
    if (!isSessionChecked) return;

    const destination = user ? "/profile" : "/auth";
    navigate(destination);
    closeMobileMenu();
  }, [isSessionChecked, user, navigate, closeMobileMenu]);

  if (!isHydrated) return null;

  return (
    <header className="app-header">
      <div className="logo">
        <Link
          to="/"
          className="nav-link"
          aria-current={location.pathname === "/" ? "page" : undefined}
          onClick={handleNavClick("/", "Home")}
        >
          <h1>AthleteXpert</h1>
        </Link>
      </div>

      {!isMobile && (
        <div className="desktop-search">
          <HeaderSearchBar showSubmitButton />
        </div>
      )}

      {isMobile && menuState === "open" && (
        <div
          className="menu-backdrop active"
          onClick={() => setMenuState("closing")}
          aria-hidden="true"
        />
      )}

      <nav
        ref={menuRef}
        id="main-navigation"
        className={`nav-links ${
          menuState === "open"
            ? "mobile-menu-open"
            : menuState === "closing"
            ? "mobile-menu-closing"
            : ""
        }`}
        aria-label="Primary navigation"
        onTransitionEnd={(e) => {
          if (e.propertyName === "transform" && menuState === "closing") {
            setMenuState("closed");
          }
        }}
      >
        {isMobile && (
          <div className="mobile-search">
            <HeaderSearchBar
              showSubmitButton={false}
              onSearchComplete={closeMobileMenu}
            />
          </div>
        )}

        {navLinks.map(({ path, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="nav-link"
              aria-current={isActive ? "page" : undefined}
              onClick={handleNavClick(path, label)}
            >
              {label}
            </Link>
          );
        })}

        <button
          className="nav-link nav-button"
          onClick={handleProfileClick}
          aria-label="Go to Profile"
        >
          Profile
        </button>
      </nav>

      <div
        className="hamburger-menu"
        role="button"
        tabIndex={0}
        aria-label="Toggle navigation menu"
        aria-controls="main-navigation"
        aria-expanded={menuState === "open"}
        onClick={toggleMobileMenu}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggleMobileMenu();
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`bar ${menuState === "open" ? "open" : ""}`}
          />
        ))}
      </div>
    </header>
  );
};

export default React.memo(Header);
