import { Outlet } from "react-router-dom";
import { Navbar, Footer } from "../components/Chrome.jsx";
import CartDrawer from "../components/CartDrawer.jsx";
import WhatsAppButton from "../components/WhatsAppButton.jsx";
import LiveChatWidget from "../components/LiveChatWidget.jsx";

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <LiveChatWidget />
    </>
  );
}
