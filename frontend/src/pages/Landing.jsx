import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, publicApi } from "../api/client.js";
import { Ticker } from "../components/Chrome.jsx";
import ProductCard from "../components/ProductCard.jsx";

// Fallback defaults so the page never breaks if the settings fetch is slow
// or the API is briefly down — the admin dashboard can edit both from
// Settings/How It Works without a redeploy.
const DEFAULT_WHATSAPP = "254740687321";
const DEFAULT_STEPS = [
  { title: "Order online", description: "Browse medicines, vitamins, skincare and more. Add to cart and check out in minutes." },
  { title: "Verified by our pharmacist", description: "Every order is reviewed for accuracy and authenticity before it's packed." },
  { title: "Fast, discreet delivery", description: "Pay with M-Pesa or cash on delivery. Most orders arrive within 24–48 hours." },
];

export default function Landing() {
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState(null);
  const [whatsapp, setWhatsapp] = useState(DEFAULT_WHATSAPP);
  const [steps, setSteps] = useState(DEFAULT_STEPS);

  useEffect(() => {
    api
      .getProducts("?featured=true")
      .then((data) => setFeatured(data.slice(0, 8)))
      .catch((err) => setError(err.message));

    publicApi
      .getSettings()
      .then((s) => {
        if (s?.whatsappNumber) setWhatsapp(s.whatsappNumber);
        if (s?.howItWorks?.length) setSteps(s.howItWorks);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="hero-eyebrow">KIRIJO PHARMACY / LICENSED &amp; TRUSTED</p>
          <h1 className="hero-title">
            <span className="outline">YOUR</span>
            <br />
            <span className="fill">HEALTH</span>{" "}
            <span className="outline">FIRST</span>
          </h1>
          <p className="hero-sub">
            Genuine medicines, vitamins, skincare and personal care — sourced
            from licensed suppliers and delivered fast across Kenya.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn">
              Shop now →
            </Link>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              Chat with a pharmacist
            </a>
          </div>
        </div>
      </section>

      <Ticker />

      <section className="section" id="featured">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-index">[ 01 / FEATURED ]</div>
              <h2 className="section-title">Popular Picks</h2>
            </div>
            <p className="section-note">
              Everyday essentials our customers reach for most, always in stock.
            </p>
          </div>

          {error && (
            <div className="center-msg">
              Couldn't reach the store API.
              <br />
              Make sure the backend is running on port 5000, then refresh.
            </div>
          )}

          <div className="grid">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          <div style={{ marginTop: 40 }}>
            <Link to="/shop" className="btn btn-ghost">
              View all products →
            </Link>
          </div>
        </div>
      </section>

      <section className="manifesto">
        <div className="wrap">
          <h2>
            CARE YOU CAN TRUST.
            <br />
            <span className="manifesto-stylish">Health, delivered with heart.</span>
          </h2>
          <p>
            KIRIJO PHARMACY is a licensed pharmacy serving Malindi and beyond.
            Every order is checked by a qualified pharmacist before it leaves
            us — genuine products, correct dosages, no shortcuts. Whether it's
            a prescription refill or your monthly vitamins, we've got you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-index">[ 02 / HOW IT WORKS ]</div>
              <h2 className="section-title">How It Works</h2>
            </div>
          </div>
          <div className="grid">
            {steps.map((s, i) => (
              <div className="card" key={s._id || s.title} style={{ padding: 26 }}>
                <div className="section-index">0{i + 1}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, margin: "10px 0 12px" }}>
                  {s.title}
                </h3>
                <p style={{ color: "var(--muted)", lineHeight: 1.55 }}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
