import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useUserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { blogTemplates } from "../../data/blogTemplates";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import "../../styles/NewBlogPost.css";
import {
  fetchAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog as deleteBlogApi,
} from "../../api/blog";
import { searchProducts } from "../../api/product";
import { safeUrl } from "../../util/safeUrl";
import type { BlogPost, BlogPostForm } from "../../types/blogs";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number | string | null;
  imgUrl: string;
  affiliateLink: string;
}

type BlogTemplate = { name: string; html: string };

const DRAFT_KEY = "blog-draft";

const emptyFormData: BlogPostForm = {
  title: "",
  author: "",
  imageUrl: "",
  summary: "",
  content: "",
  sport: "",
  tags: [],
  publishedDate: new Date().toISOString().slice(0, 10),
};

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

const normalizeTag = (tag: string) =>
  tag.trim().replace(/\s+/g, "-").toLowerCase();

const NewBlogPost: React.FC = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<BlogPostForm>(emptyFormData);
  const [tagInput, setTagInput] = useState("");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showBlogs, setShowBlogs] = useState(false);
  const [blogFilter, setBlogFilter] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<Product[]>([]);
  const productTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const draftSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMountedRef = useRef(false);

  /* ------------------ derived state ------------------ */

  const sanitizedPreview = useMemo(
    () => DOMPurify.sanitize(formData.content || ""),
    [formData.content]
  );

  const wordCount = useMemo(() => {
    const txt = (formData.content || "").trim();
    return txt ? txt.split(/\s+/).filter(Boolean).length : 0;
  }, [formData.content]);

  const filteredBlogs = useMemo(() => {
    const q = blogFilter.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter((b) =>
      `${b.title} ${b.author} ${(b.tags || []).join(" ")} ${b.sport || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [blogs, blogFilter]);

  const lastSavedLabel = useMemo(() => {
    if (!lastSavedAt) return "Not saved yet";
    return `Saved ${new Date(lastSavedAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }, [lastSavedAt]);

  /* ------------------ effects ------------------ */

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const saved = safeJsonParse<BlogPostForm>(localStorage.getItem(DRAFT_KEY));
    if (saved) {
      setFormData({ ...emptyFormData, ...saved });
      setLastSavedAt(Date.now());
    }
    hasMountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) return;

    if (draftSaveTimeout.current) {
      clearTimeout(draftSaveTimeout.current);
      draftSaveTimeout.current = null;
    }

    draftSaveTimeout.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setLastSavedAt(Date.now());
    }, 450);

    return () => {
      if (draftSaveTimeout.current) {
        clearTimeout(draftSaveTimeout.current);
        draftSaveTimeout.current = null;
      }
    };
  }, [formData]);

  useEffect(() => {
    let alive = true;
    fetchAllBlogs()
      .then((data) => alive && setBlogs(data || []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (productSearch.length < 2) {
      setProductResults([]);
      return;
    }

    if (productTimeout.current) {
      clearTimeout(productTimeout.current);
      productTimeout.current = null;
    }

    productTimeout.current = setTimeout(async () => {
      try {
        const results = await searchProducts(productSearch);
        setProductResults(results || []);
      } catch {
        setProductResults([]);
      }
    }, 400);

    return () => {
      if (productTimeout.current) {
        clearTimeout(productTimeout.current);
        productTimeout.current = null;
      }
    };
  }, [productSearch]);

  /* ------------------ handlers ------------------ */

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const insertAtCursor = useCallback(
    (text: string) => {
      const el = contentRef.current;
      if (!el) {
        setFormData((p) => ({
          ...p,
          content: (p.content || "") + "\n" + text,
        }));
        return;
      }

      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;

      const next =
        (formData.content || "").slice(0, start) +
        text +
        (formData.content || "").slice(end);

      setFormData((p) => ({ ...p, content: next }));

      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + text.length, start + text.length);
      });
    },
    [formData.content]
  );

  const addTag = (raw: string) => {
    const cleaned = normalizeTag(raw);
    if (!cleaned) return;
    setFormData((prev) =>
      prev.tags.includes(cleaned)
        ? prev
        : { ...prev, tags: [...prev.tags, cleaned] }
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingId(blog.id ?? null);
    setFormData({
      title: blog.title || "",
      author: blog.author || "",
      imageUrl: blog.imageUrl || "",
      summary: blog.summary || "",
      content: blog.content || "",
      sport: blog.sport || "",
      tags: Array.isArray(blog.tags) ? blog.tags : [],
      publishedDate:
        blog.publishedDate || new Date().toISOString().slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("Loaded blog into editor.");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deleteBlogApi(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      toast.success("Blog deleted!");
    } catch {
      toast.error("Error deleting blog.");
    }
  };

  const insertProductEmbed = (product: Product) => {
    const safeAffiliateLink = safeUrl(product.affiliateLink) ?? "#";
    const safeImgUrl = safeUrl(product.imgUrl) ?? "";
    const embed = `
<div class="ax-product-embed">
  <a href="${safeAffiliateLink}" target="_blank" rel="noopener noreferrer">
    <img src="${safeImgUrl}" alt="${product.name}" />
    <div><strong>${product.name}</strong> - ${product.brand}${
      product.price ? ` | $${product.price}` : ""
    }</div>
  </a>
</div>
`;
    insertAtCursor(embed);
    setProductResults([]);
    setProductSearch("");
    toast.success("Inserted product embed.");
  };

  const saveDraftNow = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    setLastSavedAt(Date.now());
    toast.success("Draft saved.");
  };

  const clearDraft = () => {
    if (!window.confirm("Clear the current editor + saved draft?")) return;
    localStorage.removeItem(DRAFT_KEY);
    setEditingId(null);
    setFormData(emptyFormData);
    setTagInput("");
    setLastSavedAt(null);
    toast.info("Draft cleared.");
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(formData.content || "");
      toast.success("HTML copied to clipboard.");
    } catch {
      toast.error("Could not copy. (Browser blocked clipboard)");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.author.trim()) {
      toast.error("Title + author are required.");
      return;
    }

    try {
      if (editingId) {
        await updateBlog(editingId, formData);
        toast.success("Blog updated!");
      } else {
        await createBlog(formData);
        toast.success("Blog created!");
      }

      setEditingId(null);
      setFormData(emptyFormData);
      setTagInput("");
      localStorage.removeItem(DRAFT_KEY);
      setLastSavedAt(null);

      window.scrollTo({ top: 0, behavior: "smooth" });
      const data = await fetchAllBlogs();
      setBlogs(data || []);
    } catch {
      toast.error("Error submitting blog");
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";
      if (!isSave) return;
      e.preventDefault();
      saveDraftNow();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [formData]);

  if (user?.role !== "admin") {
    return (
      <div className="admin-lockout">
        <h1>Access Denied</h1>
        <p>This page is for authorized AthleteXpert blog admins only.</p>
        <a href="mailto:contact@athletexpert.org">Contact Us</a>
      </div>
    );
  }

  const typedTemplates = blogTemplates as BlogTemplate[];

  return (
    <div className="new-blog-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "baseline",
        }}
      >
        <h2 style={{ margin: 0 }}>
          {editingId ? "Edit Blog Post" : "Create New Blog Post"}
        </h2>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          <span style={{ marginRight: 10 }}>{lastSavedLabel}</span>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ fontSize: 12 }}
          >
            Exit
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="blog-form">
        {(["title", "author", "imageUrl", "sport"] as const).map((field) => (
          <input
            key={field}
            ref={field === "title" ? titleRef : undefined}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            placeholder={
              field === "imageUrl"
                ? "Header Image URL"
                : field.charAt(0).toUpperCase() + field.slice(1)
            }
            required={field === "title" || field === "author"}
            autoComplete="off"
          />
        ))}

        {formData.imageUrl && (
          <div className="image-preview-wrapper">
            <img
              src={formData.imageUrl}
              alt="Header Preview"
              className="image-preview"
            />
          </div>
        )}

        <textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          placeholder="Summary (meta)"
        />
        <p className="char-count">Characters: {formData.summary.length}/160</p>

        <div>
          <label className="bold-label">Tags</label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a tag and press Enter (or comma)"
            autoComplete="off"
          />
          <div className="tag-preview">
            {formData.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove ${tag}`}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>

        <label className="bold-label">Published Date</label>
        <input
          type="date"
          name="publishedDate"
          value={formData.publishedDate}
          onChange={handleChange}
        />

        <div>
          <label className="bold-label">Insert Product</label>
          <input
            type="text"
            placeholder="Search for a product to embed"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
          {productResults.length > 0 && (
            <div className="product-search-results">
              {productResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="product-search-result"
                  onClick={() => insertProductEmbed(p)}
                  title={`Insert "${p.name}"`}
                >
                  <img
                    src={p.imgUrl}
                    alt={p.name}
                    width={36}
                    height={36}
                    style={{
                      objectFit: "cover",
                      borderRadius: 4,
                      marginRight: 8,
                    }}
                  />
                  {p.name} - <span style={{ color: "#666" }}>{p.brand}</span>
                  {p.price && (
                    <span
                      style={{
                        marginLeft: 8,
                        color: "#2a6045",
                        fontWeight: 500,
                      }}
                    >
                      ${p.price}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="bold-label">Blog HTML Content</label>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div
              className="template-buttons"
              style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
            >
              {typedTemplates.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    insertAtCursor(`\n${t.html}\n`);
                    toast.info(`Inserted template: ${t.name}`);
                  }}
                  title={`Insert ${t.name} at cursor`}
                >
                  Insert {t.name}
                </button>
              ))}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button type="button" onClick={saveDraftNow} title="Ctrl/Cmd+S">
                Save Draft
              </button>
              <button type="button" onClick={copyHtml}>
                Copy HTML
              </button>
              <button type="button" onClick={clearDraft} className="cancel-btn">
                Clear
              </button>
            </div>
          </div>

          <textarea
            ref={contentRef}
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write raw HTML here. Templates + product embeds insert at the cursor."
            className="blog-html-input"
            rows={14}
            spellCheck={false}
          />
          <p className="word-count">Word Count: {wordCount}</p>
        </div>

        <div className="live-preview">
          <h3 className="preview-heading">Live Preview</h3>
          <div className="preview-box">
            <div
              className="blog-post-content"
              dangerouslySetInnerHTML={{ __html: sanitizedPreview }}
            />
          </div>
        </div>

        <div className="button-group">
          <button type="submit">
            {editingId ? "Update Blog" : "Publish Blog"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData(emptyFormData);
                setTagInput("");
                toast.info("Edit cancelled.");
              }}
              className="cancel-btn"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="existing-blogs">
        <h3>
          <button onClick={() => setShowBlogs(!showBlogs)}>
            {showBlogs ? "Hide" : "Show"} Existing Blog Posts
          </button>
        </h3>

        {showBlogs && (
          <>
            <input
              type="text"
              placeholder="Filter existing posts..."
              value={blogFilter}
              onChange={(e) => setBlogFilter(e.target.value)}
              style={{ margin: "10px 0", width: "100%", padding: 10 }}
            />

            {filteredBlogs.map((b) => (
              <div key={b.id} className="blog-admin-row">
                <span>
                  <strong>{b.title}</strong> - {b.author}
                </span>
                <div>
                  <button type="button" onClick={() => handleEdit(b)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id!)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default NewBlogPost;
