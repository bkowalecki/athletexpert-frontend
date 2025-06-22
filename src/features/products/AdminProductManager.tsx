import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import "../../styles/NewProduct.css";

interface Product {
  id?: number;
  name: string;
  brand: string;
  price: string;
  imgUrl: string;
  affiliateLink: string;
  sports: string[];
}

const emptyProduct: Product = {
  name: "",
  brand: "",
  price: "",
  imgUrl: "",
  affiliateLink: "",
  sports: [],
};

const AdminProductManager: React.FC = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Product>(emptyProduct);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sportInput, setSportInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`, {
        withCredentials: true,
      });
      setProducts(res.data);
    } catch {
      setError("Error loading products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSportKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && sportInput.trim()) {
      e.preventDefault();
      const newSport = sportInput.trim();
      if (!formData.sports.includes(newSport)) {
        setFormData((prev) => ({ ...prev, sports: [...prev.sports, newSport] }));
      }
      setSportInput("");
    }
  };

  const removeSport = (sportToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.filter((s) => s !== sportToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/products/admin/${editingId}`, formData, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/products/admin`, formData, {
          withCredentials: true,
        });
      }
      setFormData(emptyProduct);
      setEditingId(null);
      fetchProducts();
      inputRef.current?.focus();
    } catch {
      setError("Error saving product. Please try again.");
    }
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setError(null);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/products/admin/${id}`, {
        withCredentials: true,
      });
      fetchProducts();
    } catch {
      setError("Error deleting product. Please try again.");
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="admin-lockout">
        <h1>🚫 This page is for admins only.</h1>
      </div>
    );
  }

  return (
    <div className="new-product-container">
      <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
      {error && <p className="error-message" role="alert">{error}</p>}

      <form onSubmit={handleSubmit} className="product-form">
        {["name", "brand", "price", "imgUrl", "affiliateLink"].map((field, i) => (
          <input
            key={field}
            ref={i === 0 ? inputRef : undefined}
            name={field}
            value={(formData as any)[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            required={field !== "affiliateLink"}
          />
        ))}

        {/* Live Image Preview */}
        {formData.imgUrl && (
          <img
            src={formData.imgUrl}
            alt="Preview"
            style={{
              maxHeight: "160px",
              objectFit: "contain",
              margin: "0.5rem 0",
              borderRadius: "8px",
              background: "#fff",
              padding: "0.5rem"
            }}
          />
        )}

        <div>
          <label className="bold-label">Sports</label>
          <input
            type="text"
            value={sportInput}
            onChange={(e) => setSportInput(e.target.value)}
            onKeyDown={handleSportKeyDown}
            placeholder="Type a sport and press Enter"
          />
          <div className="tag-preview">
            {formData.sports.map((sport) => (
              <span key={sport} className="tag-chip">
                {sport}
                <button type="button" onClick={() => removeSport(sport)} aria-label={`Remove ${sport}`}>
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit">{editingId ? "Update Product" : "Create Product"}</button>
      </form>

      <h3>All Products</h3>
      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="admin-product-list">
          {products.map((p) => (
            <div key={p.id} className="product-item">
              <img src={p.imgUrl} alt={p.name} />
              <div>
                <strong>{p.name}</strong> – ${p.price} <br />
                <small>{p.brand}</small>
              </div>
              <button onClick={() => handleEdit(p)} aria-label={`Edit ${p.name}`}>✏️ Edit</button>
              <button onClick={() => handleDelete(p.id!)} aria-label={`Delete ${p.name}`}>🗑 Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
