import { useEffect, useRef, useState } from "react";
import { publicApi } from "../api/client.js";

const VISITOR_KEY = "kirijo_visitor_id";
const POLL_MS = 4000;
const GREETING = "Hi! What can we help you with today?";

// sessionStorage (not localStorage) so a conversation only lasts for this
// browser tab/session — it resets automatically once the tab or browser is
// closed, rather than persisting forever on a shared/public device.
function getVisitorId() {
  let id = sessionStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function newVisitorId() {
  const id = crypto.randomUUID();
  sessionStorage.setItem(VISITOR_KEY, id);
  return id;
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

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

  // Lets anyone clear the current conversation and start fresh at any
  // time — important on a shared device where the next person shouldn't
  // see (or accidentally continue) someone else's chat.
  function startNewChat() {
    if (ticket && !confirm("Start a new chat? Your current conversation will stay saved with our team, but this widget won't show it anymore.")) {
      return;
    }
    newVisitorId();
    setTicket(null);
    setText("");
  }

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with us"}
      >
        {open ? <CloseIcon /> : <PersonIcon />}
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Live chat">
          <div className="chat-panel-head">
            <span className="chat-avatar">
              <PersonIcon />
            </span>
            <span className="chat-panel-title">Chat with KIRIJO PHARMACY</span>
            <button className="chat-new-btn" onClick={startNewChat} aria-label="Start a new chat" title="Start a new chat">
              <PlusIcon />
            </button>
          </div>
          <div className="chat-panel-body" ref={bodyRef}>
            <div className="chat-row">
              <span className="chat-avatar chat-avatar-sm">
                <PersonIcon />
              </span>
              <div className="chat-msg chat-msg-bot">{GREETING}</div>
            </div>
            {ticket?.messages.map((m, i) =>
              m.sender === "visitor" ? (
                <div key={i} className="chat-msg chat-msg-visitor">
                  {m.text}
                </div>
              ) : (
                <div key={i} className="chat-row">
                  <span className="chat-avatar chat-avatar-sm">
                    <PersonIcon />
                  </span>
                  <div className={`chat-msg chat-msg-${m.sender}`}>{m.text}</div>
                </div>
              )
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
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
