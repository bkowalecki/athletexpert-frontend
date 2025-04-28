// HeaderSearchBar.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/HeaderSearchBar.css";
import sportsTerms from "../../data/sportsTerms.json"; // Import your sports terms JSON

// Define props to conditionally show the submit button and handle search completion
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
        const selected = suggestions[highlightedIndex];
        navigate(`/search?query=${encodeURIComponent(selected)}`);
        setShowDropdown(false);
        if (onSearchComplete) {
          onSearchComplete();
        }
      } else {
        handleSearchSubmit(e);
      }
    }
  };

  // Handle input changes and filter suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHighlightedIndex(-1); // ✅ Reset highlight when typing
  
    if (query.length > 1) {
      const filteredSuggestions = sportsTerms.sportsTerms.filter((term) =>
        term.toLowerCase().startsWith(query.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowDropdown(filteredSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Handle search submission (form submit or clicking the button)
  const handleSearchSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    setShowDropdown(false);

    // If provided (mobile version), call onSearchComplete to close the mobile menu.
    if (onSearchComplete) {
      onSearchComplete();
    }
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
            aria-label="Search"
          ></button>
        )}
      </form>
      {showDropdown && suggestions.length > 0 && (
        <ul className="search-suggestions show">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`search-suggestion-item ${
                highlightedIndex === index ? "highlighted" : ""
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => {
                navigate(`/search?query=${encodeURIComponent(suggestion)}`);
                setShowDropdown(false);
                if (onSearchComplete) {
                  onSearchComplete();
                }
              }}
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
