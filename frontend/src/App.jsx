import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar, Footer } from "./components/Chrome.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";
import Landing from "./pages/Landing.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Checkout from "./pages/Checkout.jsx";

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<div className="center-msg">404 — Page not found.</div>} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
