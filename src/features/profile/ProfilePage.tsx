import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";
import { Helmet } from "react-helmet";
import SportStatsModal from "./SportStatsModal";
import ProductCard from "../products/ProductCard";
import BlogCard from "../blog/BlogCard";
import { useSavedProducts } from "../../hooks/useSavedProducts";

// Styles
import "../../styles/Globals.css";
import "../../styles/ProfilePage.css";

// --- Types ---
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  affiliateLink: string;
  imgUrl: string;
  brand: string;
  category: string;
  retailer: string;
  featured?: boolean;
  trending?: boolean;
}
interface BlogPost {
  id: number;
  title: string;
  author: string;
  imageUrl: string;
  slug: string;
  publishedDate: string;
  summary: string;
}
interface Profile {
  firstName: string;
  lastName: string;
  bio: string | null;
  profilePictureUrl: string | null;
  sports: string[] | null;
  badges?: string[];
  savedBlogIds?: number[];
  savedProductIds?: number[];
  location?: string | null;
  publishedDate?: string | null;
  summary?: string | null;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedBlogs, setSavedBlogs] = useState<BlogPost[]>([]);
  const [activeSport, setActiveSport] = useState<string | null>(null);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const { savedProductIds, toggleSaveProduct } = useSavedProducts();

  const navigate = useNavigate();
  const { user, setUser, isSessionChecked, checkSession } = useUserContext();
  const { logout: auth0Logout } = useAuth0();

  // --- Fetch Profile & Blogs ---
  useEffect(() => {
    if (!isSessionChecked) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/users/profile`, { credentials: "include" });
        if (!res.ok) throw new Error("❌ Failed to fetch profile");
        const data: Profile = await res.json();
        setProfile(data);
        if (data.savedBlogIds?.length) fetchSavedBlogs(data.savedBlogIds);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        navigate("/auth", { replace: true });
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [user, isSessionChecked]);

  // --- Fetch Saved Products Details ---
  useEffect(() => {
    if (!savedProductIds.length) return;
    const fetchSavedProductDetails = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/products/bulk-fetch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: savedProductIds }),
        });
        setSavedProducts(await res.json());
      } catch (err) {
        console.error("Error loading saved product details", err);
      }
    };
    fetchSavedProductDetails();
  }, [savedProductIds]);

  // --- Fetch Saved Blogs ---
  const fetchSavedBlogs = useCallback(async (ids: number[]) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/blog/bulk-fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("❌ Failed to fetch blogs");
      setSavedBlogs(await res.json());
    } catch (err) {
      console.error("❌ Error fetching blogs:", err);
    }
  }, []);

  // --- Save/Unsave Blog ---
  const toggleSaveBlog = async (blogId: number) => {
    if (!user) return toast.warn("Log in to save blogs!");
    const isSaved = savedBlogs.some((b) => b.id === blogId);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/users/saved-blogs/${blogId}`,
        {
          method: isSaved ? "DELETE" : "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        setSavedBlogs((prev) =>
          isSaved
            ? prev.filter((b) => b.id !== blogId)
            : [...prev, { id: blogId } as BlogPost]
        );
        toast.success(isSaved ? "Blog removed!" : "Blog saved!");
      }
    } catch (err) {
      toast.error("❌ Error saving blog.");
    }
  };

  // --- Sign Out Logic ---
  const handleSignOut = async () => {
    try {
      sessionStorage.removeItem("ax_id_token");
      sessionStorage.removeItem("ax_token_time");
      await fetch(`${process.env.REACT_APP_API_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      await checkSession();
      if (user?.authProvider === "auth0") {
        auth0Logout({ logoutParams: { returnTo: window.location.origin + "/auth" } });
      } else {
        window.location.href = "/auth";
      }
    } catch (err) {
      console.error("❌ Logout error:", err);
      toast.error("Error signing out.");
    }
  };

  // --- Helper for Location Formatting ---
  const formatLocation = (raw: string): string => {
    const parts = raw.split(",").map((p) => p.trim());
    if (parts.length === 3) {
      const [city, state, country] = parts;
      return country === "United States" ? `${city}, ${state}` : `${city}, ${country}`;
    }
    return raw;
  };

  // --- Early returns for loading/redirect ---
  if (!isSessionChecked || !profile) return <div className="profile-loading"></div>;
  if (!user) return null;

  // --- Render ---
  return (
    <div className="profile-container">
      <Helmet>
        <title>AthleteXpert | My Profile</title>
        <meta
          name="description"
          content="Manage your athlete profile, save blogs and products on AthleteXpert."
        />
      </Helmet>

      {/* --- Profile Banner --- */}
      <div className="profile-banner">
        <div className="profile-image-wrapper">
          <img
            src={
              profile.profilePictureUrl ||
              "https://athletexpertbucket.s3.us-east-1.amazonaws.com/avatars/default_avatar.png"
            }
            alt="Profile"
            className="profile-image"
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{profile.firstName} {profile.lastName}</h1>
          <p className="profile-bio">{profile.bio}</p>
          {profile.location && (
            <p className="profile-location">📍 {formatLocation(profile.location)}</p>
          )}
        </div>
      </div>

      <hr className="profile-divider" />

      {/* --- Sports --- */}
      <h2 className="profile-subsection-header-text">Sports & Stats</h2>
      <div className="profile-sports">
        {profile.sports?.length ? (
          profile.sports.map((sport, idx) => (
            <div key={idx} className="sport-item" onClick={() => setActiveSport(sport)}>
              {sport}
            </div>
          ))
        ) : (
          <div className="profile-no-sports">
            <p className="profile-no-sports-text">You haven't added any sports yet!</p>
            <button className="profile-cta-button" onClick={() => navigate("/settings")}>
              Pick Your Sports
            </button>
          </div>
        )}
      </div>

      {/* --- Blogs --- */}
      <h2 className="profile-subsection-header-text">My Blogs</h2>
      <div className="profile-saved-blogs-grid">
        {savedBlogs.length > 0 ? (
          savedBlogs.map((blog) => (
            <BlogCard
              key={blog.id}
              id={blog.id}
              title={blog.title}
              author={blog.author}
              slug={blog.slug}
              imageUrl={blog.imageUrl}
              publishedDate={blog.publishedDate}
              summary={blog.summary}
              variant="profile"
              isSaved={true}
              isPinned={false}
              onUnsave={() => toggleSaveBlog(blog.id)}
              onPin={() => {}}
            />
          ))
        ) : (
          <p className="profile-no-blogs-text">No saved blogs yet.</p>
        )}
      </div>

      {/* --- Products --- */}
      <h2 className="profile-subsection-header-text">Maybe Later...</h2>
      <div className="profile-saved-products">
        {savedProducts.length > 0 ? (
          savedProducts.map((product) => (
            <ProductCard
            id = {product.id}
              key={product.id}
              name={product.name}
              brand={product.brand}
              price={product.price}
              imgUrl={product.imgUrl}
              affiliateLink={product.affiliateLink}
              isSaved={true}
              onToggleSave={() => toggleSaveProduct(product.id)}
            />
          ))
        ) : (
          <p className="profile-no-products-text">No saved products yet.</p>
        )}
      </div>

      {/* --- Quote & Actions --- */}
      <div className="motivational-quote">
        "Every champion was once a contender who refused to give up." - Rocky Balboa
      </div>
      <div>
        <button onClick={handleSignOut} className="profile-cta-button">
          Sign Out
        </button>
        <button onClick={() => navigate("/settings")} className="profile-cta-button">
          Settings
        </button>
      </div>

      {/* --- Modal for Sport Stats --- */}
      {activeSport && (
        <SportStatsModal
          sport={activeSport}
          onClose={() => setActiveSport(null)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
