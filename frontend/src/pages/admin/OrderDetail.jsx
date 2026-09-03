import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/client.js";
import { fmt } from "../../context/CartContext.jsx";

const STATUS_OPTIONS = ["received", "packaged", "delivered", "cancelled"];
const TERMINAL = ["delivered", "cancelled"];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [nextStatus, setNextStatus] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusError, setStatusError] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  function load() {
    adminApi
      .getOrder(id)
      .then((o) => {
        setOrder(o);
        setNextStatus(o.status);
      })
      .catch((err) => setError(err.message));
  }

  async function updateStatus() {
    setStatusError(null);
    if (nextStatus === "cancelled" && !reason.trim()) {
      setStatusError("A reason is required to cancel an order.");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await adminApi.updateOrderStatus(id, { status: nextStatus, reason });
      setOrder(updated);
      setReason("");
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <div className="center-msg">{error}</div>;
  if (!order) return <div className="spinner" />;

  const isTerminal = TERMINAL.includes(order.status);

  return (
    <div>
      <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={() => navigate("/admin/orders")}>
        ← Back to orders
      </button>

      <h1 className="admin-page-title">{order.orderNumber}</h1>
      <span className={`status-badge status-${order.status}`}>{order.status}</span>

      <div className="admin-detail-grid">
        <div>
          <div className="admin-card">
            <h3>Items</h3>
            {order.items.map((i, idx) => (
              <div className="summary-line" key={idx}>
                <span>
                  {i.name} ({i.size}) ×{i.qty}
                </span>
                <span>{fmt(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{fmt(order.subtotal)}</span>
            </div>
            <div className="summary-line">
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? "FREE" : fmt(order.shippingFee)}</span>
            </div>
            <div className="summary-line" style={{ fontWeight: 700, fontSize: 17, borderBottom: "none" }}>
              <span>Total</span>
              <span>{fmt(order.total)}</span>
            </div>
          </div>

          <div className="admin-card">
            <h3>Customer</h3>
            <p>{order.customer.name}</p>
            <p>{order.customer.email}</p>
            <p>{order.customer.phone}</p>
            <p style={{ marginTop: 10 }}>
              {order.shipping.address}, {order.shipping.city}, {order.shipping.country}
            </p>
            <p className="label-mono" style={{ marginTop: 10 }}>
              Payment: {order.paymentMethod.toUpperCase()}
            </p>
          </div>

          <div className="admin-card">
            <h3>Status history</h3>
            <ul className="status-timeline">
              {order.statusHistory.map((h, idx) => (
                <li key={idx}>
                  <span className={`status-badge status-${h.status}`}>{h.status}</span>
                  <span className="status-timeline-date">{new Date(h.changedAt).toLocaleString()}</span>
                  {h.reason && <span className="status-timeline-reason">— {h.reason}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="admin-card">
          <h3>Update status</h3>
          {isTerminal ? (
            <p className="label-mono">This order is {order.status} and can't be changed further.</p>
          ) : (
            <>
              <div className="field">
                <label>New status</label>
                <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              {nextStatus === "cancelled" && (
                <div className="field">
                  <label>Reason (required)</label>
                  <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Out of stock, customer requested" />
                </div>
              )}
              {statusError && (
                <p style={{ color: "var(--danger)", fontFamily: "var(--font-mono)", fontSize: 13, marginBottom: 10 }}>
                  {statusError}
                </p>
              )}
              <button
                className="btn"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={updateStatus}
                disabled={submitting || nextStatus === order.status}
              >
                {submitting ? "Saving…" : "Save status →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
