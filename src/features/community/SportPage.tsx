import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import sportsData from "../../data/sports.json";
import EsportExperience from "./EsportsExperience";
import "../../styles/SportPage.css";
import ProductCard from "../products/ProductCard";

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

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  imageUrl: string;
  slug: string;
}

const SportPage: React.FC = () => {
  const { sport } = useParams<{ sport: string }>();
  const navigate = useNavigate();

  const [currentSport, setCurrentSport] = useState<Sport | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const isEsports = currentSport?.title.toLowerCase() === "e-sports";

  useEffect(() => {
    if (isEsports) {
      navigate("/404", { replace: true });
    }
  }, [isEsports, navigate]);

  useEffect(() => {
    if (!sport) {
      navigate("/404", { replace: true });
      return;
    }

    const slugify = (str: string) =>
      str
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "");

    const foundSport = sportsData.find(
      (s) => slugify(s.title) === sport.toLowerCase()
    );

    if (!foundSport) {
      console.warn(`Sport "${sport}" not found. Redirecting to 404.`);
      navigate("/404", { replace: true });
      return;
    }

    setCurrentSport(foundSport);

    const fetchRelatedBlogs = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/blog/by-tag`,
          { params: { tag: foundSport.title }, withCredentials: true }
        );
        setRelatedBlogs(data);
      } catch (err) {
        console.error("❌ Error fetching related blogs:", err);
      } finally {
        setLoadingBlogs(false);
      }
    };

    const fetchRecommendedProducts = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/products/by-sport?sport=${foundSport.title}`,
          { withCredentials: true }
        );
        setRecommendedProducts(data);
      } catch (err) {
        console.error("❌ Error fetching sport-specific products:", err);
      }
    };

    fetchRelatedBlogs();
    fetchRecommendedProducts();
  }, [sport, navigate]);

  if (!currentSport) {
    return (
      <div className="sport-page">
        <h2 className="sport-page-not-found">Loading...</h2>
      </div>
    );
  }

  if (isEsports) {
    return null;
  }

  return (
    <div className="sport-page">
      <div className="sport-page-title">{currentSport.title}</div>

      <section className="sport-page-section sport-page-funfact">
        <h2 className="sport-page-section-title">Fun Fact</h2>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sport-page-funfact-box"
        >
          <p className="sport-page-funfact-text">
            {currentSport.extra_data.fun_fact ||
              "This sport originally had wildly different rules that evolved over time!"}
          </p>
        </motion.div>
      </section>

      <section className="sport-page-section">
        <h2 className="sport-page-section-title">Recommended Gear</h2>
        {recommendedProducts.length > 0 ? (
          <div className="recommended-products-grid">
            {recommendedProducts.map((product) => (
              <ProductCard
                key={product.id}
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
              <div key={post.id} className="related-blog-card">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="related-blog-image"
                />
                <div className="related-blog-info">
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                  <Link to={`/blog/${post.slug}`}>Read More →</Link>
                </div>
              </div>
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
