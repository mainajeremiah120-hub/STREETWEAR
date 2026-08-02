import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useCart, fmt } from "../context/CartContext.jsx";

export default function Checkout() {
  const { items, subtotal, shippingFee, total, clear } = useCart();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Kenya",
    paymentMethod: "mpesa",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const placeOrder = async () => {
    setError(null);
    if (!form.name || !form.email || !form.phone || !form.address || !form.city) {
      setError("Fill in all your details so we know where to ship.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        customer: { name: form.name, email: form.email, phone: form.phone },
        shipping: { address: form.address, city: form.city, country: form.country },
        paymentMethod: form.paymentMethod,
        items: items.map((i) => ({
          product: i.product,
          name: i.name,
          size: i.size,
          qty: i.qty,
        })),
      };
      const created = await api.createOrder(payload);
      setOrder(created);
      clear();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <div className="wrap">
        <div className="confirm">
          <h1>Order Locked In</h1>
          <p className="num">{order.orderNumber}</p>
          <p style={{ color: "var(--steel)", maxWidth: 440, margin: "0 auto 24px" }}>
            We sent a confirmation to {order.customer.email}. Pay{" "}
            {fmt(order.total)} via {order.paymentMethod.toUpperCase()} and your drop
            ships within 48 hours.
          </p>
          <Link to="/shop" className="btn">
            Keep shopping →
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="center-msg">
        Your bag is empty.
        <br />
        <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => navigate("/shop")}>
          ← Go to the shop
        </button>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="section-head" style={{ marginTop: 40 }}>
        <div>
          <div className="section-index">[ CHECKOUT ]</div>
          <h2 className="section-title">Cop It</h2>
        </div>
      </div>

      <div className="checkout">
        <div>
          <div className="field">
            <label>Full name</label>
            <input value={form.name} onChange={set("name")} placeholder="Jina lako kamili" />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Email</label>
              <input value={form.email} onChange={set("email")} placeholder="you@email.com" />
            </div>
            <div className="field">
              <label>Phone (M-Pesa)</label>
              <input value={form.phone} onChange={set("phone")} placeholder="07XX XXX XXX" />
            </div>
          </div>
          <div className="field">
            <label>Delivery address</label>
            <input value={form.address} onChange={set("address")} placeholder="Estate, street, house no." />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Town / City</label>
              <input value={form.city} onChange={set("city")} placeholder="Malindi" />
            </div>
            <div className="field">
              <label>Payment method</label>
              <select value={form.paymentMethod} onChange={set("paymentMethod")}>
                <option value="mpesa">M-Pesa</option>
                <option value="cod">Cash on delivery</option>
              </select>
            </div>
          </div>

          {error && (
            <p style={{ color: "var(--hazard)", fontFamily: "var(--font-mono)", fontSize: 14 }}>
              {error}
            </p>
          )}
        </div>

        <div className="summary">
          <h3>Order Summary</h3>
          {items.map((i) => (
            <div className="summary-line" key={i.key}>
              <span>
                {i.name} ({i.size}) ×{i.qty}
              </span>
              <span>{fmt(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="summary-line">
            <span>Subtotal</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <div className="summary-line">
            <span>Shipping</span>
            <span>{shippingFee === 0 ? "FREE" : fmt(shippingFee)}</span>
          </div>
          <div className="summary-line" style={{ fontWeight: 700, fontSize: 17, borderBottom: "none" }}>
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
          <button
            className="btn"
            style={{ width: "100%", justifyContent: "center", marginTop: 18 }}
            onClick={placeOrder}
            disabled={submitting}
          >
            {submitting ? "Placing order…" : "Place order →"}
          </button>
        </div>
      </div>
    </div>
  );
}
