// HeaderSearchBar.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/HeaderSearchBar.css';
import sportsTerms from "../data/sportsTerms.json"; // Import your sports terms JSON

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
  const navigate = useNavigate();

  // Handle input changes and filter suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      const filteredSuggestions = sportsTerms.sportsTerms.filter(term =>
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
          placeholder="Search for products, blogs..."
          value={searchQuery}
          onChange={handleInputChange}
          aria-label="Search"
        />
        {showSubmitButton && (
          <div className="search-button" onClick={handleSearchSubmit}></div>
        )}
      </form>
      {showDropdown && suggestions.length > 0 && (
        <ul className="search-suggestions show">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="search-suggestion-item"
              onClick={() => {
                setSearchQuery(suggestion);
                navigate(`/search?query=${encodeURIComponent(suggestion)}`);
                setShowDropdown(false);
                // Close mobile menu if onSearchComplete is provided.
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
