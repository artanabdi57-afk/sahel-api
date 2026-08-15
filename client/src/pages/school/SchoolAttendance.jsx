import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, Clock3, FileCheck2, Printer, Search, UserX, Users } from "lucide-react";
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
  const [switching, setSwitching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const cache = useRef(new Map());
  const requestId = useRef(0);

  const fetchAttendance = async (selectedClassId, selectedDate, options = {}) => {
    if (!selectedClassId) return;
    const key = `${selectedClassId}:${selectedDate}`;
    const cached = cache.current.get(key);
    if (cached && !options.force) {
      setRows(cached.rows);
      setCounts(cached.counts);
      setLoading(false);
      setSwitching(false);
      return;
    }
    const id = ++requestId.current;
    setSwitching(true);
    setError("");
    try {
      const response = await apiRequest(`/school/attendance?class_id=${encodeURIComponent(selectedClassId)}&date=${encodeURIComponent(selectedDate)}`);
      if (id !== requestId.current) return;
      const nextRows = response.data || [];
      const nextCounts = response.counts || {};
      cache.current.set(key, { rows: nextRows, counts: nextCounts });
      setRows(nextRows);
      setCounts(nextCounts);
    } catch (e) {
      if (id === requestId.current) setError(e.message);
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setSwitching(false);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiRequest("/school/classes")
      .then(async (response) => {
        if (!mounted) return;
        const list = response.data || [];
        setClasses(list);
        const first = list[0]?.id || "";
        if (first) {
          setClassId(first);
          await fetchAttendance(first, date);
        } else setLoading(false);
      })
      .catch((e) => { if (mounted) { setError(e.message); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (classId && classes.length) fetchAttendance(classId, date);
  }, [classId, date]);

  const selectedClass = classes.find((c) => String(c.id) === String(classId));
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => `${r.name} ${r.registration_no || ""}`.toLowerCase().includes(q));
  }, [rows, search]);

  const changeClass = (next) => {
    setClassId(next);
    setRows([]);
    setCounts({ present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 });
    setSearch("");
    if (next) fetchAttendance(next, date);
  };

  const setStatus = (studentId, status) => {
    setRows((current) => current.map((row) => row.id === studentId ? { ...row, attendance: { ...(row.attendance || {}), status } } : row));
    setCounts((current) => {
      const next = { ...current };
      const old = rows.find((r) => r.id === studentId)?.attendance?.status || "unmarked";
      if (next[old] > 0) next[old] -= 1;
      next[status] = (next[status] || 0) + 1;
      return next;
    });
  };

  const markAll = (status) => {
    setRows((current) => current.map((row) => ({ ...row, attendance: { ...(row.attendance || {}), status } })));
    setCounts({ present: status === "present" ? rows.length : 0, absent: status === "absent" ? rows.length : 0, late: status === "late" ? rows.length : 0, excused: status === "excused" ? rows.length : 0, unmarked: 0 });
  };

  const save = async () => {
    if (!classId || !rows.length) return;
    setSaving(true); setNotice(""); setError("");
    try {
      const records = rows.filter((r) => r.attendance?.status).map((r) => ({ student_id: r.id, status: r.attendance.status, note: r.attendance.note || null }));
      const response = await apiRequest("/school/attendance", { method: "POST", body: JSON.stringify({ class_id: classId, date, records }) });
      setNotice(response.message || "Attendance saved.");
      cache.current.delete(`${classId}:${date}`);
      await fetchAttendance(classId, date, { force: true });
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  if (loading && !rows.length) return <LoadingState />;

  return <div className="space-y-6">
    <style>{`@media print { body * { visibility:hidden !important; } #attendance-print, #attendance-print * { visibility:visible !important; } #attendance-print { position:absolute; left:0; top:0; width:100%; } .attendance-no-print { display:none !important; } .attendance-print-table { border-collapse:collapse; width:100%; } .attendance-print-table th,.attendance-print-table td { border:1px solid #999; padding:7px; color:#000; } }`}</style>
    <div className="attendance-no-print flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
      <div><p className="mb-1 text-sm font-bold uppercase tracking-wider text-orange-600">Daily classroom attendance</p><h1 className="text-3xl font-black tracking-tight text-slate-950">Take attendance</h1><p className="mt-2 text-slate-500">Choose a class and the students change immediately.</p></div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="text-sm font-bold text-slate-700">Class<select value={classId} onChange={(e) => changeClass(e.target.value)} className="mt-1 block h-11 min-w-52 rounded-xl border border-slate-200 bg-white px-3 font-medium outline-none focus:border-orange-400"><option value="">Select class</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}{c.grade ? ` · ${c.grade}` : ""}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-700">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block h-11 rounded-xl border border-slate-200 bg-white px-3 font-medium outline-none focus:border-orange-400" /></label>
        <button type="button" onClick={() => window.print()} disabled={!selectedClass || !rows.length} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 font-black text-white disabled:opacity-40"><Printer className="h-4 w-4" /> Print</button>
      </div>
    </div>
    {switching && <div className="attendance-no-print rounded-xl border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">Loading {selectedClass?.name || "class"} students…</div>}
    {error && <ErrorState message={error} />}
    {notice && <div className="attendance-no-print rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">{notice}</div>}

    <div id="attendance-print">
      <div className="mb-4 hidden print:block"><h1 className="text-2xl font-black">Attendance — {selectedClass?.name || "Class"}</h1><p>{date} · {rows.length} students</p></div>
      <div className="attendance-no-print grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {["present", "absent", "late", "excused", "unmarked"].map((key) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm font-semibold text-slate-500">{key === "unmarked" ? "Not marked" : STATUS[key]?.label}</p><p className="mt-1 text-2xl font-black text-slate-950">{counts[key] || 0}</p></div>)}
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="attendance-no-print flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2"><button onClick={() => markAll("present")} className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">Mark all present</button><button onClick={() => markAll("absent")} className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">Mark all absent</button></div><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student..." className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 outline-none sm:w-64" /></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">School ID</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Note</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredRows.map((row) => <tr key={row.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700"><Users className="h-4 w-4" /></span><div><p className="font-black text-slate-900">{row.name}</p><p className="text-xs text-slate-400">{row.status}</p></div></div></td><td className="px-5 py-4 font-bold text-slate-600">{row.registration_no || "—"}</td><td className="px-5 py-4"><div className="flex gap-2 attendance-no-print">{Object.keys(STATUS).map((status) => { const meta = STATUS[status]; const Icon = meta.icon; const active = row.attendance?.status === status; return <button key={status} onClick={() => setStatus(row.id, status)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black ring-1 transition ${active ? meta.classes : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"}`}><Icon className="h-4 w-4" />{meta.label}</button>; })}</div><span className="hidden print:inline font-bold">{row.attendance?.status ? STATUS[row.attendance.status]?.label : "Not marked"}</span></td><td className="px-5 py-4"><input value={row.attendance?.note || ""} onChange={(e) => setRows((current) => current.map((r) => r.id === row.id ? { ...r, attendance: { ...(r.attendance || {}), note: e.target.value } } : r))} placeholder="Optional" className="attendance-no-print h-9 w-44 rounded-lg border border-slate-200 px-3 text-sm outline-none" /><span className="hidden print:inline">{row.attendance?.note || ""}</span></td></tr>)}{!filteredRows.length && <tr><td colSpan="4" className="px-5 py-16 text-center"><Users className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-bold text-slate-700">No students in this class</p></td></tr>}</tbody></table></div>
        <div className="attendance-no-print flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">{rows.length} students · {date}</p><button onClick={save} disabled={saving || !rows.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-black text-white shadow-lg shadow-orange-200 disabled:opacity-50"><Check className="h-5 w-5" />{saving ? "Saving..." : "Save attendance"}</button></div>
      </div>
    </div>
  </div>;
}
