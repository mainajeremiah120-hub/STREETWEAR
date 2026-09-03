import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/client.js";

const CATEGORIES = ["medicines", "vitamins", "skincare", "personal-care"];

const EMPTY = {
  name: "",
  slug: "",
  sku: "",
  category: "medicines",
  price: "",
  description: "",
  color: "#f1f5f9",
  image: "",
  sizes: ["Standard"],
  stock: "",
  featured: false,
};

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uploadToCloudinary(file) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) {
    throw new Error("Image upload isn't configured yet — set VITE_CLOUDINARY_CLOUD_NAME/VITE_CLOUDINARY_UPLOAD_PRESET.");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.secure_url;
}

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    adminApi
      .getProduct(id)
      .then((p) => {
        setForm({ ...EMPTY, ...p, price: p.price ?? "", stock: p.stock ?? "" });
        setSlugTouched(true);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function setName(e) {
    const name = e.target.value;
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  }

  function setSize(i, value) {
    setForm((f) => ({ ...f, sizes: f.sizes.map((s, idx) => (idx === i ? value : s)) }));
  }
  function addSize() {
    setForm((f) => ({ ...f, sizes: [...f.sizes, ""] }));
  }
  function removeSize(i) {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }));
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        sizes: form.sizes.map((s) => s.trim()).filter(Boolean),
      };
      if (isEdit) {
        await adminApi.updateProduct(id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h1 className="admin-page-title">{isEdit ? "Edit product" : "New product"}</h1>

      <form onSubmit={submit} className="admin-card" style={{ maxWidth: 640 }}>
        <div className="field">
          <label>Name</label>
          <input value={form.name} onChange={setName} required />
        </div>
        <div className="row-2">
          <div className="field">
            <label>Slug</label>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug")(e);
              }}
              required
            />
          </div>
          <div className="field">
            <label>SKU</label>
            <input value={form.sku} onChange={set("sku")} required />
          </div>
        </div>
        <div className="row-2">
          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Price (KES)</label>
            <input type="number" min="0" value={form.price} onChange={set("price")} required />
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <input value={form.description} onChange={set("description")} />
        </div>
        <div className="row-2">
          <div className="field">
            <label>Stock</label>
            <input type="number" min="0" value={form.stock} onChange={set("stock")} required />
          </div>
          <div className="field">
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                style={{ width: "auto" }}
              />
              Featured on homepage
            </label>
          </div>
        </div>

        <div className="field">
          <label>Pack sizes</label>
          {form.sizes.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={s} onChange={(e) => setSize(i, e.target.value)} placeholder="e.g. 20 Tablets" />
              <button type="button" className="cart-remove" onClick={() => removeSize(i)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost" onClick={addSize}>
            + Add pack size
          </button>
        </div>

        <div className="field">
          <label>Photo</label>
          {form.image && (
            <img src={form.image} alt="" style={{ width: 140, aspectRatio: "4/5", objectFit: "cover", marginBottom: 10, border: "2px solid var(--line)" }} />
          )}
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
          {uploading && <p className="label-mono" style={{ marginTop: 6 }}>Uploading…</p>}
        </div>

        {error && (
          <p style={{ color: "var(--danger)", fontFamily: "var(--font-mono)", fontSize: 14, marginBottom: 14 }}>{error}</p>
        )}

        <button className="btn" style={{ width: "100%", justifyContent: "center" }} disabled={submitting || uploading}>
          {submitting ? "Saving…" : isEdit ? "Save changes →" : "Create product →"}
        </button>
      </form>
    </div>
  );
}
