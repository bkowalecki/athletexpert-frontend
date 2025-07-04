import React, { useState, useEffect, useMemo } from "react";
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

// Helper to check for valid community/sport page
const sportsData: Sport[] = Array.isArray(sportsDataRaw) ? sportsDataRaw : [];
function isCommunityValid(query: string) {
  return sportsData.some(
    (s) => s.title.toLowerCase() === query.trim().toLowerCase()
  );
}

const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({
  showSubmitButton = true,
  onSearchComplete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [loadingIntent, setLoadingIntent] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const RECENT_SEARCHES_KEY = "ax_recent_searches";
function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}
function addRecentSearch(query: string) {
  let searches = getRecentSearches();
  searches = [query, ...searches.filter((q) => q !== query)].slice(0, 8); // 8 max
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

  // Reset search state when navigating away from the search page
  useEffect(() => {
    if (!location.pathname.startsWith("/search")) {
      setSearchQuery("");
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [location.pathname]);

  // Close dropdown on Escape key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) =>
      e.key === "Escape" && setShowDropdown(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Debounced function to update suggestions
  const updateSuggestions = useMemo(
    () =>
      debounce((query: string) => {
        if (query.length < 2) {
          setSuggestions([]);
          setShowDropdown(false);
          return;
        }
        // Static sports terms
        const staticFiltered = sportsTerms.sportsTerms.filter((term) =>
          term.toLowerCase().startsWith(query.toLowerCase())
        );
        // Recent searches
        const recent = getRecentSearches().filter((term) =>
          term.toLowerCase().includes(query.toLowerCase())
        );
        // No duplicates, show recents first
        const combined = [
          ...recent,
          ...staticFiltered.filter((t) => !recent.includes(t)),
        ].slice(0, 10);
        setSuggestions(combined);
        setShowDropdown(combined.length > 0);
      }, 300),
    []
  );
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHighlightedIndex(-1);
    updateSuggestions(query); // Debounced
  };

  // New: Smart AI intent routing on submit/navigate
  const handleNavigateAI = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
  
    setLoadingIntent(true);
  
    try {
      const ai = await fetchSearchIntent(trimmedQuery);
  
      // Static page intent? Route directly to the page
      if (ai.intent && ai.intent.includes("staticPage") && ai.suggestedPages?.length > 0) {
        navigate(`/${ai.suggestedPages[0].toLowerCase()}`);
      }
      // Community or Sport intent? Only navigate if it actually exists
      else if (
        (ai.intent && (ai.intent.includes("community") || ai.intent.includes("sport"))) &&
        ai.fixedQuery
      ) {
        if (isCommunityValid(ai.fixedQuery)) {
          navigate(`/community/${ai.fixedQuery.toLowerCase().replace(/\s+/g, "-")}`);
        } else {
          navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
        }
      }
      // Brand? Route to a filtered product page
      else if (ai.intent && ai.intent.includes("brand") && ai.fixedQuery) {
        navigate(`/products?brand=${encodeURIComponent(ai.fixedQuery)}`);
      }
      // Gibberish? Take them to trending or just search as fallback
      else if (ai.isGibberish) {
        navigate(`/search?query=`);
      }
      // Product/blog/other? Always navigate to the user's original query!
      else {
        navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
      }
  
      trackEvent("search_submit", {
        query: trimmedQuery || "(empty)",
        fixedQuery: ai.fixedQuery,
        intent: ai.intent,
        source: "header",
      });
  
      onSearchComplete?.();
    } catch (err) {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
      trackEvent("search_submit", {
        query: query.trim() || "(empty)",
        error: true,
        source: "header",
      });
      onSearchComplete?.();
    }
    addRecentSearch(trimmedQuery);
    setShowDropdown(false);
    setLoadingIntent(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

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
      default:
        break;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    handleNavigateAI(searchQuery);
  };

  return (
    <div className="search-bar-container">
      <form className="header-search-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder={loadingIntent ? "Finding best results..." : "Search"}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          aria-label="Search"
          disabled={loadingIntent}
        />
        {showSubmitButton && (
          <button
            type="submit"
            className="search-button"
            aria-label="Submit search"
            disabled={loadingIntent}
          >
            {loadingIntent ? "..." : ""}
          </button>
        )}
      </form>

      {showDropdown && suggestions.length > 0 && (
  <ul className="search-suggestions show">
    {suggestions.map((suggestion, index) => (
      <li
        key={suggestion}
        className={`search-suggestion-item ${highlightedIndex === index ? "highlighted" : ""}`}
        onMouseEnter={() => setHighlightedIndex(index)}
        onClick={() => handleNavigateAI(suggestion)}
      >
        {getRecentSearches().includes(suggestion) ? (
          <span className="recent-label">Recent</span>
        ) : null}
        {suggestion}
      </li>
    ))}
  </ul>
)}
    </div>
  );
};

export default HeaderSearchBar;
