import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentShop, isAuthenticated } from "../lib/auth";

export default function ProtectedRoute() {
  const location = useLocation();

  if (!isAuthenticated()) {
  return <Navigate to="/welcome" replace state={{ from: location.pathname }} />;

  if (!getCurrentShop() && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (getCurrentShop() && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
