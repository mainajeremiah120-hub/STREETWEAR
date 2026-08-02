import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar, Footer } from "./components/Chrome.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import IntroSplash from "./components/IntroSplash.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";
import Landing from "./pages/Landing.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Checkout from "./pages/Checkout.jsx";

export default function App() {
  const { pathname } = useLocation();
  const [showIntro, setShowIntro] = useState(() => pathname === "/");

  // Scroll to top on route change, and replay the intro every time the home route is (re)entered
  useEffect(() => {
    window.scrollTo(0, 0);
    if (pathname === "/") setShowIntro(true);
  }, [pathname]);

  function dismissIntro() {
    setShowIntro(false);
  }

  return (
    <>
      {showIntro && <IntroSplash onEnter={dismissIntro} />}
      <Navbar />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<div className="center-msg">404 — This page is ghost.</div>} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
