import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, History, Save, Sparkles } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/AsyncState";

const SUBJECTS = {
  primary: ["Arabic", "Science", "Math", "Technology", "Tarbiya", "Social Studies", "Somali", "English"],
  secondary: ["Arabic", "Tarbiya", "History", "Geography", "Chemistry", "Biology", "Technology", "Business", "Somali", "English", "Math"],
};
const TERMS = [
  { key: "term_1", label: "Term 1" },
  { key: "term_2", label: "Term 2" },
  { key: "term_3", label: "Term 3" },
];
const ASSESSMENTS = ["Exam 1", "Exam 2", "Exam 3", "Exam 4"];
const defaultAcademicYear = () => { const y = new Date().getFullYear(); return new Date().getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };
const termLabel = (term) => TERMS.find((x) => x.key === term)?.label || term;
const keyFor = (studentId, subject, attempt) => `${studentId}:${subject}:${attempt}`;

function HistoryPanel({ studentId, onClose }) {
  const [state, setState] = useState({ loading: true, error: "", student: null, data: [] });
  useEffect(() => {
    apiRequest(`/school/students/${studentId}/exam-history`)
      .then((r) => setState({ loading: false, error: "", student: r.student, data: r.data || [] }))
      .catch((e) => setState({ loading: false, error: e.message, student: null, data: [] }));
  }, [studentId]);
  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;
  const grouped = state.data.reduce((acc, item) => {
    const key = `${item.school_exams?.academic_year || "Unknown year"} · ${termLabel(item.school_exams?.term)}`;
    (acc[key] ||= []).push(item);
    return acc;
  }, {});
  return <div className="motion-pop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Student academic history</p><h2 className="mt-1 text-xl font-black">{state.student?.name}</h2><p className="text-sm text-slate-500">School ID {state.student?.registration_no} · {state.student?.school_classes?.name || "No class"}</p></div>
        <button className="btn-secondary" onClick={onClose}>Close</button>
      </div>
      <div className="max-h-[72vh] overflow-auto p-5">
        {!state.data.length ? <EmptyState title="No past results" description="This student does not have saved examination results yet." /> : <div className="space-y-5">{Object.entries(grouped).map(([group, items]) => <div key={group} className="overflow-hidden rounded-2xl border border-slate-200"><div className="bg-orange-50 px-4 py-3 font-black text-orange-800">{group}</div><table className="min-w-full text-left text-sm"><thead className="bg-slate-50"><tr className="border-b text-xs uppercase text-slate-500"><th className="px-4 py-3">Subject</th><th className="px-3 py-3">Exam 1</th><th className="px-3 py-3">Exam 2</th><th className="px-3 py-3">Exam 3</th><th className="px-3 py-3">Exam 4</th><th className="px-3 py-3">Total / 100</th></tr></thead><tbody className="divide-y">{items.map((item, i) => <tr key={`${item.subject}-${i}`}><td className="px-4 py-3 font-semibold">{item.subject}</td><td className="px-3 py-3">{item.attempt_one ?? 0}/20</td><td className="px-3 py-3">{item.attempt_two ?? 0}/20</td><td className="px-3 py-3">{item.attempt_three ?? 0}/20</td><td className="px-3 py-3">{item.attempt_four ?? 0}/20</td><td className="px-3 py-3 font-black text-orange-700">{item.score ?? 0}/100</td></tr>)}</tbody></table></div>)}</div>}
      </div>
    </div>
  </div>;
}

