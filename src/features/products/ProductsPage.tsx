import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import ProductCard from "../products/ProductCard";
import CategoryCard from "./CategoryCard";
import { useSavedProducts } from "../../hooks/useSavedProducts";
import "../../styles/ProductsPage.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  affiliateLink: string;
  imgUrl: string;
  brand: string;
  retailer: string;
  trending: boolean;
  featured: boolean;
  sports?: string[];
}

const fetchProducts = async (): Promise<Product[]> =>
  (await axios.get(`${process.env.REACT_APP_API_URL}/products`)).data;

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    brand: "",
    sport: "",
    sortOption: "",
  });
  const [visibleCount, setVisibleCount] = useState(12);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { savedProductIds, toggleSaveProduct } = useSavedProducts();

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5000,
  });

  const categories = [
    {
      title: "Water Bottles",
      imageUrl: "/images/categories/water-bottle.jpg",
      description: "Hydration for every athlete",
      linkTo: "/products/water-bottles",
    },
    {
      title: "Running Shoes",
      imageUrl: "/images/categories/running-shoes.jpg",
      description: "Your stride starts here",
      linkTo: "/products/running-shoes",
    },
    {
      title: "Recovery Gear",
      imageUrl: "/images/categories/recovery.jpg", // Update with a real recovery-related image
      description: "From sore to soar",
      linkTo: "/products/recovery",
    },
    {
      title: "Sport Tech",
      imageUrl: "/images/categories/sport-tech.jpg", 
      description: "Track, tune, and train smarter",
      linkTo: "/products/tech",
    },
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          (!searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (!filters.brand || product.brand === filters.brand) &&
          (!filters.sport || product.sports?.includes(filters.sport))
      )
      .sort((a, b) => {
        if (filters.sortOption === "priceLow") return a.price - b.price;
        if (filters.sortOption === "priceHigh") return b.price - a.price;
        return 0;
      });
  }, [products, searchQuery, filters]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setVisibleCount(12);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputQuery);
    setVisibleCount(12);
  };

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 12);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="products-page">
      <Helmet>
        <title>AthleteXpert | Gear</title>
        <meta
          name="description"
          content="Discover the best gear for your sport on AthleteXpert."
        />
      </Helmet>
      <h1 className="products-page-title">Explore</h1>

      {/* <div className="category-grid">
        {categories.map((cat) => (
          <CategoryCard key={cat.title} {...cat} />
        ))}
      </div> */}

      <form className="filters-container" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="search-bar"
        />
        <button className="search-btn" type="submit">
          Search
        </button>

        <select
          value={filters.brand}
          onChange={(e) => handleFilterChange("brand", e.target.value)}
        >
          <option value="">All Brands</option>
          {[...new Set(products.map((p) => p.brand))].map(
            (brand, index) =>
              brand && (
                <option key={`${brand}-${index}`} value={brand}>
                  {brand}
                </option>
              )
          )}
        </select>

        <select
          value={filters.sport}
          onChange={(e) => handleFilterChange("sport", e.target.value)}
        >
          <option value="">All Sports</option>
          {[...new Set(products.flatMap((p) => p.sports || []))].map(
            (sport, i) => (
              <option key={i} value={sport}>
                {sport}
              </option>
            )
          )}
        </select>

        <select
          value={filters.sortOption}
          onChange={(e) => handleFilterChange("sortOption", e.target.value)}
        >
          <option value="" disabled>
            Sort by...
          </option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
        </select>
      </form>

      {isLoading && <p className="loading-text">Loading products...</p>}
      {error && (
        <div className="products-error-container">
          <h2>😵 Oops! Something went wrong.</h2>
          <p>
            We couldn't load the products right now. Please try again later.
          </p>
          <button className="return-home-btn" onClick={() => navigate("/")}>
            Return Home
          </button>
        </div>
      )}

      <div className="product-grid">
        {visibleProducts.length > 0
          ? visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                brand={product.brand}
                price={product.price}
                imgUrl={product.imgUrl}
                affiliateLink={product.affiliateLink}
                isSaved={savedProductIds.includes(product.id)}
                onToggleSave={() => toggleSaveProduct(product.id)}
              />
            ))
          : !isLoading && (
              <p className="no-products-text">No products match your search.</p>
            )}
      </div>

      <div ref={sentinelRef} style={{ height: "1px" }} />
    </div>
  );
};

export default ProductsPage;
