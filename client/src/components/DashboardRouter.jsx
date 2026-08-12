import React, { Suspense, lazy } from "react";
import { getCurrentShop } from "../lib/auth";
import { LoadingState } from "./AsyncState";

const ShopDashboard   = lazy(() => import("../pages/Dashboard.jsx"));
const GymDashboard    = lazy(() => import("../pages/gym/GymDashboard.jsx"));
const SchoolDashboard = lazy(() => import("../pages/school/SchoolDashboard.jsx"));

// /dashboard is one route for every account, but what renders there depends
// on the shop's locked business_type — this is the single place that
// decision is made, so no other page needs to know about it.
export default function DashboardRouter() {
  const shop = getCurrentShop();

  const Dashboard =
    shop?.business_type === "gym"    ? GymDashboard :
    shop?.business_type === "school" ? SchoolDashboard :
    ShopDashboard;

  return (
    <Suspense fallback={<LoadingState variant="dashboard" />}>
      <Dashboard />
    </Suspense>
  );
}
