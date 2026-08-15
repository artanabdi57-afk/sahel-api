import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Save, Settings2 } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/AsyncState";

const SUBJECTS = {
  primary: ["Arabic", "Science", "Math", "Technology", "Tarbiya", "Social Studies", "Somali", "English"],
  secondary: ["Arabic", "Tarbiya", "History", "Geography", "Chemistry", "Biology", "Technology", "Business", "Somali", "English", "Math"],
};
const ASSESSMENTS = ["Exam 1", "Exam 2", "Exam 3", "Exam 4"];
const DEFAULT_LIMITS = [20, 20, 20, 20];
const defaultAcademicYear = () => { const y = new Date().getFullYear(); return new Date().getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };
const safeLimit = (value, fallback = 20) => { const n = Number(value); return Number.isFinite(n) && n >= 1 && n <= 100 ? n : fallback; };
const limitsFromExam = (exam) => [safeLimit(exam?.assessment_one_max), safeLimit(exam?.assessment_two_max), safeLimit(exam?.assessment_three_max), safeLimit(exam?.assessment_four_max)];
const keyFor = (studentId, subject, attempt) => `${studentId}:${subject}:${attempt}`;

function ClassExamBook({ schoolClass, academicYear, onBack }) {
  const subjects = SUBJECTS[schoolClass.level === "secondary" ? "secondary" : "primary"];
  const [students, setStudents] = useState([]);
  const [exam, setExam] = useState(null);
  const [limits, setLimits] = useState(DEFAULT_LIMITS);
  const [scores, setScores] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState({ loading: true, saving: false, savingLimits: false, error: "", success: "" });

  const load = async () => {
    setStatus((s) => ({ ...s, loading: true, error: "" }));
    try {
      const [er, sr] = await Promise.all([
        apiRequest(`/school/exams?class_id=${schoolClass.id}&academic_year=${encodeURIComponent(academicYear)}`),
        apiRequest(`/school/students?class_id=${schoolClass.id}`),
      ]);
      const list = er.data || [];
      setStudents(sr.data || []);
      const current = list.find((x) => x.term === "term_1") || list[0] || null;
      if (!current) {
        const created = await apiRequest("/school/exams", { method: "POST", body: JSON.stringify({ class_id: schoolClass.id, term: "term_1", academic_year: academicYear, assessment_one_max: 20, assessment_two_max: 20, assessment_three_max: 20, assessment_four_max: 20, name: `${schoolClass.name} Examination` }) });
        setExam(created.data); setLimits(limitsFromExam(created.data)); setScores({}); return;
      }
      setExam(current); setLimits(limitsFromExam(current));
      const rr = await apiRequest(`/school/exams/${current.id}/results`);
      const map = {};
      (rr.data || []).forEach((r) => {
        map[keyFor(r.student_id, r.subject, 1)] = r.attempt_one ?? "";
        map[keyFor(r.student_id, r.subject, 2)] = r.attempt_two ?? "";
        map[keyFor(r.student_id, r.subject, 3)] = r.attempt_three ?? "";
        map[keyFor(r.student_id, r.subject, 4)] = r.attempt_four ?? "";
      });
      setScores(map);
    } catch (e) { setStatus((s) => ({ ...s, error: e.message })); }
    finally { setStatus((s) => ({ ...s, loading: false })); }
  };

  useEffect(() => { load(); }, [schoolClass.id, academicYear]);

  const setScore = (studentId, subject, attempt, value) => {
    const max = limits[attempt - 1];
    const raw = value === "" ? "" : Number(value);
    const next = value === "" ? "" : Number.isFinite(raw) ? Math.min(Math.max(raw, 0), max) : "";
    setScores((s) => ({ ...s, [keyFor(studentId, subject, attempt)]: next }));
  };

  const setLimit = (attempt, value) => {
    const index = attempt - 1;
    const nextLimit = Math.min(100, Math.max(1, Number(value) || 1));
    setLimits((current) => current.map((v, i) => i === index ? nextLimit : v));
    setScores((current) => {
      const next = { ...current };
      students.forEach((student) => subjects.forEach((subject) => {
        const key = keyFor(student.id, subject, attempt);
        if (next[key] !== "" && next[key] !== undefined) next[key] = Math.min(Number(next[key]) || 0, nextLimit);
      }));
      return next;
    });
  };

  const saveLimits = async () => {
    if (!exam) return;
    setStatus((s) => ({ ...s, savingLimits: true, error: "", success: "" }));
    try {
      const r = await apiRequest("/school/exams", { method: "POST", body: JSON.stringify({ class_id: schoolClass.id, term: "term_1", academic_year: academicYear, assessment_one_max: limits[0], assessment_two_max: limits[1], assessment_three_max: limits[2], assessment_four_max: limits[3], name: `${schoolClass.name} Examination` }) });
      setExam(r.data); setLimits(limitsFromExam(r.data)); setShowSettings(false);
      setStatus((s) => ({ ...s, savingLimits: false, success: `Exam limits saved: ${limits.join(" + ")} = ${limits.reduce((a, b) => a + b, 0)} total marks.` }));
    } catch (e) { setStatus((s) => ({ ...s, savingLimits: false, error: e.message })); }
  };

  const totalFor = (studentId, subject) => [1, 2, 3, 4].reduce((sum, attempt) => sum + (Number(scores[keyFor(studentId, subject, attempt)]) || 0), 0);
  const totalMax = limits.reduce((sum, value) => sum + value, 0);

  const save = async () => {
    if (!exam) return;
    setStatus((s) => ({ ...s, saving: true, error: "", success: "" }));
    try {
      const results = [];
      students.forEach((student) => subjects.forEach((subject) => {
        const values = [1, 2, 3, 4].map((attempt) => scores[keyFor(student.id, subject, attempt)]);
        if (values.some((v) => v !== "" && v !== undefined && v !== null)) results.push({ student_id: student.id, subject, attempt_one: values[0], attempt_two: values[1], attempt_three: values[2], attempt_four: values[3] });
      }));
      await apiRequest(`/school/exams/${exam.id}/results`, { method: "POST", body: JSON.stringify({ results }) });
      setStatus((s) => ({ ...s, saving: false, success: "Exam results saved." }));
      await load();
    } catch (e) { setStatus((s) => ({ ...s, saving: false, error: e.message })); }
  };

  if (status.loading) return <LoadingState />;

  return <div className="space-y-5 motion-card">
    <div className="flex items-center gap-3"><button className="btn-secondary" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Classes</button><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Examination book</p><h1 className="text-2xl font-black">{schoolClass.name}</h1></div></div>
    <div className="rounded-3xl border border-orange-100 bg-gradient-to-r from-white via-orange-50 to-amber-50 p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-semibold text-slate-500">{schoolClass.level === "secondary" ? "Secondary · Dugsi Sare" : "Primary school"} · {academicYear}</p><h2 className="mt-1 text-xl font-black">Four-exam mark book</h2><p className="mt-1 text-sm text-slate-500">One examination book for this class. Exam 1, Exam 2, Exam 3 and Exam 4 stay separate, with a final total for each subject.</p></div><button className="btn-secondary" onClick={() => setShowSettings((v) => !v)}><Settings2 className="h-4 w-4" /> Customize exam limits</button></div></div>
    {showSettings && exam && <div className="motion-pop rounded-2xl border border-orange-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-black">Exam limits for {schoolClass.name}</p><p className="text-xs text-slate-500">Set each exam maximum. A teacher cannot enter a score above that number.</p></div><button className="btn-primary" onClick={saveLimits} disabled={status.savingLimits}>{status.savingLimits ? "Saving…" : "Save limits"}</button></div><div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{ASSESSMENTS.map((label, i) => <label key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="block text-xs font-bold text-slate-500">{label} maximum</span><input type="number" min="1" max="100" step="1" className="field mt-2 w-full text-center font-black" value={limits[i]} onChange={(e) => setLimit(i + 1, e.target.value)} /></label>)}</div></div>}
    {status.error && <ErrorState message={status.error} />}{status.success && <div className="motion-pop rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{status.success}</div>}
    {!exam ? <div className="panel flex min-h-[300px] items-center justify-center p-8"><EmptyState title="No exam book" description="An exam book could not be created for this class." /></div> : <div className="panel overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="font-black">{students.length} students · {subjects.length} subjects</h3><p className="text-xs text-slate-500">Each subject has four separate exams. Total maximum: {totalMax} marks.</p></div><button className="btn-primary" onClick={save} disabled={status.saving}><Save className="h-4 w-4" />{status.saving ? "Saving…" : "Save results"}</button></div><div className="overflow-auto"><table className="min-w-[1450px] w-full text-left text-sm"><thead className="bg-slate-50"><tr><th rowSpan="2" className="sticky left-0 z-20 min-w-48 border-r border-slate-200 bg-slate-50 px-4 py-3">Student</th>{subjects.map((subject) => <th key={subject} colSpan="5" className="border-r border-slate-200 px-3 py-3 text-center font-black text-orange-700">{subject}</th>)}</tr><tr>{subjects.map((subject) => <React.Fragment key={`${subject}-heads`}>{ASSESSMENTS.map((label, i) => <th key={`${subject}-${label}`} className="min-w-20 border-r border-slate-100 px-2 py-2 text-center text-xs font-bold text-slate-500">{label.replace("Exam ", "E")} /{limits[i]}</th>)}<th className="min-w-24 border-r border-slate-200 px-2 py-2 text-center text-xs font-black text-orange-700">Total /{totalMax}</th></React.Fragment>)}</tr></thead><tbody className="divide-y divide-slate-100">{students.map((student) => <tr key={student.id} className="hover:bg-orange-50/20"><td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-4 py-3"><p className="font-black">{student.name}</p><p className="text-xs text-slate-400">ID {student.registration_no || "—"}</p></td>{subjects.map((subject) => <React.Fragment key={`${student.id}-${subject}`}>{[1,2,3,4].map((attempt) => <td key={`${student.id}-${subject}-${attempt}`} className="border-r border-slate-100 p-2"><input aria-label={`${student.name} ${subject} Exam ${attempt}`} type="number" min="0" max={limits[attempt - 1]} value={scores[keyFor(student.id, subject, attempt)] ?? ""} onChange={(e) => setScore(student.id, subject, attempt, e.target.value)} className="h-11 w-20 rounded-xl border border-slate-200 bg-white px-2 text-center font-bold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" /></td>)}<td className="border-r border-slate-200 bg-orange-50/50 px-2 text-center font-black text-orange-700">{totalFor(student.id, subject)}/{totalMax}</td></React.Fragment>)}</tr>)}{!students.length && <tr><td colSpan={1 + subjects.length * 5} className="px-5 py-16 text-center"><BookOpen className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-bold text-slate-700">No students in this class</p></td></tr>}</tbody></table></div></div>}
  </div>;
}

export default function SchoolExams() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const academicYear = useMemo(defaultAcademicYear, []);

  useEffect(() => { apiRequest("/school/classes").then((r) => setClasses(r.data || [])).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (selectedClass) return <ClassExamBook schoolClass={selectedClass} academicYear={academicYear} onBack={() => setSelectedClass(null)} />;

  return <div className="space-y-6 motion-card"><div className="rounded-3xl border border-orange-100 bg-gradient-to-r from-white via-orange-50 to-amber-50 p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">School examinations</p><h1 className="mt-1 text-3xl font-black">Choose a class</h1><p className="mt-2 text-slate-500">Select Class 1, Class 2, Class 3, and so on. There are no Term 1, Term 2 or Term 3 choices here.</p></div>{!classes.length ? <div className="panel flex min-h-[300px] items-center justify-center p-8"><EmptyState title="No classes yet" description="Create a class first, then its examination book will appear here." /></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{classes.map((schoolClass) => <button key={schoolClass.id} onClick={() => setSelectedClass(schoolClass)} className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"><div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><BookOpen className="h-6 w-6" /></span><CheckCircle2 className="h-5 w-5 text-slate-200 transition group-hover:text-emerald-500" /></div><h2 className="mt-5 text-xl font-black text-slate-900">{schoolClass.name}</h2><p className="mt-1 text-sm text-slate-500">{schoolClass.grade || "Class"} · {schoolClass.level === "secondary" ? "Secondary" : "Primary"}</p><p className="mt-4 text-sm font-bold text-orange-600">Open exam book →</p></button>)}</div>}</div>;
}
