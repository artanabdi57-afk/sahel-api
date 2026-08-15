import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Printer, Receipt, Wallet } from "lucide-react";
import { apiRequest, formatMoney } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/AsyncState";

const monthStart = (value) => `${value}-01`;
const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function SchoolFees() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ student_id: "", amount: "", payment_method: "cash", paid_for_month: monthStart(currentMonth()) });
  const [classFilter, setClassFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [status, setStatus] = useState({ loading: true, saving: false, error: "" });

  const load = async () => {
    setStatus((s) => ({ ...s, loading: true, error: "" }));
    try {
      const [c, s, p] = await Promise.all([
        apiRequest("/school/classes"),
        apiRequest("/school/students"),
        apiRequest("/school/fee-payments"),
      ]);
      setClasses(c.data || []);
      setStudents(s.data || []);
      setPayments(p.data || []);
    } catch (e) { setStatus((s) => ({ ...s, error: e.message })); }
    finally { setStatus((s) => ({ ...s, loading: false })); }
  };
  useEffect(() => { load(); }, []);

  const paidStudentIds = useMemo(() => new Set(
    payments.filter((p) => String(p.paid_for_month || "").slice(0, 7) === selectedMonth).map((p) => p.student_id)
  ), [payments, selectedMonth]);

  const rows = useMemo(() => students.map((student) => ({
    ...student,
    className: student.school_classes?.name || "No class",
    classId: student.class_id || "none",
    paid: paidStudentIds.has(student.id),
  })), [students, paidStudentIds]);

  const filteredRows = useMemo(() => rows.filter((student) => {
    const classOk = classFilter === "all" || String(student.classId) === String(classFilter);
    const paymentOk = paymentFilter === "all" || (paymentFilter === "paid" ? student.paid : !student.paid);
    return classOk && paymentOk;
  }), [rows, classFilter, paymentFilter]);

  const filteredStudents = useMemo(() => classFilter === "all" ? students : students.filter((s) => String(s.class_id) === String(classFilter)), [students, classFilter]);
  const filteredPayments = useMemo(() => payments.filter((p) => filteredStudents.some((s) => s.id === p.student_id)), [payments, filteredStudents]);
  const total = filteredPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const paidCount = filteredRows.filter((s) => s.paid).length;
  const unpaidCount = filteredRows.filter((s) => !s.paid).length;
  const selectedClass = classes.find((c) => String(c.id) === String(classFilter));

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  async function submit(e) {
    e.preventDefault();
    setStatus((s) => ({ ...s, saving: true, error: "" }));
    try {
      await apiRequest("/school/fee-payments", { method: "POST", body: JSON.stringify({ ...form, amount: Number(form.amount), paid_for_month: form.paid_for_month || monthStart(selectedMonth) }) });
      setForm({ student_id: "", amount: "", payment_method: "cash", paid_for_month: monthStart(selectedMonth) });
      await load();
    } catch (e) { setStatus((s) => ({ ...s, error: e.message })); }
    finally { setStatus((s) => ({ ...s, saving: false })); }
  }

  if (status.loading) return <LoadingState />;

  return <div className="space-y-5 motion-card">
    <style>{`@media print { body * { visibility:hidden !important; } #fees-print, #fees-print * { visibility:visible !important; } #fees-print { position:absolute; left:0; top:0; width:100%; } .fees-no-print { display:none !important; } .fees-print-table { border-collapse:collapse; width:100%; } .fees-print-table th,.fees-print-table td { border:1px solid #999; padding:7px; color:#000; } }`}</style>
    <div className="fees-no-print rounded-2xl border border-indigo-100 bg-gradient-to-r from-white via-indigo-50/50 to-blue-50 p-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">School finance</p><div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-2xl font-black">Class-wise school fees</h2><p className="text-sm text-slate-500">Choose a class to see exactly who paid and who has not paid.</p></div><div className="flex flex-wrap gap-2"><div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-indigo-100"><p className="text-xs font-semibold text-slate-500">Collected</p><p className="text-xl font-black text-indigo-600">{formatMoney(total)}</p></div><div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-red-100"><p className="text-xs font-semibold text-slate-500">Unpaid</p><p className="text-xl font-black text-red-600">{unpaidCount}</p></div></div></div></div>
    {status.error && <ErrorState message={status.error} />}
    <div className="fees-no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><label className="text-sm font-bold text-slate-700">Class<select className="field mt-1" value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPaymentFilter("all"); }}><option value="all">All classes</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}{c.grade ? ` · ${c.grade}` : ""}</option>)}</select></label><label className="text-sm font-bold text-slate-700">Payment status<select className="field mt-1" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}><option value="all">Everyone</option><option value="paid">Paid</option><option value="unpaid">Not paid</option></select></label><label className="text-sm font-bold text-slate-700">Month<input className="field mt-1" type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setForm((f) => ({ ...f, paid_for_month: monthStart(e.target.value) })); }} /></label><div className="flex items-end"><button type="button" onClick={() => window.print()} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 font-black text-white"><Printer className="h-4 w-4" /> Print class report</button></div></div></div>

    <div id="fees-print">
      <div className="mb-5 hidden print:block"><h1 className="text-2xl font-black">School Fee Report</h1><p>Class: {selectedClass?.name || "All classes"} · Month: {selectedMonth}</p><p>Paid: {paidCount} · Not paid: {unpaidCount} · Collected: {formatMoney(total)}</p></div>
      <div className="grid gap-3 sm:grid-cols-3 fees-no-print"><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm font-semibold text-slate-500">Students</p><p className="text-2xl font-black">{filteredRows.length}</p></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-sm font-semibold text-emerald-700">Paid</p><p className="text-2xl font-black text-emerald-700">{paidCount}</p></div><div className="rounded-2xl border border-red-100 bg-red-50 p-4"><p className="text-sm font-semibold text-red-700">Not paid</p><p className="text-2xl font-black text-red-700">{unpaidCount}</p></div></div>
      <div className="mt-5 rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="fees-no-print flex items-center justify-between border-b border-slate-100 p-4"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Class payment status</p><h2 className="font-black">{selectedClass?.name || "All classes"} · {selectedMonth}</h2></div><Receipt className="h-5 w-5 text-slate-400" /></div><div className="overflow-x-auto"><table className="fees-print-table min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Monthly fee</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredRows.map((student) => <tr key={student.id}><td className="px-4 py-3 font-bold">{student.name}</td><td className="px-4 py-3">{student.className}</td><td className="px-4 py-3">{formatMoney(student.monthly_fee || 0)}</td><td className={`px-4 py-3 font-black ${student.paid ? "text-emerald-700" : "text-red-700"}`}>{student.paid ? "PAID" : "NOT PAID"}</td></tr>)}{!filteredRows.length && <tr><td colSpan="4" className="px-4 py-12 text-center text-slate-400">No students match this class/status.</td></tr>}</tbody></table></div></div>
    </div>

    <div className="fees-no-print grid gap-5 xl:grid-cols-[380px_1fr]"><form onSubmit={submit} className="panel h-fit p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"><h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Wallet className="h-5 w-5 text-blue-600" /> Record a fee payment</h2><div className="space-y-3"><select className="field" value={form.student_id} onChange={(e) => set("student_id", e.target.value)} required><option value="">Choose student…</option>{filteredStudents.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.school_classes?.name || "No class"}</option>)}</select><input className="field" type="number" min="0.01" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => set("amount", e.target.value)} required /><select className="field" value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}><option value="cash">Cash</option><option value="bank">Bank</option><option value="mobile_money">Mobile money</option></select><input className="field" type="date" value={form.paid_for_month} onChange={(e) => set("paid_for_month", e.target.value)} /></div><button className="btn-primary mt-4 w-full" disabled={status.saving}>{status.saving ? "Saving…" : "Record payment"}</button></form><div className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 p-4"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Transactions</p><h2 className="font-black">Payment history</h2></div><Receipt className="h-5 w-5 text-slate-400" /></div>{filteredPayments.length === 0 ? <div className="flex min-h-[300px] items-center justify-center p-8"><EmptyState title="No payments yet" description="No payments match the selected class." /></div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredPayments.map((p) => <tr key={p.id} className="transition hover:bg-indigo-50/40"><td className="px-4 py-3 font-bold">{p.school_students?.name || "-"}</td><td className="px-4 py-3 capitalize">{p.payment_method}</td><td className="px-4 py-3">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "-"}</td><td className="px-4 py-3 text-right font-black">{formatMoney(p.amount)}</td></tr>)}</tbody></table></div>}</div></div>
  </div>;
}
