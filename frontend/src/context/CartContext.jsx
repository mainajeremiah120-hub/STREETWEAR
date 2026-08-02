import { createContext, useContext, useReducer, useState } from "react";

const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { product, size } = action;
      const key = `${product._id}-${size}`;
      const existing = state.find((i) => i.key === key);
      if (existing) {
        return state.map((i) =>
          i.key === key ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...state,
        {
          key,
          product: product._id,
          name: product.name,
          price: product.price,
          color: product.color,
          image: product.image,
          size,
          qty: 1,
        },
      ];
    }
    case "INC":
      return state.map((i) =>
        i.key === action.key ? { ...i, qty: i.qty + 1 } : i
      );
    case "DEC":
      return state
        .map((i) => (i.key === action.key ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0);
    case "REMOVE":
      return state.filter((i) => i.key !== action.key);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [open, setOpen] = useState(false);

  const addItem = (product, size) => {
    dispatch({ type: "ADD", product, size });
    setOpen(true);
  };

  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingFee = subtotal >= 5000 || subtotal === 0 ? 0 : 300;
  const total = subtotal + shippingFee;

  const value = {
    items,
    count,
    subtotal,
    shippingFee,
    total,
    open,
    setOpen,
    addItem,
    inc: (key) => dispatch({ type: "INC", key }),
    dec: (key) => dispatch({ type: "DEC", key }),
    remove: (key) => dispatch({ type: "REMOVE", key }),
    clear: () => dispatch({ type: "CLEAR" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export const fmt = (n) => `KES ${n.toLocaleString("en-KE")}`;
