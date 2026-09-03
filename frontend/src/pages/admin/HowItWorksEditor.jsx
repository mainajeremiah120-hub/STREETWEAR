import { useEffect, useState } from "react";
import { adminApi } from "../../api/client.js";

export default function HowItWorksEditor() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    adminApi
      .getSettings()
      .then((s) => setSteps(s.howItWorks || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function update(i, key, value) {
    setSuccess(false);
    setSteps((s) => s.map((step, idx) => (idx === i ? { ...step, [key]: value } : step)));
  }

  function addStep() {
    setSteps((s) => [...s, { title: "", description: "" }]);
  }

  function removeStep(i) {
    setSteps((s) => s.filter((_, idx) => idx !== i));
  }

  function move(i, dir) {
    setSteps((s) => {
      const next = [...s];
      const target = i + dir;
      if (target < 0 || target >= next.length) return s;
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  }

  async function save() {
    setError(null);
    setSuccess(false);
    if (steps.some((s) => !s.title.trim() || !s.description.trim())) {
      setError("Every step needs both a title and a description.");
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.updateSettings({ howItWorks: steps });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h1 className="admin-page-title">How It Works</h1>
      <p className="label-mono" style={{ marginBottom: 20 }}>
        These steps show on the homepage's "How It Works" section.
      </p>

      {steps.map((s, i) => (
        <div className="admin-card" key={i} style={{ maxWidth: 560 }}>
          <div className="admin-section-head" style={{ marginTop: 0 }}>
            <h3 style={{ margin: 0 }}>Step {i + 1}</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => move(i, 1)} disabled={i === steps.length - 1}>
                ↓
              </button>
              <button type="button" className="cart-remove" onClick={() => removeStep(i)}>
                Remove
              </button>
            </div>
          </div>
          <div className="field">
            <label>Title</label>
            <input value={s.title} onChange={(e) => update(i, "title", e.target.value)} />
          </div>
          <div className="field">
            <label>Description</label>
            <input value={s.description} onChange={(e) => update(i, "description", e.target.value)} />
          </div>
        </div>
      ))}

      <button type="button" className="btn btn-ghost" onClick={addStep} style={{ marginBottom: 20 }}>
        + Add step
      </button>

      {error && (
        <p style={{ color: "var(--danger)", fontFamily: "var(--font-mono)", fontSize: 14, marginBottom: 14 }}>{error}</p>
      )}
      {success && (
        <p style={{ color: "var(--secondary)", fontFamily: "var(--font-mono)", fontSize: 14, marginBottom: 14 }}>
          Saved — live on the homepage now.
        </p>
      )}

      <button className="btn" onClick={save} disabled={submitting}>
        {submitting ? "Saving…" : "Save changes →"}
      </button>
    </div>
  );
}
