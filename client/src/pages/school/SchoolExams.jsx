import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Printer, Save } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/AsyncState";

const SUBJECTS = {
  primary: ["Arabic", "Science", "Math", "Technology", "Tarbiya", "Social Studies", "Somali", "English"],
  secondary: ["Arabic", "Tarbiya", "History", "Geography", "Chemistry", "Biology", "Technology", "Business", "Somali", "English", "Math"],
};
const EXAMS = [1, 2, 3, 4];
const defaultAcademicYear = () => { const y = new Date().getFullYear(); return new Date().getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };
const keyFor = (studentId, subject) => `${studentId}:${subject}`;

function PrintHeader({ schoolClass, academicYear, title }) {
  return <div className="print-header mb-5 border-b-2 border-slate-900 pb-3 text-center"><h1 className="text-xl font-black">{title}</h1><p className="mt-1 text-sm font-bold">{schoolClass.name} · {academicYear}</p><p className="text-xs">Sahel School Management</p></div>;
}

function ResultsTable({ students, subjects, values, max, combined = false }) {
  const subjectTotal = (studentId, subject) => combined ? EXAMS.reduce((sum, n) => sum + (Number(values[n]?.[keyFor(studentId, subject)]) || 0), 0) : (Number(values[Object.keys(values)[0]]?.[keyFor(studentId, subject)]) || 0);
  const studentTotal = (studentId) => subjects.reduce((sum, subject) => sum + subjectTotal(studentId, subject), 0);
  const totalMax = combined ? max * 4 : max;
  const grandMax = subjects.length * totalMax;
  const ranked = [...students].sort((a, b) => studentTotal(b.id) - studentTotal(a.id));
  const positions = new Map(ranked.map((s, i) => [s.id, i + 1]));
  return <table className="w-full border-collapse text-xs"><thead><tr className="bg-slate-100"><th className="border border-slate-400 px-2 py-2">No.</th><th className="border border-slate-400 px-2 py-2 text-left">Student Name</th>{subjects.map((subject) => <th key={subject} className="border border-slate-400 px-2 py-2">{subject}<span className="block font-normal">/{totalMax}</span></th>)}<th className="border border-slate-400 px-2 py-2">Total/{grandMax}</th><th className="border border-slate-400 px-2 py-2">%</th><th className="border border-slate-400 px-2 py-2">Position</th></tr></thead><tbody>{students.map((student, i) => { const total = studentTotal(student.id); const percent = grandMax ? ((total / grandMax) * 100).toFixed(1) : "0.0"; return <tr key={student.id}><td className="border border-slate-300 px-2 py-2 text-center">{i + 1}</td><td className="border border-slate-300 px-2 py-2 font-bold">{student.name}</td>{subjects.map((subject) => <td key={subject} className="border border-slate-300 px-2 py-2 text-center">{subjectTotal(student.id, subject)}</td>)}<td className="border border-slate-300 px-2 py-2 text-center font-black">{total}</td><td className="border border-slate-300 px-2 py-2 text-center">{percent}%</td><td className="border border-slate-300 px-2 py-2 text-center font-black">{positions.get(student.id)}</td></tr>; })}</tbody></table>;
}

