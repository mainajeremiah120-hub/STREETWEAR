import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adminApi } from "../../api/client.js";

export default function TicketsInbox() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const active = params.get("status") || "open";
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    adminApi
      .getTickets(`?status=${active}`)
      .then(setTickets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [active]);

  return (
    <div>
      <h1 className="admin-page-title">Support</h1>

      <div className="filters">
        <button className={`chip ${active === "open" ? "active" : ""}`} onClick={() => setParams({ status: "open" })}>
          Open
        </button>
        <button className={`chip ${active === "resolved" ? "active" : ""}`} onClick={() => setParams({ status: "resolved" })}>
          Resolved
        </button>
      </div>

      {loading && <div className="spinner" />}
      {error && <div className="center-msg">{error}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Last message</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id} onClick={() => navigate(`/admin/tickets/${t._id}`)} style={{ cursor: "pointer" }}>
                  <td>{t.visitorName || "Anonymous visitor"}</td>
                  <td>{t.messages[t.messages.length - 1]?.text?.slice(0, 60)}</td>
                  <td>{new Date(t.lastMessageAt).toLocaleString()}</td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={3} className="center-msg">
                    No {active} tickets.
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
