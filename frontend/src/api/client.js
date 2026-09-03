const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUTH_KEY = "kirijo_admin_auth";

function getToken() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY))?.token || null;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getProducts: (query = "") => request(`/products${query}`),
  getProduct: (slug) => request(`/products/${slug}`),
  createOrder: (payload) =>
    request(`/orders`, { method: "POST", body: JSON.stringify(payload) }),
  getOrder: (orderNumber) => request(`/orders/${orderNumber}`),
};

// Public endpoints that need no auth but don't belong in the storefront's `api`.
export const publicApi = {
  getSettings: () => request("/settings"),
  createTicket: (visitorId, text, name) =>
    request("/tickets", { method: "POST", body: JSON.stringify({ visitorId, text, name }) }),
  getTicket: (visitorId) => request(`/tickets/${visitorId}`),
  sendTicketMessage: (visitorId, text) =>
    request(`/tickets/${visitorId}/messages`, { method: "POST", body: JSON.stringify({ text }) }),
};

// Admin endpoints — request() attaches Authorization automatically whenever
// a token is present in localStorage (see AUTH_KEY / getToken above).
export const adminApi = {
  login: (email, password) =>
    request("/admin/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => request("/admin/auth/me"),
  updateCredentials: (payload) =>
    request("/admin/auth/credentials", { method: "PUT", body: JSON.stringify(payload) }),
  getStats: () => request("/admin/stats"),
  getOrders: (query = "") => request(`/admin/orders${query}`),
  getOrder: (id) => request(`/admin/orders/${id}`),
  updateOrderStatus: (id, payload) =>
    request(`/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
  getProducts: (query = "") => request(`/admin/products${query}`),
  getProduct: (id) => request(`/admin/products/${id}`),
  createProduct: (payload) =>
    request("/admin/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id, payload) =>
    request(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: "DELETE" }),
  getSettings: () => request("/admin/settings"),
  updateSettings: (payload) =>
    request("/admin/settings", { method: "PUT", body: JSON.stringify(payload) }),
  getTickets: (query = "") => request(`/admin/tickets${query}`),
  getTicket: (id) => request(`/admin/tickets/${id}`),
  replyTicket: (id, text) =>
    request(`/admin/tickets/${id}/reply`, { method: "POST", body: JSON.stringify({ text }) }),
  resolveTicket: (id) => request(`/admin/tickets/${id}/resolve`, { method: "PATCH" }),
};

export const AUTH_STORAGE_KEY = AUTH_KEY;