function ClassExamBook({ schoolClass, academicYear, onBack }) {
  const subjects = SUBJECTS[schoolClass.level === "secondary" ? "secondary" : "primary"];
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [activeExam, setActiveExam] = useState(1);
  const [scores, setScores] = useState({ 1: {}, 2: {}, 3: {}, 4: {} });
  const [max, setMax] = useState(20);
  const [printMode, setPrintMode] = useState("exam");
  const [status, setStatus] = useState({ loading: true, saving: false, error: "", success: "" });

  const load = async () => {
    setStatus((s) => ({ ...s, loading: true, error: "" }));
    try {
      const [er, sr] = await Promise.all([apiRequest(`/school/exams?class_id=${schoolClass.id}&academic_year=${encodeURIComponent(academicYear)}`), apiRequest(`/school/students?class_id=${schoolClass.id}`)]);
      setStudents(sr.data || []);
      let list = (er.data || []).sort((a, b) => Number(a.exam_number || 1) - Number(b.exam_number || 1));
      for (const number of EXAMS) {
        if (!list.some((x) => Number(x.exam_number) === number)) {
          const created = await apiRequest("/school/exams", { method: "POST", body: JSON.stringify({ class_id: schoolClass.id, academic_year: academicYear, exam_number: number, max_score: 20, name: `${schoolClass.name} - Exam ${number}` }) });
          list.push(created.data);
        }
      }
      list.sort((a, b) => Number(a.exam_number) - Number(b.exam_number));
      setExams(list);
      const next = { 1: {}, 2: {}, 3: {}, 4: {} };
      for (const exam of list) { const number = Number(exam.exam_number); const rr = await apiRequest(`/school/exams/${exam.id}/results`); (rr.data || []).forEach((r) => { next[number][keyFor(r.student_id, r.subject)] = r.score ?? r.attempt_one ?? ""; }); }
      setScores(next);
      const firstMax = Number(list[0]?.max_score); if (Number.isFinite(firstMax) && firstMax > 0) setMax(firstMax);
    } catch (e) { setStatus((s) => ({ ...s, error: e.message })); } finally { setStatus((s) => ({ ...s, loading: false })); }
  };
  useEffect(() => { load(); }, [schoolClass.id, academicYear]);

  const activeRecord = exams.find((e) => Number(e.exam_number) === activeExam);
  const setScore = (studentId, subject, value) => { const raw = value === "" ? "" : Number(value); const next = value === "" ? "" : Number.isFinite(raw) ? Math.min(Math.max(raw, 0), max) : ""; setScores((s) => ({ ...s, [activeExam]: { ...s[activeExam], [keyFor(studentId, subject)]: next } })); };
  const save = async () => { if (!activeRecord) return; setStatus((s) => ({ ...s, saving: true, error: "", success: "" })); try { const results = []; students.forEach((student) => subjects.forEach((subject) => { const value = scores[activeExam]?.[keyFor(student.id, subject)]; if (value !== "" && value !== undefined) results.push({ student_id: student.id, subject, score: value }); })); await apiRequest(`/school/exams/${activeRecord.id}/results`, { method: "POST", body: JSON.stringify({ results }) }); setStatus((s) => ({ ...s, saving: false, success: `Exam ${activeExam} results saved.` })); await load(); } catch (e) { setStatus((s) => ({ ...s, saving: false, error: e.message })); } };
  const printExam = (number) => { setActiveExam(number); setPrintMode("exam"); setTimeout(() => window.print(), 50); };
  const printFinal = () => { setPrintMode("final"); setTimeout(() => window.print(), 50); };

  if (status.loading) return <LoadingState />;
  if (status.error) return <ErrorState message={status.error} />;
  const singleValues = { [activeExam]: scores[activeExam] || {} };

  return <div className="space-y-5 motion-card">
    <style>{`@media print { body *{visibility:hidden!important}.print-area,.print-area *{visibility:visible!important}.print-area{position:absolute;left:0;top:0;width:100%;padding:8mm}.no-print{display:none!important}.print-header{display:block!important}@page{size:A4 landscape;margin:10mm}.final-only{display:${printMode === "final" ? "block" : "none"}!important}.exam-only{display:${printMode === "exam" ? "block" : "none"}!important}} .print-header{display:none}`}</style>
    <div className="no-print flex items-center gap-3"><button className="btn-secondary" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Classes</button><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Examinations</p><h1 className="text-2xl font-black">{schoolClass.name}</h1></div></div>
    <div className="no-print rounded-3xl border border-orange-100 bg-gradient-to-r from-white via-orange-50 to-amber-50 p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{schoolClass.level === "secondary" ? "Secondary · Dugsi Sare" : "Primary school"} · {academicYear}</p><h2 className="mt-1 text-xl font-black">Four separate examinations</h2><p className="mt-1 text-sm text-slate-500">Each exam has its own results and print button. Final Results combines all four.</p></div>
    <div className="no-print grid grid-cols-2 gap-3 md:grid-cols-4">{EXAMS.map((number) => <button key={number} onClick={() => setActiveExam(number)} className={`rounded-2xl border p-4 text-left transition ${activeExam === number ? "border-orange-400 bg-orange-50 shadow-sm" : "border-slate-200 bg-white hover:border-orange-200"}`}><div className="flex items-center justify-between"><span className="font-black">Exam {number}</span><CheckCircle2 className={`h-5 w-5 ${Object.keys(scores[number] || {}).length ? "text-emerald-500" : "text-slate-200"}`} /></div><span onClick={(e) => { e.stopPropagation(); printExam(number); }} className="mt-3 inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-orange-700"><Printer className="h-3.5 w-3.5" /> Print Exam {number}</span></button>)}</div>
    <div className="no-print flex flex-wrap gap-2"><button className="btn-primary" onClick={save} disabled={status.saving}><Save className="h-4 w-4" />{status.saving ? "Saving…" : `Save Exam ${activeExam}`}</button><button className="btn-secondary" onClick={() => printExam(activeExam)}><Printer className="h-4 w-4" /> Print Exam {activeExam}</button><button className="btn-secondary" onClick={printFinal}><Printer className="h-4 w-4" /> Print Final Results</button></div>
    {status.success && <div className="no-print rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{status.success}</div>}
    <div className="no-print panel overflow-hidden"><div className="border-b border-slate-100 p-4"><h3 className="font-black">Exam {activeExam} — enter results</h3><p className="text-xs text-slate-500">Maximum mark per subject: {max}</p></div><div className="overflow-auto"><table className="min-w-[1100px] w-full text-sm"><thead className="bg-slate-50"><tr><th className="sticky left-0 z-10 min-w-52 border-r border-slate-200 bg-slate-50 px-4 py-3 text-left">Student</th>{subjects.map((subject) => <th key={subject} className="min-w-28 border-r border-slate-200 px-2 py-3 text-center font-black">{subject}<span className="block text-xs font-normal text-slate-400">/{max}</span></th>)}</tr></thead><tbody className="divide-y divide-slate-100">{students.map((student) => <tr key={student.id}><td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-4 py-3 font-black">{student.name}<span className="block text-xs font-normal text-slate-400">ID {student.registration_no || "—"}</span></td>{subjects.map((subject) => <td key={subject} className="border-r border-slate-100 p-2"><input type="number" min="0" max={max} value={scores[activeExam]?.[keyFor(student.id, subject)] ?? ""} onChange={(e) => setScore(student.id, subject, e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-2 text-center font-bold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" /></td>)}</tr>)}{!students.length && <tr><td colSpan={subjects.length + 1} className="px-5 py-16 text-center"><BookOpen className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-bold">No students in this class</p></td></tr>}</tbody></table></div></div>
    <div className="no-print rounded-3xl border border-emerald-100 bg-emerald-50 p-5"><h3 className="font-black">Final Results — all 4 exams</h3><p className="mt-1 text-sm text-slate-600">Exam 1 + Exam 2 + Exam 3 + Exam 4 are combined automatically by subject.</p><button className="btn-primary mt-3" onClick={printFinal}><Printer className="h-4 w-4" /> Print Final Results</button></div>
    <div className="print-area">
      <div className="exam-only"><PrintHeader schoolClass={schoolClass} academicYear={academicYear} title={`Exam ${activeExam} Results`} /><ResultsTable students={students} subjects={subjects} values={singleValues} max={max} /><div className="mt-8 grid grid-cols-2 gap-8 text-xs"><span>Prepared by: __________________</span><span className="text-right">Principal/Head Teacher: __________________</span></div></div>
      <div className="final-only"><PrintHeader schoolClass={schoolClass} academicYear={academicYear} title="Final Results — All Four Exams" /><ResultsTable students={students} subjects={subjects} values={scores} max={max} combined /><div className="mt-8 grid grid-cols-2 gap-8 text-xs"><span>Prepared by: __________________</span><span className="text-right">Principal/Head Teacher: __________________</span></div></div>
    </div>
  </div>;
}

