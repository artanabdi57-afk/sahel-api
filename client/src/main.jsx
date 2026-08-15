import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardRouter from "./components/DashboardRouter.jsx";
import { LoadingState } from "./components/AsyncState.jsx";
import { applyLanguage } from "./lib/i18n.js";
import "./styles.css";

const Inventory=lazy(()=>import("./pages/Inventory.jsx"));
const NewSale=lazy(()=>import("./pages/NewSale.jsx"));
const Credits=lazy(()=>import("./pages/Credits.jsx"));
const PurchaseOrders=lazy(()=>import("./pages/PurchaseOrders.jsx"));
const Expenses=lazy(()=>import("./pages/Expenses.jsx"));
const Reports=lazy(()=>import("./pages/Reports.jsx"));
const Settings=lazy(()=>import("./pages/Settings.jsx"));
const Profile=lazy(()=>import("./pages/Profile.jsx"));
const AuthCallback=lazy(()=>import("./pages/AuthCallback.jsx"));
const Onboarding=lazy(()=>import("./pages/Onboarding.jsx"));
const AuthPage=lazy(()=>import("./pages/AuthPageV2.jsx"));
const Admin=lazy(()=>import("./pages/Admin.jsx"));
const Landing=lazy(()=>import("./pages/LandingProfessional.jsx"));
const StaffLogin=lazy(()=>import("./pages/StaffLogin.jsx"));
const ForgotPassword=lazy(()=>import("./pages/ForgotPassword.jsx"));
const ResetPassword=lazy(()=>import("./pages/ResetPassword.jsx"));
const Blog=lazy(()=>import("./pages/Blog.jsx"));
const BlogPost=lazy(()=>import("./pages/BlogPost.jsx"));
const GymMembers=lazy(()=>import("./pages/gym/GymMembers.jsx"));
const GymCheckins=lazy(()=>import("./pages/gym/GymCheckins.jsx"));
const GymPayments=lazy(()=>import("./pages/gym/GymPayments.jsx"));
const GymStaff=lazy(()=>import("./pages/gym/GymStaff.jsx"));
const SchoolClasses=lazy(()=>import("./pages/school/SchoolClasses.jsx"));
const SchoolStudents=lazy(()=>import("./pages/school/SchoolStudents.jsx"));
const SchoolTeachers=lazy(()=>import("./pages/school/SchoolTeachers.jsx"));
const SchoolAttendance=lazy(()=>import("./pages/school/SchoolAttendance.jsx"));
const SchoolFees=lazy(()=>import("./pages/school/SchoolFees.jsx"));
const SchoolExams=lazy(()=>import("./pages/school/SchoolExams.jsx"));

function lazyPage(element,variant="route"){
  return <Suspense fallback={<LoadingState variant={variant}/>}>{element}</Suspense>;
}

const savedSettings=localStorage.getItem("sahel_settings");
if(savedSettings){
  const settings=JSON.parse(savedSettings);
  document.documentElement.classList.toggle("dark",settings.theme==="dark");
  applyLanguage(settings.language);
}else applyLanguage("English");

// Capture the browser's install event globally so it cannot be missed while
// the landing page is lazy-loading or while the user moves between routes.
window.__sahelInstallPrompt = window.__sahelInstallPrompt || null;
window.addEventListener("beforeinstallprompt",(event)=>{
  event.preventDefault();
  window.__sahelInstallPrompt = event;
  window.dispatchEvent(new Event("sahel-install-available"));
});
window.addEventListener("appinstalled",()=>{
  window.__sahelInstallPrompt = null;
  window.dispatchEvent(new Event("sahel-app-installed"));
});

const router=createBrowserRouter([
  {path:"/welcome",element:lazyPage(<Landing/>)},
  {path:"/blog",element:lazyPage(<Blog/>)},
  {path:"/blog/:slug",element:lazyPage(<BlogPost/>)},
  {path:"/login",element:lazyPage(<AuthPage mode="login"/>)},
  {path:"/signup",element:lazyPage(<AuthPage mode="signup"/>)},
  {path:"/admin",element:lazyPage(<Admin/>)},
  {path:"/auth/callback",element:lazyPage(<AuthCallback/>)},
  {path:"/forgot-password",element:lazyPage(<ForgotPassword/>)},
  {path:"/staff-login",element:lazyPage(<StaffLogin/>)},
  {path:"/reset-password",element:lazyPage(<ResetPassword/>)},
  {path:"/",element:<ProtectedRoute/>,children:[
    {element:<App/>,children:[
      {index:true,element:<Navigate to="/dashboard" replace/>},
      {path:"dashboard",element:lazyPage(<DashboardRouter/>,"dashboard")},
      {path:"inventory",element:lazyPage(<Inventory/>)},
      {path:"sale",element:lazyPage(<NewSale/>)},
      {path:"credits",element:lazyPage(<Credits/>)},
      {path:"orders",element:lazyPage(<PurchaseOrders/>)},
      {path:"expenses",element:lazyPage(<Expenses/>)},
      {path:"reports",element:lazyPage(<Reports/>)},
      {path:"settings",element:lazyPage(<Settings/>)},
      {path:"profile",element:lazyPage(<Profile/>)},
      {path:"onboarding",element:lazyPage(<Onboarding/>)},
      {path:"gym/members",element:lazyPage(<GymMembers/>)},
      {path:"gym/checkins",element:lazyPage(<GymCheckins/>)},
      {path:"gym/payments",element:lazyPage(<GymPayments/>)},
      {path:"gym/staff",element:lazyPage(<GymStaff/>)},
      {path:"school/classes",element:lazyPage(<SchoolClasses/>)},
      {path:"school/students",element:lazyPage(<SchoolStudents/>)},
      {path:"school/teachers",element:lazyPage(<SchoolTeachers/>)},
      {path:"school/attendance",element:lazyPage(<SchoolAttendance/>)},
      {path:"school/fees",element:lazyPage(<SchoolFees/>)},
      {path:"school/exams",element:lazyPage(<SchoolExams/>)}
    ]}
  ]}
]);

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><RouterProvider router={router}/></React.StrictMode>);

if("serviceWorker" in navigator && import.meta.env.PROD){
  window.addEventListener("load",()=>{
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{scope:"/"}).catch((error)=>{
      console.warn("Sahel service worker registration failed",error);
    });
  });
}
