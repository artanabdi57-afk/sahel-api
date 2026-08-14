import {
  LayoutDashboard, Boxes, PlusCircle, CreditCard, ClipboardList,
  Receipt, BarChart3, Settings, Users, UserCheck, Wallet, Dumbbell,
  BookOpen, GraduationCap, ClipboardCheck,
} from "lucide-react";

/**
 * One sidebar per business_type. To add a new vertical later (e.g. "doctor"),
 * add one new key here — nothing else in Layout.jsx needs to change.
 */
export const NAV_BY_TYPE = {
  shop: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Inventory", path: "/inventory", icon: Boxes },
    { label: "New Sale", path: "/sale", icon: PlusCircle },
    { label: "Credits", path: "/credits", icon: CreditCard },
    { label: "Orders", path: "/orders", icon: ClipboardList },
    { label: "Expenses", path: "/expenses", icon: Receipt },
    { label: "Reports", path: "/reports", icon: BarChart3 },
    { label: "Settings", path: "/settings", icon: Settings },
  ],

  gym: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Members", path: "/gym/members", icon: Users },
    { label: "Check-ins", path: "/gym/checkins", icon: UserCheck },
    { label: "Payments", path: "/gym/payments", icon: Wallet },
    { label: "Staff", path: "/gym/staff", icon: Dumbbell },
    { label: "Settings", path: "/settings", icon: Settings },
  ],

  school: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Classes", path: "/school/classes", icon: BookOpen },
    { label: "Students", path: "/school/students", icon: Users },
    { label: "Teachers", path: "/school/teachers", icon: GraduationCap },
    { label: "Fees", path: "/school/fees", icon: Wallet },
    { label: "Exams", path: "/school/exams", icon: ClipboardCheck },
    { label: "Settings", path: "/settings", icon: Settings },
  ],

  // Example of how a future vertical slots in later — add pages/routes/
  // backend for it the same way gym and school were built, then this
  // is the ONLY sidebar change needed:
  //
  // doctor: [
  //   { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  //   { label: "Patients", path: "/doctor/patients", icon: Users },
  //   { label: "Appointments", path: "/doctor/appointments", icon: UserCheck },
  //   { label: "Billing", path: "/doctor/billing", icon: Wallet },
  //   { label: "Settings", path: "/settings", icon: Settings },
  // ],
};

export function getNavForBusinessType(businessType) {
  return NAV_BY_TYPE[businessType] || NAV_BY_TYPE.shop;
}
