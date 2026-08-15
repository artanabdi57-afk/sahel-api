import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, DollarSign, Filter, Users, UserRound, UserRoundX } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/AsyncState";

const filters = [
  { key: "all", label: "All members", icon: Users },
  { key: "male", label: "Male", icon: UserRound },
  { key: "female", label: "Female", icon: UserRound },
  { key: "paid", label: "Paid", icon: DollarSign },
  { key: "unpaid", label: "Unpaid", icon: CreditCard },
  { key: "left", label: "Left", icon: UserRoundX },
];

export default function GymMembers() {
  const [members, setMembers] = useState([]), [filter, setFilter] = useState("all"), [search, setSearch] = useState("");
  const [status, setStatus] = useState({ loading: true, error: "" });
  async function load() { setStatus({ loading: true, error: "" }); try { const r = await apiRequest("/gym/members"); setMembers(r.data || []); } catch (e) { setStatus({ loading: false, error: e.message }); return; } setStatus({ loading: false, error: "" }); }
  useEffect(() => { load(); }, []);
  const counts = useMemo(() => ({
    all: members.length,
    male: members.filter((m) => m.gender === "male").length,
    female: members.filter((m) => m.gender === "female").length,
    paid: members.filter((m) => m.status !== "left" && m.status !== "inactive" && m.registration_paid_until && new Date(m.registration_paid_until) >= new Date()).length,
    unpaid: members.filter((m) => m.status !== "left" && m.status !== "inactive" && (!m.registration_paid_until || new Date(m.registration_paid_until) < new Date())).length,
    left: members.filter((m) => m.status === "left" || m.status === "inactive").length,
  }), [members]);
  const visible = useMemo(() => members.filter((m) => {
    const paid = m.registration_paid_until && new Date(m.registration_paid_until) >= new Date();
    const match = filter === "all" || (filter === "male" && m.gender === "male") || (filter === "female" && m.gender === "female") || (filter === "paid" && paid && m.status !== "left" && m.status !== "inactive") || (filter === "unpaid" && !paid && m.status !== "left" && m.status !== "inactive") || (filter === "left" && (m.status === "left" || m.status === "inactive"));
    return match && (!search || `${m.name} ${m.phone || ""}`.toLowerCase().includes(search.toLowerCase()));
  }), [members, filter, search]);
  if (status.loading) return <LoadingState />;
  if (status.error) return <ErrorState message={status.error} />;
  return <div className="space-y-6 motion-card">
    <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-white via-blue-50/60 to-emerald-50 p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Member overview</p><h1 className="mt-1 text-3xl font-black">Members</h1><p className="mt-2 text-sm text-slate-500">View members by gender, payment and membership status. New members are registered from Check-ins.</p></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{filters.map(({ key, label, icon: Icon }) => <button key={key} onClick={() => setFilter(key)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${filter === key ? "border-blue-400 bg-blue-50 shadow-sm" : "border-slate-200 bg-white"}`}><div className="flex items-center justify-between"><Icon className="h-5 w-5 text-blue-600" /><span className="text-2xl font-black">{counts[key]}</span></div><p className="mt-2 text-xs font-bold text-slate-500">{label}</p></button>)}</div>
    <div className="panel overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Showing</p><h2 className="font-black">{filters.find((f) => f.key === filter)?.label} · {visible.length}</h2></div><div className="flex items-center gap-2"><Filter className="h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search member…" className="field w-full md:w-64" /></div></div>{visible.length === 0 ? <div className="flex min-h-[280px] items-center justify-center p-8"><EmptyState title="No members found" description="Try another filter or search term." /></div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Member</th><th className="px-4 py-3">Gender</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Paid until</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((m) => { const paid = m.registration_paid_until && new Date(m.registration_paid_until) >= new Date(); const left = m.status === "left" || m.status === "inactive"; return <tr key={m.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-bold">{m.name}</td><td className="px-4 py-3">{m.gender === "female" ? "Female" : m.gender === "male" ? "Male" : "—"}</td><td className="px-4 py-3 text-slate-500">{m.phone || "—"}</td><td className="px-4 py-3 text-slate-500">{m.registration_paid_until ? new Date(m.registration_paid_until).toLocaleDateString() : "—"}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{paid ? "Paid" : "Unpaid"}</span></td><td className="px-4 py-3"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${left ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-700"}`}><CheckCircle2 className="h-3.5 w-3.5" />{left ? "Left" : "Active"}</span></td></tr>; })}</tbody></table></div>}</div>
  </div>;
}
