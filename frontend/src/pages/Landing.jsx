import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { Ticker, Countdown } from "../components/Chrome.jsx";
import ProductCard from "../components/ProductCard.jsx";

// Next drop closes 6 days out from first load
const DROP_TARGET = new Date(Date.now() + 6 * 86400000).toISOString();

export default function Landing() {
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getProducts("?featured=true")
      .then((data) => setFeatured(data.slice(0, 8)))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="hero-eyebrow">STREETWEAR / DROP 01 — LIVE NOW</p>
          <h1 className="hero-title">
            <span className="outline">WEAR</span>
            <br />
            <span className="fill">THE</span>{" "}
            <span className="outline">STREETS</span>
          </h1>
          <p className="hero-sub">
            Heavyweight streetwear built from the ground up in Kenya. Limited
            drops, no restocks. When it's gone, it's gone.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn">
              Shop the drop →
            </Link>
            <a href="#featured" className="btn btn-ghost">
              See the pieces
            </a>
          </div>
          <Countdown target={DROP_TARGET} />
        </div>
      </section>

      <Ticker />

      <section className="section" id="featured">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-index">[ 01 / FEATURED ]</div>
              <h2 className="section-title">The Drop</h2>
            </div>
            <p className="section-note">
              Hand-picked heat from Drop 01. Limited runs — grab your size before
              it's ghost.
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
            BUILT ON THE STREETS.
            <br />
            <span className="manifesto-stylish">Worn by the streets.</span>
          </h2>
          <p>
            STREETWEAR was born on the block — the neighbourhood, the corner
            where the culture actually lives. Every piece is designed and printed
            with the people who wear it in mind. No filler. No hype tax. Just heavy
            garments that hold up.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-index">[ 02 / HOW IT WORKS ]</div>
              <h2 className="section-title">Drop Culture</h2>
            </div>
          </div>
          <div className="grid">
            {[
              ["Drops, not seasons", "New pieces land as timed drops. Once a run sells out, it doesn't come back."],
              ["Made in Kenya", "Designed in Malindi, printed locally. Supporting the scene that raised us."],
              ["Cop fast", "Sizes move quick. Add to bag, checkout with M-Pesa, and it ships within 48 hours."],
            ].map(([t, d], i) => (
              <div className="card" key={t} style={{ padding: 26 }}>
                <div className="section-index">0{i + 1}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, textTransform: "uppercase", margin: "10px 0 12px" }}>
                  {t}
                </h3>
                <p style={{ color: "var(--steel)", lineHeight: 1.55 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
