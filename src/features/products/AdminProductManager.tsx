import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import "../../styles/NewProduct.css";

interface Product {
  id?: number;
  name: string;
  brand: string;
  price: number; // Store as number for easier math/sorting
  imgUrl: string;
  affiliateLink: string;
  sports: string[];
}

const emptyProduct: Product = {
  name: "",
  brand: "",
  price: 0,
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
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [sortOption, setSortOption] = useState("recent");

  // Protect route for admin only
  useEffect(() => {
    if (user?.role !== "admin") navigate("/");
    // eslint-disable-next-line
  }, [user, navigate]);

  // Load all products on mount
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`, {
        withCredentials: true,
      });
      setProducts(res.data);
    } catch {
      setError("Error loading products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Clear messages after 2s
  useEffect(() => {
    if (error || success) {
      const timeout = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [error, success]);

  // Handle filter/search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filter.trim()) return fetchProducts();

    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/search`, {
        params: { query: filter },
        withCredentials: true,
      });
      setProducts(res.data);
    } catch {
      setError("Error searching products.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value.replace(/[^\d.]/g, "")) : value,
    }));
  };

  // Handle sports tag entry
  const handleSportKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && sportInput.trim()) {
      e.preventDefault();
      const newSport = sportInput.trim();
      if (!formData.sports.includes(newSport)) {
        setFormData((prev) => ({ ...prev, sports: [...prev.sports, newSport] }));
      }
      setSportInput("");
    } else if (e.key === "Backspace" && !sportInput && formData.sports.length) {
      setFormData((prev) => ({
        ...prev,
        sports: prev.sports.slice(0, -1),
      }));
    }
  };

  const removeSport = (sportToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.filter((s) => s !== sportToRemove),
    }));
  };

  // Save/Create product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name.trim() || !formData.brand.trim()) {
        setError("Name and brand are required.");
        return;
      }
      if (formData.price < 0) {
        setError("Price must be positive.");
        return;
      }
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/products/admin/${editingId}`, formData, {
          withCredentials: true,
        });
        setSuccess("Product updated!");
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/products/admin`, formData, {
          withCredentials: true,
        });
        setSuccess("Product created!");
      }
      setFormData(emptyProduct);
      setEditingId(null);
      fetchProducts();
      inputRef.current?.focus();
    } catch {
      setError("Error saving product.");
    }
  };

  const handleEdit = (product: Product) => {
    if (!window.confirm(`Edit "${product.name}"?`)) return;
    setFormData({ ...product, price: Number(product.price) });
    setEditingId(product.id || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/products/admin/${id}`, {
        withCredentials: true,
      });
      setSuccess("Product deleted.");
      fetchProducts();
    } catch {
      setError("Error deleting product.");
    }
  };

  // Sort and filter
  const sortedFilteredProducts = products
    .filter((p) => {
      const term = filter.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.sports.join(",").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortOption === "priceAsc") return a.price - b.price;
      if (sortOption === "priceDesc") return b.price - a.price;
      return (b.id || 0) - (a.id || 0); // recent
    });

  return (
    <div className="new-product-container" style={{ maxWidth: "100%", padding: "2rem" }}>
      <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
      {error && <p className="error-message" aria-live="assertive">{error}</p>}
      {success && <p className="success-message" aria-live="polite">{success}</p>}

      <form onSubmit={handleSubmit} className="product-form" style={{ position: "sticky", top: 0, background: "#121212", zIndex: 10 }}>
        {["name", "brand", "price", "imgUrl", "affiliateLink"].map((field, i) => (
          <input
            key={field}
            ref={i === 0 ? inputRef : undefined}
            name={field}
            type={field === "price" ? "number" : "text"}
            value={formData[field as keyof Product] as any}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            min={field === "price" ? 0 : undefined}
            required={field !== "affiliateLink"}
            autoComplete="off"
            style={field === "price" ? { maxWidth: 100 } : {}}
          />
        ))}

        {formData.imgUrl && (
          <img
            src={formData.imgUrl}
            alt="Preview"
            style={{
              maxHeight: "140px",
              marginBottom: "0.5rem",
              borderRadius: "6px",
              background: "#fff",
              padding: "0.5rem",
              objectFit: "contain",
            }}
          />
        )}

        <input
          type="text"
          value={sportInput}
          onChange={(e) => setSportInput(e.target.value)}
          onKeyDown={handleSportKeyDown}
          placeholder="Add sports (Enter to confirm, Backspace to remove last)"
          aria-label="Add sport"
        />
        <div className="tag-preview">
          {formData.sports.map((sport) => (
            <span key={sport} className="tag-chip">
              {sport}
              <button type="button" onClick={() => removeSport(sport)} aria-label={`Remove ${sport}`}>✕</button>
            </span>
          ))}
        </div>

        <button type="submit" aria-label={editingId ? "Update Product" : "Create Product"}>
          {editingId ? "Update Product" : "Create Product"}
        </button>
      </form>

      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "1rem 0" }}>
        <input
          type="text"
          placeholder="Search by name, brand, or sport"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "6px", flex: 1 }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            fontWeight: "bold",
            background: "#ff9900",
            color: "#121212",
          }}
        >
          Search
        </button>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={{ padding: "0.5rem" }}>
          <option value="recent">Sort: Recent</option>
          <option value="priceAsc">Price: Low → High</option>
          <option value="priceDesc">Price: High → Low</option>
        </select>
      </form>

      <div className="admin-product-list">
        {loading ? (
          <p>Loading...</p>
        ) : sortedFilteredProducts.length === 0 ? (
          <p>No matching products.</p>
        ) : (
          sortedFilteredProducts.map((p) => (
            <div key={p.id} className="product-item" tabIndex={0} aria-label={`${p.name} product`}>
              <img src={p.imgUrl} alt={p.name} />
              <div>
                <strong>{p.name}</strong> – ${p.price.toFixed(2)} <br />
                <small>{p.brand}</small>
                <div style={{ marginTop: "0.25rem" }}>
                  {p.sports.map((sport) => (
                    <span
                      key={sport}
                      style={{
                        background: "#2a6045",
                        color: "white",
                        padding: "0.2rem 0.4rem",
                        fontSize: "0.75rem",
                        borderRadius: "6px",
                        marginRight: "0.25rem",
                      }}
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => handleEdit(p)} aria-label={`Edit ${p.name}`}>✏️ Edit</button>
              <button onClick={() => handleDelete(p.id!)} aria-label={`Delete ${p.name}`}>🗑 Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminProductManager;
