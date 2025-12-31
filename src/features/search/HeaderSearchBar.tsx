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

const safeParseJsonArray = (raw: string | null): string[] => {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

const getRecentSearches = (): string[] =>
  safeParseJsonArray(localStorage.getItem(RECENT_SEARCHES_KEY));

const addRecentSearch = (query: string) => {
  const trimmed = query.trim();
  if (!trimmed) return;

  const searches = [trimmed, ...getRecentSearches().filter((q) => q !== trimmed)].slice(
    0,
    MAX_RECENT
  );
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
};

const toSlug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

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
  const inFlightRef = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Focus with "/" shortcut
  useEffect(() => {
    const handleSlash = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (
        e.key === "/" &&
        tag !== "INPUT" &&
        tag !== "TEXTAREA" &&
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
  const updateSuggestions = useMemo(() => {
    const fn = debounce((query: string) => {
      const q = query.trim();
      if (q.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      const recentAll = getRecentSearches();
      const recent = recentAll.filter((term) => term.toLowerCase().includes(q.toLowerCase()));

      const staticFiltered = (sportsTerms as any).sportsTerms
        ?.filter((term: string) => term.toLowerCase().startsWith(q.toLowerCase()))
        ?? [];

      const combined = [...recent, ...staticFiltered.filter((t: string) => !recent.includes(t))].slice(
        0,
        10
      );

      setSuggestions(combined);
      setShowDropdown(combined.length > 0);
    }, 250);

    return fn;
  }, []);

  // cancel debounce on unmount
  useEffect(() => {
    return () => updateSuggestions.cancel();
  }, [updateSuggestions]);

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
      // If empty, just navigate to generic search page
      if (!trimmedQuery) {
        navigate(`/search?query=`);
        trackEvent("search_submit", { query: "(empty)", search_origin: "header" });
        onSearchComplete?.();
        setShowDropdown(false);
        return;
      }

      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setLoadingIntent(true);

      try {
        const ai = await fetchSearchIntent(trimmedQuery);

        if (ai.intent?.includes("staticPage") && ai.suggestedPages?.length > 0) {
          navigate(`/${String(ai.suggestedPages[0]).toLowerCase()}`);
        } else if (
          ai.intent &&
          (ai.intent.includes("community") || ai.intent.includes("sport")) &&
          ai.fixedQuery
        ) {
          if (isCommunityValid(ai.fixedQuery)) {
            navigate(`/community/${toSlug(ai.fixedQuery)}`);
          } else {
            navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
          }
        } else if (ai.intent?.includes("brand") && ai.fixedQuery) {
          navigate(`/products?brand=${encodeURIComponent(ai.fixedQuery)}`);
        } else if (ai.isGibberish) {
          navigate(`/search?query=`);
        } else {
          navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
        }

        trackEvent("search_submit", {
          query: trimmedQuery,
          fixedQuery: ai.fixedQuery,
          intent: ai.intent,
          search_origin: "header",
        });

        // Only persist real queries
        if (!ai.isGibberish) addRecentSearch(trimmedQuery);

        onSearchComplete?.();
      } catch {
        navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
        trackEvent("search_submit", {
          query: trimmedQuery,
          error: true,
          search_origin: "header",
        });
        addRecentSearch(trimmedQuery);
        onSearchComplete?.();
      } finally {
        setShowDropdown(false);
        setLoadingIntent(false);
        inFlightRef.current = false;
      }
    },
    [navigate, onSearchComplete]
  );

  const recentSet = useMemo(() => new Set(getRecentSearches()), [showDropdown, suggestions.length]);

  // Keyboard navigation in dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If dropdown isn't showing yet, allow ArrowDown to open it (if we have suggestions)
    if (!showDropdown && e.key === "ArrowDown" && suggestions.length > 0) {
      setShowDropdown(true);
      setHighlightedIndex(0);
      e.preventDefault();
      return;
    }

    if (showDropdown && suggestions.length) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev === 0 ? suggestions.length - 1 : prev - 1));
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
      return;
    }

    // If dropdown isn't active, Enter should still submit normally
    if (e.key === "Enter") {
      e.preventDefault();
      handleNavigateAI(searchQuery);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    handleNavigateAI(searchQuery);
  };

  // close dropdown after click elsewhere (blur)
  const handleInputBlur = () => {
    setTimeout(() => setShowDropdown(false), 120);
  };

  return (
    <div className="search-bar-container" role="search" aria-label="Sitewide search">
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
            loadingIntent ? "Finding best results..." : "Search products, blogs, or sports..."
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
        <ul className="search-suggestions show" role="listbox" aria-label="Search suggestions">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className={`search-suggestion-item${highlightedIndex === index ? " highlighted" : ""}`}
              role="option"
              aria-selected={highlightedIndex === index}
              tabIndex={-1}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseDown={() => handleNavigateAI(suggestion)}
            >
              {recentSet.has(suggestion) && <span className="recent-label">Recent</span>}
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HeaderSearchBar;
