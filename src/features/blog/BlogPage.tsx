import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/BlogPage.css";

interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  imageUrl: string;
  slug: string;
}

const fetchPosts = async (searchQuery: string, page: number): Promise<BlogPost[]> => {
  if (searchQuery.trim().length > 50 || /[^\w\s-]/.test(searchQuery)) return [];
  const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/blog`, {
    params: { searchQuery, page, size: 9 },
  });
  return data.content;
};

const BlogPostCard: React.FC<{
  post: BlogPost;
  isSaved: boolean;
  onToggleSave: (id: number) => void;
  userExists: boolean;
}> = ({ post, isSaved, onToggleSave, userExists }) => (
  <div className="blog-post-item">
    <img src={post.imageUrl} alt={post.title} className="blog-image" loading="lazy" />
    <div className="blog-info">
      <h3 className="blog-title">{post.title}</h3>
      <p className="blog-author">By {post.author}</p>
      <p className="blog-date">{new Date(post.publishedDate).toLocaleDateString()}</p>
      <p className="blog-description">{DOMPurify.sanitize(post.summary)}</p>
      <Link to={`/blog/${post.slug}`} className="blog-read-more-btn">Read More</Link>
      {userExists && (
        <button
          className={`save-blog-btn ${isSaved ? "unsave" : ""}`}
          onClick={() => onToggleSave(post.id)}
        >
          {isSaved ? "Unsave" : "Save"}
        </button>
      )}
    </div>
  </div>
);

const BlogPage: React.FC = () => {
  const [inputQuery, setInputQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const { user } = useUserContext();
  const [savedBlogIds, setSavedBlogIds] = useState<number[]>([]);

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery<BlogPost[], Error>({
    queryKey: ["posts", searchQuery, currentPage],
    queryFn: () => fetchPosts(searchQuery, currentPage),
    enabled: searchQuery.length < 100,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (error) toast.error("❌ Error fetching blog posts.");
  }, [error]);

  useEffect(() => {
    if (data) {
      const newPosts = data.filter(post => !posts.some(p => p.id === post.id));
      setPosts(currentPage === 0 ? data : [...posts, ...newPosts]);
      setHasMorePosts(data.length >= 9);
    }
  }, [data, currentPage]);

  useEffect(() => {
    if (!user) return;
    axios
      .get(`${process.env.REACT_APP_API_URL}/users/saved-blogs`, { withCredentials: true })
      .then(res => setSavedBlogIds(res.data.map((blog: BlogPost) => blog.id)))
      .catch(err => console.error("❌ Error fetching saved blogs:", err));
  }, [user]);

  const toggleSaveBlog = useCallback(async (blogId: number) => {
    if (!user) return toast.warn("Log in to save blogs!");
    const isSaved = savedBlogIds.includes(blogId);
    try {
      await axios({
        method: isSaved ? "DELETE" : "POST",
        url: `${process.env.REACT_APP_API_URL}/users/saved-blogs/${blogId}`,
        withCredentials: true,
      });
      setSavedBlogIds(prev => isSaved ? prev.filter(id => id !== blogId) : [...prev, blogId]);
      toast.success(isSaved ? "Removed!" : "Saved!");
    } catch {
      toast.error("❌ Couldn't save blog.");
    }
  }, [savedBlogIds, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputQuery(e.target.value);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(inputQuery);
    setCurrentPage(0);
    setHasMorePosts(true);
  };

  const loadMorePosts = () => {
    if (hasMorePosts && !isFetching) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="blog-page-container">
      <Helmet>
        <title>AthleteXpert | Blog</title>
        <meta name="description" content="Get the latest athletic tips and stories." />
      </Helmet>

      <h1 className="blog-page-title">Blog</h1>
      <form className="blog-search-container" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          value={inputQuery}
          onChange={handleInputChange}
          placeholder="Search blog posts"
          className="blog-search-input"
          aria-label="Search blog posts"
        />
        <button type="submit" className="blog-search-button">Search</button>
      </form>

      <div className="blog-post-list">
        {isLoading && posts.length === 0 ? (
          Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="blog-post-item skeleton-loader"></div>
          ))
        ) : posts.length ? (
          posts.map((post) => (
            <BlogPostCard
              key={post.id}
              post={post}
              isSaved={savedBlogIds.includes(post.id)}
              onToggleSave={toggleSaveBlog}
              userExists={!!user}
            />
          ))
        ) : (
          <div className="no-posts-message">No blog posts match your search.</div>
        )}
      </div>

      {!isLoading && hasMorePosts && (
        <button onClick={loadMorePosts} className="load-more-button">
          {isFetching ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
};

export default BlogPage;
