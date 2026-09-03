import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_LINKS = [
  ["/admin", "Dashboard", true],
  ["/admin/orders", "Orders"],
  ["/admin/products", "Products"],
  ["/admin/tickets", "Support"],
  ["/admin/how-it-works", "How It Works"],
  ["/admin/settings", "Settings"],
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          KIRIJO <span>ADMIN</span>
        </div>
        <nav className="admin-nav">
          {NAV_LINKS.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={!!end}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar-email">{admin?.email}</span>
          <button className="btn btn-ghost admin-logout" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
