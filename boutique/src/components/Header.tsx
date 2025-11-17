import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

export default function Header() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header
      className="sticky top-0 z-50 p-4 shadow-md"
      style={{ backgroundColor: "var(--card-background)" }}
    >
      <div className="flex justify-between items-center">
        <Link to="/" className="text-xl font-bold" style={{ color: "var(--text-heading)" }}>
          PLUG CERTIFIÉ
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/products"
            className="text-sm"
            style={{ color: "var(--link-color)" }}
          >
            Produits
          </Link>
          <Link
            to="/cart"
            className="relative"
            style={{ color: "var(--link-color)" }}
          >
            🛒
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

