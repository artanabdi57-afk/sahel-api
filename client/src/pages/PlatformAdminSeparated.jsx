import React, { useEffect, useMemo, useState } from "react";
import { Building2, Download, Eye, LogOut, RefreshCw, Search, Shield, UserCheck, UserMinus, X } from "lucide-react";
import { apiRequest } from "../lib/api.js";

const SESSION_KEY = "sahel_platform_admin_session";
const TYPES = [
  ["shop", "Shop"],
  ["gym", "Gym"],
  ["school", "School"],
  ["hospital", "Hospital"],
];
const money = n => `$${new Intl.NumberFormat().format(Math.round(Number(n || 0)))}`;
const date = v => v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const Card = ({ children }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{children}</div>;

export default function PlatformAdminSeparated() {
  const [session, setSession] = useState(() => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } });
  const [username, setUsername] = useState(""); const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(""); const [loading, setLoading] = useState(false);
  const [type, setType] = useState("shop"); const [data, setData] = useState({ totals: {}, users: [] });
  const [search, setSearch] = useState(""); const [selected, setSelected] = useState(null); const [notice, setNotice] = useState("");

  async function login(e) {
    e.preventDefault(); setLoading(true); setLoginError("");
    try { const r = await apiRequest("/admin/session", { method: "POST", body: JSON.stringify({ username, password }) }); localStorage.setItem(SESSION_KEY, JSON.stringify(r.data)); setSession(r.data); }
    catch (e) { setLoginError(e.message); } finally { setLoading(false); }
  }
  async function load() {
    if (!session?.token) return; setLoading(true);
    try { const r = await apiRequest(`/admin/overview?business_type=${type}`, { headers: { Authorization: `Bearer ${session.token}` } }); setData(r.data || { totals: {}, users: [] }); }
    catch (e) { if (/expired|invalid|authentication/i.test(e.message)) { localStorage.removeItem(SESSION_KEY); setSession(null); } setNotice(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [session, type]);
  const users = useMemo(() => { const q = search.trim().toLowerCase(); return (data.users || []).filter(r => !q || [r.shop_name,r.owner_name,r.owner_email,r.phone,r.location].some(v => String(v || "").toLowerCase().includes(q))); }, [data.users, search]);
  async function status(row, value) { try { await apiRequest(`/admin/shops/${row.id}/status`, { method: "PUT", headers: { Authorization: `Bearer ${session.token}` }, body: JSON.stringify({ status: value }) }); setNotice(`${row.shop_name || "Account"} is now ${value}.`); load(); } catch(e) { setNotice(e.message); } }
  function exportCsv() { const cols=["business_type","shop_name","owner_name","owner_email","phone","location","status","plan","created_at","hear_about","main_problem"]; const rows=users.map(r=>cols.map(c=>c==="hear_about"?r.collected?.hear_about:c==="main_problem"?r.collected?.main_problem:r[c])); const csv=[cols,...rows].map(row=>row.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n"); const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download=`sahel-${type}-users.csv`; a.click(); }

  if (!session) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5"><Card><div className="w-full max-w-md text-center"><div className="mx-auto h-14 w-14 rounded-2xl bg-slate-950 text-white grid place-items-center"><Shield /></div><h1 className="mt-4 text-2xl font-black">Sahel Platform Admin</h1><p className="mt-1 text-sm text-slate-500">Platform admin only — separate from customer accounts.</p><form onSubmit={login} className="mt-6 space-y-3 text-left"><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Admin username" className="h-12 w-full rounded-xl border px-4" required/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Admin password" className="h-12 w-full rounded-xl border px-4" required/>{loginError&&<p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{loginError}</p>}<button className="h-12 w-full rounded-xl bg-slate-950 text-white font-black">{loading?"Signing in…":"Sign in"}</button></form></div></Card></div>;

  const t=data.totals||{}; const label=TYPES.find(x=>x[0]===type)?.[1]||type;
  return <div className="min-h-screen bg-slate-50 text-slate-900"><header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4"><div><p className="text-xs font-black uppercase tracking-widest text-blue-600">Sahel Platform</p><h1 className="text-xl font-black">Super Admin · {label}</h1></div><button onClick={()=>{localStorage.removeItem(SESSION_KEY);setSession(null)}} className="rounded-xl border p-2"><LogOut className="h-4 w-4"/></button></div></header>
    <main className="mx-auto max-w-[1500px] space-y-5 p-5">
      <div><h2 className="text-2xl font-black">Choose management</h2><p className="mt-1 text-sm font-semibold text-slate-500">Only the selected business type is shown. Nothing is mixed together.</p></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{TYPES.map(([key,name])=><button key={key} onClick={()=>{setType(key);setSearch("");setSelected(null)}} className={`rounded-2xl border p-5 text-left transition ${type===key?"border-blue-600 bg-blue-600 text-white shadow-lg":"border-slate-200 bg-white hover:border-blue-300"}`}><Building2 className="h-5 w-5"/><p className="mt-3 text-lg font-black">{name}</p><p className={`text-xs font-bold ${type===key?"text-blue-100":"text-slate-400"}`}>{type===key?(t.accounts||0):"Select to view"}</p></button>)}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Card><p className="text-xs font-black uppercase text-slate-400">{label} accounts</p><p className="mt-2 text-3xl font-black">{t.accounts||0}</p></Card><Card><p className="text-xs font-black uppercase text-slate-400">Active</p><p className="mt-2 text-3xl font-black">{t.active||0}</p></Card><Card><p className="text-xs font-black uppercase text-slate-400">Suspended</p><p className="mt-2 text-3xl font-black">{t.suspended||0}</p></Card><Card><p className="text-xs font-black uppercase text-slate-400">Revenue</p><p className="mt-2 text-3xl font-black">{money(t.revenue)}</p></Card><Card><p className="text-xs font-black uppercase text-slate-400">Expenses</p><p className="mt-2 text-3xl font-black">{money(t.expenses)}</p></Card></div>
      <Card><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h3 className="text-lg font-black">{label} users only</h3><p className="text-xs font-semibold text-slate-500">Business, owner, contact, plan and collected onboarding data.</p></div><div className="flex gap-2"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${label.toLowerCase()} users…`} className="h-10 w-72 rounded-xl border pl-9 pr-3 text-sm"/></div><button onClick={load} className="rounded-xl border p-2.5"><RefreshCw className={loading?"animate-spin":""}/></button><button onClick={exportCsv} className="rounded-xl bg-blue-600 px-4 text-sm font-black text-white"><Download className="inline h-4 w-4 mr-1"/>Export</button></div></div>
      {notice&&<div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm font-bold text-blue-700">{notice}</div>}
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[1000px] text-left"><thead><tr className="border-b text-[10px] uppercase tracking-widest text-slate-400"><th className="p-3">Business</th><th className="p-3">Owner</th><th className="p-3">Contact</th><th className="p-3">Plan</th><th className="p-3">Usage</th><th className="p-3">Status</th><th className="p-3">Data</th></tr></thead><tbody>{users.map(r=><tr key={r.id} className="border-b hover:bg-slate-50"><td className="p-3"><b>{r.shop_name||"—"}</b><div className="text-xs text-slate-400">Joined {date(r.created_at)}</div></td><td className="p-3"><b>{r.owner_name}</b><div className="text-xs text-slate-500">{r.owner_email}</div></td><td className="p-3 text-sm">{r.phone||"—"}<div className="text-xs text-slate-400">{r.location||"—"}</div></td><td className="p-3"><b className="capitalize">{r.plan}</b></td><td className="p-3 text-xs font-bold">{r.usage?.products||0} products · {r.usage?.sales||0} sales<br/>{money(r.usage?.revenue)}</td><td className="p-3"><button onClick={()=>status(r,r.status==="active"?"suspended":"active")} className={r.status==="active"?"text-green-700":"text-red-700"}>{r.status==="active"?<><UserCheck className="inline h-4 w-4"/> Active</>:<><UserMinus className="inline h-4 w-4"/> Suspended</>}</button></td><td className="p-3"><button onClick={()=>setSelected(r)} className="rounded-lg border p-2"><Eye className="h-4 w-4"/></button></td></tr>)}</tbody></table>{!users.length&&<div className="py-12 text-center text-sm font-semibold text-slate-400">No {label.toLowerCase()} users found.</div>}</div></Card>
      {selected&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={()=>setSelected(null)}><div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6" onClick={e=>e.stopPropagation()}><div className="flex justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-blue-600">{label} user data</p><h3 className="text-2xl font-black">{selected.shop_name}</h3></div><button onClick={()=>setSelected(null)}><X/></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{Object.entries(selected.collected||{}).map(([k,v])=><div className="rounded-xl bg-slate-50 p-4" key={k}><p className="text-[10px] font-black uppercase text-slate-400">{k.replaceAll("_"," ")}</p><p className="mt-1 text-sm font-bold break-words">{v||"Not provided"}</p></div>)}</div></div></div>}
    </main></div>;
}