function ClassExamBook({ schoolClass, academicYear, onBack }) {
  const subjects = SUBJECTS[schoolClass.level === "secondary" ? "secondary" : "primary"];
  const [term, setTerm] = useState("term_1");
  const [terms, setTerms] = useState([]);
  const [students, setStudents] = useState([]);
  const [exam, setExam] = useState(null);
  const [scores, setScores] = useState({});
  const [historyStudent, setHistoryStudent] = useState(null);
  const [status, setStatus] = useState({ loading: true, saving: false, preparing: false, error: "", success: "" });

  const load = async (selectedTerm = term) => {
    setStatus((s) => ({ ...s, loading: true, error: "" }));
    try {
      const [er, sr] = await Promise.all([
        apiRequest(`/school/exams?class_id=${schoolClass.id}&academic_year=${encodeURIComponent(academicYear)}`),
        apiRequest(`/school/students?class_id=${schoolClass.id}`),
      ]);
      const list = er.data || [];
      setTerms(list);
      setStudents(sr.data || []);
      const current = list.find((x) => x.term === selectedTerm) || null;
      setExam(current);
      if (current) {
        const rr = await apiRequest(`/school/exams/${current.id}/results`);
        const map = {};
        (rr.data || []).forEach((r) => {
          map[keyFor(r.student_id, r.subject, 1)] = r.attempt_one ?? "";
          map[keyFor(r.student_id, r.subject, 2)] = r.attempt_two ?? "";
          map[keyFor(r.student_id, r.subject, 3)] = r.attempt_three ?? "";
          map[keyFor(r.student_id, r.subject, 4)] = r.attempt_four ?? "";
        });
        setScores(map);
      } else setScores({});
    } catch (e) {
      setStatus((s) => ({ ...s, error: e.message }));
    } finally {
      setStatus((s) => ({ ...s, loading: false }));
    }
  };
  useEffect(() => { load(term); }, [schoolClass.id, academicYear]);

  const prepareAllTerms = async () => {
    setStatus((s) => ({ ...s, preparing: true, error: "", success: "" }));
    try {
      for (const t of TERMS) await apiRequest("/school/exams", { method: "POST", body: JSON.stringify({ class_id: schoolClass.id, term: t.key, academic_year: academicYear }) });
      await load(term);
      setStatus((s) => ({ ...s, preparing: false, success: "All 3 terms are ready. Each subject has 4 exams × 20 marks = 100." }));
    } catch (e) { setStatus((s) => ({ ...s, preparing: false, error: e.message })); }
  };
  const setScore = (studentId, subject, attempt, value) => setScores((s) => ({ ...s, [keyFor(studentId, subject, attempt)]: value }));
  const totalFor = (studentId, subject) => [1,2,3,4].reduce((sum, attempt) => sum + (Number(scores[keyFor(studentId, subject, attempt)]) || 0), 0);
  const save = async () => {
    if (!exam) return;
    setStatus((s) => ({ ...s, saving: true, error: "", success: "" }));
    try {
      const results = [];
      students.forEach((student) => subjects.forEach((subject) => {
        const values = [1,2,3,4].map((attempt) => scores[keyFor(student.id, subject, attempt)]);
        if (values.some((v) => v !== "" && v !== undefined && v !== null)) results.push({ student_id: student.id, subject, attempt_one: values[0], attempt_two: values[1], attempt_three: values[2], attempt_four: values[3] });
      }));
      await apiRequest(`/school/exams/${exam.id}/results`, { method: "POST", body: JSON.stringify({ results }) });
      setStatus((s) => ({ ...s, saving: false, success: `${termLabel(term)} results saved. Every subject is now out of 100.` }));
      await load(term);
    } catch (e) { setStatus((s) => ({ ...s, saving: false, error: e.message })); }
  };

  if (status.loading) return <LoadingState />;
  return <div className="space-y-5 motion-card">
    <div className="flex items-center gap-3"><button className="btn-secondary" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Classes</button><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Examination book</p><h1 className="text-2xl font-black">{schoolClass.name}</h1></div></div>
    <div className="rounded-3xl border border-orange-100 bg-gradient-to-r from-white via-orange-50 to-amber-50 p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-semibold text-slate-500">{schoolClass.level === "secondary" ? "Secondary · Dugsi Sare" : "Primary school"} · {academicYear}</p><h2 className="mt-1 text-xl font-black">Four-exam mark book</h2><p className="mt-1 text-sm text-slate-500">Every subject: Exam 1 + Exam 2 + Exam 3 + Exam 4. Each exam is out of 20. Total is automatically calculated out of 100.</p></div><button className="btn-primary" onClick={prepareAllTerms} disabled={status.preparing}><Sparkles className="h-4 w-4" />{status.preparing ? "Preparing…" : "Prepare all 3 terms"}</button></div></div>
    {status.error && <ErrorState message={status.error} />}{status.success && <div className="motion-pop rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{status.success}</div>}
    <div className="grid gap-3 md:grid-cols-3">{TERMS.map((t) => { const exists = terms.find((x) => x.term === t.key); return <button key={t.key} onClick={() => { setTerm(t.key); load(t.key); }} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${term === t.key ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white"}`}><div className="flex items-center justify-between"><span className="font-black">{t.label}</span>{exists ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <span className="text-xs text-slate-400">Not started</span>}</div><p className="mt-1 text-xs text-slate-500">{exists ? "Ready · enter 4 exams" : "Not started"}</p></button>; })}</div>
    {!exam ? <div className="panel flex min-h-[300px] items-center justify-center p-8"><EmptyState title={`${termLabel(term)} has not been started`} description="Use Prepare all 3 terms to create the examination book for this class." /></div> : <div className="panel overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="font-black">{termLabel(term)} · {students.length} students · {subjects.length} subjects</h3><p className="text-xs text-slate-500">Each score is 0–20. Total is calculated live and saved out of 100.</p></div><button className="btn-primary" onClick={save} disabled={status.saving}><Save className="h-4 w-4" />{status.saving ? "Saving…" : "Save results"}</button></div>
      <div className="overflow-x-auto"><table className="min-w-[1700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th rowSpan="2" className="sticky left-0 z-20 bg-slate-50 px-4 py-3">Student</th>{subjects.map((subject) => <th key={subject} colSpan="5" className="border-l border-slate-200 px-2 py-3 text-center text-orange-700">{subject}</th>)}<th rowSpan="2" className="px-4 py-3 text-center">History</th></tr><tr>{subjects.flatMap((subject) => [1,2,3,4].map((n) => <th key={`${subject}-${n}`} className="border-l border-slate-100 px-2 py-2 text-center">E{n} /20</th>)).concat(subjects.map((subject) => null))}</tr></thead><tbody className="divide-y divide-slate-100">{students.length ? students.map((student) => <tr key={student.id} className="transition hover:bg-orange-50/30"><td className="sticky left-0 z-10 bg-white px-4 py-3"><button className="text-left" onClick={() => setHistoryStudent(student.id)}><p className="font-black text-slate-900 hover:text-orange-600">{student.name}</p><p className="text-[11px] font-bold text-slate-400">ID {student.registration_no || "-"}</p></button></td>{subjects.map((subject) => <React.Fragment key={subject}>{[1,2,3,4].map((attempt) => <td key={`${subject}-${attempt}`} className="border-l border-slate-100 px-1 py-2"><input type="number" min="0" max="20" step="1" className="field w-16 text-center" placeholder="0" value={scores[keyFor(student.id, subject, attempt)] ?? ""} onChange={(e) => setScore(student.id, subject, attempt, e.target.value)} /></td>)}<td className="border-l border-slate-200 bg-orange-50/50 px-2 py-2 text-center font-black text-orange-700">{totalFor(student.id, subject)}/100</td></React.Fragment>)}<td className="px-4 py-3 text-center"><button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-orange-100 text-orange-600 hover:bg-orange-50" title="View past examinations" onClick={() => setHistoryStudent(student.id)}><History className="h-4 w-4" /></button></td></tr>) : <tr><td colSpan={subjects.length * 5 + 2} className="p-10"><EmptyState title="No students in this class" description="Register students and assign them to this class first." /></td></tr>}</tbody></table></div>
      <div className="border-t border-slate-100 bg-orange-50/60 p-4 text-sm font-semibold text-orange-900">Marking rule: <strong>20 + 20 + 20 + 20 = 100 marks</strong> for every subject.</div>
    </div>}
    {historyStudent && <HistoryPanel studentId={historyStudent} onClose={() => setHistoryStudent(null)} />}
  </div>;
}

export default function SchoolExams() {
  const [classes, setClasses] = useState([]); const [academicYear, setAcademicYear] = useState(defaultAcademicYear()); const [selected, setSelected] = useState(null); const [status, setStatus] = useState({ loading: true, error: "" });
  const load = async () => { setStatus({ loading: true, error: "" }); try { const r = await apiRequest("/school/classes"); setClasses(r.data || []); setStatus({ loading: false, error: "" }); } catch (e) { setStatus({ loading: false, error: e.message }); } };
  useEffect(() => { load(); }, []);
  const summary = useMemo(() => ({ primary: classes.filter((c) => c.level !== "secondary").length, secondary: classes.filter((c) => c.level === "secondary").length }), [classes]);
  if (status.loading) return <LoadingState />; if (status.error) return <ErrorState message={status.error} />; if (selected) return <ClassExamBook schoolClass={selected} academicYear={academicYear} onBack={() => setSelected(null)} />;
  return <div className="space-y-5 motion-card"><div className="rounded-3xl border border-orange-100 bg-gradient-to-r from-white via-orange-50/70 to-amber-50 p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Academic records</p><h1 className="mt-1 text-2xl font-black">Examination Book</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">Choose a class, select a term, and enter four assessments for every subject. Each subject is automatically totaled out of 100.</p></div><div className="flex items-center gap-2"><label className="text-xs font-bold text-slate-500">Academic year</label><input className="field w-36" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2026-2027" /></div></div><div className="mt-5 grid max-w-md grid-cols-2 gap-3"><div className="rounded-2xl border border-white bg-white/80 p-4"><p className="text-xs font-semibold text-slate-500">Primary classes</p><p className="mt-1 text-2xl font-black text-orange-700">{summary.primary}</p></div><div className="rounded-2xl border border-white bg-white/80 p-4"><p className="text-xs font-semibold text-slate-500">Secondary · Dugsi Sare</p><p className="mt-1 text-2xl font-black text-orange-700">{summary.secondary}</p></div></div></div>{!classes.length ? <div className="panel flex min-h-[360px] items-center justify-center"><EmptyState title="No classes yet" description="Create your Primary and Secondary classes first." /></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{classes.map((schoolClass) => <button key={schoolClass.id} onClick={() => setSelected(schoolClass)} className="panel group p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"><div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700"><BookOpen className="h-5 w-5" /></div><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{schoolClass.level === "secondary" ? "Dugsi Sare" : "Primary"}</span></div><h2 className="mt-4 text-lg font-black">{schoolClass.name}</h2><p className="mt-1 text-sm text-slate-500">Open this class examination book</p><div className="mt-4 flex items-center justify-between text-sm font-bold text-orange-700"><span>4 exams × 20 = 100</span><span>Open →</span></div></button>)}</div>}</div>;
}
