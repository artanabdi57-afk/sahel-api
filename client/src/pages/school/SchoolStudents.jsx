import React, { useEffect, useState } from "react";
import { ShieldCheck, UserRound } from "lucide-react";
import EntityCrud from "../../components/EntityCrud";
import { apiRequest, formatMoney } from "../../lib/api";
import { ErrorState, LoadingState } from "../../components/AsyncState";

const guardianOptions = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "other", label: "Other guardian / relative" },
];

const studentFields = (classes, defaultClassId = "") => [
  { key: "name", label: "Student full name", aliases: ["student name", "full name", "name"], required: true },
  { key: "class_id", label: "Class", aliases: ["class", "grade", "section"], default: defaultClassId, type: "select", options: classes.map((c) => ({ value: c.id, label: c.name })) },
  { key: "guardian_type", label: "Guardian type", aliases: ["guardian", "guardian type"], type: "select", required: true, options: guardianOptions },
  { key: "guardian_name", label: "Guardian full name", aliases: ["guardian name", "parent name", "father name", "mother name"], required: true },
  { key: "phone_number", label: "Guardian phone number", aliases: ["phone", "phone number", "guardian phone", "parent phone"], required: true },
  { key: "age", label: "Age", type: "number" },
  { key: "monthly_fee", label: "Monthly fee", aliases: ["fee", "monthly fee", "school fee"], type: "number" },
];

const transformStudent = (form) => ({
  name: form.name,
  class_id: form.class_id || null,
  guardian_type: form.guardian_type,
  guardian_name: form.guardian_name,
  phone_number: form.phone_number,
  age: form.age === "" ? null : Number(form.age),
  monthly_fee: form.monthly_fee === "" ? 0 : Number(form.monthly_fee),
});

const guardianForRow = (row) => {
  if (row.father_name) return { type: "Father", name: row.father_name };
  if (row.mother_name) return { type: "Mother", name: row.mother_name };
  if (row.guardian_name) return { type: "Other guardian", name: row.guardian_name };
  return { type: "-", name: "-" };
};

export default function SchoolStudents() {
  const [classes, setClasses] = useState([]);
  const [importClassId, setImportClassId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/school/classes")
      .then((response) => setClasses(response.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const selectedClass = classes.find((c) => c.id === importClassId);
  const fields = studentFields(classes, importClassId);
  const bulkHeaderContent = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-black text-slate-900">Class for this import</p>
        <p className="text-sm text-slate-500">Choose the class where these imported students must be saved. This selection takes priority over any Class or Grade value in the Excel file.</p>
      </div>
      <select className="field max-w-sm" value={importClassId} onChange={(e) => setImportClassId(e.target.value)}>
        <option value="">Use class from Excel / leave unassigned</option>
        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
  );

  const submitStudent = (form) => transformStudent({
    ...form,
    // When a class is selected in the import controls, it is authoritative.
    // This prevents values such as "Grade 5" in Excel from overriding the
    // actual school_classes UUID selected by the user.
    class_id: importClassId || form.class_id,
  });

  return (
    <div className="school-students-official">
      <style>{`
        .school-students-official .btn-primary { background: linear-gradient(135deg,#f97316,#ea580c) !important; box-shadow: 0 10px 24px rgba(234,88,12,.20); }
        .school-students-official .btn-primary:hover { filter: brightness(.97); transform: translateY(-1px); }
        .school-students-official .btn-secondary { border-color:#fed7aa !important; color:#c2410c !important; }
        .school-students-official .btn-secondary:hover { background:#fff7ed !important; }
        .school-students-official .field:focus { border-color:#fb923c !important; box-shadow:0 0 0 3px rgba(251,146,60,.14) !important; outline:none; }
        .school-students-official .motion-card:hover { box-shadow:0 12px 30px rgba(15,23,42,.07); }
      `}</style>
      <EntityCrud
        apiPath="/school/students"
        title="Register Student"
        entityLabel="students"
        transformSubmit={submitStudent}
        bulkHeaderContent={bulkHeaderContent}
        emptyTitle="No students registered"
        emptyDescription="Register students individually, add many at once, or import an Excel/CSV file. Sahel organizes the rows, maps common column names, lets you review them, and places them into the class you designate."
        fields={fields}
        columns={[
          { key: "registration_no", label: "School ID", render: (r) => <span className="inline-flex min-w-12 items-center justify-center rounded-xl bg-orange-50 px-3 py-1.5 text-sm font-black text-orange-700 ring-1 ring-orange-100">{r.registration_no || "—"}</span> },
          { key: "name", label: "Student", render: (r) => <div><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700"><UserRound className="h-4 w-4" /></span><p className="font-black text-slate-900">{r.name}</p></div><p className="ml-10 text-xs text-slate-400">Age {r.age ?? "-"}</p></div> },
          { key: "school_classes", label: "Class", render: (r) => <div><p className="font-semibold">{r.school_classes?.name || "Unassigned"}</p><p className="text-xs text-slate-400">{r.school_classes?.level === "secondary" ? "Dugsi Sare" : r.school_classes?.level === "primary" ? "Primary" : "-"}</p></div> },
          { key: "guardian", label: "Guardian", render: (r) => { const g = guardianForRow(r); return <div><p className="font-semibold text-slate-800">{g.name}</p><p className="text-xs font-bold text-orange-600">{g.type}</p></div>; } },
          { key: "phone_number", label: "Phone", render: (r) => r.phone_number || r.guardian_phone || "-" },
          { key: "monthly_fee", label: "Fee", align: "right", render: (r) => formatMoney(r.monthly_fee) },
          { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{r.status || "active"}</span> },
        ]}
      />
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-white p-4 text-sm text-slate-600 shadow-sm">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-200"><ShieldCheck className="h-5 w-5" /></span>
        <div><p className="font-black text-slate-900">Official school registry</p><p>Each student receives one school-wide ID. The ID follows the student even when they move between classes.</p>{selectedClass ? <p className="mt-1 text-xs font-bold text-orange-600">Current import class: {selectedClass.name}</p> : null}</div>
      </div>
    </div>
  );
}
