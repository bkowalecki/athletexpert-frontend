import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  savedBlogIds?: number[]; // ✅ IDs only
  savedProductIds?: number[]; // ✅ IDs only
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedBlogs, setSavedBlogs] = useState<BlogPost[]>([]);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
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
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/users/profile`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("❌ Failed to fetch profile");

        const data: Profile = await response.json();
        console.log("✅ Full Profile Data:", data);
        setProfile(data);

        // ✅ Ensure both fetch functions are called with IDs
        if (data.savedBlogIds?.length) {
          console.log("🔍 Fetching Blogs for IDs:", data.savedBlogIds);
          fetchSavedBlogs(data.savedBlogIds);
        }

        if (data.savedProductIds?.length) {
          console.log("🔍 Fetching Products for IDs:", data.savedProductIds);
          fetchSavedProducts(data.savedProductIds);
        }
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        navigate("/auth", { replace: true });
      }
    };

    fetchProfile();
  }, [user, isSessionChecked, navigate, setUser]);

  /** ✅ Fetch Full Blog Details */
  const fetchSavedBlogs = async (blogIds: number[]) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/blogs/bulk-fetch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: blogIds }),
        }
      );

      if (!response.ok) throw new Error("❌ Failed to fetch blogs");

      const data: BlogPost[] = await response.json();
      console.log("✅ Blogs Loaded:", data);
      setSavedBlogs(data);
    } catch (error) {
      console.error("❌ Error fetching saved blogs:", error);
    }
  };

  const toggleSaveProduct = async (productId: number) => {
    if (!user) {
      toast.warn("⚠️ You need to log in to save products!", {
        position: "top-center",
      });
      return;
    }

    const isSaved = savedProducts.some((product) => product.id === productId);

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

        toast.success(isSaved ? "Product removed!" : "Product saved!", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      toast.error("❌ Error saving product. Try again.");
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

  /** ✅ Fetch Full Product Details */
  /** ✅ Fetch Full Product Details */
  const fetchSavedProducts = async (productIds: number[]) => {
    if (!productIds.length) {
      console.warn("⚠️ No product IDs found to fetch.");
      return;
    }

    try {
      console.log("🔍 Sending request to fetch products for IDs:", productIds);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/products/bulk-fetch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: productIds }),
        }
      );

      if (!response.ok) {
        throw new Error("❌ Failed to fetch products");
      }

      const data: Product[] = await response.json();

      console.log("✅ Products Loaded:", data);

      if (data.length === 0) {
        console.warn("⚠️ No products returned from bulk-fetch.");
      }

      setSavedProducts(data);
    } catch (error) {
      console.error("❌ Error fetching saved products:", error);
    }
  };

  if (!isSessionChecked)
    return <div className="profile-loading">Checking session...</div>;
  if (!profile)
    return <div className="profile-loading">No profile data found.</div>;

  const handleSignOut = async () => {
    try {
      if (user?.authProvider === 'auth0') {
        console.log("Signing out from Auth0 session...");
        await fetch(`${process.env.REACT_APP_API_URL}/users/logout`, {
          method: "POST",
          credentials: "include",
        });
        setUser(null);
  
        // 👇 Redirect to Auth0's logout endpoint
        window.location.href = `https://${process.env.REACT_APP_AUTH0_DOMAIN}/v2/logout?client_id=${process.env.REACT_APP_AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(window.location.origin)}`;
  
      } else {
        console.log("Signing out from local session...");
        await fetch(`${process.env.REACT_APP_API_URL}/users/logout`, {
          method: "POST",
          credentials: "include",
        });
        setUser(null);
        window.location.reload(); // 👈 For local users
      }
    } catch (error) {
      console.error("❌ Error during logout:", error);
      toast.error("Error signing out. Please try again.", { position: "top-center" });
    }
  };
  

  return (
    <div className="profile-container">
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

      <div className="profile-section">
        {/* <h2 className="profile-subsection-header-text">Badges</h2>
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
          <div className="badge-item-one-of-a-kind">
            <img
              src="https://athletexpertbucket.s3.us-east-1.amazonaws.com/badges/White+Gold+Black+Modern+Elegant+Football+Club+Badge+Logo.png"
              alt="whhops"
              className="badge-image"
            />
          </div>
        </div> */}

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

        <h2 className="profile-subsection-header-text">Saved Products</h2>
        <div className="profile-saved-products">
          {savedProducts.length > 0 ? (
            <div className="saved-products-grid">
              {savedProducts.map((product) => (
                <div key={product.id} className="saved-product-card">
                  <img
                    src={product.imgUrl}
                    alt={product.name}
                    className="saved-product-image"
                  />
                  <div className="saved-product-details">
                    <h3 className="product-name">{product.name}</h3>
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
                    >
                      Unsave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="profile-no-products-text">No saved products yet.</p>
          )}
        </div>

        
        <div className="motivational-quote">
  "Every champion was once a contender who refused to give up." - Rocky Balboa
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
      </div>
    </div>
  );
};

export default ProfilePage;
