import React, { useEffect, useState } from "react";
import { Trash2, BookOpen, Plus, GraduationCap } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/AsyncState";

export default function SchoolClasses() {
  const [classes, setClasses] = useState([]), [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ name: "", grade: "", level: "primary", teacher_id: "" });
  const [status, setStatus] = useState({ loading: true, saving: false, error: "" });
  const load = async () => { setStatus((s) => ({ ...s, loading: true, error: "" })); try { const [c, t] = await Promise.all([apiRequest("/school/classes"), apiRequest("/school/teachers")]); setClasses(c.data || []); setTeachers(t.data || []); } catch (e) { setStatus((s) => ({ ...s, error: e.message })); } finally { setStatus((s) => ({ ...s, loading: false })); } };
  useEffect(() => { load(); }, []);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => { e.preventDefault(); setStatus((s) => ({ ...s, saving: true, error: "" })); try { await apiRequest("/school/classes", { method: "POST", body: JSON.stringify(form) }); setForm({ name: "", grade: "", level: "primary", teacher_id: "" }); await load(); } catch (e) { setStatus((s) => ({ ...s, error: e.message })); } finally { setStatus((s) => ({ ...s, saving: false })); } };
  const del = async (id) => { if (!window.confirm("Remove this class?")) return; try { await apiRequest(`/school/classes/${id}`, { method: "DELETE" }); await load(); } catch (e) { setStatus((s) => ({ ...s, error: e.message })); } };
  if (status.loading) return <LoadingState />;
  return <div className="space-y-5 motion-card">
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-white via-blue-50/50 to-indigo-50 p-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">School setup</p><h2 className="mt-1 text-2xl font-black">Classes & sections</h2><p className="mt-1 text-sm text-slate-500">Choose Primary or Secondary so Sahel automatically uses the correct subjects in examinations.</p></div>
    {status.error && <ErrorState message={status.error} />}
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="panel h-fit p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><BookOpen className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Quick add</p><h2 className="font-black">Add Class</h2></div></div>
        <div className="space-y-3">
          <input className="field" placeholder="Class name (e.g. Grade 5A)" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          <input className="field" placeholder="Grade / level" value={form.grade} onChange={(e) => set("grade", e.target.value)} />
          <select className="field" value={form.level} onChange={(e) => set("level", e.target.value)}><option value="primary">Primary school</option><option value="secondary">Secondary school · Dugsi Sare</option></select>
          <select className="field" value={form.teacher_id} onChange={(e) => set("teacher_id", e.target.value)}><option value="">Assign teacher (optional)</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        </div>
        <button className="btn-primary mt-4 w-full" disabled={status.saving}><Plus className="h-4 w-4" />{status.saving ? "Saving…" : "Add class"}</button>
      </form>
      <div className="panel min-h-[360px] overflow-hidden">
        {classes.length === 0 ? <div className="flex min-h-[360px] items-center justify-center p-8"><EmptyState title="No classes yet" description="Add your first Primary or Secondary class to start enrolling students." /></div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3 font-bold">Class</th><th className="px-4 py-3 font-bold">Level</th><th className="px-4 py-3 font-bold">Grade</th><th className="px-4 py-3 font-bold">Teacher</th><th className="px-4 py-3 text-right font-bold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{classes.map((c) => <tr key={c.id} className="transition hover:bg-blue-50/40"><td className="px-4 py-3 font-bold">{c.name}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${c.level === "secondary" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}>{c.level === "secondary" ? "Secondary" : "Primary"}</span></td><td className="px-4 py-3">{c.grade || "-"}</td><td className="px-4 py-3">{c.school_teachers?.name || <span className="text-slate-400">Unassigned</span>}</td><td className="px-4 py-3 text-right"><button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50" onClick={() => del(c.id)}><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>}
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2"><div className="panel p-5"><div className="flex items-center gap-3"><GraduationCap className="h-5 w-5 text-blue-600" /><h3 className="font-black">Primary subjects</h3></div><p className="mt-2 text-sm text-slate-500">Arabic · Science · Math · Technology · Tarbiya · Social Studies · Somali · English</p></div><div className="panel p-5"><div className="flex items-center gap-3"><GraduationCap className="h-5 w-5 text-violet-600" /><h3 className="font-black">Secondary subjects · Dugsi Sare</h3></div><p className="mt-2 text-sm text-slate-500">Arabic · Tarbiya · History · Geography · Chemistry · Biology · Technology · Business · Somali · English · Math</p></div></div>
  </div>;
}
