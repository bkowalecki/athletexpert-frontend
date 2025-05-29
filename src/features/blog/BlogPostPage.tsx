import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet";
import ShareButtons from "../../components/ShareButtons";
import "../../styles/BlogPostPage.css";

interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  sport: string;
  imageUrl: string;
  content: string;
  summary: string;
}

const fetchBlogPost = async (slug: string): Promise<BlogPost> => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/blog/slug/${slug}`
  );
  return response.data;
};

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (isError || (!isLoading && !post)) {
      console.warn(`⚠️ Blog post not found. Redirecting to /404.`);
      navigate("/404", { replace: true });
    }
  }, [isError, isLoading, post, navigate]);

  if (isLoading || !post) {
    return (
      <div className="loading" style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Loading blog...</h2>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      <Helmet>
        <title>{post.title} - AthleteXpert</title>
        <meta name="description" content={post.summary || post.title || "Read this blog on AthleteXpert."} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.summary || post.title} />
        <meta property="og:image" content={post.imageUrl} />
        <meta property="og:url" content={`https://www.athletexpert.org/blog/${slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.summary || post.title} />
        <meta name="twitter:image" content={post.imageUrl} />
        <link rel="canonical" href={`https://www.athletexpert.org/blog/${slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title || "AthleteXpert Blog",
            image: post.imageUrl ? [post.imageUrl] : undefined,
            datePublished: post.publishedDate,
            author: post.author ? [{ "@type": "Person", name: post.author }] : undefined,
            publisher: {
              "@type": "Organization",
              name: "AthleteXpert",
              logo: {
                "@type": "ImageObject",
                url: "https://www.athletexpert.org/favicon.png",
              },
            },
          })}
        </script>
      </Helmet>

      <div className="back-link-container">
        <Link to="/blog" className="back-link">
          ← Back to Blog
        </Link>
      </div>

      {post.imageUrl && (
        <div className="blog-post-image-container">
          <img
            src={post.imageUrl}
            alt={`Image for ${post.title}`}
            className="blog-post-image"
          />
        </div>
      )}

      <div className="blog-post-header">
        <h1 className="blog-post-title">{post.title}</h1>
        <div className="blog-post-author-and-date">
          <p className="blog-post-meta">By {post.author}</p>
          <p>{new Date(post.publishedDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="blog-post-content-wrapper">
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(post.content || ""),
          }}
        />
        <ShareButtons title={post.title} />
      </div>
    </div>
  );
};

export default BlogPostPage;
