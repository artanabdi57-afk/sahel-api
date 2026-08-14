import React from "react";
import EntityCrud from "../../components/EntityCrud";
import { formatMoney } from "../../lib/api";

export default function GymMembers() {
  return (
    <EntityCrud
      apiPath="/gym/members"
      title="Add Member"
      entityLabel="members"
      emptyTitle="No members yet"
      emptyDescription="Add your first gym member to start tracking attendance and payments."
      fields={[
        { key: "name", label: "Full name", required: true },
        { key: "phone", label: "Phone number" },
        { key: "gender", label: "Section", type: "select", options: [{ value: "male", label: "Men's section" }, { value: "female", label: "Women's section" }] },
        { key: "registration_fee", label: "Registration fee", type: "number" },
        { key: "registration_paid_until", label: "Paid until", type: "date" },
        { key: "notes", label: "Notes" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "gender", label: "Section", render: (r) => (r.gender === "female" ? "Women" : r.gender === "male" ? "Men" : "-") },
        { key: "registration_fee", label: "Reg. fee", align: "right", render: (r) => formatMoney(r.registration_fee) },
        { key: "registration_paid_until", label: "Paid until", render: (r) => (r.registration_paid_until ? new Date(r.registration_paid_until).toLocaleDateString() : "-") },
        { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{r.status || "active"}</span> },
      ]}
    />
  );
}
