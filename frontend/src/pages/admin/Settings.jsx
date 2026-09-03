import { useEffect, useState } from "react";
import { adminApi } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Settings() {
  const { admin, setAdmin } = useAuth();

  // Credentials form
  const [credForm, setCredForm] = useState({ currentPassword: "", newEmail: "", newPassword: "" });
  const [credSubmitting, setCredSubmitting] = useState(false);
  const [credError, setCredError] = useState(null);
  const [credSuccess, setCredSuccess] = useState(false);

  // WhatsApp form
  const [whatsapp, setWhatsapp] = useState("");
  const [waLoading, setWaLoading] = useState(true);
  const [waSubmitting, setWaSubmitting] = useState(false);
  const [waError, setWaError] = useState(null);
  const [waSuccess, setWaSuccess] = useState(false);

  // Danger zone — reset all orders
  const [resetPassword, setResetPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);

  useEffect(() => {
    adminApi
      .getSettings()
      .then((s) => setWhatsapp(s.whatsappNumber))
      .catch((err) => setWaError(err.message))
      .finally(() => setWaLoading(false));
  }, []);

  const setCred = (k) => (e) => {
    setCredSuccess(false);
    setCredForm({ ...credForm, [k]: e.target.value });
  };

  async function submitCredentials(e) {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(false);
    if (!credForm.currentPassword) {
      setCredError("Enter your current password to confirm this change.");
      return;
    }
    if (!credForm.newEmail && !credForm.newPassword) {
      setCredError("Enter a new email and/or a new password.");
      return;
    }
    setCredSubmitting(true);
    try {
      const payload = { currentPassword: credForm.currentPassword };
      if (credForm.newEmail) payload.newEmail = credForm.newEmail;
      if (credForm.newPassword) payload.newPassword = credForm.newPassword;
      const updated = await adminApi.updateCredentials(payload);
      setAdmin(updated);
      setCredForm({ currentPassword: "", newEmail: "", newPassword: "" });
      setCredSuccess(true);
    } catch (err) {
      setCredError(err.message);
    } finally {
      setCredSubmitting(false);
    }
  }

  async function submitWhatsapp(e) {
    e.preventDefault();
    setWaError(null);
    setWaSuccess(false);
    setWaSubmitting(true);
    try {
      await adminApi.updateSettings({ whatsappNumber: whatsapp });
      setWaSuccess(true);
    } catch (err) {
      setWaError(err.message);
    } finally {
      setWaSubmitting(false);
    }
  }

  async function submitReset(e) {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    if (!resetPassword) {
      setResetError("Enter your password to confirm.");
      return;
    }
    if (
      !confirm(
        "This permanently deletes EVERY order and all its revenue history. This cannot be undone. Are you absolutely sure?"
      )
    ) {
      return;
    }
    setResetSubmitting(true);
    try {
      const { deletedCount } = await adminApi.resetAllOrders(resetPassword);
      setResetSuccess(`Deleted ${deletedCount} order${deletedCount === 1 ? "" : "s"}.`);
      setResetPassword("");
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="admin-page-title">Settings</h1>

      <form onSubmit={submitCredentials} className="admin-card" style={{ maxWidth: 480 }}>
        <h3>Admin login</h3>
        <p className="label-mono" style={{ marginBottom: 14 }}>Currently: {admin?.email}</p>
        <div className="field">
          <label>Current password</label>
          <input type="password" value={credForm.currentPassword} onChange={setCred("currentPassword")} required />
        </div>
        <div className="field">
          <label>New email (optional)</label>
          <input type="email" value={credForm.newEmail} onChange={setCred("newEmail")} placeholder={admin?.email} />
        </div>
        <div className="field">
          <label>New password (optional)</label>
          <input type="password" value={credForm.newPassword} onChange={setCred("newPassword")} placeholder="Leave blank to keep current" />
        </div>
        {credError && (
          <p style={{ color: "var(--danger)", fontFamily: "var(--font-mono)", fontSize: 13, marginBottom: 10 }}>{credError}</p>
        )}
        {credSuccess && (
          <p style={{ color: "var(--secondary)", fontFamily: "var(--font-mono)", fontSize: 13, marginBottom: 10 }}>Saved.</p>
        )}
        <button className="btn" style={{ width: "100%", justifyContent: "center" }} disabled={credSubmitting}>
          {credSubmitting ? "Saving…" : "Update login →"}
        </button>
      </form>

      <form onSubmit={submitWhatsapp} className="admin-card" style={{ maxWidth: 480 }}>
        <h3>WhatsApp number</h3>
        <p className="label-mono" style={{ marginBottom: 14 }}>Used by the site's WhatsApp button and "Chat with a pharmacist" link.</p>
        {waLoading ? (
          <div className="spinner" />
        ) : (
          <>
            <div className="field">
              <label>Number (international format, no +)</label>
              <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="254700000000" />
            </div>
            {waError && (
              <p style={{ color: "var(--danger)", fontFamily: "var(--font-mono)", fontSize: 13, marginBottom: 10 }}>{waError}</p>
            )}
            {waSuccess && (
              <p style={{ color: "var(--secondary)", fontFamily: "var(--font-mono)", fontSize: 13, marginBottom: 10 }}>Saved.</p>
            )}
            <button className="btn" style={{ width: "100%", justifyContent: "center" }} disabled={waSubmitting}>
              {waSubmitting ? "Saving…" : "Update number →"}
            </button>
          </>
        )}
      </form>

      <form onSubmit={submitReset} className="admin-card danger-zone" style={{ maxWidth: 480 }}>
        <h3>Danger zone</h3>
        <p className="label-mono" style={{ marginBottom: 14 }}>
          Permanently deletes every order and all revenue figures (which are calculated live from
          orders, so there's nothing separate to reset). This cannot be undone.
        </p>
        <div className="field">
          <label>Your password</label>
          <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
        </div>
        {resetError && (
          <p style={{ color: "var(--danger)", fontFamily: "var(--font-mono)", fontSize: 13, marginBottom: 10 }}>{resetError}</p>
        )}
        {resetSuccess && (
          <p style={{ color: "var(--secondary)", fontFamily: "var(--font-mono)", fontSize: 13, marginBottom: 10 }}>{resetSuccess}</p>
        )}
        <button
          className="btn"
          style={{ width: "100%", justifyContent: "center", background: "var(--danger)" }}
          disabled={resetSubmitting}
        >
          {resetSubmitting ? "Deleting…" : "Reset all order data →"}
        </button>
      </form>
    </div>
  );
}
