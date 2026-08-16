import React, { lazy, Suspense } from "react";
import { getCurrentShop } from "../lib/auth";
import { LoadingState } from "../components/AsyncState";

const Settings = lazy(() => import("./Settings.jsx"));
const HospitalSettings = lazy(() => import("./hospital/HospitalSettings.jsx"));

export default function SettingsRouter() {
  const shop = getCurrentShop();
  const Component = shop?.business_type === "hospital" ? HospitalSettings : Settings;
  return <Suspense fallback={<LoadingState />}><Component /></Suspense>;
}
