import { useEffect, useRef, useState } from "react";
import { publicApi } from "../api/client.js";

const VISITOR_KEY = "kirijo_visitor_id";
const POLL_MS = 4000;
const GREETING = "Hi! What can we help you with today?";

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
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
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Live chat">
          <div className="chat-panel-head">
            <span>Chat with KIRIJO PHARMACY</span>
          </div>
          <div className="chat-panel-body" ref={bodyRef}>
            <div className="chat-msg chat-msg-bot">{GREETING}</div>
            {ticket?.messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg-${m.sender}`}>
                {m.text}
              </div>
            ))}
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
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
