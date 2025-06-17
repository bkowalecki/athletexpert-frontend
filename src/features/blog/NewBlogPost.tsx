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
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/blog/admin/all`, {
          withCredentials: true,
        });
        setBlogs(data || []);
      } catch (err) {
        console.error("Error loading blogs", err);
      }
    };
    fetchBlogs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/blog/${id}`, { withCredentials: true });
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
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/blog/admin/all`, {
        withCredentials: true,
      });
      setBlogs(data || []);
    } catch (err) {
      console.error("Error submitting blog:", err);
      alert("Error submitting blog");
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="admin-lockout">
        <h1>🚫 Hold up — this door’s locked!</h1>
        <p>
          This page is for official <strong>AthleteXpert</strong> blog writers only. If you've got
          spicy takes or a foam roller obsession — we want to hear from you!
        </p>
        <a href="mailto:contact@athletexpert.org">✉️ Contact Us</a>
      </div>
    );
  }

  return (
    <div className="new-blog-container">
      <h2>{editingId ? "Edit Blog Post" : "Create New Blog Post"}</h2>
      <form onSubmit={handleSubmit} className="blog-form">
        {["title", "author", "imageUrl", "sport"].map((name) => (
          <input
            key={name}
            name={name}
            value={(formData as any)[name]}
            onChange={handleChange}
            placeholder={
              name === "imageUrl"
                ? "Header Image URL"
                : name.charAt(0).toUpperCase() + name.slice(1)
            }
            required={name === "title" || name === "author"}
          />
        ))}

        <textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          placeholder="Summary"
        />

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
                {tag}{" "}
                <button type="button" onClick={() => removeTag(tag)}>
                  x
                </button>
              </span>
            ))}
          </div>
        </div>

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
                ➕ {template.name}
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

        <div className="live-preview">
          <h3 className="preview-heading">Live Preview:</h3>
          <div
            className="preview-box"
            dangerouslySetInnerHTML={{ __html: formData.content }}
          />
        </div>

        <button type="submit">{editingId ? "Update" : "Publish"}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData(emptyFormData);
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="existing-blogs">
        <h3>Existing Blog Posts</h3>
        {blogs.map((b) => (
          <div key={b.id} className="blog-admin-row">
            <strong>{b.title}</strong> — {b.author}
            <button onClick={() => handleEdit(b)}>✏️ Edit</button>
            <button onClick={() => handleDelete(b.id!)}>🗑️ Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewBlogPost;