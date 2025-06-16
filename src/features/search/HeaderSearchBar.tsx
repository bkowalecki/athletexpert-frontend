import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash.debounce"; // <-- ADD THIS
import "../../styles/HeaderSearchBar.css";
import { trackEvent } from "../../util/analytics";
import sportsTerms from "../../data/sportsTerms.json";

interface HeaderSearchBarProps {
  showSubmitButton?: boolean;
  onSearchComplete?: () => void;
}

const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({
  showSubmitButton = true,
  onSearchComplete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith("/search")) {
      setSearchQuery("");
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // 🔥 Debounced logic
  const updateSuggestions = useMemo(
    () =>
      debounce((query: string) => {
        if (query.length > 1) {
          const filtered = sportsTerms.sportsTerms.filter((term) =>
            term.toLowerCase().startsWith(query.toLowerCase())
          );
          setSuggestions(filtered);
          setShowDropdown(filtered.length > 0);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHighlightedIndex(-1);
    updateSuggestions(query); // debounced
  };

  const handleNavigate = (query: string) => {
    const trimmedQuery = query.trim();
    setSearchQuery(trimmedQuery);
    navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
    setShowDropdown(false);
    trackEvent("search_submit", {
      query: trimmedQuery || "(empty)",
      source: "header",
    });
    if (onSearchComplete) onSearchComplete();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev === 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleNavigate(suggestions[highlightedIndex]);
      } else {
        handleNavigate(searchQuery);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    handleNavigate(searchQuery);
  };

  return (
    <div className="search-bar-container">
      <form className="header-search-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder="Search"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          aria-label="Search"
        />
        {showSubmitButton && (
          <button
            type="submit"
            className="search-button"
            aria-label="Submit search"
          />
        )}
      </form>

      {showDropdown && suggestions.length > 0 && (
        <ul className="search-suggestions show">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className={`search-suggestion-item ${
                highlightedIndex === index ? "highlighted" : ""
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => handleNavigate(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HeaderSearchBar;
