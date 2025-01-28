import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/HeaderSearchBar.css';
import sportsTerms from "../data/sportsTerms.json"; // ✅ Import sports terms JSON

const HeaderSearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Handle Input Change & Show Suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      // ✅ Filter suggestions from JSON
      const filteredSuggestions = sportsTerms.sportsTerms.filter(term =>
        term.toLowerCase().startsWith(query.toLowerCase()) // Match from the beginning
      );

      setSuggestions(filteredSuggestions);
      setShowDropdown(filteredSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    setShowDropdown(false);
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
        <button type="submit" className="search-button">🔍</button>
      </form>

      {/* 🔥 Live Search Suggestions Dropdown */}
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
