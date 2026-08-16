import React,{Suspense,lazy} from "react";
import {getCurrentShop} from "../lib/auth";
import {LoadingState} from "./AsyncState";
const GenericSettings=lazy(()=>import("../pages/Settings.jsx"));
const HospitalSettings=lazy(()=>import("../pages/hospital/HospitalSettings.jsx"));
export default function SettingsRouter(){const shop=getCurrentShop();const Settings=shop?.business_type==="hospital"?HospitalSettings:GenericSettings;return <Suspense fallback={<LoadingState variant="route"/>}><Settings/></Suspense>}
