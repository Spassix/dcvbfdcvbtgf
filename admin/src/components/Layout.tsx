import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const menuItems = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/settings", label: "Paramètres" },
    { path: "/admin/products", label: "Produits" },
    { path: "/admin/categories", label: "Catégories" },
    { path: "/admin/farms", label: "Fermes" },
    { path: "/admin/promos", label: "Codes promo" },
    { path: "/admin/reviews", label: "Avis" },
    { path: "/admin/cart-settings", label: "Panier" },
    { path: "/admin/colors", label: "Couleurs" },
    { path: "/admin/events", label: "Événements" },
    { path: "/admin/typography", label: "Typographie" },
    { path: "/admin/loading", label: "Écran de chargement" },
    { path: "/admin/socials", label: "Réseaux sociaux" },
    { path: "/admin/users", label: "Utilisateurs" },
    { path: "/admin/maintenance", label: "Maintenance" },
    { path: "/admin/api-tokens", label: "Tokens API" },
    { path: "/admin/telegram", label: "Telegram" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">PLUG CERTIFIÉ - Admin</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.path
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

