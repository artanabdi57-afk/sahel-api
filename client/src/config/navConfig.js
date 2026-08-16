import { LayoutDashboard, Boxes, PlusCircle, CreditCard, ClipboardList, Receipt, BarChart3, Settings, Users, UserCheck, Wallet, Dumbbell, BookOpen, GraduationCap, ClipboardCheck, CalendarCheck2, Stethoscope, UserPlus, Pill, FlaskConical, UserCog, HeartPulse, CalendarDays, Beaker } from "lucide-react";

export const NAV_BY_TYPE = {
  shop: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }, { label: "Inventory", path: "/inventory", icon: Boxes }, { label: "New Sale", path: "/sale", icon: PlusCircle }, { label: "Credits", path: "/credits", icon: CreditCard }, { label: "Orders", path: "/orders", icon: ClipboardList }, { label: "Expenses", path: "/expenses", icon: Receipt }, { label: "Reports", path: "/reports", icon: BarChart3 }, { label: "Settings", path: "/settings", icon: Settings },
  ],
  gym: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }, { label: "Members", path: "/gym/members", icon: Users }, { label: "Check-ins", path: "/gym/checkins", icon: UserCheck }, { label: "Payments", path: "/gym/payments", icon: Wallet }, { label: "Staff", path: "/gym/staff", icon: Dumbbell }, { label: "Settings", path: "/settings", icon: Settings },
  ],
  school: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }, { label: "Classes", path: "/school/classes", icon: BookOpen }, { label: "Students", path: "/school/students", icon: Users }, { label: "Teachers", path: "/school/teachers", icon: GraduationCap }, { label: "Attendance", path: "/school/attendance", icon: CalendarCheck2 }, { label: "Fees", path: "/school/fees", icon: Wallet }, { label: "Exams", path: "/school/exams", icon: ClipboardCheck }, { label: "Settings", path: "/settings", icon: Settings },
  ],
  hospital: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Patients", path: "/hospital/patients", icon: Users },
    { label: "Appointments", path: "/hospital/appointments", icon: CalendarDays },
    { label: "Doctors", path: "/hospital/doctors", icon: Stethoscope },
    { label: "Reception", path: "/hospital/reception", icon: UserPlus },
    { label: "Pharmacy", path: "/hospital/pharmacy", icon: Pill },
    { label: "Laboratory", path: "/hospital/laboratory", icon: FlaskConical },
    { label: "Finance", path: "/hospital/finance", icon: Wallet },
    { label: "Users & Access", path: "/hospital/users", icon: UserCog },
    { label: "Attendance", path: "/hospital/attendance", icon: UserCheck },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
};
export function getNavForBusinessType(businessType) { return NAV_BY_TYPE[businessType] || NAV_BY_TYPE.shop; }
