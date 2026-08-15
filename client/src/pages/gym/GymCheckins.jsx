import React, { useEffect, useState } from "react";
import { UserPlus, UserRound, Phone, CalendarDays, DollarSign, CreditCard } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/AsyncState";

const today = new Date().toISOString().slice(0, 10);

export default function GymCheckins() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: "", age: "", gender: "", phone: "", paymentAmount: "", paymentFor: "Monthly Membership", paymentDate: today, paidUntil: "" });
  const [status, setStatus] = useState({ loading: true, saving: false, error: "", success: "" });

  async function load() {
    setStatus((s) => ({ ...s, loading: true, error: "" }));
    try { const r = await apiRequest("/gym/members"); setMembers(r.data || []); }
    catch (e) { setStatus((s) => ({ ...s, error: e.message })); }
    finally { setStatus((s) => ({ ...s, loading: false })); }
  }
  useEffect(() => { load(); }, []);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }
  async function addMember(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.age || !form.gender || !form.phone.trim() || !form.paymentAmount || !form.paymentDate) return;
    setStatus((s) => ({ ...s, saving: true, error: "", success: "" }));
    try {
      const r = await apiRequest("/gym/members", { method: "POST", body: JSON.stringify({ name: form.name.trim(), age: Number(form.age), gender: form.gender, phone: form.phone.trim(), registration_paid_amount: Number(form.paymentAmount), registration_paid_until: form.paidUntil || null, payment_for: form.paymentFor, payment_date: form.paymentDate }) });
      setForm({ name: "", age: "", gender: "", phone: "", paymentAmount: "", paymentFor: "Monthly Membership", paymentDate: today, paidUntil: "" });
      setStatus((s) => ({ ...s, success: `${r.data?.name || "New member"} was registered with their first payment.` }));
      await load();
    } catch (e) { setStatus((s) => ({ ...s, error: e.message })); }
    finally { setStatus((s) => ({ ...s, saving: false })); }
  }

  if (status.loading) return <LoadingState />;
  return <div className="space-y-6 motion-card">
    <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50 to-blue-50 p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Member registration</p><h1 className="mt-1 text-3xl font-black">Add New Member</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">Register the person and record their first payment in one place. No attendance or check-in is required.</p></div>
    {status.error && <ErrorState message={status.error} />}{status.success && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{status.success}</div>}
    <div className="grid gap-6 lg:grid-cols-[560px_1fr]">
      <form onSubmit={addMember} className="panel p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><UserPlus className="h-6 w-6" /></span><div><h2 className="text-xl font-black">Register a new member</h2><p className="text-sm text-slate-500">Member details + first payment.</p></div></div>
        <label className="mb-2 block text-sm font-bold text-slate-700">Full name</label><input className="field" placeholder="Enter full name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
        <label className="mb-2 mt-5 block text-sm font-bold text-slate-700">Age</label><input className="field" type="number" min="1" max="120" placeholder="Enter age" value={form.age} onChange={(e) => update("age", e.target.value)} required />
        <label className="mb-2 mt-5 block text-sm font-bold text-slate-700">Gender</label><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => update("gender", "male")} className={`rounded-2xl border p-4 text-left transition ${form.gender === "male" ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-200"}`}><UserRound className="mb-2 h-5 w-5 text-blue-600" /><span className="font-black">Male</span></button><button type="button" onClick={() => update("gender", "female")} className={`rounded-2xl border p-4 text-left transition ${form.gender === "female" ? "border-pink-400 bg-pink-50 ring-2 ring-pink-100" : "border-slate-200 bg-white hover:border-pink-200"}`}><UserRound className="mb-2 h-5 w-5 text-pink-600" /><span className="font-black">Female</span></button></div>
        <label className="mb-2 mt-5 block text-sm font-bold text-slate-700">Phone number</label><div className="relative"><Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input className="field pl-10" type="tel" placeholder="Enter phone number" value={form.phone} onChange={(e) => update("phone", e.target.value)} required /></div>
        <div className="my-6 border-t border-slate-100" /><div className="mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-emerald-600" /><h3 className="font-black">First payment</h3></div>
        <label className="mb-2 block text-sm font-bold text-slate-700">What are they paying for?</label><select className="field" value={form.paymentFor} onChange={(e) => update("paymentFor", e.target.value)}><option>Monthly Membership</option><option>Weekly Membership</option><option>Daily Membership</option><option>Registration Fee</option><option>Other</option></select>
        <label className="mb-2 mt-4 block text-sm font-bold text-slate-700">Payment amount</label><div className="relative"><DollarSign className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input className="field pl-10" type="number" min="0" step="0.01" placeholder="0.00" value={form.paymentAmount} onChange={(e) => update("paymentAmount", e.target.value)} required /></div>
        <label className="mb-2 mt-4 block text-sm font-bold text-slate-700">Payment date</label><div className="relative"><CalendarDays className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input className="field pl-10" type="date" value={form.paymentDate} onChange={(e) => update("paymentDate", e.target.value)} required /></div>
        <label className="mb-2 mt-4 block text-sm font-bold text-slate-700">Paid until / next payment date</label><input className="field" type="date" value={form.paidUntil} onChange={(e) => update("paidUntil", e.target.value)} />
        <button className="btn-primary mt-6 w-full justify-center py-3" disabled={status.saving}>{status.saving ? "Adding member…" : "Add Member & Record Payment"}</button>
      </form>
      <div className="panel p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Member directory</p><h2 className="text-xl font-black">Recently registered</h2></div><div className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-black">{members.length} total</div></div>{members.length === 0 ? <div className="flex min-h-[280px] items-center justify-center"><EmptyState title="No members yet" description="Use Add New Member to register the first person." /></div> : <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase text-slate-400"><tr><th className="px-3 py-3">Name</th><th className="px-3 py-3">Age</th><th className="px-3 py-3">Gender</th><th className="px-3 py-3">Phone</th></tr></thead><tbody className="divide-y divide-slate-100">{members.slice(0, 12).map((m) => <tr key={m.id}><td className="px-3 py-3 font-bold">{m.name}</td><td className="px-3 py-3">{m.age ?? "—"}</td><td className="px-3 py-3">{m.gender === "female" ? "Female" : m.gender === "male" ? "Male" : "—"}</td><td className="px-3 py-3 text-slate-500">{m.phone || "—"}</td></tr>)}</tbody></table></div>}</div>
    </div>
  </div>;
}
