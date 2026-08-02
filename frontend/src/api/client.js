const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getProducts: (query = "") => request(`/products${query}`),
  getProduct: (slug) => request(`/products/${slug}`),
  createOrder: (payload) =>
    request(`/orders`, { method: "POST", body: JSON.stringify(payload) }),
  getOrder: (orderNumber) => request(`/orders/${orderNumber}`),
};
