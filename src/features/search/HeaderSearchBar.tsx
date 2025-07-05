import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import "../../styles/HeaderSearchBar.css";
import { trackEvent } from "../../util/analytics";
import sportsTerms from "../../data/sportsTerms.json";
import sportsDataRaw from "../../data/sports.json";
import { fetchSearchIntent } from "../../util/aiSearchIntent";

interface HeaderSearchBarProps {
  showSubmitButton?: boolean;
  onSearchComplete?: () => void;
}

interface Sport {
  title: string;
  backgroundImage: string;
}

const RECENT_SEARCHES_KEY = "ax_recent_searches";
const MAX_RECENT = 8;

const sportsData: Sport[] = Array.isArray(sportsDataRaw) ? sportsDataRaw : [];

const getRecentSearches = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
};
const addRecentSearch = (query: string) => {
  let searches = getRecentSearches();
  searches = [query, ...searches.filter((q) => q !== query)].slice(
    0,
    MAX_RECENT
  );
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
};

const isCommunityValid = (query: string) =>
  sportsData.some((s) => s.title.toLowerCase() === query.trim().toLowerCase());

const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({
  showSubmitButton = true,
  onSearchComplete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Focus with "/" shortcut
  useEffect(() => {
    const handleSlash = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleSlash);
    return () => window.removeEventListener("keydown", handleSlash);
  }, []);

  // Reset search state when not on search page
  useEffect(() => {
    if (!location.pathname.startsWith("/search")) {
      setSearchQuery("");
      setSuggestions([]);
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  }, [location.pathname]);

  // Global Escape to close dropdown
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Debounced suggestions function
  const updateSuggestions = useMemo(
    () =>
      debounce((query: string) => {
        if (query.length < 2) {
          setSuggestions([]);
          setShowDropdown(false);
          return;
        }
        const staticFiltered = sportsTerms.sportsTerms.filter((term) =>
          term.toLowerCase().startsWith(query.toLowerCase())
        );
        const recent = getRecentSearches().filter((term) =>
          term.toLowerCase().includes(query.toLowerCase())
        );
        const combined = [
          ...recent,
          ...staticFiltered.filter((t) => !recent.includes(t)),
        ].slice(0, 10);
        setSuggestions(combined);
        setShowDropdown(combined.length > 0);
      }, 250),
    []
  );

  // Suggestions on input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHighlightedIndex(-1);
    updateSuggestions(query);
  };

  // AI search intent
  const handleNavigateAI = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      setLoadingIntent(true);
      try {
        const ai = await fetchSearchIntent(trimmedQuery);

        if (
          ai.intent &&
          ai.intent.includes("staticPage") &&
          ai.suggestedPages?.length > 0
        ) {
          navigate(`/${ai.suggestedPages[0].toLowerCase()}`);
        } else if (
          ai.intent &&
          (ai.intent.includes("community") || ai.intent.includes("sport")) &&
          ai.fixedQuery
        ) {
          if (isCommunityValid(ai.fixedQuery)) {
            navigate(
              `/community/${ai.fixedQuery.toLowerCase().replace(/\s+/g, "-")}`
            );
          } else {
            navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
          }
        } else if (ai.intent && ai.intent.includes("brand") && ai.fixedQuery) {
          navigate(`/products?brand=${encodeURIComponent(ai.fixedQuery)}`);
        } else if (ai.isGibberish) {
          navigate(`/search?query=`);
        } else {
          navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
        }

        trackEvent("search_submit", {
          query: trimmedQuery || "(empty)",
          fixedQuery: ai.fixedQuery,
          intent: ai.intent,
          search_origin: "header",
        });
        onSearchComplete?.();
      } catch (err) {
        navigate(`/search?query=${encodeURIComponent(query.trim())}`);
        trackEvent("search_submit", {
          query: query.trim() || "(empty)",
          error: true,
          search_origin: "header",
        });

        onSearchComplete?.();
      }
      addRecentSearch(trimmedQuery);
      setShowDropdown(false);
      setLoadingIntent(false);
    },
    [navigate, onSearchComplete]
  );

  // Keyboard navigation in dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown && suggestions.length) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev === 0 ? suggestions.length - 1 : prev - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            handleNavigateAI(suggestions[highlightedIndex]);
          } else {
            handleNavigateAI(searchQuery);
          }
          break;
        case "Tab":
          setShowDropdown(false);
          break;
        default:
          break;
      }
    }
  };

  // Submit
  const handleSearchSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    handleNavigateAI(searchQuery);
  };

  // For accessibility: close dropdown after a click elsewhere (blur)
  const handleInputBlur = () => {
    setTimeout(() => setShowDropdown(false), 120); // Allow click event to process
  };

  // ---- JSX ----
  return (
    <div
      className="search-bar-container"
      role="search"
      aria-label="Sitewide search"
    >
      <form
        className="header-search-bar-form"
        onSubmit={handleSearchSubmit}
        autoComplete="off"
        tabIndex={0}
        aria-label="Search products, blogs, and more"
      >
        <input
          ref={inputRef}
          type="text"
          className="header-search-bar-input"
          placeholder={
            loadingIntent
              ? "Finding best results..."
              : "Search products, blogs, or sports..."
          }
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          aria-label="Sitewide search"
          disabled={loadingIntent}
          autoComplete="off"
        />
        {showSubmitButton && (
          <button
            type="submit"
            className="header-search-bar-button"
            aria-label="Submit search"
            disabled={loadingIntent}
          >
            <i className="fas fa-search" aria-hidden="true"></i>
            <span className="sr-only">Search</span>
          </button>
        )}
      </form>

      {showDropdown && suggestions.length > 0 && (
        <ul
          className="search-suggestions show"
          role="listbox"
          aria-label="Search suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className={`search-suggestion-item${
                highlightedIndex === index ? " highlighted" : ""
              }`}
              role="option"
              aria-selected={highlightedIndex === index}
              tabIndex={-1}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseDown={() => handleNavigateAI(suggestion)}
            >
              {getRecentSearches().includes(suggestion) && (
                <span className="recent-label">Recent</span>
              )}
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HeaderSearchBar;
