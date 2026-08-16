import React, { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Building2, CheckCircle2, Download, Eye, Lock, LogOut, RefreshCw, Search, Shield, UserCheck, UserMinus, Users, XCircle } from "lucide-react";
import { apiRequest } from "../lib/api.js";

const SESSION_KEY = "sahel_platform_admin_session";
const TYPES = [
  ["all", "All accounts"],
  ["shop", "Shop management"],
  ["gym", "Gym management"],
  ["school", "School management"],
  ["hospital", "Hospital management"],
];

function money(value) { return `$${new Intl.NumberFormat().format(Math.round(Number(value || 0)))}`; }
function date(value) { return value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"; }

function Card({ children, className = "" }) { return <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>; }
function Stat({ label, value, sub }) { return <Card><p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p><p className="mt-2 text-3xl font-black text-slate-950">{value}</p>{sub && <p className="mt-1 text-xs font-semibold text-slate-400">{sub}</p>}</Card>; }

export default function PlatformAdmin() {
  const [session, setSession] = useState(() => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ totals: {}, by_type: {}, users: [] });
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");

  async function login(event) {
    event.preventDefault(); setLoading(true); setLoginError("");
    try {
      const result = await apiRequest("/admin/session", { method: "POST", body: JSON.stringify({ username, password }) });
      localStorage.setItem(SESSION_KEY, JSON.stringify(result.data));
      setSession(result.data);
    } catch (error) { setLoginError(error.message); }
    finally { setLoading(false); }
  }

  async function load() {
    if (!session?.token) return;
    setLoading(true);
    try {
      const query = type === "all" ? "" : `?business_type=${encodeURIComponent(type)}`;
      const result = await apiRequest(`/admin/overview${query}`, { headers: { Authorization: `Bearer ${session.token}` } });
      setData(result.data || { totals: {}, by_type: {}, users: [] });
    } catch (error) {
      if (/expired|invalid|authentication/i.test(error.message)) { localStorage.removeItem(SESSION_KEY); setSession(null); }
      setNotice(error.message);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [session, type]);

  const users = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data.users || []).filter(row => !q || [row.shop_name, row.owner_name, row.owner_email, row.phone, row.location, row.business_type, row.collected?.hear_about, row.collected?.main_problem].some(v => String(v || "").toLowerCase().includes(q)));
  }, [data.users, search]);

  async function changeStatus(row, status) {
    try {
      await apiRequest(`/admin/shops/${row.id}/status`, { method: "PUT", headers: { Authorization: `Bearer ${session.token}` }, body: JSON.stringify({ status }) });
      setNotice(`${row.shop_name || "Account"} is now ${status}.`); await load();
    } catch (error) { setNotice(error.message); }
  }

  function exportCsv() {
    const columns = ["business_type","shop_name","owner_name","owner_email","phone","location","status","plan","created_at","hear_about","main_problem","products","sales","revenue","expenses_total"];
    const rows = users.map(r => columns.map(c => c === "hear_about" ? r.collected?.hear_about : c === "main_problem" ? r.collected?.main_problem : ["products","sales","revenue","expenses_total"].includes(c) ? r.usage?.[c] : r[c]));
    const csv = [columns, ...rows].map(row => row.map(v => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `sahel-${type}-user-data.csv`; a.click(); URL.revokeObjectURL(url);
  }

  if (!session) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-7"><div className="mx-auto h-16 w-16 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-xl"><Shield className="h-8 w-8" /></div><h1 className="mt-4 text-2xl font-black text-slate-950">Sahel Platform Admin</h1><p className="mt-1 text-sm font-semibold text-slate-500">Separate from shop, gym, school and hospital accounts.</p></div>
        <Card>
          <form onSubmit={login} className="space-y-4">
            <label className="block"><span className="text-xs font-black uppercase tracking-wide text-slate-500">Admin username</span><input value={username} onChange={e => setUsername(e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500" required /></label>
            <label className="block"><span className="text-xs font-black uppercase tracking-wide text-slate-500">Admin password</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500" required /></label>
            {loginError && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{loginError}</div>}
            <button disabled={loading} className="h-12 w-full rounded-xl bg-slate-950 text-white font-black disabled:opacity-60">{loading ? "Signing in…" : "Sign in to Platform Admin"}</button>
          </form>
        </Card>
      </div>
    </div>
  );

  const totals = data.totals || {};
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4"><div><p className="text-xs font-black uppercase tracking-widest text-blue-600">Sahel Platform</p><h1 className="text-xl font-black">Super Admin Control Center</h1></div><div className="flex items-center gap-2"><span className="hidden sm:inline text-xs font-bold text-slate-500">{session.username} · Super Admin</span><button onClick={() => { localStorage.removeItem(SESSION_KEY); setSession(null); }} className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50" title="Sign out"><LogOut className="h-4 w-4" /></button></div></div></header>
      <main className="mx-auto max-w-[1500px] space-y-6 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-2xl font-black">Platform overview</h2><p className="mt-1 text-sm font-semibold text-slate-500">Manage each business type separately and inspect the onboarding data collected from owners.</p></div><div className="flex gap-2"><button onClick={load} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black flex items-center gap-2"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button><button onClick={exportCsv} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white flex items-center gap-2"><Download className="h-4 w-4" />Export data</button></div></div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">{TYPES.slice(1).map(([key,label]) => <button key={key} onClick={() => setType(key)} className={`rounded-2xl border p-4 text-left ${type === key ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}><p className="text-xs font-black text-slate-500">{label}</p><p className="mt-2 text-2xl font-black">{data.by_type?.[key] ?? 0}</p></button>)}<button onClick={() => setType("all")} className={`rounded-2xl border p-4 text-left ${type === "all" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white"}`}><p className="text-xs font-black opacity-70">All accounts</p><p className="mt-2 text-2xl font-black">{Object.values(data.by_type || {}).reduce((a,b)=>a+Number(b||0),0)}</p></button></div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Stat label="Accounts" value={totals.accounts || 0} sub="selected business type" /><Stat label="Active" value={totals.active || 0} /><Stat label="Suspended" value={totals.suspended || 0} /><Stat label="Revenue" value={money(totals.revenue)} /><Stat label="Expenses" value={money(totals.expenses)} /></div>

        <div className="grid gap-4 lg:grid-cols-3"><Card><div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-blue-600" /><div><p className="font-black">Business separation</p><p className="text-xs font-semibold text-slate-500">Each type has its own management population.</p></div></div><div className="mt-4 space-y-2">{TYPES.slice(1).map(([key,label]) => <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span className="text-sm font-bold">{label}</span><span className="font-black">{data.by_type?.[key] || 0}</span></div>)}</div></Card><Card><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-green-600" /><div><p className="font-black">Usage</p><p className="text-xs font-semibold text-slate-500">Across the selected accounts.</p></div></div><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-2xl font-black">{totals.products || 0}</p><p className="text-xs font-bold text-slate-400">Products</p></div><div><p className="text-2xl font-black">{totals.sales || 0}</p><p className="text-xs font-bold text-slate-400">Sales</p></div></div></Card><Card><div className="flex items-center gap-3"><Activity className="h-5 w-5 text-purple-600" /><div><p className="font-black">Admin powers</p><p className="text-xs font-semibold text-slate-500">Server-authorized controls.</p></div></div><ul className="mt-4 space-y-2 text-sm font-semibold text-slate-600"><li>• Suspend / reactivate accounts</li><li>• Reset customer passwords</li><li>• Edit business information</li><li>• View collected onboarding data</li><li>• Export filtered data</li></ul></Card></div>

        <Card><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="text-lg font-black">{TYPES.find(x => x[0] === type)?.[1]}</h3><p className="text-xs font-semibold text-slate-500">Email, phone, business type, location, plan, onboarding answers and usage.</p></div><div className="relative w-full lg:w-96"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search owner, business, email, phone…" className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500" /></div></div>
          {notice && <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">{notice}</div>}
          <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[1100px] text-left"><thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400"><th className="px-3 py-3">Business</th><th className="px-3 py-3">Owner / Contact</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Plan</th><th className="px-3 py-3">Usage</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th></tr></thead><tbody>{users.map(row => <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50"><td className="px-3 py-4"><p className="font-black">{row.shop_name || "—"}</p><p className="text-xs text-slate-400">Joined {date(row.created_at)}</p></td><td className="px-3 py-4"><p className="text-sm font-bold">{row.owner_name}</p><p className="text-xs text-slate-500">{row.owner_email}</p><p className="text-xs text-slate-400">{row.phone || "No phone"}</p></td><td className="px-3 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black capitalize">{row.business_type}</span></td><td className="px-3 py-4"><p className="font-bold capitalize">{row.plan}</p><p className="text-xs text-slate-400">{date(row.plan_expiry)}</p></td><td className="px-3 py-4 text-xs font-bold text-slate-500">{row.usage?.products || 0} products · {row.usage?.sales || 0} sales<br />{money(row.usage?.revenue)} revenue</td><td className="px-3 py-4">{row.status === "active" ? <span className="inline-flex items-center gap-1 text-xs font-black text-green-700"><CheckCircle2 className="h-4 w-4" />Active</span> : <span className="inline-flex items-center gap-1 text-xs font-black text-rose-700"><XCircle className="h-4 w-4" />Suspended</span>}</td><td className="px-3 py-4"><div className="flex gap-1"><button onClick={() => setSelected(row)} className="rounded-lg border border-slate-200 p-2" title="View collected data"><Eye className="h-4 w-4" /></button>{row.status === "active" ? <button onClick={() => changeStatus(row,"suspended")} className="rounded-lg border border-rose-200 p-2 text-rose-600" title="Suspend"><UserMinus className="h-4 w-4" /></button> : <button onClick={() => changeStatus(row,"active")} className="rounded-lg border border-green-200 p-2 text-green-600" title="Reactivate"><UserCheck className="h-4 w-4" /></button>}</div></td></tr>)}</tbody></table>{!users.length && <div className="py-12 text-center text-sm font-semibold text-slate-400">No accounts match this filter.</div>}</div>
        </Card>

        {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setSelected(null)}><div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-blue-600">Collected user data</p><h3 className="mt-1 text-2xl font-black">{selected.shop_name}</h3></div><button onClick={() => setSelected(null)} className="rounded-xl border border-slate-200 p-2">×</button></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{Object.entries(selected.collected || {}).map(([key,value]) => <div key={key} className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{key.replaceAll("_"," ")}</p><p className="mt-1 text-sm font-bold text-slate-800 break-words">{value || "Not provided"}</p></div>)}</div><div className="mt-5 rounded-xl bg-blue-50 p-4"><p className="text-xs font-black uppercase tracking-widest text-blue-600">Usage</p><p className="mt-2 text-sm font-bold">{selected.usage?.products || 0} products · {selected.usage?.sales || 0} sales · {money(selected.usage?.revenue)} revenue · {money(selected.usage?.expenses_total)} expenses</p></div></div></div>}
      </main>
    </div>
  );
}
