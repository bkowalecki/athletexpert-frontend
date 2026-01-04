import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "../../styles/SportPage.css";

import ProductCard from "../products/ProductCard";
import BlogCard from "../blog/BlogCard";
import SportWeeklyPoll from "../community/SportWeeklyPoll";

import type { BlogPost } from "../../types/blogs";
import type { Product } from "../../types/products";

import { fetchBlogsByTag } from "../../api/blog";
import { fetchProductsBySport } from "../../api/product";
import { useSports } from "../../context/SportsContext";
import { slugifySportName } from "../../util/slug";

// Reusable UI
const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <p className="sport-page-text">{message}</p>
);

const NoDataState: React.FC<{ message: string }> = ({ message }) => (
  <p className="sport-page-text">{message}</p>
);

const SportPage: React.FC = () => {
  const FORUM_ENABLED = false;
  const WEEKLY_POLL_ENABLED = false;
  const { sport: slug } = useParams<{ sport: string }>();
  const navigate = useNavigate();
  const { sports } = useSports();

  // Resolve current sport from context
  const currentSport = useMemo(() => {
    if (!slug) return null;
    return sports.find((s) => slugifySportName(s.title) === slug) ?? null;
  }, [sports, slug]);

  // Redirect invalid sport or E-Sports
  useEffect(() => {
    if (!slug || !currentSport || currentSport.title.toLowerCase() === "e-sports") {
      navigate("/404", { replace: true });
    }
  }, [slug, currentSport, navigate]);

  // Blogs
  const {
    data: relatedBlogs = [],
    isLoading: blogsLoading,
    isError: blogsError,
  } = useQuery<BlogPost[]>({
    queryKey: ["sportBlogs", currentSport?.title],
    queryFn: () => fetchBlogsByTag(currentSport!.title),
    enabled: !!currentSport,
    staleTime: 60_000,
  });

  // Products
  const {
    data: recommendedProducts = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery<Product[]>({
    queryKey: ["sportProducts", currentSport?.title],
    queryFn: () => fetchProductsBySport(currentSport!.title),
    enabled: !!currentSport,
    staleTime: 60_000,
  });

  if (!currentSport) {
    return (
      <div className="sport-page">
        <h2 className="sport-page-not-found">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="sport-page">
      <div className="sport-page-title">{currentSport.title}</div>

      {WEEKLY_POLL_ENABLED && (
        <SportWeeklyPoll sportSlug={slugifySportName(currentSport.title)} />
      )}

      {FORUM_ENABLED && (
        <section className="sport-page-section">
          <h2 className="sport-page-section-title">Sport Forum</h2>
          <p className="sport-page-text">
            Jump into the conversation with athletes who play this sport.
          </p>
          <div className="sport-page-buttons">
            <Link
              to={`/community/${slugifySportName(currentSport.title)}/forum`}
              className="sport-page-btn primary"
            >
              Visit Forum
            </Link>
          </div>
        </section>
      )}

      {/* Recommended Gear */}
      <section className="sport-page-section">
        <h2 className="sport-page-section-title">Recommended Gear</h2>

        {productsLoading ? (
          <LoadingState message="Loading products..." />
        ) : productsError ? (
          <NoDataState message="Failed to load products. Please try again later." />
        ) : recommendedProducts.length > 0 ? (
          <div className="recommended-products-grid">
            {recommendedProducts.map((product) => (
              <ProductCard
                key={product.id ?? product.asin ?? product.slug ?? product.name}
                id={product.id}
                name={product.name}
                brand={product.brand}
                price={typeof product.price === "number" ? product.price : null}
                imgUrl={product.imgUrl}
                affiliateLink={product.affiliateLink}
                slug={product.slug}
                isAmazonFallback={product.isAmazonFallback}
                isTrending={Boolean((product as any).trending)}
              />
            ))}
          </div>
        ) : (
          <NoDataState message="We're still gathering the best gear for this sport." />
        )}
      </section>

      {/* Related Blogs */}
      <section className="sport-page-section">
        <h2 className="sport-page-section-title">Explore More</h2>

        {blogsLoading ? (
          <LoadingState message="Loading related blogs..." />
        ) : blogsError ? (
          <NoDataState message="Failed to load blogs. Please try again later." />
        ) : relatedBlogs.length > 0 ? (
          <div className="sport-related-blogs">
            {relatedBlogs.map((post) => (
              <BlogCard
                key={post.id}
                id={post.id}
                title={post.title}
                author={post.author || "Unknown"}
                publishedDate={post.publishedDate}
                slug={post.slug}
                imageUrl={post.imageUrl}
                summary={post.summary}
                variant="list"
              />
            ))}
          </div>
        ) : (
          <NoDataState
            message={`No blog posts found for ${currentSport.title}. Want to write one?`}
          />
        )}
      </section>
    </div>
  );
};

export default SportPage;
