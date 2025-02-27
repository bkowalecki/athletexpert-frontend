import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet";
import { useUserContext } from "../components/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/BlogPage.css";

interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  imageUrl: string;
  slug: string;
}

const fetchPosts = async (
  searchQuery: string,
  page: number
): Promise<BlogPost[]> => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/blogs`, {
    params: { searchQuery, page, size: 9 },
  });
  return response.data.content;
};

const BlogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(0);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const { user } = useUserContext();
  const [savedBlogIds, setSavedBlogIds] = useState<number[]>([]);

  const { data, isLoading, isFetching } = useQuery<BlogPost[], Error>({
    queryKey: ["posts", debouncedSearchQuery, currentPage],
    queryFn: () => fetchPosts(debouncedSearchQuery, currentPage),
    staleTime: 5000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData || [],
  });

  useEffect(() => {
    if (data) {
      setPosts((prevPosts) =>
        currentPage === 0
          ? data
          : [
              ...prevPosts,
              ...data.filter((post) => !prevPosts.some((p) => p.id === post.id)),
            ]
      );
      setHasMorePosts(data.length >= 9);
    }
  }, [data, currentPage]);

  /** ✅ Fetch User's Saved Blogs */
  useEffect(() => {
    if (!user) return;

    const fetchSavedBlogs = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/users/saved-blogs`,
          { withCredentials: true }
        );
        setSavedBlogIds(response.data.map((blog: BlogPost) => blog.id));
      } catch (error) {
        console.error("❌ Error fetching saved blogs:", error);
      }
    };

    fetchSavedBlogs();
  }, [user]);

  /** ✅ Toggle Save/Unsave Blog */
  const toggleSaveBlog = async (blogId: number) => {
    if (!user) {
      toast.warn("⚠️ You need to log in to save blogs!", {
        position: "top-center",
      });
      return;
    }

    const isSaved = savedBlogIds.includes(blogId);

    try {
      const response = await axios({
        method: isSaved ? "DELETE" : "POST",
        url: `${process.env.REACT_APP_API_URL}/users/saved-blogs/${blogId}`,
        withCredentials: true,
      });

      if (response.status === 200) {
        setSavedBlogIds((prev) =>
          isSaved ? prev.filter((id) => id !== blogId) : [...prev, blogId]
        );

        toast.success(isSaved ? "Blog removed!" : "Blog saved!", {
          position: "bottom-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error("❌ Error saving blog. Try again.");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
    setHasMorePosts(true);
  };

  function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  }

  return (
    <div className="blog-page-container">
      <Helmet>
        <title>Blog - AthleteXpert</title>
        <meta
          name="description"
          content="Discover the latest articles and insights on AthleteXpert."
        />
      </Helmet>

      <h2 className="blog-heading">Blog</h2>

      <div className="blog-search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search blog posts"
          className="blog-search-input"
          aria-label="Search blog posts"
        />
      </div>

      <div className="blog-post-list">
        {isLoading
          ? Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="blog-post-item skeleton-loader"></div>
            ))
          : posts.map((post) => (
              <div key={post.id} className="blog-post-item">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="blog-image"
                  loading="lazy"
                />
                <div className="blog-info">
                  <h3 className="blog-title">{post.title}</h3>
                  <p className="blog-author">By {post.author}</p>
                  <p className="blog-date">
                    {new Date(post.publishedDate).toLocaleDateString()}
                  </p>
                  <p className="blog-description">
                    {DOMPurify.sanitize(post.summary)}
                  </p>
                  <Link to={`/blog/${post.slug}`} className="blog-read-more-btn">
                    Read More
                  </Link>
                  {user && (
                    <button
                      className={`save-blog-btn ${
                        savedBlogIds.includes(post.id) ? "unsave" : ""
                      }`}
                      onClick={() => toggleSaveBlog(post.id)}
                    >
                      {savedBlogIds.includes(post.id) ? "Unsave" : "Save"}
                    </button>
                  )}
                </div>
              </div>
            ))}
      </div>

      {!isLoading && hasMorePosts && (
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="load-more-button"
        >
          {isFetching ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
};

export default BlogPage;
