import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
import { BlogPost } from "../../types/blogs"; 
import { trackEvent } from "../../util/analytics";
import { fetchBlogs, fetchSavedBlogIds, toggleSaveBlogApi } from "../../api/blog";
import BlogCard from "./BlogCard";
import "../../styles/BlogPage.css";

// ---- SPORTS ----
const SPORTS = [
  { value: "", label: "All Sports" },
  { value: "Running", label: "Running" },
  { value: "Pickleball", label: "Pickleball" },
  { value: "Basketball", label: "Basketball" },
  { value: "Soccer", label: "Soccer" },
  { value: "Tennis", label: "Tennis" },
  { value: "Swimming", label: "Swimming" },
  { value: "Yoga", label: "Yoga" },
  { value: "Weight Training", label: "Weight Training" },
];

const BlogPage: React.FC = () => {
  const [inputQuery, setInputQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [savedBlogIds, setSavedBlogIds] = useState<number[]>([]);
  const { user } = useUserContext();

  // Fetch blog posts
  const { data, isLoading, isFetching, error } = useQuery<BlogPost[], Error>({
    queryKey: ["posts", searchQuery, currentPage, selectedSport],
    queryFn: () => fetchBlogs(searchQuery, currentPage, selectedSport),
    enabled: searchQuery.length < 100,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  // Fetch saved blogs when user changes
  useEffect(() => {
    if (!user) {
      setSavedBlogIds([]);
      return;
    }
    fetchSavedBlogIds()
      .then(setSavedBlogIds)
      .catch(err => {
        setSavedBlogIds([]);
        console.error("❌ Error fetching saved blogs:", err);
      });
  }, [user]);

  // Error toast for blogs
  useEffect(() => {
    if (error && currentPage === 0) toast.error("❌ Error fetching blog posts.");
  }, [error, currentPage]);

  // Add new posts as you paginate
  useEffect(() => {
    if (data) {
      const newPosts = data.filter(post => !posts.some(p => p.id === post.id));
      setPosts(currentPage === 0 ? data : [...posts, ...newPosts]);
      setHasMorePosts(data.length >= 9);
    }
    // eslint-disable-next-line
  }, [data, currentPage]);

  // Infinite scroll for more blogs
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400 &&
        !isFetching &&
        hasMorePosts
      ) {
        setCurrentPage(prev => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching, hasMorePosts]);

  // Save/Unsave blog
  const toggleSaveBlog = useCallback(
    async (blogId: number) => {
      if (!user) return toast.warn("Log in to save blogs!");
      const isSaved = savedBlogIds.includes(blogId);
      try {
        await toggleSaveBlogApi(blogId, isSaved);
        setSavedBlogIds(prev => (isSaved ? prev.filter(id => id !== blogId) : [...prev, blogId]));
        toast.success(isSaved ? "Removed!" : "Saved!");
      } catch {
        toast.error("Couldn't save blog :/ Please try again later.");
      }
    },
    [savedBlogIds, user]
  );

  // Search handler
  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearchQuery(inputQuery);
    setCurrentPage(0);
    setPosts([]);
    setHasMorePosts(true);
    trackEvent("blog_search", { query: inputQuery, sport: selectedSport });
  };

  // Sport filter
  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSport(e.target.value);
    setCurrentPage(0);
    setPosts([]);
    setHasMorePosts(true);
    setSearchQuery(inputQuery);
  };

  return (
    <div className="blog-page-container">
      <Helmet>
        <title>AthleteXpert | Blog</title>
        <meta name="description" content="Get the latest athletic tips and stories." />
      </Helmet>

      <h1 className="blog-page-title">Blog</h1>
      <form
        className="blog-search-container"
        onSubmit={handleSearchSubmit}
        style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
      >
        <input
          type="text"
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          placeholder="Search blog posts"
          className="blog-search-input"
          aria-label="Search blog posts"
        />
        <select
          value={selectedSport}
          onChange={handleSportChange}
          className="blog-sport-filter"
          aria-label="Filter by sport"
        >
          {SPORTS.map(sport => (
            <option key={sport.value} value={sport.value}>
              {sport.label}
            </option>
          ))}
        </select>
        <button type="submit" className="blog-search-button">
          Search
        </button>
      </form>

      <div className="blog-post-list">
        {isLoading && posts.length === 0 ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="blog-post-item skeleton-loader" />
          ))
        ) : posts.length ? (
          posts.map(post => (
            <BlogCard
              key={post.id}
              id={post.id}
              title={post.title}
              author={post.author}
              slug={post.slug}
              imageUrl={post.imageUrl}
              publishedDate={post.publishedDate}
              summary={post.summary}
              variant="list"
              isSaved={savedBlogIds.includes(post.id)}
              onSave={() => toggleSaveBlog(post.id)}
              onUnsave={() => toggleSaveBlog(post.id)}
            />
          ))
        ) : (
          <div className="no-posts-message">No blog posts match your search.</div>
        )}
      </div>

      {isFetching && <p className="loading-more">Loading more...</p>}
    </div>
  );
};

export default BlogPage;
