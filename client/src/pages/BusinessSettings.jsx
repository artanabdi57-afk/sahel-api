import React from "react";
import { getCurrentShop } from "../lib/auth";
import Settings from "./Settings.jsx";
import HospitalSettings from "./hospital/HospitalSettings.jsx";

export default function BusinessSettings() {
  const shop = getCurrentShop();
  return shop?.business_type === "hospital" ? <HospitalSettings /> : <Settings />;
}
