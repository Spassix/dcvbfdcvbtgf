import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { DesktopGuard } from "./components/DesktopGuard";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Farms from "./pages/Farms";
import Promos from "./pages/Promos";
import Reviews from "./pages/Reviews";
import CartSettings from "./pages/CartSettings";
import Colors from "./pages/Colors";
import Events from "./pages/Events";
import Typography from "./pages/Typography";
import LoadingScreen from "./pages/LoadingScreen";
import Socials from "./pages/Socials";
import AdminUsers from "./pages/AdminUsers";
import Maintenance from "./pages/Maintenance";
import ApiTokens from "./pages/ApiTokens";
import Telegram from "./pages/Telegram";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  useEffect(() => {
    // Disable right-click in production
    if (import.meta.env.PROD) {
      document.addEventListener("contextmenu", (e) => e.preventDefault());
    }
  }, []);

  return (
    <DesktopGuard>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <PrivateRoute>
                <Products />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/farms"
            element={
              <PrivateRoute>
                <Farms />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/promos"
            element={
              <PrivateRoute>
                <Promos />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <PrivateRoute>
                <Reviews />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/cart-settings"
            element={
              <PrivateRoute>
                <CartSettings />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/colors"
            element={
              <PrivateRoute>
                <Colors />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <PrivateRoute>
                <Events />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/typography"
            element={
              <PrivateRoute>
                <Typography />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/loading"
            element={
              <PrivateRoute>
                <LoadingScreen />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/socials"
            element={
              <PrivateRoute>
                <Socials />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/maintenance"
            element={
              <PrivateRoute>
                <Maintenance />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/api-tokens"
            element={
              <PrivateRoute>
                <ApiTokens />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/telegram"
            element={
              <PrivateRoute>
                <Telegram />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </AuthProvider>
    </DesktopGuard>
  );
}

export default App;

