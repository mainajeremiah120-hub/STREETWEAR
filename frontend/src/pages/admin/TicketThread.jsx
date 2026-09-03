import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/client.js";

const POLL_MS = 4000;

export default function TicketThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const bodyRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, POLL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [ticket]);

  function load() {
    adminApi.getTicket(id).then(setTicket).catch((err) => setError(err.message));
  }

  async function send() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setText("");
    try {
      const updated = await adminApi.replyTicket(id, value);
      setTicket(updated);
    } catch (err) {
      setError(err.message);
      setText(value);
    } finally {
      setSending(false);
    }
  }

  async function resolve() {
    try {
      const updated = await adminApi.resolveTicket(id);
      setTicket(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <div className="center-msg">{error}</div>;
  if (!ticket) return <div className="spinner" />;

  return (
    <div>
      <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={() => navigate("/admin/tickets")}>
        ← Back to inbox
      </button>

      <div className="admin-section-head" style={{ marginTop: 0 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          {ticket.visitorName || "Anonymous visitor"}
        </h1>
        {ticket.status === "open" ? (
          <button className="btn btn-ghost" onClick={resolve}>
            Mark resolved
          </button>
        ) : (
          <span className="status-badge status-delivered">Resolved</span>
        )}
      </div>

      <div className="admin-card ticket-thread">
        <div className="chat-panel-body" ref={bodyRef} style={{ maxHeight: 420 }}>
          {ticket.messages.map((m, i) => (
            <div key={i} className={`chat-msg chat-msg-${m.sender}`}>
              {m.text}
            </div>
          ))}
        </div>
        {ticket.status === "open" && (
          <div className="chat-panel-foot">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Reply…"
              disabled={sending}
            />
            <button onClick={send} disabled={sending || !text.trim()}>
              Send →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
