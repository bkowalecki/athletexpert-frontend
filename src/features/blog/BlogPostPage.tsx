import React, { useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet";
import ShareButtons from "../../components/ShareButtons";
import BlogCard from "./BlogCard";
import type { BlogPost } from "../../types/blogs";
import { fetchBlogPost, fetchRelatedBlogs } from "../../api/blog";
import { safeUrl } from "../../util/safeUrl";
import "../../styles/BlogPostPage.css";

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const hasRedirectedRef = useRef(false);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://www.athletexpert.org";

  const canonicalUrl = slug ? `${origin}/blog/${slug}` : `${origin}/blog`;

  const contentRef = useRef<HTMLDivElement | null>(null);

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery<BlogPost, Error>({
    queryKey: ["blogPost", slug],
    queryFn: () => fetchBlogPost(slug as string),
    enabled: !!slug,
    retry: 1,
  });

  const { data: relatedBlogs = [] } = useQuery<BlogPost[]>({
    queryKey: ["relatedBlogs", slug],
    queryFn: () => fetchRelatedBlogs(slug as string),
    enabled: !!slug,
  });

  // Redirect to 404 (once) if error or post not found
  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (isError || (!isLoading && !post)) {
      hasRedirectedRef.current = true;
      navigate("/404", { replace: true });
    }
  }, [isError, isLoading, post, navigate]);

  // Ensure all external links open safely (scoped to content)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const links = el.querySelectorAll<HTMLAnchorElement>("a[href^='http']");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      if (!safeUrl(link.getAttribute("href"))) {
        link.setAttribute("href", "#");
      }
    });
  }, [post?.content]);

  const formattedDate = useMemo(() => {
    if (!post?.publishedDate) return "";
    return new Date(post.publishedDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [post?.publishedDate]);

  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(post?.content || "");
  }, [post?.content]);

  const safeImageUrl = useMemo(() => safeUrl(post?.imageUrl), [post?.imageUrl]);

  if (isLoading || !post) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>Loading blog...</h2>
      </div>
    );
  }

  return (
    <section className="blog-post-page">
      <Helmet>
        <title>{post.title} - AthleteXpert</title>
        <meta name="author" content={post.author} />
        <meta name="description" content={post.summary || post.title} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="AthleteXpert" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.summary || post.title} />
        {safeImageUrl && <meta property="og:image" content={safeImageUrl} />}
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      <nav className="back-link-container" aria-label="Breadcrumb">
        <Link to="/blog" className="back-link">
          Back to Blog
        </Link>
      </nav>

      <article className="blog-post-container">
        <header className="blog-post-header">
          <h1 className="blog-post-title">{post.title}</h1>
          <div className="blog-post-author-and-date">
            <address className="blog-post-author">{post.author}</address>
            <span className="bullet">|</span>
            <time dateTime={post.publishedDate}>{formattedDate}</time>
          </div>
        </header>

        {safeImageUrl && (
          <div className="blog-post-image-container">
            <img
              src={safeImageUrl}
              alt={`Image for ${post.title}`}
              className="blog-post-image"
              loading="eager"
              decoding="async"
              draggable={false}
            />
          </div>
        )}

        <section className="blog-post-content-wrapper">
          <div
            ref={contentRef}
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          <div className="share-section">
            <h3>Share this post:</h3>
            <ShareButtons title={post.title} />
          </div>
        </section>
      </article>

      {relatedBlogs.length > 0 && (
        <section className="related-blogs-section">
          <h2>Related Posts</h2>
          <div className="related-blogs-grid">
            {relatedBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                {...blog}
                variant="related"
              />
            ))}
          </div>
        </section>
      )}
    </section>
  );
};

export default BlogPostPage;
