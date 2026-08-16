import React,{Suspense,lazy} from "react";
import {getCurrentShop,getCurrentUser} from "../lib/auth";
import {LoadingState} from "./AsyncState";
const ShopDashboard=lazy(()=>import("../pages/Dashboard.jsx"));
const GymDashboard=lazy(()=>import("../pages/gym/GymDashboard.jsx"));
const SchoolDashboard=lazy(()=>import("../pages/school/SchoolDashboard.jsx"));
const HospitalManagementDashboard=lazy(()=>import("../pages/hospital/HospitalManagementDashboard.jsx"));
const HospitalStaffDashboard=lazy(()=>import("../pages/hospital/HospitalStaffDashboard.jsx"));
export default function DashboardRouter(){
 const shop=getCurrentShop(); const user=getCurrentUser(); const role=String(user?.role||"").toLowerCase(); const isStaff=Boolean(user?.is_staff);
 let Dashboard;
 if(shop?.business_type==="hospital") Dashboard=isStaff && role!=="hospital manager" && role!=="manager" ? HospitalStaffDashboard : HospitalManagementDashboard;
 else if(shop?.business_type==="gym") Dashboard=GymDashboard;
 else if(shop?.business_type==="school") Dashboard=SchoolDashboard;
 else Dashboard=ShopDashboard;
 return <Suspense fallback={<LoadingState variant="dashboard"/>}><Dashboard/></Suspense>;
}
