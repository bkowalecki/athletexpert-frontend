import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";
import { Helmet } from "react-helmet";
import SportStatsModal from "./SportStatsModal"; // adjust path

import "react-toastify/dist/ReactToastify.css";
import "../../styles/Globals.css";
import "../../styles/ProfilePage.css";

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
  firstName: string;
  lastName: string;
  bio: string | null;
  profilePictureUrl: string | null;
  sports: string[] | null;
  badges?: string[];
  savedBlogIds?: number[];
  savedProductIds?: number[];
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedBlogs, setSavedBlogs] = useState<BlogPost[]>([]);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [savingProductIds, setSavingProductIds] = useState<number[]>([]);
  const [activeSport, setActiveSport] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, setUser, isSessionChecked, checkSession } = useUserContext();
  const { logout: auth0Logout } = useAuth0();

  useEffect(() => {
    if (!isSessionChecked) return;
    if (!user) {
      console.warn("⚠️ No valid session. Redirecting to /auth...");
      navigate("/auth", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/users/profile`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("❌ Failed to fetch profile");

        const data: Profile = await response.json();
        setProfile(data);

        if (data.savedBlogIds?.length) {
          fetchSavedBlogs(data.savedBlogIds);
        }
        if (data.savedProductIds?.length) {
          fetchSavedProducts(data.savedProductIds);
        }
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        navigate("/auth", { replace: true });
      }
    };

    fetchProfile();
  }, [user, isSessionChecked, navigate]);

  const fetchSavedBlogs = async (blogIds: number[]) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/blog/bulk-fetch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: blogIds }),
        }
      );

      if (!response.ok) throw new Error("❌ Failed to fetch blogs");

      const data: BlogPost[] = await response.json();
      setSavedBlogs(data);
    } catch (error) {
      console.error("❌ Error fetching saved blogs:", error);
    }
  };

  const fetchSavedProducts = async (productIds: number[]) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/products/bulk-fetch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: productIds }),
        }
      );

      if (!response.ok) throw new Error("❌ Failed to fetch products");

      const data: Product[] = await response.json();
      setSavedProducts(data);
    } catch (error) {
      console.error("❌ Error fetching saved products:", error);
    }
  };

  const toggleSaveProduct = async (productId: number) => {
    if (!user) {
      toast.warn("⚠️ You need to log in to save products!");
      return;
    }

    const isSaved = savedProducts.some((product) => product.id === productId);

    setSavingProductIds((prev) => [...prev, productId]);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/saved-products/${productId}`,
        {
          method: isSaved ? "DELETE" : "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        setSavedProducts((prev) =>
          isSaved
            ? prev.filter((product) => product.id !== productId)
            : [...prev, { id: productId } as Product]
        );
        toast.success(isSaved ? "Product removed!" : "Product saved!");
      }
    } catch (error) {
      toast.error("❌ Error saving product. Try again.");
    } finally {
      setSavingProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const toggleSaveBlog = async (blogId: number) => {
    if (!user) {
      toast.warn("⚠️ You need to log in to save blogs!", {
        position: "top-center",
      });
      return;
    }

    const isSaved = savedBlogs.some((blog) => blog.id === blogId);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/saved-blogs/${blogId}`,
        {
          method: isSaved ? "DELETE" : "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        setSavedBlogs((prev) =>
          isSaved
            ? prev.filter((blog) => blog.id !== blogId)
            : [...prev, { id: blogId } as BlogPost]
        );
        toast.success(isSaved ? "Blog removed!" : "Blog saved!", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      toast.error("❌ Error saving blog. Try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      const currentAuthProvider = user?.authProvider;

      await fetch(`${process.env.REACT_APP_API_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      await checkSession(); // ✅ Immediately revalidate with server

      if (currentAuthProvider === "auth0") {
        auth0Logout({
          logoutParams: {
            returnTo: window.location.origin + "/auth",
          },
        });
      } else {
        window.location.href = "/auth"; // ✅ Hard reload for full memory wipe
      }
    } catch (error) {
      console.error("❌ Error during logout:", error);
      toast.error("Error signing out. Please try again.", {
        position: "top-center",
      });
    }
  };

  if (!isSessionChecked)
    return <div className="profile-loading">Checking session...</div>;
  if (!profile)
    return <div className="profile-loading">No profile data found.</div>;

  return (
    <div className="profile-container">
      <Helmet>
        <title>AthleteXpert | My Profile</title>
        <meta
          name="description"
          content="Manage your athlete profile, save blogs and products on AthleteXpert."
        />
      </Helmet>
      {/* --- Profile Banner and Info --- */}
      <div className="profile-banner">
        <div className="profile-image-wrapper">
          <img
            src={profile.profilePictureUrl || "https://via.placeholder.com/150"}
            alt="Profile"
            className="profile-image"
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="profile-bio">{profile.bio}</p>
        </div>
      </div>

      <hr className="profile-divider" />

      {/* --- Sports --- */}
      <h2 className="profile-subsection-header-text">Sports & Stats</h2>
      <div className="profile-sports">
        {profile.sports?.length ? (
          profile.sports.map((sport, index) => (
            <div
              key={index}
              className="sport-item"
              onClick={() => setActiveSport(sport)}
            >
              {sport}
            </div>
          ))
        ) : (
          <div className="profile-no-sports">
            <p className="profile-no-sports-text">
              You haven't added any sports yet!
            </p>
            <button
              className="profile-cta-button"
              onClick={() => navigate("/settings")}
            >
              Pick Your Sports
            </button>
          </div>
        )}
      </div>

      {/* --- Saved Blogs --- */}
      <h2 className="profile-subsection-header-text">Saved Blogs</h2>
      <div className="profile-saved-blogs-grid">
        {savedBlogs.length > 0 ? (
          savedBlogs.map((blog) => (
            <div key={blog.id} className="saved-blog-card">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="saved-blog-image"
              />
              <div className="saved-blog-details">
                <h3 className="saved-blog-title">{blog.title}</h3>
                <p className="saved-blog-author">By {blog.author}</p>
                <a href={`/blog/${blog.slug}`} className="read-blog-btn">
                  Read More
                </a>
                <button
                  className="save-blog-btn unsave"
                  onClick={() => toggleSaveBlog(blog.id)}
                >
                  Unsave
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="profile-no-blogs-text">No saved blogs yet.</p>
        )}
      </div>

      {/* --- Saved Products --- */}
      <h2 className="profile-subsection-header-text">Saved Products</h2>
      <div className="profile-saved-products">
        {savedProducts.length > 0 ? (
          <>
            {savedProducts.map((product) => (
              <div key={product.id} className="saved-product-card">
                <img
                  src={product.imgUrl}
                  alt={product.name}
                  className="saved-product-image"
                />
                <div className="saved-product-details">
                  <h3 className="profile-product-name">{product.name}</h3>
                  <a
                    href={product.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-now-btn"
                  >
                    View on Amazon
                  </a>
                  <button
                    className="save-product-btn unsave"
                    onClick={() => toggleSaveProduct(product.id)}
                    disabled={savingProductIds.includes(product.id)}
                    style={{ minWidth: "100px" }}
                  >
                    {savingProductIds.includes(product.id) ? (
                      <>
                        Saving
                        <span className="small-spinner"></span>
                      </>
                    ) : (
                      "Unsave"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <p className="profile-no-products-text">No saved products yet.</p>
        )}
      </div>

      {/* --- Motivational Quote and Buttons --- */}
      <div className="motivational-quote">
        "Every champion was once a contender who refused to give up." - Rocky
        Balboa
      </div>

      <div>
        <button onClick={handleSignOut} className="profile-cta-button">
          Sign Out
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="profile-cta-button"
        >
          Settings
        </button>
      </div>
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
