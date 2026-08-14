import React from "react";
import EntityCrud from "../../components/EntityCrud";
import { formatMoney } from "../../lib/api";

export default function SchoolStudents() {
  return (
    <EntityCrud
      apiPath="/school/students"
      title="Add Student"
      entityLabel="students"
      emptyTitle="No students yet"
      emptyDescription="Add students individually, several at once, or import your existing CSV list."
      fields={[
        { key: "name", label: "Student name", required: true },
        { key: "class_id", label: "Class ID" },
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
