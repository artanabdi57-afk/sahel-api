import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { LoadingState } from "./components/AsyncState.jsx";
import { applyLanguage } from "./lib/i18n.js";
import "./styles.css";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Inventory = lazy(() => import("./pages/Inventory.jsx"));
const NewSale = lazy(() => import("./pages/NewSale.jsx"));
const Credits = lazy(() => import("./pages/Credits.jsx"));
const PurchaseOrders = lazy(() => import("./pages/PurchaseOrders.jsx"));
const Expenses = lazy(() => import("./pages/Expenses.jsx"));
const Reports = lazy(() => import("./pages/Reports.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const AuthCallback = lazy(() => import("./pages/AuthCallback.jsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.jsx"));
const AuthPage = lazy(() => import("./pages/AuthPage.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));

function lazyPage(element, variant = "route") {
  return <Suspense fallback={<LoadingState variant={variant} />}>{element}</Suspense>;
}

const savedSettings = localStorage.getItem("sahel_settings");
if (savedSettings) {
  const settings = JSON.parse(savedSettings);
  document.documentElement.classList.toggle("dark", settings.theme === "dark");
  applyLanguage(settings.language);
} else {
  applyLanguage("English");
}

const router = createBrowserRouter([
  { path: "/login", element: lazyPage(<AuthPage mode="login" />) },
  { path: "/signup", element: lazyPage(<AuthPage mode="signup" />) },
  { path: "/admin", element: lazyPage(<Admin />) },
  { path: "/auth/callback", element: lazyPage(<AuthCallback />) },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <App />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: lazyPage(<Dashboard />, "dashboard") },
          { path: "inventory", element: lazyPage(<Inventory />) },
          { path: "sale", element: lazyPage(<NewSale />) },
          { path: "credits", element: lazyPage(<Credits />) },
          { path: "orders", element: lazyPage(<PurchaseOrders />) },
          { path: "expenses", element: lazyPage(<Expenses />) },
          { path: "reports", element: lazyPage(<Reports />) },
          { path: "settings", element: lazyPage(<Settings />) },
          { path: "profile", element: lazyPage(<Profile />) },
          { path: "onboarding", element: lazyPage(<Onboarding />) }
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

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
