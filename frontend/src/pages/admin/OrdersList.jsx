import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adminApi } from "../../api/client.js";
import { fmt } from "../../context/CartContext.jsx";

const STATUSES = [
  ["all", "All"],
  ["received", "Received"],
  ["packaged", "Packaged"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
];

export default function OrdersList() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const active = params.get("status") || "all";
  const page = Number(params.get("page")) || 1;

  const [data, setData] = useState({ orders: [], total: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const query = new URLSearchParams();
    if (active !== "all") query.set("status", active);
    query.set("page", page);
    adminApi
      .getOrders(`?${query}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [active, page]);

  const setStatus = (status) => {
    const next = status === "all" ? {} : { status };
    setParams(next);
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div>
      <h1 className="admin-page-title">Orders</h1>

      <div className="filters">
        {STATUSES.map(([val, label]) => (
          <button key={val} className={`chip ${active === val ? "active" : ""}`} onClick={() => setStatus(val)}>
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="spinner" />}
      {error && <div className="center-msg">{error}</div>}

      {!loading && !error && (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o._id} onClick={() => navigate(`/admin/orders/${o._id}`)} style={{ cursor: "pointer" }}>
                    <td>{o.orderNumber}</td>
                    <td>{o.customer.name}</td>
                    <td>
                      <span className={`status-badge status-${o.status}`}>{o.status}</span>
                    </td>
                    <td>{fmt(o.total)}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data.orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="center-msg">
                      No orders in this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-ghost"
                disabled={page <= 1}
                onClick={() => setParams({ ...(active !== "all" && { status: active }), page: page - 1 })}
              >
                ← Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-ghost"
                disabled={page >= totalPages}
                onClick={() => setParams({ ...(active !== "all" && { status: active }), page: page + 1 })}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
