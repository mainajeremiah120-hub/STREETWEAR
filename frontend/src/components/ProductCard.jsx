import { useNavigate } from "react-router-dom";
import { useCart, fmt } from "../context/CartContext.jsx";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const open = () => navigate(`/product/${product.slug}`);

  const quickAdd = (e) => {
    e.stopPropagation();
    if (product.soldOut) return;
    addItem(product, product.sizes[0]);
  };

  return (
    <article className="card" onClick={open}>
      <div className="card-tile" style={{ background: product.color }}>
        <span className="card-mark">STREETWEAR</span>
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        <span className="card-drop">{product.drop}</span>
        {product.soldOut && <span className="card-soldout">Sold Out</span>}
      </div>
      <div className="card-body">
        <div className="card-cat">{product.category}</div>
        <h3 className="card-name">{product.name}</h3>
        <div className="card-foot">
          <span className="card-price">{fmt(product.price)}</span>
          <button
            className="card-add"
            onClick={quickAdd}
            disabled={product.soldOut}
          >
            {product.soldOut ? "—" : "Add +"}
          </button>
        </div>
      </div>
    </article>
  );
}
