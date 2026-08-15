import React, { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Clock3, FileCheck2, Search, UserX, Users, X } from "lucide-react";
import { apiRequest, todayISO } from "../../lib/api";
import { ErrorState, LoadingState } from "../../components/AsyncState";

const STATUS = {
  present: { label: "Present", icon: CheckCircle2, classes: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  absent: { label: "Absent", icon: UserX, classes: "bg-rose-50 text-rose-700 ring-rose-200" },
  late: { label: "Late", icon: Clock3, classes: "bg-amber-50 text-amber-700 ring-amber-200" },
  excused: { label: "Excused", icon: FileCheck2, classes: "bg-blue-50 text-blue-700 ring-blue-200" },
};

export default function SchoolAttendance() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({ present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  const loadClasses = async () => {
    const response = await apiRequest("/school/classes");
    const list = response.data || [];
    setClasses(list);
    if (!classId && list[0]) setClassId(list[0].id);
  };

  const loadAttendance = async () => {
    if (!classId) return;
    setLoading(true); setError("");
    try {
      const response = await apiRequest(`/school/attendance?class_id=${encodeURIComponent(classId)}&date=${encodeURIComponent(date)}`);
      setRows(response.data || []);
      setCounts(response.counts || {});
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { loadClasses().catch(e => { setError(e.message); setLoading(false); }); }, []);
  useEffect(() => { if (classId) loadAttendance(); }, [classId, date]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => `${r.name} ${r.registration_no || ""}`.toLowerCase().includes(q));
  }, [rows, search]);

  const setStatus = (studentId, status) => {
    setRows(current => current.map(row => row.id === studentId ? { ...row, attendance: { ...(row.attendance || {}), status } } : row));
    setCounts(current => {
      const next = { ...current };
      const old = rows.find(r => r.id === studentId)?.attendance?.status || "unmarked";
      if (next[old] > 0) next[old] -= 1;
      next[status] = (next[status] || 0) + 1;
      return next;
    });
  };

  const markAll = (status) => {
    setRows(current => current.map(row => ({ ...row, attendance: { ...(row.attendance || {}), status } })));
    setCounts({ present: status === "present" ? rows.length : 0, absent: status === "absent" ? rows.length : 0, late: status === "late" ? rows.length : 0, excused: status === "excused" ? rows.length : 0, unmarked: 0 });
  };

  const save = async () => {
    if (!classId || !rows.length) return;
    setSaving(true); setNotice(""); setError("");
    try {
      const records = rows.filter(r => r.attendance?.status).map(r => ({ student_id: r.id, status: r.attendance.status, note: r.attendance.note || null }));
      const response = await apiRequest("/school/attendance", { method: "POST", body: JSON.stringify({ class_id: classId, date, records }) });
      setNotice(response.message || "Attendance saved.");
      await loadAttendance();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  if (loading && !rows.length) return <LoadingState />;

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="mb-1 text-sm font-bold uppercase tracking-wider text-orange-600">Daily classroom attendance</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Take attendance</h1>
        <p className="mt-2 text-slate-500">Teachers can mark every student as present, absent, late, or excused.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="text-sm font-bold text-slate-700">Class<select value={classId} onChange={e => setClassId(e.target.value)} className="mt-1 block h-11 min-w-52 rounded-xl border border-slate-200 bg-white px-3 font-medium outline-none focus:border-orange-400"><option value="">Select class</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}{c.grade ? ` · ${c.grade}` : ""}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-700">Date<input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block h-11 rounded-xl border border-slate-200 bg-white px-3 font-medium outline-none focus:border-orange-400" /></label>
      </div>
    </div>

    {error && <ErrorState message={error} />}
    {notice && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">{notice}</div>}

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {["present", "absent", "late", "excused", "unmarked"].map(key => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm font-semibold text-slate-500">{key === "unmarked" ? "Not marked" : STATUS[key]?.label}</p><p className="mt-1 text-2xl font-black text-slate-950">{counts[key] || 0}</p></div>)}
    </div>

    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2"><button onClick={() => markAll("present")} className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100">Mark all present</button><button onClick={() => markAll("absent")} className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100">Mark all absent</button></div>
        <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 outline-none focus:border-orange-400 sm:w-64" /></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">School ID</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Note</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{filteredRows.map(row => <tr key={row.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700"><Users className="h-4 w-4" /></span><div><p className="font-black text-slate-900">{row.name}</p><p className="text-xs text-slate-400">{row.status}</p></div></div></td><td className="px-5 py-4 font-bold text-slate-600">{row.registration_no || "—"}</td><td className="px-5 py-4"><div className="flex gap-2">{Object.keys(STATUS).map(status => { const meta = STATUS[status]; const Icon = meta.icon; const active = row.attendance?.status === status; return <button key={status} onClick={() => setStatus(row.id, status)} title={meta.label} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black ring-1 transition ${active ? meta.classes : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"}`}><Icon className="h-4 w-4" />{meta.label}</button>; })}</div></td><td className="px-5 py-4"><input value={row.attendance?.note || ""} onChange={e => setRows(current => current.map(r => r.id === row.id ? { ...r, attendance: { ...(r.attendance || {}), note: e.target.value } } : r))} placeholder="Optional" className="h-9 w-44 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-orange-400" /></td></tr>)}
          {!filteredRows.length && <tr><td colSpan="4" className="px-5 py-16 text-center"><Users className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-bold text-slate-700">No students in this class</p><p className="text-sm text-slate-400">Add students and assign them to this class first.</p></td></tr>}</tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">{rows.length} students · {date}</p><button onClick={save} disabled={saving || !rows.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"><Check className="h-5 w-5" />{saving ? "Saving..." : "Save attendance"}</button></div>
    </div>
  </div>;
}
