import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Inventory from "./pages/Inventory.jsx";
import NewSale from "./pages/NewSale.jsx";
import Credits from "./pages/Credits.jsx";
import PurchaseOrders from "./pages/PurchaseOrders.jsx";
import Expenses from "./pages/Expenses.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Admin from "./pages/Admin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { applyLanguage } from "./lib/i18n.js";
import "./styles.css";

const savedSettings = localStorage.getItem("sahel_settings");
if (savedSettings) {
  const settings = JSON.parse(savedSettings);
  document.documentElement.classList.toggle("dark", settings.theme === "dark");
  applyLanguage(settings.language);
} else {
  applyLanguage("English");
}

const router = createBrowserRouter([
  { path: "/login", element: <AuthPage mode="login" /> },
  { path: "/signup", element: <AuthPage mode="signup" /> },
  { path: "/admin", element: <Admin /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <App />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "inventory", element: <Inventory /> },
          { path: "sale", element: <NewSale /> },
          { path: "credits", element: <Credits /> },
          { path: "orders", element: <PurchaseOrders /> },
          { path: "expenses", element: <Expenses /> },
          { path: "reports", element: <Reports /> },
          { path: "settings", element: <Settings /> },
          { path: "profile", element: <Profile /> },
          { path: "onboarding", element: <Onboarding /> }
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
