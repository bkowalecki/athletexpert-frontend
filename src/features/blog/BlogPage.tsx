import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
] as const;

const PAGE_SIZE = 9;

const BlogPage: React.FC = () => {
  const [inputQuery, setInputQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [savedBlogIds, setSavedBlogIds] = useState<number[]>([]);
  const { user } = useUserContext();

  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.athletexpert.org";
  const canonicalUrl = `${origin}/blog`;

  const { data, isLoading, isFetching, error } = useQuery<BlogPost[], Error>({
    queryKey: ["posts", searchQuery, currentPage, selectedSport],
    queryFn: () => fetchBlogs(searchQuery, currentPage, selectedSport),
    enabled: searchQuery.length < 100,
    staleTime: 5_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setSavedBlogIds([]);
      return;
    }
    fetchSavedBlogIds()
      .then((ids) => {
        if (!cancelled) setSavedBlogIds(ids);
      })
      .catch((err) => {
        if (!cancelled) setSavedBlogIds([]);
        console.error("❌ Error fetching saved blogs:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (error && currentPage === 0) toast.error("❌ Error fetching blog posts.");
  }, [error, currentPage]);

  useEffect(() => {
    if (!data) return;

    setPosts((prev) => {
      if (currentPage === 0) return data;

      const seen = new Set(prev.map((p) => p.id));
      const merged = [...prev, ...data.filter((p) => !seen.has(p.id))];
      return merged;
    });

    setHasMorePosts((data?.length ?? 0) >= PAGE_SIZE);
  }, [data, currentPage]);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (!hasMorePosts) return;

    const el = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isFetching) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [isFetching, hasMorePosts]);

  const toggleSaveBlog = useCallback(
    async (blogId: number) => {
      if (!user) return toast.warn("Log in to save blogs!");
      const isSaved = savedBlogIds.includes(blogId);

      try {
        await toggleSaveBlogApi(blogId, isSaved);
        setSavedBlogIds((prev) =>
          isSaved ? prev.filter((id) => id !== blogId) : [...prev, blogId]
        );
        toast.success(isSaved ? "Removed!" : "Saved!");
      } catch {
        toast.error("Couldn't save blog :/ Please try again later.");
      }
    },
    [savedBlogIds, user]
  );

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
    setCurrentPage(0);
    setPosts([]);
    setHasMorePosts(true);
    setSearchQuery(inputQuery.trim());
  };

  const handleLoadMoreClick = useCallback(() => {
    if (!isFetching && hasMorePosts) setCurrentPage((p) => p + 1);
  }, [hasMorePosts, isFetching]);

  // ✅ JSON-LD for blog index + list of visible posts
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
      description:
        "Expert gear reviews, deals, and buying guides for pickleball, golf, running, and more.",
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

        <meta property="og:type" content="website" />
        <meta property="og:title" content="AthleteXpert Blog" />
        <meta
          property="og:description"
          content="Expert gear reviews, deals, and buying guides for pickleball, golf, running, and more."
        />
        <meta property="og:url" content={canonicalUrl} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="AthleteXpert Blog" />
        <meta
          name="twitter:description"
          content="Expert gear reviews, deals, and buying guides for pickleball, golf, running, and more."
        />

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

      <div className="blog-post-list" aria-busy={isLoading || isFetching ? "true" : "false"}>
        {isLoading && posts.length === 0 ? (
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="blog-post-item skeleton-loader" />
          ))
        ) : posts.length ? (
          posts.map((post) => (
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

      {/* Infinite scroll sentinel */}
      <div ref={loadMoreRef} />

      {/* ✅ Fallback control (good for UX + crawlers + “no scroll” scenarios) */}
      {hasMorePosts && !isFetching && posts.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <button type="button" className="blog-search-button" onClick={handleLoadMoreClick}>
            Load more
          </button>
        </div>
      )}

      {isFetching && <p className="loading-more">Loading more...</p>}
    </div>
  );
};

export default BlogPage;
