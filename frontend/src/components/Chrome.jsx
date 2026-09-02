import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext.jsx";

export function Navbar() {
  const { count, setOpen } = useCart();
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link to="/" className="nav-logo">
          KIRIJO<span className="nav-logo-tag">PHARMACY</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/shop?category=medicines">Medicines</NavLink>
          <NavLink to="/shop?category=vitamins">Vitamins</NavLink>
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
  "LICENSED & GENUINE PRODUCTS",
  "FREE DELIVERY OVER KES 1,500",
  "CHAT WITH OUR PHARMACIST ON WHATSAPP",
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

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">KIRIJO</div>
        <div className="footer-cols">
          <div>
            <h4>Shop</h4>
            <p><Link to="/shop?category=medicines">Medicines</Link></p>
            <p><Link to="/shop?category=vitamins">Vitamins</Link></p>
            <p><Link to="/shop?category=skincare">Skincare</Link></p>
            <p><Link to="/shop?category=personal-care">Personal Care</Link></p>
          </div>
          <div>
            <h4>Info</h4>
            <p>Delivery Info</p>
            <p>Prescription Upload</p>
            <p>Track Order</p>
            <p>Contact</p>
          </div>
          <div>
            <h4>Follow</h4>
            <p>Instagram</p>
            <p>Facebook</p>
            <p>X / Twitter</p>
          </div>
          <div>
            <h4>KIRIJO PHARMACY</h4>
            <p>Malindi, Kenya</p>
            <p>hello@kirijopharmacy.co.ke</p>
            <p>&copy; {new Date().getFullYear()} Kirijo Pharmacy</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
