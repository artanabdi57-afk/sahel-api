import React, { Suspense, lazy } from "react";
import { getCurrentShop } from "../lib/auth";
import { LoadingState } from "./AsyncState";

const ShopDashboard = lazy(() => import("../pages/Dashboard.jsx"));
const GymDashboard = lazy(() => import("../pages/gym/GymDashboard.jsx"));
const SchoolDashboard = lazy(() => import("../pages/school/SchoolDashboard.jsx"));
const HospitalDashboard = lazy(() => import("../pages/hospital/HospitalDashboard.jsx"));

export default function DashboardRouter() {
  const shop = getCurrentShop();
  const Dashboard = shop?.business_type === "hospital" ? HospitalDashboard : shop?.business_type === "gym" ? GymDashboard : shop?.business_type === "school" ? SchoolDashboard : ShopDashboard;
  return <Suspense fallback={<LoadingState variant="dashboard" />}><Dashboard /></Suspense>;
}