export default function SchoolExams() {
  const [classes, setClasses] = useState([]); const [selectedClass, setSelectedClass] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const academicYear = useMemo(defaultAcademicYear, []);
  useEffect(() => { apiRequest("/school/classes").then((r) => setClasses(r.data || [])).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingState />; if (error) return <ErrorState message={error} />; if (selectedClass) return <ClassExamBook schoolClass={selectedClass} academicYear={academicYear} onBack={() => setSelectedClass(null)} />;
  return <div className="space-y-6 motion-card"><div className="rounded-3xl border border-orange-100 bg-gradient-to-r from-white via-orange-50 to-amber-50 p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">School examinations</p><h1 className="mt-1 text-3xl font-black">Choose a class</h1><p className="mt-2 text-slate-500">Manage Exam 1, Exam 2, Exam 3 and Exam 4 separately. No Term 1, Term 2 or Term 3 choices.</p></div>{!classes.length ? <div className="panel flex min-h-[300px] items-center justify-center p-8"><EmptyState title="No classes yet" description="Create a class first, then its examination records will appear here." /></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{classes.map((schoolClass) => <button key={schoolClass.id} onClick={() => setSelectedClass(schoolClass)} className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"><div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><BookOpen className="h-6 w-6" /></span><CheckCircle2 className="h-5 w-5 text-slate-200 transition group-hover:text-emerald-500" /></div><h2 className="mt-5 text-xl font-black text-slate-900">{schoolClass.name}</h2><p className="mt-1 text-sm text-slate-500">{schoolClass.level === "secondary" ? "Secondary" : "Primary"} · Four exams</p></button>)}</div>}</div>;
}
