import React, { useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet";
import ShareButtons from "../../components/ShareButtons";
import BlogCard from "./BlogCard";
import { BlogPost } from "../../types/blogs";
import { fetchBlogPost, fetchRelatedBlogs } from "../../api/blog";
import "../../styles/BlogPostPage.css";

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.athletexpert.org";
  const canonicalUrl = slug ? `${origin}/blog/${slug}` : `${origin}/blog`;

  const contentRef = useRef<HTMLDivElement | null>(null);

  const { data: post, isLoading, isError } = useQuery<BlogPost, Error>({
    queryKey: ["blogPost", slug],
    queryFn: () => fetchBlogPost(slug!),
    enabled: !!slug,
    retry: 1,
  });

  const { data: relatedBlogs = [] } = useQuery<BlogPost[]>({
    queryKey: ["relatedBlogs", slug],
    queryFn: () => fetchRelatedBlogs(slug!),
    enabled: !!slug,
  });

  // Redirect to 404 if error or post not found
  useEffect(() => {
    if (isError || (!isLoading && !post)) navigate("/404", { replace: true });
  }, [isError, isLoading, post, navigate]);

  // Ensure all external links open in new tab with proper rel (scoped to content)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const links = el.querySelectorAll<HTMLAnchorElement>("a[href^='http']");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }, [post?.content]);

  const formattedDate = useMemo(
    () =>
      post?.publishedDate
        ? new Date(post.publishedDate).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "",
    [post?.publishedDate]
  );

  const sanitizedContent = useMemo(() => {
    // Keep your behavior: render HTML, but sanitize it.
    return DOMPurify.sanitize(post?.content || "");
  }, [post?.content]);

  if (isLoading || !post) {
    return (
      <div className="loading" style={{ textAlign: "center", marginTop: 100 }}>
        <h2>Loading blog...</h2>
      </div>
    );
  }

  return (
    <main className="blog-post-page" role="main">
      <Helmet>
        <title>{post.title} - AthleteXpert</title>
        <meta name="author" content={post.author} />
        <meta name="description" content={post.summary || post.title} />
        <meta property="article:published_time" content={post.publishedDate} />

        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.summary || post.title} />
        {post.imageUrl && <meta property="og:image" content={post.imageUrl} />}
        <meta property="og:url" content={canonicalUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.summary || post.title} />
        {post.imageUrl && <meta name="twitter:image" content={post.imageUrl} />}

        {/* Article Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            image: post.imageUrl ? [post.imageUrl] : undefined,
            datePublished: post.publishedDate,
            author: post.author ? [{ "@type": "Person", name: post.author }] : undefined,
            publisher: {
              "@type": "Organization",
              name: "AthleteXpert",
              logo: {
                "@type": "ImageObject",
                url: `${origin}/favicon.png`,
              },
            },
          })}
        </script>

        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Blog", item: `${origin}/blog` },
              { "@type": "ListItem", position: 2, name: post.title, item: canonicalUrl },
            ],
          })}
        </script>
      </Helmet>

      <nav className="back-link-container" aria-label="Breadcrumb">
        <Link to="/blog" className="back-link">
          ← Back to Blog
        </Link>
      </nav>

      <article
        className="blog-post-container"
        itemScope
        itemType="https://schema.org/Article"
        aria-labelledby="blog-title"
      >
        <header className="blog-post-header">
          <h1 id="blog-title" className="blog-post-title">
            {post.title}
          </h1>
          <div className="blog-post-author-and-date">
            <address className="blog-post-author">{post.author}</address>
            <span className="bullet">•</span>
            <time dateTime={post.publishedDate}>{formattedDate}</time>
          </div>
        </header>

        {post.imageUrl && (
          <div className="blog-post-image-container">
            <img
              src={post.imageUrl}
              alt={`Image for ${post.title}`}
              className="blog-post-image"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              draggable={false}
            />
          </div>
        )}

        <section className="blog-post-content blog-post-content-wrapper">
          <div ref={contentRef} dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          <div className="share-section">
            <h3 className="share-heading">Share this post:</h3>
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
                id={blog.id}
                title={blog.title}
                author={blog.author}
                slug={blog.slug}
                imageUrl={blog.imageUrl}
                publishedDate={blog.publishedDate}
                summary={blog.summary}
                variant="related"
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default BlogPostPage;
