import { useEffect, useRef, useState } from "react";
import { publicApi } from "../api/client.js";

const VISITOR_KEY = "kirijo_visitor_id";
const POLL_MS = 4000;

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const pollRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    fetchTicket();
    pollRef.current = setInterval(fetchTicket, POLL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [ticket]);

  function fetchTicket() {
    publicApi
      .getTicket(getVisitorId())
      .then(setTicket)
      .catch(() => {}); // 404 just means no ticket yet — fine, stays null
  }

  async function send() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setText("");
    try {
      const updated = ticket
        ? await publicApi.sendTicketMessage(getVisitorId(), value)
        : await publicApi.createTicket(getVisitorId(), value);
      setTicket(updated);
    } catch {
      setText(value); // restore on failure so the visitor doesn't lose their message
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with us"}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Live chat">
          <div className="chat-panel-head">
            <span>Chat with KIRIJO PHARMACY</span>
          </div>
          <div className="chat-panel-body" ref={bodyRef}>
            {!ticket || ticket.messages.length === 0 ? (
              <p className="chat-empty">Send us a message — we usually reply fast.</p>
            ) : (
              ticket.messages.map((m, i) => (
                <div key={i} className={`chat-msg chat-msg-${m.sender}`}>
                  {m.text}
                </div>
              ))
            )}
            {ticket?.status === "resolved" && (
              <p className="chat-resolved">This conversation was marked resolved. Send a new message to start again.</p>
            )}
          </div>
          <div className="chat-panel-foot">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              disabled={sending}
            />
            <button onClick={send} disabled={sending || !text.trim()} aria-label="Send">
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
