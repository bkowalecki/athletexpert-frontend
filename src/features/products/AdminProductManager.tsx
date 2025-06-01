// ✅ Enhanced product admin UI with multi-sport input like blog tags

import React, { useEffect, useState } from "react";
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

  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Product>(emptyProduct);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sportInput, setSportInput] = useState("");

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`, {
        withCredentials: true,
      });
      setProducts(res.data);
    } catch (err) {
      alert("Error loading products.");
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
    try {
      if (editingId) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/products/admin/${editingId}`,
          formData,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/products/admin`,
          formData,
          { withCredentials: true }
        );
      }
      setFormData(emptyProduct);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      alert("Error saving product.");
    }
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id || null);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/products/admin/${id}`, {
        withCredentials: true,
      });
      fetchProducts();
    } catch (err) {
      alert("Error deleting product.");
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
      <form onSubmit={handleSubmit} className="product-form">
        {["name", "brand", "price", "imgUrl", "affiliateLink"].map((field) => (
          <input
            key={field}
            name={field}
            value={(formData as any)[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            required={field !== "affiliateLink"}
          />
        ))}

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
                {sport} <button onClick={() => removeSport(sport)}>x</button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit">{editingId ? "Update" : "Create"}</button>
      </form>

      <h3>All Products</h3>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="product-list">
          {products.map((p) => (
            <div key={p.id} className="product-item">
              <img src={p.imgUrl} alt={p.name} />
              <div>
                <strong>{p.name}</strong> – ${p.price} <br />
                <small>{p.brand}</small>
              </div>
              <button onClick={() => handleEdit(p)}>✏️ Edit</button>
              <button onClick={() => handleDelete(p.id!)}>🗑 Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
