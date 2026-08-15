import React, { useEffect, useState } from "react";
import { UserPlus, UserRound, Phone, Users } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/AsyncState";

export default function GymCheckins() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: "", gender: "", phone: "" });
  const [status, setStatus] = useState({ loading: true, saving: false, error: "", success: "" });

  async function load() {
    setStatus((s) => ({ ...s, loading: true, error: "" }));
    try { const r = await apiRequest("/gym/members"); setMembers(r.data || []); }
    catch (e) { setStatus((s) => ({ ...s, error: e.message })); }
    finally { setStatus((s) => ({ ...s, loading: false })); }
  }
  useEffect(() => { load(); }, []);

  async function addMember(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.gender || !form.phone.trim()) return;
    setStatus((s) => ({ ...s, saving: true, error: "", success: "" }));
    try {
      const r = await apiRequest("/gym/members", { method: "POST", body: JSON.stringify({ name: form.name.trim(), gender: form.gender, phone: form.phone.trim() }) });
      setForm({ name: "", gender: "", phone: "" });
      setStatus((s) => ({ ...s, success: `${r.data?.name || "New member"} has been added successfully.` }));
      await load();
    } catch (e) { setStatus((s) => ({ ...s, error: e.message })); }
    finally { setStatus((s) => ({ ...s, saving: false })); }
  }

  if (status.loading) return <LoadingState />;
  return <div className="space-y-6 motion-card">
    <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50 to-blue-50 p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Member registration</p>
      <h1 className="mt-1 text-3xl font-black">Add New Member</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">When someone joins the gym, register them here. Attendance and check-ins are intentionally not part of this page.</p>
    </div>
    {status.error && <ErrorState message={status.error} />}
    {status.success && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{status.success}</div>}
    <div className="grid gap-6 lg:grid-cols-[560px_1fr]">
      <form onSubmit={addMember} className="panel p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><UserPlus className="h-6 w-6" /></span><div><h2 className="text-xl font-black">Register a new member</h2><p className="text-sm text-slate-500">Create the member profile in a few seconds.</p></div></div>
        <label className="mb-2 block text-sm font-bold text-slate-700">Full name</label>
        <input className="field" placeholder="Enter full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <label className="mb-2 mt-5 block text-sm font-bold text-slate-700">Gender</label>
        <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setForm({ ...form, gender: "male" })} className={`rounded-2xl border p-4 text-left transition ${form.gender === "male" ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-200"}`}><UserRound className="mb-2 h-5 w-5 text-blue-600" /><span className="font-black">Male</span></button><button type="button" onClick={() => setForm({ ...form, gender: "female" })} className={`rounded-2xl border p-4 text-left transition ${form.gender === "female" ? "border-pink-400 bg-pink-50 ring-2 ring-pink-100" : "border-slate-200 bg-white hover:border-pink-200"}`}><UserRound className="mb-2 h-5 w-5 text-pink-600" /><span className="font-black">Female</span></button></div>
        <label className="mb-2 mt-5 block text-sm font-bold text-slate-700">Phone number</label>
        <div className="relative"><Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input className="field pl-10" type="tel" placeholder="Enter phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
        <button className="btn-primary mt-6 w-full justify-center py-3" disabled={status.saving}>{status.saving ? "Adding member…" : "Add New Member"}</button>
      </form>
      <div className="panel p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Member directory</p><h2 className="text-xl font-black">Recently registered</h2></div><div className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-black">{members.length} total</div></div>{members.length === 0 ? <div className="flex min-h-[280px] items-center justify-center"><EmptyState title="No members yet" description="Use Add New Member to register the first person." /></div> : <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase text-slate-400"><tr><th className="px-3 py-3">Name</th><th className="px-3 py-3">Gender</th><th className="px-3 py-3">Phone</th></tr></thead><tbody className="divide-y divide-slate-100">{members.slice(0, 12).map((m) => <tr key={m.id}><td className="px-3 py-3 font-bold">{m.name}</td><td className="px-3 py-3">{m.gender === "female" ? "Female" : m.gender === "male" ? "Male" : "—"}</td><td className="px-3 py-3 text-slate-500">{m.phone || "—"}</td></tr>)}</tbody></table></div>}</div>
    </div>
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800"><span className="font-bold">Registration only:</span> attendance/check-in has been removed from this page. You can add attendance later as a separate feature without changing member registration.</div>
  </div>;
}
