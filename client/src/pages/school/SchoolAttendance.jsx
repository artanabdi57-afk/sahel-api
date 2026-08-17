import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, FileCheck2, Printer, Search, UserX, Users } from "lucide-react";
import { apiRequest, todayISO } from "../../lib/api";
import { ErrorState, LoadingState } from "../../components/AsyncState";

const STATUS = {
  present: { label: "Present", icon: CheckCircle2, classes: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  absent: { label: "Absent", icon: UserX, classes: "bg-rose-50 text-rose-700 ring-rose-200" },
  excused: { label: "Excused", icon: FileCheck2, classes: "bg-blue-50 text-blue-700 ring-blue-200" },
};
const STATUS_KEYS = Object.keys(STATUS);

export default function SchoolAttendance() {
  const [classes, setClasses] = useState([]); const [classId, setClassId] = useState(""); const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState([]); const [counts, setCounts] = useState({ present: 0, absent: 0, excused: 0, unmarked: 0 });
  const [loading, setLoading] = useState(true); const [switching, setSwitching] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [search, setSearch] = useState("");
  const cache = useRef(new Map()); const requestId = useRef(0);

  const normalizeCounts = (value = {}) => ({ present: Number(value.present || 0), absent: Number(value.absent || 0), excused: Number(value.excused || 0), unmarked: Number(value.unmarked || 0) });
  const fetchAttendance = async (selectedClassId, selectedDate, force = false) => {
    if (!selectedClassId) return;
    const key = `${selectedClassId}:${selectedDate}`; const cached = cache.current.get(key);
    if (cached && !force) { setRows(cached.rows); setCounts(cached.counts); setLoading(false); setSwitching(false); return; }
    const id = ++requestId.current; setSwitching(true); setError("");
    try {
      const response = await apiRequest(`/school/attendance?class_id=${encodeURIComponent(selectedClassId)}&date=${encodeURIComponent(selectedDate)}`);
      if (id !== requestId.current) return;
      const nextRows = (response.data || []).map((row) => row.attendance?.status === "late" ? { ...row, attendance: { ...row.attendance, status: null } } : row);
      const nextCounts = normalizeCounts(response.counts);
      cache.current.set(key, { rows: nextRows, counts: nextCounts }); setRows(nextRows); setCounts(nextCounts);
    } catch (e) { if (id === requestId.current) setError(e.message); }
    finally { if (id === requestId.current) { setLoading(false); setSwitching(false); } }
  };

  useEffect(() => {
    let mounted = true; setLoading(true);
    apiRequest("/school/classes").then((response) => { if (!mounted) return; const list = response.data || []; setClasses(list); if (list[0]) setClassId(list[0].id); else setLoading(false); }).catch((e) => { if (mounted) { setError(e.message); setLoading(false); } });
    return () => { mounted = false; };
  }, []);
  useEffect(() => { if (classId) fetchAttendance(classId, date); }, [classId, date]);

  const selectedClass = classes.find((c) => String(c.id) === String(classId));
  const filteredRows = useMemo(() => { const q = search.trim().toLowerCase(); return q ? rows.filter((r) => `${r.name} ${r.registration_no || ""}`.toLowerCase().includes(q)) : rows; }, [rows, search]);
  const changeClass = (next) => { setClassId(next); setRows([]); setCounts({ present: 0, absent: 0, excused: 0, unmarked: 0 }); setSearch(""); setError(""); };
  const setStatus = (studentId, status) => {
    setRows((current) => current.map((row) => row.id === studentId ? { ...row, attendance: { ...(row.attendance || {}), status } } : row));
    setCounts((current) => { const next = { ...current }; const old = rows.find((r) => r.id === studentId)?.attendance?.status || "unmarked"; if (next[old] > 0) next[old] -= 1; next[status] = (next[status] || 0) + 1; return next; });
  };
  const markAll = (status) => { setRows((current) => current.map((row) => ({ ...row, attendance: { ...(row.attendance || {}), status } }))); setCounts({ present: status === "present" ? rows.length : 0, absent: status === "absent" ? rows.length : 0, excused: status === "excused" ? rows.length : 0, unmarked: 0 }); };
  const save = async () => {
    if (!classId || !rows.length) return; setSaving(true); setNotice(""); setError("");
    try { const records = rows.filter((r) => STATUS_KEYS.includes(r.attendance?.status)).map((r) => ({ student_id: r.id, status: r.attendance.status, note: r.attendance.note || null })); const response = await apiRequest("/school/attendance", { method: "POST", body: JSON.stringify({ class_id: classId, date, records }) }); setNotice(response.message || "Attendance saved."); cache.current.delete(`${classId}:${date}`); await fetchAttendance(classId, date, true); }
    catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  if (loading && !rows.length) return <LoadingState />;

  const StatusButtons = ({ row }) => <div className="grid grid-cols-3 gap-1.5 sm:flex">{STATUS_KEYS.map((status) => { const meta = STATUS[status]; const Icon = meta.icon; const active = row.attendance?.status === status; return <button type="button" key={status} onClick={() => setStatus(row.id, status)} className={`inline-flex min-w-0 items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-black ring-1 transition ${active ? meta.classes : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"}`}><Icon className="h-3.5 w-3.5 shrink-0" /><span>{meta.label}</span></button>; })}</div>;

  return <div className="school-attendance space-y-4 sm:space-y-6"><style>{`@media print { body * { visibility:hidden !important; } #attendance-print, #attendance-print * { visibility:visible !important; } #attendance-print { position:absolute; left:0; top:0; width:100%; } .attendance-no-print { display:none !important; } .attendance-print-table { border-collapse:collapse; width:100%; } .attendance-print-table th,.attendance-print-table td { border:1px solid #999; padding:7px; color:#000; } }`}</style>
    <div className="attendance-no-print flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-4 sm:rounded-3xl sm:p-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-1 text-xs font-bold uppercase tracking-wider text-orange-600">Daily classroom attendance</p><h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Take attendance</h1><p className="mt-1 text-sm text-slate-500 sm:mt-2">Choose a class and its students load immediately.</p></div><div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3"><label className="text-xs font-bold text-slate-700">Class<select value={classId} onChange={(e) => changeClass(e.target.value)} className="mt-1 block h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm font-medium outline-none focus:border-orange-400 sm:min-w-52 sm:px-3"><option value="">Select class</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}{c.grade ? ` · ${c.grade}` : ""}</option>)}</select></label><label className="text-xs font-bold text-slate-700">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm font-medium outline-none focus:border-orange-400 sm:px-3" /></label><button type="button" onClick={() => window.print()} disabled={!selectedClass || !rows.length} className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-black text-white disabled:opacity-40 sm:col-span-1"><Printer className="h-4 w-4" /> Print</button></div></div>
    {switching && <div className="attendance-no-print rounded-xl border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">Loading {selectedClass?.name || "class"} students…</div>}{error && <ErrorState message={error} />}{notice && <div className="attendance-no-print rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">{notice}</div>}
    <div id="attendance-print"><div className="mb-3 hidden print:block"><h1 className="text-2xl font-black">Attendance — {selectedClass?.name || "Class"}</h1><p>{date} · {rows.length} students</p></div>
      <div className="attendance-no-print grid grid-cols-4 gap-1.5 sm:gap-3">{[{ key: "present", label: "Present" }, { key: "absent", label: "Absent" }, { key: "excused", label: "Excused" }, { key: "unmarked", label: "Not marked" }].map(({ key, label }) => <div key={key} className="min-w-0 rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-center shadow-sm sm:rounded-2xl sm:p-4"><p className="truncate text-[10px] font-bold text-slate-500 sm:text-sm">{label}</p><p className="mt-0.5 text-lg font-black text-slate-950 sm:mt-1 sm:text-2xl">{counts[key] || 0}</p></div>)}</div>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-4 sm:rounded-3xl"><div className="attendance-no-print flex flex-col gap-2 border-b border-slate-100 p-3 sm:p-5 lg:flex-row lg:items-center lg:justify-between"><div className="grid grid-cols-2 gap-2 sm:flex"><button onClick={() => markAll("present")} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:rounded-xl sm:text-sm">Mark all present</button><button onClick={() => markAll("absent")} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 sm:rounded-xl sm:text-sm">Mark all absent</button></div><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student..." className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none sm:h-10 sm:w-64 sm:rounded-xl" /></div></div>
        <div className="hidden overflow-x-auto sm:block"><table className="attendance-print-table w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">School ID</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Note</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredRows.map((row) => <tr key={row.id} className="hover:bg-slate-50/70"><td className="px-5 py-4 font-black">{row.name}</td><td className="px-5 py-4 font-bold text-slate-600">{row.registration_no || "—"}</td><td className="px-5 py-4"><StatusButtons row={row} /></td><td className="px-5 py-4"><input value={row.attendance?.note || ""} onChange={(e) => setRows((current) => current.map((r) => r.id === row.id ? { ...r, attendance: { ...(r.attendance || {}), note: e.target.value } } : r))} placeholder="Optional" className="h-9 w-44 rounded-lg border border-slate-200 px-3 text-sm outline-none" /></td></tr>)}</tbody></table></div>
        <div className="divide-y divide-slate-100 sm:hidden">{filteredRows.map((row) => <div key={row.id} className="p-3"><div className="mb-2 flex min-w-0 items-center justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{row.name}</p><p className="text-[11px] font-semibold text-slate-400">School ID: {row.registration_no || "—"}</p></div><span className="shrink-0 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">{row.attendance?.status ? STATUS[row.attendance.status]?.label : "Not marked"}</span></div><StatusButtons row={row} /><input value={row.attendance?.note || ""} onChange={(e) => setRows((current) => current.map((r) => r.id === row.id ? { ...r, attendance: { ...(r.attendance || {}), note: e.target.value } } : r))} placeholder="Note (optional)" className="mt-2 h-8 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none" /></div>)}{!filteredRows.length && <div className="px-5 py-16 text-center"><Users className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-bold text-slate-700">No students in this class</p></div>}</div>
        <div className="attendance-no-print flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-5"><p className="text-xs text-slate-500 sm:text-sm">{rows.length} students · {date}</p><button onClick={save} disabled={saving || !rows.length} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-black text-white shadow-lg shadow-orange-200 disabled:opacity-50"><Check className="h-5 w-5" />{saving ? "Saving..." : "Save attendance"}</button></div>
      </div>
    </div>
  </div>;
}
