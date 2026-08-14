import React, { useEffect, useState } from "react";
import EntityCrud from "../../components/EntityCrud";
import { apiRequest, formatMoney } from "../../lib/api";
import { ErrorState, LoadingState } from "../../components/AsyncState";

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
      title="Add Student"
      entityLabel="students"
      emptyTitle="No students yet"
      emptyDescription="Add students individually, several at once, or import your existing CSV list."
      fields={[
        { key: "name", label: "Student name", required: true },
        { key: "class_id", label: "Class", type: "select", options: classes.map((c) => ({ value: c.id, label: c.name })) },
        { key: "guardian_name", label: "Guardian name" },
        { key: "guardian_phone", label: "Guardian phone" },
        { key: "monthly_fee", label: "Monthly fee", type: "number" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "school_classes", label: "Class", render: (r) => r.school_classes?.name || "Unassigned" },
        { key: "guardian_name", label: "Guardian", render: (r) => `${r.guardian_name || "-"}${r.guardian_phone ? ` · ${r.guardian_phone}` : ""}` },
        { key: "monthly_fee", label: "Monthly fee", align: "right", render: (r) => formatMoney(r.monthly_fee) },
        { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{r.status || "active"}</span> },
      ]}
    />
  );
}
