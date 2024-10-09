import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/BlogPage.css";

interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  imageUrl: string;
  link: string;
  sport: string;
  slug: string;
}

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");

  // Fetch the latest 9 blogs on component mount
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/blogs?limit=9`)
      .then((response) => {
        console.log("API response:", response.data); // Log the response to inspect it
        if (Array.isArray(response.data.content)) {
          setPosts(response.data.content); // Access the 'content' field
          setFilteredPosts(response.data.content);
        } else {
          console.error("Unexpected API response, expected an array in the 'content' field");
          setPosts([]);
          setFilteredPosts([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching blog posts!", error);
      });
  }, []);
  

  // Available sports for filtering
  const sports = ["All", "Football", "Basketball", "Tennis", "Running", "Swimming"];

  // Filter blogs based on sport and search query
  useEffect(() => {
    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    const filtered = posts.filter((post) => {
      const matchesSport = selectedSport === "All" || post.sport === selectedSport;
      const matchesSearch = post.title.toLowerCase().includes(lowerCaseSearchQuery) || 
                            post.summary.toLowerCase().includes(lowerCaseSearchQuery);
      return matchesSport && matchesSearch;
    });
    setFilteredPosts(filtered);
  }, [searchQuery, selectedSport, posts]);

  return (
    <div className="blog-page-container">
      <h2 className="heading">Blog</h2>

      {/* Filter and Search Options */}
      <div className="filter-container">
        {/* Sport Filter */}
        <label htmlFor="sport-filter" className="filter-label">Filter by Sport:</label>
        <select
          id="sport-filter"
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="filter-dropdown"
        >
          {sports.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>

        {/* Search Bar */}
        <label htmlFor="search-bar" className="filter-label">Search by Keyword:</label>
        <input
          id="search-bar"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search blog posts..."
          className="search-bar"
        />
      </div>

      {/* Blog List */}
      <ul className="blog-list">
        {filteredPosts.map((post) => (
          <li key={post.id} className="blog-page-item">
            <div className="blog-image-container">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="blog-image"
              />
            </div>
            <div className="blog-info">
              <h3 className="blog-title">{post.title}</h3>
              <p className="blog-author">By {post.author}</p>
              <p className="blog-date">
                {new Date(post.publishedDate).toLocaleDateString()}
              </p>
              <p className="blog-summary">{post.summary}</p>
            </div>
            <Link to={`/blog/${post.slug}`} className="cta-button">
              Read More
            </Link>
          </li>
        ))}
      </ul>

      {/* Show message if no posts match the filter */}
      {filteredPosts.length === 0 && <p>No blog posts match your criteria.</p>}
    </div>
  );
};

export default BlogPage;
