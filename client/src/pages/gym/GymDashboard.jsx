import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Wallet, TrendingUp, Target, ArrowUpRight, CalendarDays, Sparkles, AlertTriangle } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest, formatMoney } from "../../lib/api";
import { getCurrentShop } from "../../lib/auth";
import { LoadingState, ErrorState } from "../../components/AsyncState";

const money = (value) => formatMoney(Math.round(Number(value || 0)));
const monthKey = (date) => new Date(date).toISOString().slice(0, 7);
const monthLabel = (key) => new Date(`${key}-01T00:00:00`).toLocaleDateString(undefined, { month: "short", year: "2-digit" });

function StatCard({ icon: Icon, label, value, hint, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-amber-50 text-amber-700",
    purple: "bg-violet-50 text-violet-700",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${colors[color] || colors.blue}`}><Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" /></div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      {hint && <p className="mt-1 text-xs font-medium text-slate-400">{hint}</p>}
    </div>
  );
}

function ChartCard({ title, subtitle, children, action }) {
  return <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg">
    <div className="mb-4 flex items-start justify-between gap-4"><div><h2 className="font-black text-slate-950">{title}</h2>{subtitle && <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>}</div>{action}</div>
    {children}
  </section>;
}

const tooltipStyle = { borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(15,23,42,.10)" };

export default function GymDashboard() {
  const navigate = useNavigate();
  const shop = getCurrentShop();
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [budget, setBudget] = useState(() => Number(localStorage.getItem("sahel_gym_monthly_budget") || 0));
  const [budgetInput, setBudgetInput] = useState(() => localStorage.getItem("sahel_gym_monthly_budget") || "");
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    (async () => {
      try {
        const [m, p] = await Promise.all([apiRequest("/gym/members"), apiRequest("/gym/payments")]);
        setMembers(m.data || []); setPayments(p.data || []); setStatus({ loading: false, error: "" });
      } catch (error) { setStatus({ loading: false, error: error.message }); }
    })();
  }, []);

  const activeMembers = useMemo(() => members.filter((m) => m.status !== "left" && m.status !== "inactive"), [members]);
  const paidMembers = useMemo(() => activeMembers.filter((m) => m.registration_paid_until && new Date(m.registration_paid_until) >= new Date()).length, [activeMembers]);
  const expiringSoon = useMemo(() => activeMembers.filter((m) => {
    if (!m.registration_paid_until) return true;
    const days = (new Date(m.registration_paid_until) - new Date()) / 86400000;
    return days >= 0 && days <= 30;
  }), [activeMembers]);

  const monthlyRevenue = useMemo(() => {
    const map = {};
    payments.forEach((p) => { if (!p.paid_at) return; const key = monthKey(p.paid_at); map[key] = (map[key] || 0) + Number(p.amount || 0); });
    const result = [];
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const key = monthKey(d); result.push({ key, month: monthLabel(key), revenue: Math.round(map[key] || 0) });
    }
    return result;
  }, [payments]);

  const analytics = useMemo(() => {
    const last3 = monthlyRevenue.slice(-3).map((x) => x.revenue);
    const last6 = monthlyRevenue.slice(-6).map((x) => x.revenue);
    const avg3 = last3.length ? last3.reduce((a, b) => a + b, 0) / last3.length : 0;
    const avg6 = last6.length ? last6.reduce((a, b) => a + b, 0) / last6.length : 0;
    const weights = [0.5, 0.3, 0.2];
    const weighted = last3.length ? last3.slice().reverse().reduce((sum, value, i) => sum + value * (weights[i] || 0), 0) : 0;
    const recentGrowth = avg6 > 0 ? ((avg3 - avg6) / avg6) : 0;
    const forecastRevenue = Math.max(0, weighted || avg3 || avg6);
    const avgRevenuePerActive = activeMembers.length ? forecastRevenue / activeMembers.length : 0;
    const expectedMembers = activeMembers.length ? Math.max(activeMembers.length, Math.round(activeMembers.length * (1 + Math.max(-0.15, Math.min(0.15, recentGrowth))))) : 0;
    const expectedRevenue = Math.max(forecastRevenue, expectedMembers * avgRevenuePerActive);
    const best = monthlyRevenue.reduce((a, b) => b.revenue > a.revenue ? b : a, { revenue: 0, month: "—" });
    const budgetGap = budget ? expectedRevenue - budget : 0;
    const budgetPct = budget ? Math.round((expectedRevenue / budget) * 100) : 0;
    const confidence = monthlyRevenue.filter((x) => x.revenue > 0).length >= 3 ? "High" : monthlyRevenue.some((x) => x.revenue > 0) ? "Medium" : "Low";
    return { avg3, avg6, recentGrowth, forecastRevenue, expectedMembers, expectedRevenue, best, budgetGap, budgetPct, confidence, avgRevenuePerActive };
  }, [monthlyRevenue, activeMembers.length, budget]);

  function saveBudget(e) {
    e.preventDefault();
    const value = Math.max(0, Number(budgetInput || 0));
    setBudget(value); localStorage.setItem("sahel_gym_monthly_budget", String(value));
  }

  if (status.loading) return <LoadingState variant="dashboard" />;
  if (status.error) return <ErrorState message={status.error} />;

  return <div className="space-y-6 motion-card">
    <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-xl lg:p-8">
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-400/20 blur-2xl" /><div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Gym forecasting command center</p><h1 className="mt-2 text-3xl font-black tracking-tight">{shop?.shop_name || "Your gym"}</h1><p className="mt-1 max-w-2xl text-sm font-medium text-blue-100/75">Plan next month from your real payment history — expected members, expected revenue, budget performance and your strongest month.</p></div><button onClick={() => navigate("/gym/members")} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold backdrop-blur transition hover:bg-white/20">View members <ArrowUpRight className="h-4 w-4" /></button></div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Users} label="Expected members next month" value={analytics.expectedMembers} hint={`${activeMembers.length} active now · ${paidMembers} paid`} color="blue" />
      <StatCard icon={TrendingUp} label="Expected revenue" value={money(analytics.expectedRevenue)} hint={`${analytics.confidence} forecast confidence`} color="green" />
      <StatCard icon={Target} label="Budget target" value={budget ? money(budget) : "Not set"} hint={budget ? `${analytics.budgetPct}% of budget forecast` : "Set a monthly target below"} color="orange" />
      <StatCard icon={CalendarDays} label="Best month" value={analytics.best.month} hint={analytics.best.revenue ? `${money(analytics.best.revenue)} revenue` : "Waiting for payment history"} color="purple" />
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <ChartCard title="Revenue forecast" subtitle="Actual revenue vs the forward forecast baseline">
        <div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={monthlyRevenue}>
          <defs><linearGradient id="forecastRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} /></linearGradient></defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={money} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [money(value), "Revenue"]} /><Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fill="url(#forecastRevenue)" animationDuration={1100} />
        </AreaChart></ResponsiveContainer></div>
      </ChartCard>

      <ChartCard title="Forecast summary" subtitle="Simple, explainable forecasting analytics">
        <div className="space-y-3">
          <div className="rounded-xl bg-blue-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Expected revenue</p><p className="mt-1 text-2xl font-black text-slate-950">{money(analytics.expectedRevenue)}</p><p className="mt-1 text-xs text-slate-500">Weighted average of the latest 3 months, adjusted for recent trend.</p></div>
          <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Revenue per active member</p><p className="mt-1 text-2xl font-black text-slate-950">{money(analytics.avgRevenuePerActive)}</p><p className="mt-1 text-xs text-slate-500">Useful for pricing and membership planning.</p></div>
          <div className="rounded-xl bg-violet-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-violet-600">Recent trend</p><p className="mt-1 text-2xl font-black text-slate-950">{analytics.recentGrowth >= 0 ? "+" : ""}{Math.round(analytics.recentGrowth * 100)}%</p><p className="mt-1 text-xs text-slate-500">Latest 3-month average vs latest 6-month average.</p></div>
        </div>
      </ChartCard>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <ChartCard title="Monthly performance" subtitle="See which months are strongest and where revenue is falling">
        <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyRevenue} barSize={28}><CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={money} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [money(value), "Revenue"]} /><Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[7, 7, 2, 2]} animationDuration={900} /></BarChart></ResponsiveContainer></div>
      </ChartCard>

      <ChartCard title="Budget & planning" subtitle="Set your monthly target and compare it with the forecast">
        <form onSubmit={saveBudget} className="space-y-3"><label className="block text-xs font-bold text-slate-500">Monthly revenue budget</label><div className="flex gap-2"><input className="field" type="number" min="0" step="1" placeholder="e.g. 5000" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} /><button className="btn-primary" type="submit">Save</button></div></form>
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-500">Forecast vs budget</span><span className={`text-sm font-black ${analytics.budgetGap >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{budget ? `${analytics.budgetGap >= 0 ? "+" : "-"}${money(Math.abs(analytics.budgetGap))}` : "—"}</span></div>{budget > 0 && <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600 transition-all duration-700" style={{ width: `${Math.min(100, analytics.budgetPct)}%` }} /></div>}<p className="mt-3 text-xs text-slate-500">{budget ? (analytics.budgetGap >= 0 ? "Forecast is above your target." : "Forecast is below your target — consider member retention or promotions.") : "Set a target to unlock budget variance analytics."}</p></div>
      </ChartCard>
    </div>

    <div className="grid gap-5 md:grid-cols-3">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5"><Sparkles className="h-5 w-5 text-blue-600" /><h3 className="mt-3 font-black">Best month</h3><p className="mt-1 text-sm text-slate-500">{analytics.best.month} generated {money(analytics.best.revenue)} — use it as a benchmark for future targets.</p></div>
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5"><TrendingUp className="h-5 w-5 text-emerald-600" /><h3 className="mt-3 font-black">Forecast method</h3><p className="mt-1 text-sm text-slate-500">Weighted 3-month revenue average with a capped recent-trend adjustment. Easy to understand and update as more data arrives.</p></div>
      <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5"><AlertTriangle className="h-5 w-5 text-amber-600" /><h3 className="mt-3 font-black">Renewal opportunity</h3><p className="mt-1 text-sm text-slate-500">{expiringSoon.length} active member{expiringSoon.length === 1 ? "" : "s"} have payment dates within 30 days. These are your immediate revenue opportunities.</p></div>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      {[{ label: "Members", path: "/gym/members", icon: Users }, { label: "Payments", path: "/gym/payments", icon: Wallet }, { label: "Check-ins", path: "/gym/checkins", icon: CalendarDays }].map(({ label, path, icon: Icon }) => <button key={path} onClick={() => navigate(path)} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"><span className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Icon className="h-5 w-5 transition-transform group-hover:scale-110" /></span><span className="font-bold text-slate-800">{label}</span><ArrowUpRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:text-blue-600" /></span></button>)}
    </div>
  </div>;
}
