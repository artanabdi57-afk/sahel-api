import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, Wallet, AlertTriangle, Dumbbell, ArrowUpRight, CalendarDays } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest, formatMoney } from "../../lib/api";
import { getCurrentShop } from "../../lib/auth";
import { LoadingState, ErrorState } from "../../components/AsyncState";

const CHART_COLORS = ["#2563eb", "#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];
const money = (value) => formatMoney(value);

function StatCard({ icon: Icon, label, value, hint, color = "blue" }) {
  const colors = {
    blue: "from-blue-500/15 to-indigo-500/5 text-blue-700",
    green: "from-emerald-500/15 to-cyan-500/5 text-emerald-700",
    orange: "from-amber-500/15 to-orange-500/5 text-amber-700",
    red: "from-rose-500/15 to-red-500/5 text-rose-700",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${colors[color] || colors.blue}`}>
        <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
      </div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      {hint && <p className="mt-1 text-xs font-medium text-slate-400">{hint}</p>}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100/60 transition-transform duration-500 group-hover:scale-150" />
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-black text-slate-950">{title}</h2>
          {subtitle && <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

const tooltipStyle = { borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(15,23,42,.10)" };

export default function GymDashboard() {
  const navigate = useNavigate();
  const shop = getCurrentShop();
  const [members, setMembers] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    (async () => {
      try {
        const [m, c, p] = await Promise.all([
          apiRequest("/gym/members"),
          apiRequest("/gym/checkins?limit=400"),
          apiRequest("/gym/payments"),
        ]);
        setMembers(m.data || []);
        setCheckins(c.data || []);
        setPayments(p.data || []);
        setStatus({ loading: false, error: "" });
      } catch (error) {
        setStatus({ loading: false, error: error.message });
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const active = members.filter((m) => m.status === "active");
    const men = active.filter((m) => m.gender === "male").length;
    const women = active.filter((m) => m.gender === "female").length;
    const today = new Date().toISOString().slice(0, 10);
    const todaysCheckins = checkins.filter((c) => c.checked_in_at?.slice(0, 10) === today).length;
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthRevenue = payments.filter((p) => p.paid_at?.slice(0, 7) === thisMonth).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const expiringSoon = active.filter((m) => {
      if (!m.registration_paid_until) return true;
      const days = (new Date(m.registration_paid_until) - new Date()) / 86400000;
      return days <= 7;
    });
    return { total: active.length, men, women, todaysCheckins, monthRevenue, expiringSoon };
  }, [members, checkins, payments]);

  const weeklyCheckins = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ day: d.toLocaleDateString(undefined, { weekday: "short" }), checkins: checkins.filter((c) => c.checked_in_at?.slice(0, 10) === key).length });
    }
    return result;
  }, [checkins]);

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

  const genderData = useMemo(() => [
    { name: "Men", value: stats.men },
    { name: "Women", value: stats.women },
  ].filter((x) => x.value > 0), [stats]);

  if (status.loading) return <LoadingState variant="dashboard" />;
  if (status.error) return <ErrorState message={status.error} />;

  return (
    <div className="space-y-6 motion-card">
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-xl shadow-blue-950/15 lg:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-400/20 blur-2xl" />
        <div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Gym command center</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{shop?.shop_name || "Your gym"}</h1>
            <p className="mt-1 text-sm font-medium text-blue-100/75">{shop?.location || "Manage your members, attendance and revenue in one place."}</p>
          </div>
          <button onClick={() => navigate("/gym/members")} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold backdrop-blur transition hover:bg-white/20">
            View members <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Active members" value={stats.total} hint={`${stats.men} men · ${stats.women} women`} />
        <StatCard icon={UserCheck} label="Checked in today" value={stats.todaysCheckins} hint="Live attendance pulse" color="green" />
        <StatCard icon={Wallet} label="This month's revenue" value={money(stats.monthRevenue)} hint="Recorded payments" color="orange" />
        <StatCard icon={AlertTriangle} label="Expiring within 7 days" value={stats.expiringSoon.length} hint="Members needing follow-up" color="red" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard title="Attendance activity" subtitle="Daily check-ins for the last 7 days">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyCheckins} barSize={30}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip cursor={{ fill: "#eff6ff" }} contentStyle={tooltipStyle} />
                <Bar dataKey="checkins" name="Check-ins" radius={[8, 8, 3, 3]} fill="#2563eb" animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Member mix" subtitle="Active members by gender">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={68} outerRadius={98} paddingAngle={4} animationDuration={900}>
                  {genderData.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-5 text-xs font-bold text-slate-500">
            {genderData.map((item, index) => <span key={item.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[index] }} />{item.name}: {item.value}</span>)}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Revenue trend" subtitle="Payment revenue across the last 6 months">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <defs><linearGradient id="gymRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => money(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [money(value), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fill="url(#gymRevenue)" animationDuration={1100} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {stats.expiringSoon.length > 0 && (
        <div className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-rose-500" /><h2 className="font-black text-slate-950">Needs attention</h2></div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {stats.expiringSoon.slice(0, 8).map((m) => <div key={m.id} className="rounded-xl bg-white px-3 py-2.5 text-sm shadow-sm ring-1 ring-rose-100"><p className="font-bold text-slate-800">{m.name}</p><p className="mt-0.5 text-xs font-medium text-rose-600">{m.registration_paid_until ? `Due ${new Date(m.registration_paid_until).toLocaleDateString()}` : "No payment on record"}</p></div>)}
          </div>
          <button className="btn-secondary mt-4" onClick={() => navigate("/gym/payments")}>Record a payment</button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Members", path: "/gym/members", icon: Users },
          { label: "Check-ins", path: "/gym/checkins", icon: UserCheck },
          { label: "Staff", path: "/gym/staff", icon: Dumbbell },
        ].map(({ label, path, icon: Icon }) => <button key={path} onClick={() => navigate(path)} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"><span className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Icon className="h-5 w-5 transition-transform group-hover:scale-110" /></span><span className="font-bold text-slate-800">{label}</span><ArrowUpRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:text-blue-600" /></span></button>)}
      </div>
    </div>
  );
}
