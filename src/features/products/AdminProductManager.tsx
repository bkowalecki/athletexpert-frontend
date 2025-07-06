import React, { useEffect, useRef, useState, useCallback } from "react";
import { useUserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  fetchProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/product";
import "../../styles/NewProduct.css";
import type { Product } from "../../types/products";

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  brand: "",
  price: 0,
  imgUrl: "",
  affiliateLink: "",
  sports: [],
  asin: "",
  retailer: "",
};

const AdminProductManager: React.FC = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Omit<Product, "id">>(emptyProduct);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sportInput, setSportInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [sortOption, setSortOption] = useState("recent");

  useEffect(() => {
    if (user?.role !== "admin") navigate("/");
  }, [user, navigate]);

  // Fetch all products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch {
      setError("Error loading products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (error || success) {
      const timeout = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [error, success]);

  // Search products
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filter.trim()) return loadProducts();

    setLoading(true);
    try {
      const data = await searchProducts(filter.trim());
      setProducts(data);
    } catch {
      setError("Error searching products.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value.replace(/[^\d.]/g, "")) : value,
    }));
  };

  // Handle sports input
  const handleSportKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && sportInput.trim()) {
      e.preventDefault();
      const newSport = sportInput.trim();
      if (!(formData.sports ?? []).includes(newSport)) {
        setFormData((prev) => ({
          ...prev,
          sports: [...(prev.sports ?? []), newSport],
        }));
      }
      setSportInput("");
    } else if (
      e.key === "Backspace" &&
      !sportInput &&
      (formData.sports ?? []).length
    ) {
      setFormData((prev) => ({
        ...prev,
        sports: (prev.sports ?? []).slice(0, -1),
      }));
    }
  };

  const removeSport = (sportToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sports: (prev.sports ?? []).filter((s) => s !== sportToRemove),
    }));
  };

  // Submit form for create/update
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
        await updateProduct(editingId, formData);
        setSuccess("Product updated!");
      } else {
        await createProduct(formData);
        setSuccess("Product created!");
      }
      setFormData(emptyProduct);
      setEditingId(null);
      loadProducts();
      inputRef.current?.focus();
    } catch {
      setError("Error saving product.");
    }
  };

  // Edit mode
  const handleEdit = (product: Product) => {
    if (!window.confirm(`Edit "${product.name}"?`)) return;
    // Strip id for form, just in case
    const { id, ...rest } = product;
    setFormData({
      ...rest,
      price: Number(product.price),
      sports: rest.sports ?? [],
    });
    setEditingId(product.id ?? null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setSuccess("Product deleted.");
      loadProducts();
    } catch {
      setError("Error deleting product.");
    }
  };

  const sortedFilteredProducts = products
    .filter((p) => {
      const term = filter.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        (p.sports ?? []).join(",").toLowerCase().includes(term) ||
        (p.asin && p.asin.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      if (sortOption === "priceAsc") return a.price - b.price;
      if (sortOption === "priceDesc") return b.price - a.price;
      return (b.id || 0) - (a.id || 0);
    });

  return (
    <div className="new-product-container" style={{ maxWidth: "100%", padding: "2rem" }}>
      <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="product-form">
        {["name", "brand", "price", "imgUrl", "affiliateLink", "asin", "retailer"].map(
          (field, i) => (
            <input
              key={field}
              ref={i === 0 ? inputRef : undefined}
              name={field}
              type={field === "price" ? "number" : "text"}
              value={formData[field as keyof typeof formData] as any}
              onChange={handleChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              min={field === "price" ? 0 : undefined}
              step={field === "price" ? "0.01" : undefined}
              required={field !== "affiliateLink" && field !== "asin"}
              autoComplete="off"
              style={field === "price" ? { maxWidth: 100 } : {}}
            />
          )
        )}

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
        />
        <div className="tag-preview">
          {(formData.sports ?? []).map((sport) => (
            <span key={sport} className="tag-chip">
              {sport}
              <button type="button" onClick={() => removeSport(sport)}>
                ✕
              </button>
            </span>
          ))}
        </div>

        <button type="submit">{editingId ? "Update Product" : "Create Product"}</button>
      </form>

      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
        <input
          type="text"
          placeholder="Search by name, brand, sport, or ASIN"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button type="submit">Search</button>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
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
            <div key={p.id} className="product-item">
              <img src={p.imgUrl} alt={p.name} />
              <div>
                <strong>{p.name}</strong> – ${p.price.toFixed(2)} <br />
                <small>{p.brand}</small>
                {p.asin && <p>ASIN: {p.asin}</p>}
                <div>
                  {(p.sports ?? []).map((sport) => (
                    <span key={sport} className="tag-chip">
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => handleEdit(p)}>✏️ Edit</button>
              <button onClick={() => handleDelete(p.id!)}>🗑 Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminProductManager;
