// src/pages/admin/NewBlogPost.tsx
import React, { useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useUserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

import "../../styles/NewBlogPost.css";

const NewBlogPost: React.FC = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    author: user?.username || "",
    imageUrl: "",
    summary: "",
    content: "",
    sport: "",
  });

  console.log("user from context:", user);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/blog/admin/blog`,
        formData,
        {
          withCredentials: true,
        }
      );
      navigate("/blog");
    } catch (err) {
      alert("Error creating blog post");
      console.error(err);
    }
  };

  if (user?.role !== "admin") {
    return (
<div style={{
  minHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "2rem",
  color: "#fff",
  background: "#1a1a1a",
  fontFamily: "Poppins, sans-serif"
}}>
  <h1 style={{ fontSize: "2.4rem", marginBottom: "1rem" }}>🚫 Hold up — this door’s locked!</h1>
  <p style={{ fontSize: "1.2rem", maxWidth: "650px", lineHeight: "1.6" }}>
    This page is for official <strong>AthleteXpert</strong> blog writers only.
    But hey — if you've got sharp insights, spicy takes, or just a weird obsession with foam rollers...
    <strong> we want to hear from you!</strong>
  </p>
  <p style={{ fontSize: "1rem", marginTop: "1.5rem", fontStyle: "italic", opacity: 0.8 }}>
    Shoot us an email with your pitch — whether it’s deep dives or dad jokes, we’re all ears.
  </p>
  <a
    href="mailto:contact@athletexpert.org"
    style={{
      marginTop: "1.5rem",
      fontSize: "1.1rem",
      padding: "0.75rem 1.5rem",
      backgroundColor: "#FFA756",
      color: "#1a1a1a",
      borderRadius: "8px",
      textDecoration: "none",
      fontWeight: "bold",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
    }}
  >
    ✉️ Contact Us
  </a>
</div>

    );
  }

  return (
    <div className="new-blog-container">
      <h2>Create New Blog Post</h2>
      <form onSubmit={handleSubmit} className="blog-form">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
        <input
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="Header Image URL"
        />
        <input
          name="sport"
          value={formData.sport}
          onChange={handleChange}
          placeholder="Sport (optional)"
        />
        <textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          placeholder="Summary"
        />
        <ReactQuill
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image"],
              ["clean"],
            ],
          }}
          value={formData.content}
          onChange={(value) => setFormData({ ...formData, content: value })}
        />
        <button type="submit">Publish</button>
      </form>
    </div>
  );
};

export default NewBlogPost;
