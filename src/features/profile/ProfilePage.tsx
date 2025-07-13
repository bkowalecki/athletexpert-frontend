import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";
import { Helmet } from "react-helmet";
import SportStatsModal from "./SportStatsModal";
import ProductCard from "../products/ProductCard";
import BlogCard from "../blog/BlogCard";
import { Product } from "../../types/products";
import { BlogPost } from "../../types/blogs";
import { useSavedProducts } from "../../hooks/useSavedProducts";
import "../../styles/Globals.css";
import "../../styles/ProfilePage.css";
import api from "../../api/axios";

interface Profile {
  firstName: string;
  lastName: string;
  bio: string | null;
  profilePictureUrl: string | null;
  sports: string[] | null;
  savedBlogIds?: number[];
  savedProductIds?: number[];
  location?: string | null;
}

const ProfilePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedBlogs, setSavedBlogs] = useState<BlogPost[]>([]);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [activeSport, setActiveSport] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user, setUser, isSessionChecked, checkSession } = useUserContext();
  const { logout: auth0Logout } = useAuth0();
  const { savedProductIds, toggleSaveProduct } = useSavedProducts();

  // Fetch full blog objects
  const fetchSavedBlogs = useCallback(async (ids: number[]) => {
    try {
      const { data } = await api.post("/blog/bulk-fetch", { ids });
      setSavedBlogs(data);
    } catch {
      setSavedBlogs([]);
    }
  }, []);

  // Fetch profile & blogs
  useEffect(() => {
    if (!isSessionChecked || !user) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get("/users/profile");
        setProfile(data);
        if (data.savedBlogIds?.length) await fetchSavedBlogs(data.savedBlogIds);
      } catch {
        toast.error("Failed to load profile.");
        navigate("/auth", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user, isSessionChecked, fetchSavedBlogs, navigate]);

  // Fetch product details
  useEffect(() => {
    if (!savedProductIds.length) return setSavedProducts([]);
    const fetchProducts = async () => {
      try {
        const { data } = await api.post("/products/bulk-fetch", { ids: savedProductIds });
        setSavedProducts(data);
      } catch {
        setSavedProducts([]);
      }
    };
    fetchProducts();
  }, [savedProductIds]);

  const toggleSaveBlog = async (blogId: number) => {
    if (!user) return toast.warn("Please log in to manage blogs.");
    const isSaved = savedBlogs.some((b) => b.id === blogId);
    try {
      await api({
        method: isSaved ? "DELETE" : "POST",
        url: `/users/saved-blogs/${blogId}`,
        withCredentials: true,
      });

      setSavedBlogs((prev) =>
        isSaved ? prev.filter((b) => b.id !== blogId) : [...prev, { id: blogId } as BlogPost]
      );
      toast.success(isSaved ? "Blog removed." : "Blog saved!");
    } catch {
      toast.error("Error updating saved blogs.");
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear local storage/sessionStorage
      sessionStorage.removeItem("ax_id_token");
      sessionStorage.removeItem("ax_token_time");
      sessionStorage.setItem("justLoggedOut", "true");
  
      // Backend logout (clears cookie)
      await api.post("/users/logout");
  
      // Hard clear any lingering context **before** redirect
      setUser(null);
  
      // Skip checkSession() — it's often the root of the flash/loop bug
  
      if (user?.authProvider === "auth0") {
        // Auth0 handles cookie cleanup + redirect
        auth0Logout({ logoutParams: {  returnTo: window.location.origin + "/" } });
      } else {
        // Delay slightly to give cookie time to clear
        setTimeout(() => {
          window.location.href = "/"; // or "/" if you'd rather land them on home
        }, 100); // You can tweak delay if needed
      }
    } catch {
      toast.error("Log out failed.");
    }
  };
  

  const formatLocation = (loc: string): string => {
    const parts = loc.split(",").map((p) => p.trim());
    if (parts.length === 3) {
      const [city, state, country] = parts;
      return country === "United States" ? `${city}, ${state}` : `${city}, ${country}`;
    }
    return loc;
  };

  if (isLoading) {
    return (
      <div className="profile-loading" style={{ minHeight: 320, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="ax-spinner" style={{
          width: 36, height: 36, border: "4px solid #f0a500", borderTop: "4px solid #1a1a1a", borderRadius: "50%", animation: "spin 0.8s linear infinite"
        }} />
        <span style={{ marginLeft: 16, fontWeight: 600, color: "#888" }}>Loading your profile...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !user || !profile) {
    return (
      <div className="profile-error" role="alert" style={{ textAlign: "center", color: "#b00", marginTop: 80 }}>
        <p><strong>Uh oh! {error || "Unable to load profile."}</strong></p>
        <button onClick={() => window.location.reload()} className="profile-cta-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Helmet>
        <title>AthleteXpert | My Profile</title>
        <meta name="description" content="Manage your athlete profile, save blogs and products on AthleteXpert." />
      </Helmet>

      {/* Banner */}
      <div className="profile-banner">
        <div className="profile-image-wrapper">
          <img
            src={profile.profilePictureUrl || "https://athletexpertbucket.s3.us-east-1.amazonaws.com/avatars/default_avatar.png"}
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

      {/* Sports */}
      <h2 className="profile-subsection-header-text">Sports & Stats</h2>
      <div className="profile-sports">
        {profile.sports?.length ? (
          profile.sports.map((sport, i) => (
            <div key={i} className="sport-item" onClick={() => setActiveSport(sport)}>
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

      {/* Blogs */}
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
              isSaved
              isPinned={false}
              onUnsave={() => toggleSaveBlog(blog.id)}
              onPin={() => {}}
            />
          ))
        ) : (
          <p className="profile-no-blogs-text">No saved blogs yet.</p>
        )}
      </div>

      {/* Products */}
      <h2 className="profile-subsection-header-text">Maybe Later...</h2>
      <div className="profile-saved-products">
        {savedProducts.length > 0 ? (
          savedProducts.map((product) => (
            <ProductCard
              id={product.id}
              key={product.id}
              name={product.name}
              brand={product.brand}
              price={product.price}
              imgUrl={product.imgUrl}
              affiliateLink={product.affiliateLink}
              isSaved
              onToggleSave={() => toggleSaveProduct(product.id)}
            />
          ))
        ) : (
          <p className="profile-no-products-text">No saved products yet.</p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="motivational-quote">
        "Every champion was once a contender who refused to give up." - Rocky Balboa
      </div>
      <div>
        <button onClick={handleSignOut} className="profile-cta-button">Sign Out</button>
        <button onClick={() => navigate("/settings")} className="profile-cta-button">Settings</button>
      </div>

      {/* Modal */}
      {activeSport && (
        <SportStatsModal sport={activeSport} onClose={() => setActiveSport(null)} />
      )}
    </div>
  );
};

export default ProfilePage;
