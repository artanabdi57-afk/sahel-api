import React, { useEffect, useState } from "react";
import EntityCrud from "../../components/EntityCrud";
import { apiRequest, formatMoney } from "../../lib/api";
import { ErrorState, LoadingState } from "../../components/AsyncState";

const studentFields = (classes) => [
  { key: "registration_no", label: "Student number (optional)" },
  { key: "name", label: "Student full name", required: true },
  { key: "class_id", label: "Class", type: "select", options: classes.map((c) => ({ value: c.id, label: `${c.name} · ${c.level === "secondary" ? "Secondary" : "Primary"}` })) },
  { key: "father_name", label: "Father's name" },
  { key: "mother_name", label: "Mother's name" },
  { key: "guardian_name", label: "Parent / guardian name" },
  { key: "phone_number", label: "Phone number" },
  { key: "age", label: "Age", type: "number" },
  { key: "monthly_fee", label: "Monthly fee", type: "number" },
];

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
    <EntityCrud
      apiPath="/school/students"
      title="Register Student"
      entityLabel="students"
      emptyTitle="No students registered"
      emptyDescription="Register students individually, add many at once, or import your existing CSV list. Sahel automatically assigns a student number when one is not supplied."
      fields={studentFields(classes)}
      columns={[
        { key: "registration_no", label: "No.", render: (r) => <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{r.registration_no || "Pending"}</span> },
        { key: "name", label: "Student", render: (r) => <div><p className="font-black text-slate-900">{r.name}</p><p className="text-xs text-slate-400">Age {r.age ?? "-"}</p></div> },
        { key: "school_classes", label: "Class", render: (r) => <div><p className="font-semibold">{r.school_classes?.name || "Unassigned"}</p><p className="text-xs text-slate-400">{r.school_classes?.level === "secondary" ? "Secondary" : r.school_classes?.level === "primary" ? "Primary" : "-"}</p></div> },
        { key: "father_name", label: "Father", render: (r) => r.father_name || "-" },
        { key: "mother_name", label: "Mother", render: (r) => r.mother_name || "-" },
        { key: "phone_number", label: "Phone", render: (r) => r.phone_number || r.guardian_phone || "-" },
        { key: "monthly_fee", label: "Fee", align: "right", render: (r) => formatMoney(r.monthly_fee) },
        { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{r.status || "active"}</span> },
      ]}
    />
  );
}
