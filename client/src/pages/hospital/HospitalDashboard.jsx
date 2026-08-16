import React from "react";
import { Activity, BedDouble, CalendarDays, ClipboardList, DollarSign, Pill, Stethoscope, Users } from "lucide-react";

const stats = [
  ["Patients today", "47", "+12%", Users],
  ["Appointments", "32", "8 waiting", CalendarDays],
  ["Doctors on duty", "18/21", "3 away", Stethoscope],
  ["Beds occupied", "34/50", "68%", BedDouble],
  ["Today's revenue", "$4,850", "+9%", DollarSign],
  ["Pending lab tests", "12", "5 urgent", ClipboardList],
  ["Low stock items", "7", "Needs action", Pill],
  ["Emergency cases", "8", "2 critical", Activity],
];

const departments = [
  ["Outpatient", 128, 34], ["Emergency", 46, 12], ["Pediatrics", 73, 19],
  ["Maternity", 41, 9], ["Surgery", 24, 7], ["Internal Medicine", 62, 15],
];

export default function HospitalDashboard() {
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-600">Hospital workspace</p><h1 className="text-3xl font-black tracking-tight text-slate-950">Hospital overview</h1><p className="mt-1 text-slate-500">A live operational view for authorized management users.</p></div>
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">Sunday, 16 August 2026</div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label,value,meta,Icon]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-xs font-bold text-emerald-600">{meta}</p></div><div className="rounded-xl bg-blue-50 p-3 text-blue-700"><Icon className="h-5 w-5"/></div></div></div>)}</div>
    <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-black text-slate-950">Patient activity</h2><p className="text-sm text-slate-500">Visits by department today</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Live</span></div><div className="space-y-4">{departments.map(([name,visits,waiting]) => <div key={name}><div className="mb-1 flex justify-between text-sm"><span className="font-bold text-slate-700">{name}</span><span className="font-semibold text-slate-500">{visits} visits · {waiting} waiting</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{width:`${Math.min(100,visits/1.4)}%`}}/></div></div>)}</div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-950">Doctor status</h2><p className="mb-5 text-sm text-slate-500">Attendance and appointment readiness</p><div className="space-y-3">{[["Dr. Ahmed Ali","Ophthalmology","On duty","08:04"],["Dr. Maryan Hassan","Pediatrics","With patient","07:52"],["Dr. Omar Yusuf","Surgery","Off duty","—"],["Dr. Asha Noor","Emergency","On duty","06:48"]].map(([n,d,s,t])=><div key={n} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="text-sm font-bold text-slate-800">{n}</p><p className="text-xs text-slate-500">{d}</p></div><div className="text-right"><p className={`text-xs font-black ${s==='On duty'?'text-emerald-600':s==='Off duty'?'text-slate-400':'text-amber-600'}`}>{s}</p><p className="text-[11px] text-slate-400">{t}</p></div></div>)}</div></section>
    </div>
  </div>;
}
