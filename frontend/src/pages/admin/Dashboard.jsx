import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/client.js";
import { fmt } from "../../context/CartContext.jsx";

const STATUS_LABELS = { received: "Received", packaged: "Packaged", delivered: "Delivered", cancelled: "Cancelled" };

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.getStats().then(setStats).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="center-msg">Couldn't load stats: {error}</div>;
  if (!stats) return <div className="spinner" />;

  return (
    <div>
      <h1 className="admin-page-title">Dashboard</h1>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="stat-label">Total revenue</div>
          <div className="stat-value">{fmt(stats.totalRevenue)}</div>
          <div className="stat-note">{stats.totalOrders} orders (excl. cancelled)</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Today</div>
          <div className="stat-value">{fmt(stats.revenueToday)}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Last 7 days</div>
          <div className="stat-value">{fmt(stats.revenueWeek)}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">This month</div>
          <div className="stat-value">{fmt(stats.revenueMonth)}</div>
        </div>
      </div>

      <div className="stat-grid" style={{ marginTop: 14 }}>
        {Object.entries(stats.statusCounts).map(([status, count]) => (
          <div className="stat-tile" key={status}>
            <div className="stat-label">{STATUS_LABELS[status] || status}</div>
            <div className="stat-value">{count}</div>
          </div>
        ))}
      </div>

      <div className="admin-section-head">
        <h2>Recent orders</h2>
        <Link to="/admin/orders" className="btn btn-ghost">
          View all →
        </Link>
      </div>

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
            {stats.recentOrders.map((o) => (
              <tr key={o._id} onClick={() => navigate(`/admin/orders/${o._id}`)} style={{ cursor: "pointer" }}>
                <td>{o.orderNumber}</td>
                <td>{o.customer.name}</td>
                <td>
                  <span className={`status-badge status-${o.status}`}>{STATUS_LABELS[o.status]}</span>
                </td>
                <td>{fmt(o.total)}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
