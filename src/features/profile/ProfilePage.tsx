import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";
import { Helmet } from "react-helmet";
import { useQueryClient } from "@tanstack/react-query";
import SportStatsModal from "./SportStatsModal";
import ProductCard from "../products/ProductCard";
import BlogCard from "../blog/BlogCard";
import type { Product } from "../../types/products";
import type { BlogPost } from "../../types/blogs";
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
  authProvider?: "auth0" | "local" | string;
  isPublic?: boolean;
  publicSlug?: string;
}

type TabKey = "overview" | "blogs" | "products";

const DEFAULT_AVATAR =
  "https://athletexpertbucket.s3.us-east-1.amazonaws.com/avatars/default_avatar.png";

const ProfilePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedBlogs, setSavedBlogs] = useState<BlogPost[]>([]);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [activeSport, setActiveSport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [avatarSrc, setAvatarSrc] = useState<string>(DEFAULT_AVATAR);
  const [error, setError] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");

  const navigate = useNavigate();
  const { user, setUser, isSessionChecked } = useUserContext();
  const { logout: auth0Logout } = useAuth0();
  const queryClient = useQueryClient();
  const { savedProductIds, toggleSaveProduct } = useSavedProducts();

  const initials = useMemo(() => {
    const f = profile?.firstName?.[0] ?? "";
    const l = profile?.lastName?.[0] ?? "";
    return (f + l || "AX").toUpperCase();
  }, [profile]);

  const formatLocation = useCallback((loc: string): string => {
    const parts = loc.split(",").map((p) => p.trim());
    if (parts.length === 3) {
      const [city, state, country] = parts;
      return country === "United States"
        ? `${city}, ${state}`
        : `${city}, ${country}`;
    }
    return loc;
  }, []);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const checks = [
      !!profile.firstName,
      !!profile.lastName,
      !!profile.bio,
      !!profile.profilePictureUrl,
      !!profile.location,
      !!(profile.sports && profile.sports.length),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  const blogCount = savedBlogs.length;
  const productCount = savedProducts.length;

  const formatShortDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "";

  // ---------- Saved Blogs ----------
  const fetchSavedBlogs = useCallback(
    async (ids: number[], signal?: AbortSignal) => {
      if (!ids?.length) {
        setSavedBlogs([]);
        return;
      }
      try {
        const { data } = await api.post(
          "/blog/bulk-fetch",
          { ids },
          { signal }
        );
        setSavedBlogs(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
          return;
        setSavedBlogs([]);
      }
    },
    []
  );

  // ---------- Activity types ----------
  type ActivityItem =
    | { type: "blog_save"; label: string; href: string; date: string }
    | { type: "product_save"; label: string; href: string; date: string }
    | { type: "comment"; label: string; href: string; date: string }
    | { type: "vote"; label: string; href: string; date: string };

  const blogSaved = (b: BlogPost): ActivityItem => ({
    type: "blog_save",
    label: `Saved blog: ${b.title}`,
    href: `/blog/${b.slug}`,
    date: b.publishedDate ?? new Date().toISOString(),
  });

  const productSaved = (p: Product): ActivityItem => ({
    type: "product_save",
    label: `Saved product: ${p.brand} ${p.name}`,
    href: `/product/${p.slug}`,
    date: new Date().toISOString(),
  });

  // ---------- Small UI helpers ----------
  const StreakGrid: React.FC<{ days?: number; data?: number[] }> = ({
    days = 35,
    data,
  }) => {
    const vals =
      data ?? Array.from({ length: days }, (_, i) => ((i * 7) % 23) % 5);
    return (
      <div className="streak">
        {vals.map((v, i) => (
          <span key={i} className={`streak-cell lvl-${v}`} aria-hidden="true" />
        ))}
      </div>
    );
  };

  type Badge = { id: string; label: string; icon: string; earnedAt?: string };
  const BadgesRow: React.FC<{ badges: Badge[] }> = ({ badges }) => {
    if (!badges.length)
      return <div className="empty tiny">No badges yet — keep going! 🏁</div>;
    return (
      <div className="badges">
        {badges.map((b) => (
          <div key={b.id} className="badge">
            <span className="badge-icon" aria-hidden>
              {b.icon}
            </span>
            <div className="badge-meta">
              <div className="badge-label">{b.label}</div>
              {b.earnedAt && (
                <div className="badge-date">{formatShortDate(b.earnedAt)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ActivityList: React.FC<{
    items: ActivityItem[];
    onNavigate: (href: string) => void;
  }> = ({ items, onNavigate }) => {
    if (!items.length)
      return <div className="empty tiny">No recent activity yet.</div>;
    return (
      <ul className="activity">
        {items.slice(0, 6).map((it, i) => (
          <li key={i} className={`activity-item ${it.type}`}>
            <button
              className="activity-link"
              onClick={() => onNavigate(it.href)}
            >
              <span className="activity-icon" aria-hidden>
                {it.type === "blog_save"
                  ? "📝"
                  : it.type === "product_save"
                  ? "🛒"
                  : it.type === "comment"
                  ? "💬"
                  : "⬆️"}
              </span>
              <span className="activity-label">{it.label}</span>
              <time className="activity-date">{formatShortDate(it.date)}</time>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const Checklist: React.FC<{
    items: { id: string; label: string; done: boolean; onClick?: () => void }[];
  }> = ({ items }) => (
    <ul className="checklist">
      {items.map((c) => (
        <li key={c.id} className={`check ${c.done ? "done" : ""}`}>
          <button
            className="check-btn"
            onClick={c.onClick}
            aria-pressed={c.done}
          >
            <span className="check-box" aria-hidden>
              {c.done ? "✔" : ""}
            </span>
            <span className="check-label">{c.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );

  const PrivacyToggle: React.FC<{
    isPublic: boolean;
    onChange: (v: boolean) => void;
    publicUrl?: string;
  }> = ({ isPublic, onChange, publicUrl }) => {
    return (
      <div className="privacy">
        <div className="privacy-row">
          <span className="privacy-label">Profile visibility</span>
          <button
            className={`switch ${isPublic ? "on" : ""}`}
            onClick={() => onChange(!isPublic)}
            role="switch"
            aria-checked={isPublic}
          >
            <span className="knob" />
          </button>
        </div>
        <div className="privacy-sub">
          {isPublic ? (
            <>
              Public • Share your profile:&nbsp;
              {publicUrl ? (
                <a href={publicUrl} className="inline-link">
                  {publicUrl}
                </a>
              ) : (
                <span>Link available after first publish</span>
              )}
            </>
          ) : (
            "Private • Only you can see your profile details."
          )}
        </div>
      </div>
    );
  };

  // ---------- Load Profile ----------
  const loadProfile = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      setProfileStatus("loading");

      try {
        const { data } = await api.get("/users/profile", { signal });

        setProfile(data);
        setAvatarSrc(data?.profilePictureUrl || DEFAULT_AVATAR);

        if (data?.savedBlogIds?.length) {
          await fetchSavedBlogs(data.savedBlogIds, signal);
        } else {
          setSavedBlogs([]);
        }
        setProfileStatus("loaded");
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
          return;
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          navigate("/auth", { replace: true });
          return;
        }
        setError("Failed to load profile. Please try again.");
        setProfileStatus("error");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSavedBlogs, navigate]
  );

  useEffect(() => {
    if (!isSessionChecked) return;

    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    const controller = new AbortController();
    loadProfile(controller.signal);
    return () => controller.abort();
  }, [isSessionChecked, user, loadProfile, navigate]);

  // ---------- Load Saved Products (from hook ids) ----------
  useEffect(() => {
    const controller = new AbortController();

    if (!savedProductIds?.length) {
      setSavedProducts([]);
      return;
    }

    (async () => {
      try {
        const { data } = await api.post(
          "/products/bulk-fetch",
          { ids: savedProductIds },
          { signal: controller.signal }
        );
        setSavedProducts(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
          return;
        setSavedProducts([]);
      }
    })();

    return () => controller.abort();
  }, [savedProductIds]);

  const toggleSaveBlog = useCallback(
    async (blogId: number) => {
      if (!user) return toast.warn("Please log in to manage blogs.");

      const currentIds = profile?.savedBlogIds ?? [];
      const isSaved = currentIds.includes(blogId);

      try {
        await api({
          method: isSaved ? "DELETE" : "POST",
          url: `/users/saved-blogs/${blogId}`,
          withCredentials: true,
        });

        const nextIds = isSaved
          ? currentIds.filter((id) => id !== blogId)
          : [...currentIds, blogId];

        setProfile((prev) =>
          prev ? { ...prev, savedBlogIds: nextIds } : prev
        );
        await fetchSavedBlogs(nextIds);
        toast.success(isSaved ? "Blog removed." : "Blog saved!");
      } catch {
        toast.error("Error updating saved blogs.");
      }
    },
    [user, profile, fetchSavedBlogs]
  );

  const handleSignOut = useCallback(async () => {
    try {
      sessionStorage.removeItem("ax_id_token");
      sessionStorage.removeItem("ax_token_time");
      sessionStorage.removeItem("sessionExpired");
      sessionStorage.removeItem("ax_auth_redirected");
      sessionStorage.setItem("justLoggedOut", "true");

      setUser(null);
      queryClient.clear();

      await api.post("/users/logout").catch(() => {});

      const provider = (user as any)?.authProvider;
      if (provider === "auth0") {
        auth0Logout({
          logoutParams: {
            returnTo: `${window.location.origin}/auth?loggedOut=1`,
          },
        });
      } else {
        navigate("/auth?loggedOut=1", { replace: true });
      }
    } catch {
      toast.error("Log out failed.");
    }
  }, [setUser, user, auth0Logout, queryClient, navigate]);

  if (!isSessionChecked || profileStatus === "loading") {
    return (
      <div className="profile-frame loading">
        <div className="ribbon" aria-hidden="true" />
        <div className="shell">
          <div className="left-rail">
            <div className="card glass skeleton">
              <div className="avatar-skel shimmer" />
              <div className="line-skel shimmer" />
              <div className="line-skel short shimmer" />
            </div>
          </div>
          <div className="main-rail">
            <div className="card glass skeleton">
              <div className="line-skel shimmer" />
              <div className="line-skel shimmer" />
              <div className="line-skel short shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (profileStatus === "error" && isSessionChecked) {
    return (
      <div className="profile-error-wrap">
        <div className="card glass error">
          <p>
            <strong>{error ?? "Unable to load profile."}</strong>
          </p>
          <button
            className="btn primary"
            onClick={() => {
              const c = new AbortController();
              loadProfile(c.signal);
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const getStableProductKey = (p: Product, idx: number) =>
    String(p.id ?? p.asin ?? p.slug ?? `${p.name}-${idx}`);

  return (
    <div className="profile-frame">
      <Helmet>
        <title>AthleteXpert | My Profile</title>
        <meta
          name="description"
          content="Your profile, sports, saved blogs and products on AthleteXpert."
        />
      </Helmet>

      <div className="ribbon" aria-hidden="true" />

      <div className="shell">
        <aside className="left-rail" aria-label="Profile summary">
          <div className="card glass profile-card">
            <div className="avatar-wrap">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="avatar"
                  onError={() => setAvatarSrc(DEFAULT_AVATAR)}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="avatar-fallback">{initials}</div>
              )}
            </div>

            <h1 className="display-name">
              {profile.firstName} {profile.lastName}
            </h1>

            {profile.location && (
              <div className="muted">📍 {formatLocation(profile.location)}</div>
            )}
            {profile.bio && <p className="bio">{profile.bio}</p>}

            <div className="meter">
              <div className="meter-bar" style={{ width: `${completion}%` }} />
            </div>
            <div className="meter-label">
              Profile completeness: {completion}%
            </div>

            <div className="quick-actions">
              <button
                className="btn subtle"
                onClick={() => navigate("/settings")}
              >
                Edit Profile
              </button>
              <button
                className="btn subtle"
                onClick={() => navigate("/settings")}
              >
                Preferences
              </button>
              <button className="btn danger" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="stat-num">
                  {(profile.sports?.length ?? 0).toString()}
                </div>
                <div className="stat-label">Sports</div>
              </div>
              <div className="stat">
                <div className="stat-num">{blogCount.toString()}</div>
                <div className="stat-label">Blogs</div>
              </div>
              <div className="stat">
                <div className="stat-num">{productCount.toString()}</div>
                <div className="stat-label">Products</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-rail">
          <nav className="tabs" aria-label="Profile sections">
            {(
              [
                { key: "overview", label: "Overview" },
                { key: "blogs", label: `Saved Blogs (${blogCount})` },
                { key: "products", label: `Saved Products (${productCount})` },
              ] as { key: TabKey; label: string }[]
            ).map((t) => (
              <button
                key={t.key}
                className={`tab ${activeTab === t.key ? "active" : ""}`}
                aria-pressed={activeTab === t.key}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {activeTab === "overview" && (
            <>
              <section className="card glass">
                <h2 className="section-title">At a Glance</h2>

                <PrivacyToggle
                  isPublic={Boolean(profile?.isPublic)}
                  onChange={(next) =>
                    setProfile((p) => (p ? { ...p, isPublic: next } : p))
                  }
                  publicUrl={
                    profile?.publicSlug
                      ? `${window.location.origin}/u/${profile.publicSlug}`
                      : undefined
                  }
                />

                <div className="overview-grid">
                  <div>
                    <div className="subtle-title">Activity Streak</div>
                    <StreakGrid />
                  </div>
                  <div>
                    <div className="subtle-title">Achievements</div>
                    <BadgesRow badges={[]} />
                  </div>
                </div>
              </section>

              <section className="card glass">
                <h2 className="section-title">Sports & Stats</h2>
                <div className="chips">
                  {profile.sports?.length ? (
                    profile.sports.map((sport, i) => (
                      <button
                        key={`${sport}-${i}`}
                        className="chip"
                        onClick={() => setActiveSport(sport)}
                      >
                        {sport}
                      </button>
                    ))
                  ) : (
                    <div className="empty">
                      <p>You haven’t added any sports.</p>
                      <button
                        className="btn primary"
                        onClick={() => navigate("/settings")}
                      >
                        Pick Your Sports
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <section className="card glass">
                <h2 className="section-title">Recent Activity</h2>
                <ActivityList
                  onNavigate={(href) => navigate(href)}
                  items={[
                    ...savedBlogs.slice(0, 3).map(blogSaved),
                    ...savedProducts.slice(0, 3).map(productSaved),
                  ]}
                />
              </section>

              <section className="card glass">
                <h2 className="section-title">Finish Setting Up</h2>
                <Checklist
                  items={[
                    {
                      id: "pic",
                      label: "Add a profile picture",
                      done: !!profile.profilePictureUrl,
                      onClick: () => navigate("/settings"),
                    },
                    {
                      id: "bio",
                      label: "Write a short bio",
                      done: !!profile.bio,
                      onClick: () => navigate("/settings"),
                    },
                    {
                      id: "loc",
                      label: "Add your location",
                      done: !!profile.location,
                      onClick: () => navigate("/settings"),
                    },
                    {
                      id: "sport",
                      label: "Pick at least one sport",
                      done: !!(profile.sports && profile.sports.length),
                      onClick: () => navigate("/settings"),
                    },
                  ]}
                />
              </section>
            </>
          )}

          {activeTab === "blogs" && (
            <section aria-labelledby="blogs-heading" className="card glass">
              <h2 id="blogs-heading" className="section-title">
                My Blogs
              </h2>

              {savedBlogs.length > 0 ? (
                <div className="grid">
                  {savedBlogs.map((blog) => (
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
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <p>No saved blogs yet.</p>
                  <button
                    className="btn subtle"
                    onClick={() => navigate("/blog")}
                  >
                    Explore Blog
                  </button>
                </div>
              )}
            </section>
          )}

          {activeTab === "products" && (
            <section aria-labelledby="products-heading" className="card glass">
              <h2 id="products-heading" className="section-title">
                Saved Products
              </h2>

              {savedProducts.length > 0 ? (
                <div className="grid">
                  {savedProducts.map((product) => (
                    <ProductCard
                      key={String(product.id)}
                      id={product.id}
                      name={product.name}
                      brand={product.brand}
                      price={product.price}
                      imgUrl={product.imgUrl}
                      affiliateLink={product.affiliateLink}
                      slug={product.slug}
                      isSaved
                      onToggleSave={() => toggleSaveProduct(product.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <p>No saved products yet.</p>
                  <button
                    className="btn subtle"
                    onClick={() => navigate("/products")}
                  >
                    Browse Gear
                  </button>
                </div>
              )}
            </section>
          )}
        </main>
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
