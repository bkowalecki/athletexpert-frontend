import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import sportsData from "../../data/sports.json";
import "../../styles/SportPage.css";
import ProductCard from "../products/ProductCard";
import { BlogPost } from "../../types/blogs";
import BlogCard from "../blog/BlogCard";

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
}

// Slugify utility
const slugify = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

// Memoize a lookup map for O(1) slug->sport
const getSlugMap = (sportsArr: Sport[]) => {
  const map: Record<string, Sport> = {};
  sportsArr.forEach((s) => {
    map[slugify(s.title)] = s;
  });
  return map;
};

const SportPage: React.FC = () => {
  const { sport: slug } = useParams<{ sport: string }>();
  const navigate = useNavigate();

  const slugMap = useMemo(() => getSlugMap(sportsData), []);
  const currentSport = slug ? slugMap[slug] : null;

  // UI state
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Redirect on 404 or Esports (coming soon)
  useEffect(() => {
    if (!slug || !currentSport || currentSport.title.toLowerCase() === "e-sports") {
      navigate("/404", { replace: true });
    }
  }, [slug, currentSport, navigate]);

  // Fetch related data
  useEffect(() => {
    if (!currentSport) return;
    let cancelled = false;

    const fetchRelatedBlogs = async () => {
      setLoadingBlogs(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/blog/by-tag`,
          { params: { tag: currentSport.title }, withCredentials: true }
        );
        if (!cancelled) setRelatedBlogs(data);
      } catch {
        if (!cancelled) setRelatedBlogs([]);
      } finally {
        if (!cancelled) setLoadingBlogs(false);
      }
    };

    const fetchRecommendedProducts = async () => {
      setLoadingProducts(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/products/by-sport`,
          { params: { sport: currentSport.title }, withCredentials: true }
        );
        if (!cancelled) setRecommendedProducts(data);
      } catch {
        if (!cancelled) setRecommendedProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    fetchRelatedBlogs();
    fetchRecommendedProducts();

    return () => {
      cancelled = true;
    };
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

      <section className="sport-page-section">
        <h2 className="sport-page-section-title">Recommended Gear</h2>
        {loadingProducts ? (
          <p className="sport-page-text">Loading products...</p>
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
              />
            ))}
          </div>
        ) : (
          <p className="sport-page-text">
            We're still gathering the best gear for this sport.
          </p>
        )}
      </section>

      <section className="sport-page-section">
        <h2 className="sport-page-section-title">Explore More</h2>
        {loadingBlogs ? (
          <p className="sport-page-text">Loading related blogs...</p>
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
          <p className="sport-page-text">
            No blog posts found for {currentSport.title}. Want to write one?
          </p>
        )}
      </section>
    </div>
  );
};

export default SportPage;
