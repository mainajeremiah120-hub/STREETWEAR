import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

const CATEGORIES = [
  ["all", "All"],
  ["tshirts", "T-Shirts"],
  ["hoodies", "Hoodies"],
  ["jeans", "Jeans"],
  ["caps", "Caps"],
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const active = params.get("category") || "all";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const query = active === "all" ? "" : `?category=${active}`;
    api
      .getProducts(query)
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [active]);

  const setCategory = (cat) => {
    if (cat === "all") setParams({});
    else setParams({ category: cat });
  };

  return (
    <section className="section" style={{ borderTop: "none" }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-index">[ SHOP / DROP 01 ]</div>
            <h2 className="section-title">All Products</h2>
          </div>
          <p className="section-note">
            {products.length} {products.length === 1 ? "piece" : "pieces"} available
          </p>
        </div>

        <div className="filters">
          {CATEGORIES.map(([val, label]) => (
            <button
              key={val}
              className={`chip ${active === val ? "active" : ""}`}
              onClick={() => setCategory(val)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <div className="spinner" />}

        {error && (
          <div className="center-msg">
            Couldn't load products.
            <br />
            Is the backend running on port 5000?
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="center-msg">Nothing in this category yet.</div>
        )}

        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
