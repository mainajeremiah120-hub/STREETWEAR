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
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const page = Number(params.get("page")) || 1;

  const [data, setData] = useState({ orders: [], total: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const query = new URLSearchParams();
    if (active !== "all") query.set("status", active);
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    query.set("page", page);
    adminApi
      .getOrders(`?${query}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [active, from, to, page]);

  // Preserve every existing filter while changing one — pass overrides for
  // just the field(s) being changed.
  function updateParams(overrides) {
    const next = { active, from, to, page: 1, ...overrides };
    const out = {};
    if (next.active && next.active !== "all") out.status = next.active;
    if (next.from) out.from = next.from;
    if (next.to) out.to = next.to;
    if (next.page && next.page !== 1) out.page = next.page;
    setParams(out);
  }

  const clearDates = () => updateParams({ from: "", to: "" });

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div>
      <h1 className="admin-page-title">Orders</h1>

      <div className="filters">
        {STATUSES.map(([val, label]) => (
          <button
            key={val}
            className={`chip ${active === val ? "active" : ""}`}
            onClick={() => updateParams({ active: val })}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="date-filters">
        <div className="field">
          <label>From</label>
          <input type="date" value={from} onChange={(e) => updateParams({ from: e.target.value })} />
        </div>
        <div className="field">
          <label>To</label>
          <input type="date" value={to} onChange={(e) => updateParams({ to: e.target.value })} />
        </div>
        {(from || to) && (
          <button className="btn btn-ghost" onClick={clearDates} style={{ height: 47, alignSelf: "flex-end" }}>
            Clear dates
          </button>
        )}
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
                  <th></th>
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
                    <td>
                      <button
                        className="btn btn-ghost table-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/orders/${o._id}`);
                        }}
                      >
                        Update status →
                      </button>
                    </td>
                  </tr>
                ))}
                {data.orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="center-msg">
                      No orders in this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-ghost" disabled={page <= 1} onClick={() => updateParams({ page: page - 1 })}>
                ← Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-ghost"
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: page + 1 })}
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
