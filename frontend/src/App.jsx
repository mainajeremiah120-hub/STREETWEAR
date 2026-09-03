import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import PublicLayout from "./layouts/PublicLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Checkout from "./pages/Checkout.jsx";
import AdminLogin from "./pages/admin/Login.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import OrdersList from "./pages/admin/OrdersList.jsx";
import OrderDetail from "./pages/admin/OrderDetail.jsx";
import ProductsList from "./pages/admin/ProductsList.jsx";
import ProductForm from "./pages/admin/ProductForm.jsx";
import Settings from "./pages/admin/Settings.jsx";
import HowItWorksEditor from "./pages/admin/HowItWorksEditor.jsx";
import TicketsInbox from "./pages/admin/TicketsInbox.jsx";
import TicketThread from "./pages/admin/TicketThread.jsx";

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<div className="center-msg">404 — Page not found.</div>} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="tickets" element={<TicketsInbox />} />
          <Route path="tickets/:id" element={<TicketThread />} />
          <Route path="how-it-works" element={<HowItWorksEditor />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}
