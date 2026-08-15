import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, GraduationCap, AlertTriangle, ClipboardCheck, Wallet, ArrowUpRight, School } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest, formatMoney } from "../../lib/api";
import { getCurrentShop } from "../../lib/auth";
import { LoadingState, ErrorState } from "../../components/AsyncState";

const CHART_COLORS = ["#2563eb", "#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];
const tooltipStyle = { borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(15,23,42,.10)" };

function StatCard({ icon: Icon, label, value, hint, color = "blue" }) {
  const colors = {
    blue: "from-blue-500/15 to-indigo-500/5 text-blue-700",
    green: "from-emerald-500/15 to-cyan-500/5 text-emerald-700",
    orange: "from-amber-500/15 to-orange-500/5 text-amber-700",
    red: "from-rose-500/15 to-red-500/5 text-rose-700",
  };
  return <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"><div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${colors[color] || colors.blue}`}><Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" /></div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{value}</p>{hint && <p className="mt-1 text-xs font-medium text-slate-400">{hint}</p>}<div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100/60 transition-transform duration-500 group-hover:scale-150" /></div>;
}

function ChartCard({ title, subtitle, children, className = "" }) {
  return <section className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg ${className}`}><div className="mb-4"><h2 className="font-black text-slate-950">{title}</h2>{subtitle && <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>}</div>{children}</section>;
}

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const shop = getCurrentShop();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [unpaidStudents, setUnpaidStudents] = useState([]);
  const [unpaidTeachers, setUnpaidTeachers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    (async () => {
      try {
        const [s, c, t, us, ut, p] = await Promise.all([
          apiRequest("/school/students"),
          apiRequest("/school/classes"),
          apiRequest("/school/teachers"),
          apiRequest("/school/fee-payments/unpaid"),
          apiRequest("/school/salary-payments/unpaid"),
          apiRequest("/school/fee-payments"),
        ]);
        setStudents(s.data || []);
        setClasses(c.data || []);
        setTeachers(t.data || []);
        setUnpaidStudents(us.data || []);
        setUnpaidTeachers(ut.data || []);
        setPayments(p.data || []);
        setStatus({ loading: false, error: "" });
      } catch (error) {
        setStatus({ loading: false, error: error.message });
      }
    })();
  }, []);

  const activeStudents = useMemo(() => students.filter((s) => s.status === "active"), [students]);
  const activeTeachers = useMemo(() => teachers.filter((t) => t.status === "active").length, [teachers]);

  const genderData = useMemo(() => [
    { name: "Boys", value: activeStudents.filter((s) => s.gender === "male").length },
    { name: "Girls", value: activeStudents.filter((s) => s.gender === "female").length },
  ].filter((x) => x.value > 0), [activeStudents]);

  const classData = useMemo(() => classes.map((c) => ({
    name: c.name || c.class_name || "Class",
    students: activeStudents.filter((s) => String(s.class_id || "") === String(c.id || "") || s.class_name === c.name).length,
  })).slice(0, 8), [classes, activeStudents]);

  const revenueTrend = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      result.push({ month: d.toLocaleDateString(undefined, { month: "short" }), revenue: payments.filter((p) => p.paid_at?.slice(0, 7) === key).reduce((sum, p) => sum + Number(p.amount || 0), 0) });
    }
    return result;
  }, [payments]);

  const financeMix = useMemo(() => [
    { name: "Paid", value: Math.max(activeStudents.length - unpaidStudents.length, 0) },
    { name: "Unpaid", value: unpaidStudents.length },
  ].filter((x) => x.value > 0), [activeStudents.length, unpaidStudents.length]);

  const monthRevenue = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7);
    return payments.filter((p) => p.paid_at?.slice(0, 7) === month).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  if (status.loading) return <LoadingState variant="dashboard" />;
  if (status.error) return <ErrorState message={status.error} />;

  return <div className="space-y-6 motion-card">
    <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 p-6 text-white shadow-xl shadow-indigo-950/15 lg:p-8">
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-indigo-400/20 blur-2xl" /><div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">School command center</p><h1 className="mt-2 text-3xl font-black tracking-tight">{shop?.shop_name || "Your school"}</h1><p className="mt-1 text-sm font-medium text-indigo-100/75">{shop?.location || "Monitor students, teachers, classes and school finances."}</p></div><button onClick={() => navigate("/school/students")} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold backdrop-blur transition hover:bg-white/20">View students <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></button></div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Users} label="Active students" value={activeStudents.length} hint={`${genderData.find((x) => x.name === "Boys")?.value || 0} boys · ${genderData.find((x) => x.name === "Girls")?.value || 0} girls`} />
      <StatCard icon={BookOpen} label="Classes" value={classes.length} hint="Active school classes" color="green" />
      <StatCard icon={GraduationCap} label="Teachers" value={activeTeachers} hint="Active teaching staff" color="orange" />
      <StatCard icon={AlertTriangle} label="Unpaid this month" value={unpaidStudents.length} hint="Students needing follow-up" color="red" />
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <ChartCard title="Students by class" subtitle="Enrollment distribution across your classes"><div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={classData} barSize={28}><CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} /><Tooltip cursor={{ fill: "#eef2ff" }} contentStyle={tooltipStyle} /><Bar dataKey="students" name="Students" radius={[8, 8, 3, 3]} fill="#4f46e5" animationDuration={900} /></BarChart></ResponsiveContainer></div></ChartCard>
      <ChartCard title="Student mix" subtitle="Active students by gender"><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={64} outerRadius={92} paddingAngle={4} animationDuration={900}>{genderData.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer></div><div className="flex justify-center gap-5 text-xs font-bold text-slate-500">{genderData.map((item, index) => <span key={item.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[index] }} />{item.name}: {item.value}</span>)}</div></ChartCard>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <ChartCard title="Fee revenue trend" subtitle="Collected school fees over the last 6 months"><div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueTrend}><defs><linearGradient id="schoolRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4f46e5" stopOpacity={0.28} /><stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => formatMoney(v)} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatMoney(value), "Revenue"]} /><Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fill="url(#schoolRevenue)" animationDuration={1100} /></AreaChart></ResponsiveContainer></div></ChartCard>
      <ChartCard title="Fee collection status" subtitle="Paid vs unpaid students"><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={financeMix} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={64} outerRadius={92} paddingAngle={4} animationDuration={900}><Cell fill="#10b981" /><Cell fill="#ef4444" /></Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer></div><div className="flex justify-center gap-5 text-xs font-bold text-slate-500"><span>Collected this month: {formatMoney(monthRevenue)}</span></div></ChartCard>
    </div>

    {(unpaidStudents.length > 0 || unpaidTeachers.length > 0) && <div className="grid gap-5 lg:grid-cols-2">
      {unpaidStudents.length > 0 && <div className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-white p-5 shadow-sm"><h2 className="mb-3 font-black text-slate-950">Students needing payment</h2><div className="flex flex-wrap gap-2">{unpaidStudents.slice(0, 10).map((s) => <span key={s.id} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-rose-700 shadow-sm ring-1 ring-rose-100">{s.name} — {formatMoney(s.monthly_fee)}</span>)}</div><button className="btn-secondary mt-4" onClick={() => navigate("/school/fees")}>Go to Fees</button></div>}
      {unpaidTeachers.length > 0 && <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 via-white to-white p-5 shadow-sm"><h2 className="mb-3 font-black text-slate-950">Teachers awaiting salary</h2><div className="flex flex-wrap gap-2">{unpaidTeachers.slice(0, 10).map((t) => <span key={t.id} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-amber-700 shadow-sm ring-1 ring-amber-100">{t.name} — {formatMoney(t.monthly_salary)}</span>)}</div><button className="btn-secondary mt-4" onClick={() => navigate("/school/teachers")}>Go to Teachers</button></div>}
    </div>}

    <div className="grid gap-3 sm:grid-cols-3">{[
      { label: "Classes", path: "/school/classes", icon: BookOpen },
      { label: "Students", path: "/school/students", icon: Users },
      { label: "Exams", path: "/school/exams", icon: ClipboardCheck },
    ].map(({ label, path, icon: Icon }) => <button key={path} onClick={() => navigate(path)} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"><span className="flex items-center gap-3"><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Icon className="h-5 w-5 transition-transform group-hover:scale-110" /></span><span className="font-bold text-slate-800">{label}</span><ArrowUpRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:text-indigo-600" /></span></button>)}</div>
  </div>;
}
