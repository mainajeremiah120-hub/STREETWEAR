import { useNavigate } from "react-router-dom";
import { useCart, fmt } from "../context/CartContext.jsx";

export default function CartDrawer() {
  const { open, setOpen, items, inc, dec, remove, subtotal, shippingFee, total } =
    useCart();
  const navigate = useNavigate();

  if (!open) return null;

  const goCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      <div className="overlay" onClick={() => setOpen(false)} />
      <aside className="drawer" role="dialog" aria-label="Shopping cart">
        <div className="drawer-head">
          <h3>Your Bag</h3>
          <button className="cart-remove" onClick={() => setOpen(false)}>
            Close ✕
          </button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty">
              Your bag is empty.
              <br />
              Go cop something from the drop.
            </div>
          ) : (
            items.map((i) => (
              <div className="cart-line" key={i.key}>
                <div className="cart-swatch" style={{ background: i.color }}>
                  {i.image && (
                    <img
                      src={i.image}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
                <div className="cart-line-info">
                  <div className="cart-line-name">{i.name}</div>
                  <div className="cart-line-meta">
                    Size {i.size} · {fmt(i.price)}
                  </div>
                  <div className="qty">
                    <button onClick={() => dec(i.key)} aria-label="Decrease">
                      −
                    </button>
                    <span>{i.qty}</span>
                    <button onClick={() => inc(i.key)} aria-label="Increase">
                      +
                    </button>
                  </div>
                </div>
                <button className="cart-remove" onClick={() => remove(i.key)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="cart-total">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="cart-total">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? "FREE" : fmt(shippingFee)}</span>
            </div>
            <div className="cart-total grand">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
            <button
              className="btn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={goCheckout}
            >
              Checkout →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
