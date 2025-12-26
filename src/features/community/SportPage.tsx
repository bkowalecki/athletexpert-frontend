import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import sportsData from "../../data/sports.json";
import "../../styles/SportPage.css";
import ProductCard from "../products/ProductCard";
import BlogCard from "../blog/BlogCard";
import SportWeeklyPoll from "../community/SportWeeklyPoll";
import { BlogPost } from "../../types/blogs";
import { fetchBlogsByTag } from "../../api/blog";
import { fetchProductsBySport } from "../../api/product";

// Types
interface Sport {
  title: string;
  backgroundImage: string;
  extra_data: {
    category: string;
    type: string;
    popularity: string;
    summary?: string;
    fun_fact?: string;
  };
}

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  imgUrl: string;
  affiliateLink: string;
  slug: string;
}

// Utility: Slugify
const slugify = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

// Reusable Loading Component
const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <p className="sport-page-text">{message}</p>
);

// Reusable No Data Component
const NoDataState: React.FC<{ message: string }> = ({ message }) => (
  <p className="sport-page-text">{message}</p>
);

const SportPage: React.FC = () => {
  const { sport: slug } = useParams<{ sport: string }>();
  const navigate = useNavigate();

  // Memoized Slug Map
  const slugMap = useMemo(() => {
    return sportsData.reduce((map, sport) => {
      map[slugify(sport.title)] = sport;
      return map;
    }, {} as Record<string, Sport>);
  }, []);

  const currentSport = slug ? slugMap[slug] : null;

  // State
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect on invalid sport or "E-Sports"
  useEffect(() => {
    if (!slug || !currentSport || currentSport.title.toLowerCase() === "e-sports") {
      navigate("/404", { replace: true });
    }
  }, [slug, currentSport, navigate]);

  // Fetch related blogs and products
  useEffect(() => {
    if (!currentSport) return;
  
    const fetchData = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const [blogs, products] = await Promise.all([
          fetchBlogsByTag(currentSport.title),
          fetchProductsBySport(currentSport.title),
        ]);
        setRelatedBlogs(blogs);
        setRecommendedProducts(products);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [currentSport]);

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

      <SportWeeklyPoll sportSlug={slug!} />

      {/* Recommended Gear Section */}
      <section className="sport-page-section">
        <h2 className="sport-page-section-title">Recommended Gear</h2>
        {loading ? (
          <LoadingState message="Loading products..." />
        ) : error ? (
          <NoDataState message={error} />
        ) : recommendedProducts.length > 0 ? (
          <div className="recommended-products-grid">
            {recommendedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                brand={product.brand}
                price={product.price}
                imgUrl={product.imgUrl}
                affiliateLink={product.affiliateLink}
                slug={product.slug}
              />
            ))}
          </div>
        ) : (
          <NoDataState message="We're still gathering the best gear for this sport." />
        )}
      </section>

      {/* Related Blogs Section */}
      <section className="sport-page-section">
        <h2 className="sport-page-section-title">Explore More</h2>
        {loading ? (
          <LoadingState message="Loading related blogs..." />
        ) : error ? (
          <NoDataState message={error} />
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