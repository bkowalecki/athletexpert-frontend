import React, { useState } from "react";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { blogTemplates, BlogTemplate } from "../../data/blogTemplates";
import "../../styles/NewBlogPost.css";

const NewBlogPost: React.FC = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    imageUrl: "",
    summary: "",
    content: "",
    sport: "",
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState("");

  const insertTemplate = (templateHtml: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + "\n" + templateHtml,
    }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/blog/admin/blog`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      navigate("/blog");
    } catch (err) {
      console.error("Error creating blog post:", err);
      alert("Error creating blog post");
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="admin-lockout">
        <h1>🚫 Hold up — this door’s locked!</h1>
        <p>
          This page is for official <strong>AthleteXpert</strong> blog writers
          only. If you've got spicy takes or a foam roller obsession — we want
          to hear from you!
        </p>
        <a href="mailto:contact@athletexpert.org">✉️ Contact Us</a>
      </div>
    );
  }

  return (
    <div className="new-blog-container">
      <h2>Create New Blog Post</h2>
      <form onSubmit={handleSubmit} className="blog-form">
        {[
          { name: "title", placeholder: "Title" },
          { name: "author", placeholder: "Author" },
          { name: "imageUrl", placeholder: "Header Image URL" },
          { name: "sport", placeholder: "Sport (optional)" },
        ].map(({ name, placeholder }) => (
          <input
            key={name}
            name={name}
            value={(formData as any)[name]}
            onChange={handleChange}
            placeholder={placeholder}
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
                {tag} <button onClick={() => removeTag(tag)}>x</button>
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
                onClick={() => insertTemplate(template.html)}
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

        <button type="submit">Publish</button>
      </form>
    </div>
  );
};

export default NewBlogPost;