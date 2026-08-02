import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useCart, fmt } from "../context/CartContext.jsx";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .getProduct(slug)
      .then((p) => {
        setProduct(p);
        setSize(p.sizes[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="spinner" />;
  if (error || !product)
    return (
      <div className="center-msg">
        Product not found.
        <br />
        <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => navigate("/shop")}>
          ← Back to shop
        </button>
      </div>
    );

  return (
    <div className="wrap">
      <div className="pd">
        <div className="pd-tile" style={{ background: product.color }}>
          <span className="pd-mark">STREETWEAR</span>
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>

        <div>
          <div className="pd-cat">
            {product.category} · {product.drop} · {product.sku}
          </div>
          <h1 className="pd-name">{product.name}</h1>
          <div className="pd-price">{fmt(product.price)}</div>
          <p className="pd-desc">{product.description}</p>

          <div className="label-mono">Select size</div>
          <div className="size-row">
            {product.sizes.map((s) => (
              <button
                key={s}
                className={`size-box ${size === s ? "active" : ""}`}
                onClick={() => setSize(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            className="btn"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={product.soldOut}
            onClick={() => addItem(product, size)}
          >
            {product.soldOut ? "Sold out" : "Add to bag →"}
          </button>

          <p className="label-mono" style={{ marginTop: 18 }}>
            {product.stock > 0
              ? `${product.stock} left in this drop · Free shipping over KES 5,000`
              : "This piece is ghost."}
          </p>
        </div>
      </div>
    </div>
  );
}
