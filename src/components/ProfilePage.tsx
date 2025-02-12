import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../components/UserContext";
import "../styles/ProfilePage.css";

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
}

interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  profilePictureUrl: string | null;
  sports: string[] | null;
  badges?: string[];
  savedBlogs?: BlogPost[]; // ✅ Ensure this is properly populated
  savedProducts?: Product[];
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  const { user, setUser, isSessionChecked } = useUserContext();

  useEffect(() => {
    if (!isSessionChecked) return;

    if (!user) {
      console.warn("⚠️ No valid session. Redirecting to /auth...");
      navigate("/auth", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Profile data:", data); // ✅ Debugging output
          setProfile(data);
        } else {
          console.warn("⚠️ No valid session. Redirecting to /auth...");
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        navigate("/auth", { replace: true });
      }
    };

    fetchProfile();
  }, [user, isSessionChecked, navigate, setUser]);

  if (!isSessionChecked) {
    return <div className="profile-loading">Checking session...</div>;
  }

  if (!profile) return <div className="profile-loading">No profile data found.</div>;

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });

      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; HttpOnly; SameSite=None";

      setUser(null);
      console.log("🔹 User successfully logged out.");
      navigate("/", { replace: true });
      window.location.href = "/";
    } catch (error) {
      console.error("❌ Error during logout:", error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-banner">
        <div className="profile-image-wrapper">
          <img
            src={profile.profilePictureUrl || "https://via.placeholder.com/150"}
            alt={profile.name}
            className="profile-image"
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="profile-bio">{profile.bio}</p>
          <div>
            <button onClick={handleSignOut} className="profile-cta-button">
              Sign Out
            </button>
            <button onClick={() => navigate("/settings")} className="profile-cta-button">
              Settings
            </button>
          </div>
        </div>
      </div>

      <hr className="profile-divider" />

      <div className="profile-section">
        <h2 className="profile-subsection-header-text">Badges</h2>
        <div className="profile-badges">
          {profile.badges?.length ? (
            profile.badges.map((badge, index) => (
              <div key={index} className="badge-item">
                {badge}
              </div>
            ))
          ) : (
            <p>No badges yet. Start achieving!</p>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-subsection-header-text">Sports & Stats</h2>
        <div className="profile-sports">
          {profile.sports?.length ? (
            profile.sports.map((sport, index) => (
              <div key={index} className="sport-item">
                {sport}
              </div>
            ))
          ) : (
            <p>No sports added yet.</p>
          )}
        </div>
      </div>

      {/* ✅ FIXED: Display saved blogs correctly */}
      <div className="profile-section">
        <h2 className="profile-subsection-header-text">Saved Blogs</h2>
        <div className="saved-blogs-grid">
  {profile.savedBlogs && profile.savedBlogs.length ? (
    profile.savedBlogs.map((blog) => (
      <div key={blog.id} className="saved-blog-card">
        {/* Blog Image */}
        <img src={blog.imageUrl} alt={blog.title} className="saved-blog-image" />

        {/* Blog Details */}
        <div className="saved-blog-details">
          <h3 className="blog-title">{blog.title}</h3>
          <p className="blog-author">By {blog.author}</p>

          {/* Read More Button */}
          <a href={`/blog/${blog.slug}`} className="read-blog-btn">
            Read More
          </a>
        </div>
      </div>
    ))
  ) : (
    <p className="no-blogs-text">No saved blogs yet.</p>
  )}
</div>


      </div>

      {/* Saved Products Section */}
      <div className="profile-section">
        <h2 className="profile-subsection-header-text">Saved Products</h2>
        <div className="profile-saved-products">
          {profile.savedProducts?.length ? (
            <div className="saved-products-grid">
              {profile.savedProducts.map((product) => (
                <div key={product.id} className="saved-product-card">
                  <img src={product.imgUrl} alt={product.name} className="saved-product-image" />
                  <div className="saved-product-details">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-brand">{product.brand}</p>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    <div className="saved-product-actions">
                      <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="buy-now-btn">
                        Buy Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-products-text">No saved products yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
