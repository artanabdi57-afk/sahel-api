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

const studentFields = (classes) => [
  { key: "name", label: "Student full name", required: true },
  { key: "class_id", label: "Class", type: "select", options: classes.map((c) => ({ value: c.id, label: `${c.name} · ${c.level === "secondary" ? "Dugsi Sare" : "Primary"}` })) },
  { key: "guardian_type", label: "Guardian type", type: "select", required: true, options: guardianOptions },
  { key: "guardian_name", label: "Guardian full name", required: true },
  { key: "phone_number", label: "Guardian phone number", required: true },
  { key: "age", label: "Age", type: "number" },
  { key: "monthly_fee", label: "Monthly fee", type: "number" },
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
        transformSubmit={transformStudent}
        emptyTitle="No students registered"
        emptyDescription="Register students individually, add many at once, or import your existing CSV list. Sahel assigns one official school ID across the entire school — IDs never restart for another class."
        fields={studentFields(classes)}
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
        <div><p className="font-black text-slate-900">Official school registry</p><p>Each student receives one school-wide ID. The ID follows the student even when they move between classes.</p></div>
      </div>
    </div>
  );
}
