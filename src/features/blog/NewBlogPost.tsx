import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { blogTemplates } from "../../data/blogTemplates";
import { toast } from "react-toastify";
import "../../styles/NewBlogPost.css";

// Replace with your real product search type!
interface Product {
  id: number;
  name: string;
  brand: string;
  price: number | string;
  imgUrl: string;
  affiliateLink: string;
}

interface BlogPost {
  id?: number;
  title: string;
  author: string;
  imageUrl: string;
  summary: string;
  content: string;
  sport: string;
  tags: string[];
  publishedDate: string;
}

const emptyFormData: BlogPost = {
  title: "",
  author: "",
  imageUrl: "",
  summary: "",
  content: "",
  sport: "",
  tags: [],
  publishedDate: new Date().toISOString().slice(0, 10),
};

const NewBlogPost: React.FC = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BlogPost>(emptyFormData);
  const [tagInput, setTagInput] = useState("");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showBlogs, setShowBlogs] = useState(false);

  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<Product[]>([]);
  const productTimeout = useRef<NodeJS.Timeout>();

  // Focus on title at mount for speed
  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  // Blog draft load/save
  useEffect(() => {
    const saved = localStorage.getItem("blog-draft");
    if (saved) setFormData(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("blog-draft", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/blog/admin/all`, { withCredentials: true })
      .then(({ data }) => setBlogs(data || []))
      .catch(() => {});
  }, []);

  // ======== Product Search (auto debounce) ==========
  useEffect(() => {
    if (productSearch.length < 2) return setProductResults([]);
    if (productTimeout.current) clearTimeout(productTimeout.current);
    productTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/search`, {
          params: { query: productSearch },
        });
        setProductResults(res.data);
      } catch {
        setProductResults([]);
      }
    }, 400);
    // eslint-disable-next-line
  }, [productSearch]);

  // ======== Handlers =============
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim();
      if (!formData.tags.includes(tag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingId(blog.id ?? null);
    setFormData({ ...blog, tags: Array.isArray(blog.tags) ? blog.tags : [] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/blog/${id}`, { withCredentials: true });
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      toast.success("Blog deleted!");
    } catch {
      toast.error("Error deleting blog.");
    }
  };

  // ======== Insert product embed ==========
  const insertProductEmbed = (product: Product) => {
    // Customize this to your desired HTML format!
    const embed = `
<div class="ax-product-embed">
  <a href="${product.affiliateLink}" target="_blank" rel="noopener noreferrer">
    <img src="${product.imgUrl}" alt="${product.name}" />
    <div><strong>${product.name}</strong> – ${product.brand}${product.price ? ` | $${product.price}` : ""}</div>
  </a>
</div>
`;
    setFormData((prev) => ({
      ...prev,
      content: prev.content + "\n" + embed,
    }));
    setProductResults([]);
    setProductSearch("");
  };

  // ======== AI Draft Writer (Optional) ==========
  const generateAIBlog = async () => {
    // TODO: Swap for your API
    toast.info("Drafting with AI...");
    try {
      const res = await axios.post("/api/ai/generate-blog", {
        title: formData.title,
        summary: formData.summary,
        sport: formData.sport,
      });
      setFormData((prev) => ({ ...prev, content: res.data.content }));
    } catch {
      toast.error("AI drafting failed.");
    }
  };

  // ======== Submit ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId
      ? `${process.env.REACT_APP_API_URL}/blog/admin/blog/${editingId}`
      : `${process.env.REACT_APP_API_URL}/blog/admin/blog`;
    const method = editingId ? "put" : "post";

    try {
      await axios({ url, method, data: formData, withCredentials: true });
      toast.success(editingId ? "Blog updated!" : "Blog created!");
      setEditingId(null);
      setFormData(emptyFormData);
      window.scrollTo({ top: 0, behavior: "smooth" });
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/blog/admin/all`, { withCredentials: true });
      setBlogs(data || []);
    } catch {
      toast.error("Error submitting blog");
    }
  };

  // ======== UI ==========
  if (user?.role !== "admin") {
    return (
      <div className="admin-lockout">
        <h1>Access Denied</h1>
        <p>This page is for authorized AthleteXpert blog admins only.</p>
        <a href="mailto:contact@athletexpert.org">Contact Us</a>
      </div>
    );
  }

  return (
    <div className="new-blog-container">
      <h2>{editingId ? "Edit Blog Post" : "Create New Blog Post"}</h2>
      <form onSubmit={handleSubmit} className="blog-form">
        {(["title", "author", "imageUrl", "sport"] as const).map((field) => (
          <input
            key={field}
            ref={field === "title" ? titleRef : undefined}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            placeholder={field === "imageUrl" ? "Header Image URL" : field.charAt(0).toUpperCase() + field.slice(1)}
            required={field === "title" || field === "author"}
            autoComplete="off"
          />
        ))}

        {formData.imageUrl && (
          <div className="image-preview-wrapper">
            <img src={formData.imageUrl} alt="Header Preview" className="image-preview" />
          </div>
        )}

        <textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          placeholder="Summary"
        />
        <p className="char-count">Characters: {formData.summary.length}/160</p>

        {/* ===== TAGS ===== */}
        <div>
          <label className="bold-label">Tags</label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a tag and press Enter"
            autoComplete="off"
          />
          <div className="tag-preview">
            {formData.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>×</button>
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

        {/* ===== FAST PRODUCT SEARCH & EMBED ===== */}
        <div>
          <label className="bold-label">Insert Product</label>
          <input
            type="text"
            placeholder="Search for a product to embed"
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
          />
          {productResults.length > 0 && (
            <div className="product-search-results">
              {productResults.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className="product-search-result"
                  onClick={() => insertProductEmbed(p)}
                  title={`Insert "${p.name}"`}
                >
                  <img src={p.imgUrl} alt={p.name} width={36} height={36} style={{ objectFit: "cover", borderRadius: 4, marginRight: 8 }} />
                  {p.name} – <span style={{ color: "#666" }}>{p.brand}</span>
                  {p.price && <span style={{ marginLeft: 8, color: "#2a6045", fontWeight: 500 }}>${p.price}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== AI WRITE BUTTON ===== */}
        <div className="ai-write-bar">
          <button type="button" onClick={generateAIBlog} style={{ marginBottom: 8 }}>
            🪄 Draft Blog with AI (Experimental)
          </button>
        </div>

        {/* ===== TEMPLATES & CONTENT ===== */}
        <div>
          <label className="bold-label">Blog HTML Content</label>
          <div className="template-buttons">
            {blogTemplates.map(({ name, html }) => (
              <button key={name} type="button" onClick={() => setFormData((prev) => ({ ...prev, content: prev.content + "\n" + html }))}>
                Add {name}
              </button>
            ))}
          </div>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter raw HTML content here..."
            className="blog-html-input"
            rows={12}
          />
          <p className="word-count">Word Count: {formData.content.trim().split(/\s+/).length}</p>
        </div>

        <div className="live-preview">
          <h3 className="preview-heading">Live Preview</h3>
          <div className="preview-box">
            <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: formData.content }} />
          </div>
        </div>

        <div className="button-group">
          <button type="submit">{editingId ? "Update Blog" : "Publish Blog"}</button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData(emptyFormData); }} className="cancel-btn">
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
        {showBlogs && blogs.map((b) => (
          <div key={b.id} className="blog-admin-row">
            <span><strong>{b.title}</strong> – {b.author}</span>
            <div>
              <button onClick={() => handleEdit(b)}>Edit</button>
              <button onClick={() => handleDelete(b.id!)} className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewBlogPost;
