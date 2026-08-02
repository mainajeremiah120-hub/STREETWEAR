import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext.jsx";

export function Navbar() {
  const { count, setOpen } = useCart();
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link to="/" className="nav-logo">
          STREET<b>WEAR</b>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/shop?category=hoodies">Hoodies</NavLink>
          <NavLink to="/shop?category=tshirts">T-Shirts</NavLink>
        </nav>
        <button className="cart-btn" onClick={() => setOpen(true)}>
          Cart
          {count > 0 && <span className="cart-count">{count}</span>}
        </button>
      </div>
    </header>
  );
}

// Types each phrase out like a typewriter, pauses, deletes, then moves to the next
const TICKER_PHRASES = [
  "STREETWEAR — DROP 01 LIVE",
  "FREE SHIPPING OVER KES 5,000",
  "WEAR THE STREETS",
];

export function Ticker() {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [index, setIndex] = useState(0);
  const [text, setText] = useState(reduce ? TICKER_PHRASES[0] : "");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const current = TICKER_PHRASES[index % TICKER_PHRASES.length];
    let timer;

    if (!deleting && text === current) {
      // fully typed — hold, then start deleting
      timer = setTimeout(() => setDeleting(true), 1500);
    } else if (deleting && text === "") {
      // fully deleted — advance to next phrase
      setDeleting(false);
      setIndex((i) => (i + 1) % TICKER_PHRASES.length);
    } else {
      // type or delete one character
      timer = setTimeout(
        () => setText(current.slice(0, deleting ? text.length - 1 : text.length + 1)),
        deleting ? 35 : 70
      );
    }

    return () => clearTimeout(timer);
  }, [text, deleting, index, reduce]);

  return (
    <div className="ticker">
      <div className="wrap ticker-inner">
        <span className="ticker-cue">&gt;</span>
        <span className="ticker-text">{text}</span>
        <span className="ticker-cursor" aria-hidden="true" />
      </div>
    </div>
  );
}

// Counts down to a fixed drop date
export function Countdown({ target }) {
  const [left, setLeft] = useState(diff(target));
  useEffect(() => {
    const t = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(t);
  }, [target]);

  return (
    <div className="countdown">
      <span className="countdown-label">
        Next drop
        <br />
        closes in
      </span>
      <div className="countdown-units">
        {[
          ["Days", left.d],
          ["Hrs", left.h],
          ["Min", left.m],
          ["Sec", left.s],
        ].map(([tag, val]) => (
          <div className="count-unit" key={tag}>
            <div className="count-num">{String(val).padStart(2, "0")}</div>
            <div className="count-tag">{tag}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function diff(target) {
  const ms = Math.max(0, new Date(target) - new Date());
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms / 3600000) % 24),
    m: Math.floor((ms / 60000) % 60),
    s: Math.floor((ms / 1000) % 60),
  };
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">STREETWEAR</div>
        <div className="footer-cols">
          <div>
            <h4>Shop</h4>
            <p><Link to="/shop?category=tshirts">T-Shirts</Link></p>
            <p><Link to="/shop?category=hoodies">Hoodies</Link></p>
            <p><Link to="/shop?category=jeans">Jeans</Link></p>
            <p><Link to="/shop?category=caps">Caps</Link></p>
          </div>
          <div>
            <h4>Info</h4>
            <p>Shipping &amp; Returns</p>
            <p>Size Guide</p>
            <p>Track Order</p>
            <p>Contact</p>
          </div>
          <div>
            <h4>Follow</h4>
            <p>Instagram</p>
            <p>TikTok</p>
            <p>X / Twitter</p>
          </div>
          <div>
            <h4>STREETWEAR HQ</h4>
            <p>Malindi, Kenya</p>
            <p>hello@streetwear.co.ke</p>
            <p>&copy; {new Date().getFullYear()} STREETWEAR</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
