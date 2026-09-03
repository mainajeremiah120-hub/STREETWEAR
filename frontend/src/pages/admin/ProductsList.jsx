import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/client.js";
import { fmt } from "../../context/CartContext.jsx";

export default function ProductsList() {
  const navigate = useNavigate();
  const [data, setData] = useState({ products: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    adminApi
      .getProducts()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleDelete(e, id, name) {
    e.stopPropagation();
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    setDeletingId(id);
    try {
      await adminApi.deleteProduct(id);
      setData((d) => ({ ...d, products: d.products.filter((p) => p._id !== id) }));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="admin-section-head" style={{ marginTop: 0 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          Products
        </h1>
        <Link to="/admin/products/new" className="btn">
          New product →
        </Link>
      </div>

      {loading && <div className="spinner" />}
      {error && <div className="center-msg">{error}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => (
                <tr key={p._id} onClick={() => navigate(`/admin/products/${p._id}/edit`)} style={{ cursor: "pointer" }}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{fmt(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>
                    {p.soldOut || p.stock <= 0 ? (
                      <span className="status-badge status-cancelled">Sold out</span>
                    ) : (
                      <span className="status-badge status-delivered">In stock</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="cart-remove"
                      onClick={(e) => handleDelete(e, p._id, p.name)}
                      disabled={deletingId === p._id}
                    >
                      {deletingId === p._id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {data.products.length === 0 && (
                <tr>
                  <td colSpan={6} className="center-msg">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
