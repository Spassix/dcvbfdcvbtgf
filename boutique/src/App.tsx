import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { TelegramGuard } from "./components/TelegramGuard";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Reviews from "./pages/Reviews";

function App() {
  // Check if running in Telegram Mini App
  useEffect(() => {
    // Disable right-click in production
    if (import.meta.env.PROD) {
      document.addEventListener("contextmenu", (e) => e.preventDefault());
    }
  }, []);

  return (
    <TelegramGuard>
      <ThemeProvider>
        <CartProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </ThemeProvider>
    </TelegramGuard>
  );
}

export default App;

