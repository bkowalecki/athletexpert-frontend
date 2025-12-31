import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";

import { useUserContext } from "../../context/UserContext";
import { BlogPost } from "../../types/blogs";
import { trackEvent } from "../../util/analytics";
import { fetchBlogs } from "../../api/blog";
import {
  fetchSavedBlogIds,
  toggleSaveBlog as toggleSaveBlogApi,
} from "../../api/user";

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
] as const;

const PAGE_SIZE = 9;

const BlogPage: React.FC = () => {
  const { user } = useUserContext();

  const [inputQuery, setInputQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://www.athletexpert.org";
  const canonicalUrl = `${origin}/blog`;

  // ---- BLOG POSTS ----
  const {
    data: blogData,
    isLoading,
    isFetching,
    error,
  } = useQuery<BlogPost[], Error>({
    queryKey: ["blogs", { searchQuery, selectedSport, page: currentPage }],
    queryFn: () => fetchBlogs(searchQuery, currentPage, selectedSport),
    enabled: searchQuery.length < 100,
    staleTime: 5_000,
    refetchOnWindowFocus: false,
  });

  // ---- SAVED BLOG IDS ----
  const { data: savedBlogIds = [] } = useQuery<number[]>({
    queryKey: ["savedBlogs", user?.username],
    queryFn: fetchSavedBlogIds,
    enabled: !!user,
    staleTime: 60_000,
  });

  // ---- MERGE PAGINATED RESULTS ----
  useEffect(() => {
    if (!blogData) return;

    setPosts((prev) => {
      if (currentPage === 0) return blogData;

      const seen = new Set(prev.map((p) => p.id));
      return [...prev, ...blogData.filter((p) => !seen.has(p.id))];
    });

    setHasMorePosts(blogData.length >= PAGE_SIZE);
  }, [blogData, currentPage]);

  // ---- ERROR HANDLING ----
  useEffect(() => {
    if (error && currentPage === 0) {
      toast.error("❌ Error fetching blog posts.");
    }
  }, [error, currentPage]);

  // ---- INFINITE SCROLL ----
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMorePosts) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching) {
          setCurrentPage((p) => p + 1);
        }
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMorePosts, isFetching]);

  // ---- SAVE / UNSAVE ----
  const handleToggleSaveBlog = useCallback(
    async (blogId: number) => {
      if (!user) return toast.warn("Log in to save blogs!");

      const isSaved = savedBlogIds.includes(blogId);

      try {
        await toggleSaveBlogApi(blogId, isSaved);
        toast.success(isSaved ? "Removed!" : "Saved!");
      } catch {
        toast.error("Couldn't save blog. Please try again.");
      }
    },
    [savedBlogIds, user]
  );

  // ---- SEARCH ----
  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = inputQuery.trim();

    setSearchQuery(q);
    setCurrentPage(0);
    setPosts([]);
    setHasMorePosts(true);

    trackEvent("blog_search", { query: q, sport: selectedSport });
  };

  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sport = e.target.value;

    setSelectedSport(sport);
    setSearchQuery(inputQuery.trim());
    setCurrentPage(0);
    setPosts([]);
    setHasMorePosts(true);
  };

  const handleLoadMoreClick = useCallback(() => {
    if (!isFetching && hasMorePosts) {
      setCurrentPage((p) => p + 1);
    }
  }, [hasMorePosts, isFetching]);

  // ---- SEO JSON-LD ----
  const jsonLd = useMemo(() => {
    const itemList = posts.slice(0, 25).map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${origin}/blog/${p.slug}`,
      name: p.title,
    }));

    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "AthleteXpert Blog",
      url: canonicalUrl,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: itemList,
      },
    });
  }, [posts, origin, canonicalUrl]);

  return (
    <div className="blog-page-container">
      <Helmet>
        <title>AthleteXpert | Blog</title>
        <meta
          name="description"
          content="Expert gear reviews, deals, and buying guides for pickleball, golf, running, and more."
        />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{jsonLd}</script>
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
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Search blog posts"
          className="blog-search-input"
          aria-label="Search blog posts"
          maxLength={100}
        />

        <select
          value={selectedSport}
          onChange={handleSportChange}
          className="blog-sport-filter"
          aria-label="Filter by sport"
        >
          {SPORTS.map((sport) => (
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
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="blog-post-item skeleton-loader" />
          ))
        ) : posts.length ? (
          posts.map((post) => (
            <BlogCard
              key={post.id}
              {...post}
              variant="list"
              isSaved={savedBlogIds.includes(post.id)}
              onSave={() => handleToggleSaveBlog(post.id)}
              onUnsave={() => handleToggleSaveBlog(post.id)}
            />
          ))
        ) : (
          <div className="no-posts-message">No blog posts found.</div>
        )}
      </div>

      <div ref={loadMoreRef} />

      {hasMorePosts && !isFetching && posts.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={handleLoadMoreClick}>Load more</button>
        </div>
      )}

      {isFetching && <p className="loading-more">Loading more...</p>}
    </div>
  );
};

export default BlogPage;
