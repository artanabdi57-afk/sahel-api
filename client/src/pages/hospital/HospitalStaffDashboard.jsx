import React, { useEffect, useState } from "react";
import { CalendarDays, FlaskConical, Pill, UsersRound } from "lucide-react";
import { getCurrentUser } from "../../lib/auth";
import { apiRequest } from "../../lib/api";

export default function HospitalStaffDashboard() {
  const user = getCurrentUser() || {};
  const role = String(user.role || "staff").toLowerCase();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ appointments: [], labs: [], pharmacy: [], staff: [] });
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [appointments, labs, pharmacy, staff] = await Promise.all([
          apiRequest("/hospital/appointments"),
          apiRequest("/hospital/laboratory"),
          apiRequest("/hospital/pharmacy"),
          apiRequest("/hospital/staff"),
        ]);
        if (active) setData({ appointments: appointments.data || [], labs: labs.data || [], pharmacy: pharmacy.data || [], staff: staff.data || [] });
      } finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, []);
  const title = role === "doctor" ? "Doctor Dashboard" : role === "nurse" ? "Nurse Dashboard" : role.includes("laboratory") ? "Laboratory Dashboard" : role === "pharmacist" ? "Pharmacy Dashboard" : role === "accountant" ? "Finance Dashboard" : "Hospital Staff Dashboard";
  const cards = role === "pharmacist" ? [["Pharmacy stock", data.pharmacy.length, Pill], ["Low stock", data.pharmacy.filter(x => Number(x.quantity) <= Number(x.reorder_level)).length, Pill], ["Appointments", data.appointments.length, CalendarDays]] : role.includes("laboratory") ? [["Pending tests", data.labs.filter(x => x.status === "pending").length, FlaskConical], ["Completed", data.labs.filter(x => x.status === "completed").length, FlaskConical], ["Total requests", data.labs.length, FlaskConical]] : [["Appointments", data.appointments.length, CalendarDays], ["Laboratory orders", data.labs.length, FlaskConical], ["Team", data.staff.length, UsersRound]];
  return <div className="space-y-6"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-600">{user.name || user.email}</p><h1 className="text-3xl font-black text-slate-950">{title}</h1><p className="mt-1 text-slate-500">Signed in with the role assigned by hospital management.</p></div><div className="grid gap-4 sm:grid-cols-3">{cards.map(([label,value,Icon])=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-blue-600"/><p className="mt-3 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{loading ? "…" : value}</p></div>)}</div><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-950">Your workspace</h2><p className="mt-1 text-sm text-slate-500">Your access is limited by your hospital role. Hospital management retains the full operational dashboard.</p></section></div>;
}
