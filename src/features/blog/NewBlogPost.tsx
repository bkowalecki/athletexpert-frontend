import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { blogTemplates, BlogTemplate } from "../../data/blogTemplates";
import "../../styles/NewBlogPost.css";

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

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/blog/admin/all`,
          {
            withCredentials: true,
          }
        );
        setBlogs(data || []);
      } catch (err) {
        console.error("Error loading blogs", err);
      }
    };
    fetchBlogs();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingId(blog.id ?? null);
    setFormData({ ...blog, tags: Array.isArray(blog.tags) ? blog.tags : [] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/blog/${id}`, {
        withCredentials: true,
      });
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId
      ? `${process.env.REACT_APP_API_URL}/blog/admin/blog/${editingId}`
      : `${process.env.REACT_APP_API_URL}/blog/admin/blog`;
    const method = editingId ? "put" : "post";

    try {
      await axios({
        url,
        method,
        data: formData,
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      alert(editingId ? "Blog updated!" : "Blog created!");
      setEditingId(null);
      setFormData(emptyFormData);

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/blog/admin/all`,
        {
          withCredentials: true,
        }
      );
      setBlogs(data || []);
    } catch (err) {
      console.error("Error submitting blog:", err);
      alert("Error submitting blog");
    }
  };

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
        {/* Core Fields */}
        {["title", "author", "imageUrl", "sport"].map((field) => (
          <input
            key={field}
            name={field}
            value={(formData as any)[field]}
            onChange={handleChange}
            placeholder={
              field === "imageUrl"
                ? "Header Image URL"
                : field.charAt(0).toUpperCase() + field.slice(1)
            }
            required={field === "title" || field === "author"}
          />
        ))}

        {/* Summary */}
        <textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          placeholder="Summary"
        />

        {/* Tags */}
        <div>
          <label className="bold-label">Tags</label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a tag and press Enter"
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
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="bold-label">Blog HTML Content</label>
          <div className="template-buttons">
            {blogTemplates.map((template: BlogTemplate) => (
              <button
                key={template.name}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    content: prev.content + "\n" + template.html,
                  }))
                }
              >
                Add {template.name}
              </button>
            ))}
          </div>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter raw HTML content here..."
            className="blog-html-input"
          />
        </div>

        {/* Preview */}
        <div className="live-preview">
          <h3 className="preview-heading">Live Preview</h3>
          <div className="preview-box">
            <div
              className="blog-post-content"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          </div>
        </div>

        {/* Actions */}
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
              }}
              className="cancel-btn"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Existing Blogs */}
      <div className="existing-blogs">
        <h3>Manage Existing Blog Posts</h3>
        {blogs.map((b) => (
          <div key={b.id} className="blog-admin-row">
            <span>
              <strong>{b.title}</strong> – {b.author}
            </span>
            <div>
              <button onClick={() => handleEdit(b)}>Edit</button>
              <button
                onClick={() => handleDelete(b.id!)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewBlogPost;
