import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Plus, GraduationCap, Users, X, Download, Search, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/AsyncState";

const csvEscape = (value) => {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const studentClassId = (student) => student?.class_id || student?.school_classes?.id || null;

export default function SchoolClasses() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", grade: "", level: "primary", teacher_id: "" });
  const [status, setStatus] = useState({ loading: true, saving: false, error: "" });

  const load = async () => {
    setStatus((s) => ({ ...s, loading: true, error: "" }));
    try {
      const [c, t] = await Promise.all([
        apiRequest("/school/classes"),
        apiRequest("/school/teachers"),
      ]);
      setClasses(c.data || []);
      setTeachers(t.data || []);
    } catch (e) {
      setStatus((s) => ({ ...s, error: e.message }));
    } finally {
      setStatus((s) => ({ ...s, loading: false }));
    }
  };

  const loadAllStudents = async () => {
    try {
      const response = await apiRequest("/school/students");
      setStudents(response.data || []);
    } catch (e) {
      setStatus((s) => ({ ...s, error: e.message }));
    }
  };

  const openClass = async (schoolClass) => {
    setSelectedClass(schoolClass);
    setSearch("");
    setRosterError("");
    setRosterLoading(true);
    try {
      // Always fetch the selected class directly. This prevents the roster from
      // depending on whatever student list happened to be loaded previously.
      const response = await apiRequest(`/school/students?class_id=${encodeURIComponent(schoolClass.id)}`);
      setStudents(response.data || []);
    } catch (e) {
      setRosterError(e.message || "Could not load this class roster.");
      setStudents([]);
    } finally {
      setRosterLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadAllStudents();
  }, []);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus((s) => ({ ...s, saving: true, error: "" }));
    try {
      await apiRequest("/school/classes", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", grade: "", level: "primary", teacher_id: "" });
      await load();
      await loadAllStudents();
    } catch (e) {
      setStatus((s) => ({ ...s, error: e.message }));
    } finally {
      setStatus((s) => ({ ...s, saving: false }));
    }
  };

  const del = async (id) => {
    if (!window.confirm("Remove this class? Students will not be deleted.")) return;
    try {
      await apiRequest(`/school/classes/${id}`, { method: "DELETE" });
      if (String(selectedClass?.id) === String(id)) setSelectedClass(null);
      await load();
      await loadAllStudents();
    } catch (e) {
      setStatus((s) => ({ ...s, error: e.message }));
    }
  };

  const classCounts = useMemo(() => {
    const counts = new Map();
    students.forEach((student) => {
      const id = studentClassId(student);
      if (id != null) counts.set(String(id), (counts.get(String(id)) || 0) + 1);
    });
    return counts;
  }, [students]);

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const q = search.trim().toLowerCase();
    return students
      .filter((student) => String(studentClassId(student) || "") === String(selectedClass.id))
      .filter((student) => !q || `${student.registration_no || ""} ${student.name || ""} ${student.guardian_name || ""} ${student.phone_number || ""}`.toLowerCase().includes(q))
      .sort((a, b) => Number(a.registration_no || 0) - Number(b.registration_no || 0));
  }, [students, selectedClass, search]);

  const exportClass = () => {
    if (!selectedClass) return;
    const headers = ["School ID", "Student Name", "Guardian", "Guardian Type", "Phone", "Age", "Status"];
    const rows = classStudents.map((student) => [
      student.registration_no,
      student.name,
      student.guardian_name,
      student.guardian_type,
      student.phone_number || student.guardian_phone,
      student.age,
      student.status || "active",
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedClass.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-students.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (status.loading) return <LoadingState />;

  return (
    <div className="space-y-5 motion-card school-classes-official">
      <style>{`
        .school-classes-official .class-card { transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
        .school-classes-official .class-card:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(15,23,42,.09); border-color: #fdba74; }
        .school-classes-official .btn-orange { background: linear-gradient(135deg,#f97316,#ea580c); color:white; box-shadow:0 10px 24px rgba(234,88,12,.2); }
        .school-classes-official .btn-orange:hover { filter:brightness(.97); transform:translateY(-1px); }
        .school-classes-official .spreadsheet th { background:#fff7ed; color:#9a3412; position:sticky; top:0; z-index:1; }
        .school-classes-official .spreadsheet td, .school-classes-official .spreadsheet th { border-right:1px solid #f1f5f9; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
      `}</style>

      <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-white via-orange-50/40 to-amber-50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">School setup</p>
            <h2 className="mt-1 text-2xl font-black">Classes & sections</h2>
            <p className="mt-1 text-sm text-slate-500">Click any class to immediately open that class's students.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-orange-100">
            <GraduationCap className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-bold text-slate-700">{classes.length} classes</span>
          </div>
        </div>
      </div>

      {status.error && <ErrorState message={status.error} />}

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="panel h-fit p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><BookOpen className="h-5 w-5" /></div>
            <div><p className="text-xs font-bold uppercase tracking-wider text-orange-600">Quick add</p><h2 className="font-black">Add Class</h2></div>
          </div>
          <div className="space-y-3">
            <input className="field" placeholder="Class name (e.g. Grade 5A)" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <input className="field" placeholder="Grade / level" value={form.grade} onChange={(e) => set("grade", e.target.value)} />
            <select className="field" value={form.level} onChange={(e) => set("level", e.target.value)}>
              <option value="primary">Primary school</option>
              <option value="secondary">Secondary school · Dugsi Sare</option>
            </select>
            <select className="field" value={form.teacher_id} onChange={(e) => set("teacher_id", e.target.value)}>
              <option value="">Assign teacher (optional)</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
            </select>
          </div>
          <button className="btn-primary mt-4 w-full" disabled={status.saving}>
            <Plus className="h-4 w-4" />{status.saving ? "Saving…" : "Add class"}
          </button>
        </form>

        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {classes.length === 0 ? (
            <div className="panel col-span-full flex min-h-[300px] items-center justify-center p-8">
              <EmptyState title="No classes yet" description="Add your first Primary or Secondary class to start enrolling students." />
            </div>
          ) : classes.map((schoolClass) => {
            const count = classCounts.get(String(schoolClass.id)) || 0;
            const secondary = schoolClass.level === "secondary";
            return (
              <button
                key={schoolClass.id}
                type="button"
                onClick={() => openClass(schoolClass)}
                className="class-card panel text-left p-5 focus:outline-none focus:ring-4 focus:ring-orange-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${secondary ? "bg-violet-50 text-violet-600" : "bg-orange-50 text-orange-600"}`}>
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-900">{schoolClass.name}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${secondary ? "bg-violet-50 text-violet-700" : "bg-orange-50 text-orange-700"}`}>{secondary ? "Dugsi Sare" : "Primary"}</span>
                  {schoolClass.grade && <span className="text-xs font-semibold text-slate-400">Grade {schoolClass.grade}</span>}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-600"><Users className="h-4 w-4 text-orange-500" />{count} students</span>
                  <span className="text-xs font-bold text-orange-600">Open roster</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{schoolClass.school_teachers?.name || "No teacher assigned"}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); del(schoolClass.id); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); del(schoolClass.id); } }}
                    className="cursor-pointer font-semibold text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="inline h-3.5 w-3.5" /> Remove
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5"><div className="flex items-center gap-3"><GraduationCap className="h-5 w-5 text-orange-600" /><h3 className="font-black">Primary subjects</h3></div><p className="mt-2 text-sm text-slate-500">Arabic · Science · Math · Technology · Tarbiya · Social Studies · Somali · English</p></div>
        <div className="panel p-5"><div className="flex items-center gap-3"><GraduationCap className="h-5 w-5 text-violet-600" /><h3 className="font-black">Secondary subjects · Dugsi Sare</h3></div><p className="mt-2 text-sm text-slate-500">Arabic · Tarbiya · History · Geography · Chemistry · Biology · Technology · Business · Somali · English · Math</p></div>
      </div>

      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedClass(null); }}>
          <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-white to-orange-50/60 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><Users className="h-6 w-6" /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Class register</p>
                  <h2 className="text-xl font-black">{selectedClass.name}</h2>
                  <p className="text-sm text-slate-500">{selectedClass.level === "secondary" ? "Secondary · Dugsi Sare" : "Primary"} · {rosterLoading ? "Loading students…" : `${classStudents.length} students`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={exportClass} disabled={rosterLoading || classStudents.length === 0} className="btn-orange inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" />Export class</button>
                <button type="button" onClick={() => setSelectedClass(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="border-b border-slate-100 bg-white px-6 py-3">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} className="field pl-9" placeholder="Search student name, ID or guardian…" disabled={rosterLoading} />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              {rosterLoading ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <p className="font-semibold">Loading {selectedClass.name} students…</p>
                </div>
              ) : rosterError ? (
                <div className="p-6"><ErrorState message={rosterError} /></div>
              ) : classStudents.length === 0 ? (
                <div className="flex min-h-[280px] items-center justify-center p-8"><EmptyState title={`No students in ${selectedClass.name}`} description="Register a student and select this class to build its roster." /></div>
              ) : (
                <table className="spreadsheet min-w-full border-collapse text-sm">
                  <thead><tr><th className="px-4 py-3 text-left font-black">School ID</th><th className="px-4 py-3 text-left font-black">Student name</th><th className="px-4 py-3 text-left font-black">Guardian</th><th className="px-4 py-3 text-left font-black">Phone</th><th className="px-4 py-3 text-left font-black">Age</th><th className="px-4 py-3 text-left font-black">Status</th></tr></thead>
                  <tbody>
                    {classStudents.map((student, index) => (
                      <tr key={student.id} className={index % 2 ? "bg-slate-50/50" : "bg-white"}>
                        <td className="px-4 py-3 font-black text-orange-700">{student.registration_no || "—"}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{student.name}</td>
                        <td className="px-4 py-3"><span className="font-semibold text-slate-700">{student.guardian_name || student.father_name || student.mother_name || "—"}</span>{student.guardian_type && <span className="ml-2 text-xs font-bold text-orange-600">{student.guardian_type}</span>}</td>
                        <td className="px-4 py-3 text-slate-600">{student.phone_number || student.guardian_phone || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{student.age ?? "—"}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${student.status === "inactive" ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}>{student.status || "active"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
