import React, { Suspense, lazy, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentShop, getCurrentUser, getHomePath } from "../lib/auth";
import { LoadingState } from "./AsyncState";

const ShopDashboard = lazy(() => import("../pages/Dashboard.jsx"));
const GymDashboard = lazy(() => import("../pages/gym/GymDashboard.jsx"));
const SchoolDashboard = lazy(() => import("../pages/school/SchoolDashboard.jsx"));
const HospitalDashboard = lazy(() => import("../pages/hospital/HospitalDashboard.jsx"));

export default function DashboardRouter() {
  const [session, setSession] = useState(() => ({ shop: getCurrentShop(), user: getCurrentUser() }));

  useEffect(() => {
    const refresh = () => setSession({ shop: getCurrentShop(), user: getCurrentUser() });
    window.addEventListener("sahel-session-changed", refresh);
    return () => window.removeEventListener("sahel-session-changed", refresh);
  }, []);

  const { shop, user } = session;
  if (!shop) return <LoadingState variant="dashboard" />;

  // /dashboard is the generic entry route. Hospital workspaces must never render
  // the shop dashboard, even for one frame after login.
  if (shop.business_type === "hospital") {
    const homePath = getHomePath(user, shop);
    return <Navigate to={homePath} replace />;
  }

  const Dashboard = shop.business_type === "gym" ? GymDashboard : shop.business_type === "school" ? SchoolDashboard : ShopDashboard;
  return <Suspense fallback={<LoadingState variant="dashboard" />}><Dashboard /></Suspense>;
}
