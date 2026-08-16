import React, { useEffect, useMemo, useState } from "react";
import { Building2, Check, KeyRound, Plus, Save, ShieldCheck, Trash2, UsersRound, X } from "lucide-react";
import { getCurrentShop } from "../../lib/auth";
import { supabase } from "../../lib/supabaseClient";

const ROLES = ["Hospital Manager", "Doctor", "Nurse", "Laboratory Technician", "Pharmacist", "Receptionist", "Accountant", "HR / Staff Manager"];
const PERMISSIONS = ["dashboard", "doctors_staff", "pharmacy", "pharmacy_sales", "pharmacy_inventory", "laboratory", "billing", "reports", "settings"];

export default function HospitalSettings() {
  const shop = getCurrentShop();
  const [tab, setTab] = useState("team");
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [showStaff, setShowStaff] = useState(false);
  const [showDepartment, setShowDepartment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [staffForm, setStaffForm] = useState({ full_name: "", employee_id: "", email: "", phone: "", password: "", role: "Doctor", department_id: "", license_number: "" });
  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");

  const activeRole = useMemo(() => staffForm.role, [staffForm.role]);

  useEffect(() => { load(); }, [shop?.id]);
  async function load() {
    if (!shop?.id) return;
    const [{ data: s }, { data: d }, { data: p }] = await Promise.all([
      supabase.from("hospital_staff").select("id,full_name,employee_id,role,phone,license_number,active,department_id,hospital_departments(name)").eq("shop_id", shop.id).order("full_name"),
      supabase.from("hospital_departments").select("id,name,code,active").eq("shop_id", shop.id).order("name"),
      supabase.from("hospital_role_permissions").select("id,role,permission,enabled").eq("shop_id", shop.id).order("role,permission"),
    ]);
    setStaff(s || []); setDepartments(d || []); setPermissions(p || []);
  }
  function notify(text) { setMessage(text); setTimeout(() => setMessage(""), 5000); }

  async function addStaff(e) {
    e.preventDefault();
    if (!staffForm.full_name.trim() || !staffForm.email.trim() || !staffForm.phone.trim() || staffForm.password.length < 8) return notify("Name, email, phone and an 8+ character password are required.");
    setSaving(true);
    try {
      const { data: account, error: accountError } = await supabase.rpc("create_staff_member", { p_shop_id: shop.id, p_name: staffForm.full_name.trim(), p_email: staffForm.email.trim(), p_password: staffForm.password, p_phone: staffForm.phone.trim() });
      if (accountError) throw accountError;
      const { error } = await supabase.from("hospital_staff").insert({ shop_id: shop.id, full_name: staffForm.full_name.trim(), employee_id: staffForm.employee_id.trim() || null, role: staffForm.role, department_id: staffForm.department_id || null, phone: staffForm.phone.trim(), license_number: staffForm.license_number.trim() || null, active: true });
      if (error) throw error;
      setStaffForm({ full_name: "", employee_id: "", email: "", phone: "", password: "", role: "Doctor", department_id: "", license_number: "" });
      setShowStaff(false); await load(); notify(`${staffForm.full_name} was added to the hospital team. Login: ${account?.email || staffForm.email}`);
    } catch (e) { notify(e.message || "Could not create staff account."); } finally { setSaving(false); }
  }

  async function addDepartment(e) {
    e.preventDefault(); if (!departmentName.trim()) return;
    setSaving(true); const { error } = await supabase.from("hospital_departments").insert({ shop_id: shop.id, name: departmentName.trim(), code: departmentCode.trim() || null });
    setSaving(false); if (error) return notify(error.message); setDepartmentName(""); setDepartmentCode(""); setShowDepartment(false); await load(); notify("Department created.");
  }

  async function togglePermission(role, permission, enabled) {
    const existing = permissions.find(p => p.role === role && p.permission === permission);
    const payload = { shop_id: shop.id, role, permission, scope: "shop", enabled: !enabled };
    if (existing) await supabase.from("hospital_role_permissions").update({ enabled: !enabled }).eq("id", existing.id); else await supabase.from("hospital_role_permissions").insert(payload);
    await load();
  }

  async function deactivateStaff(id) { if (!window.confirm("Deactivate this hospital staff member?")) return; await supabase.from("hospital_staff").update({ active: false }).eq("id", id); await load(); }

  return <div className="space-y-5">
    <div><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-600">Hospital administration</p><h1 className="text-3xl font-black text-slate-950">Settings</h1><p className="mt-1 text-slate-500">Manage Artan Hospital's team, departments, access and workspace configuration.</p></div>
    {message && <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800"><span>{message}</span><button onClick={() => setMessage("")}><X className="h-4 w-4"/></button></div>}
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">{[["team","Hospital Team",UsersRound],["departments","Departments",Building2],["permissions","Roles & Permissions",ShieldCheck],["general","Hospital Information",Building2]].map(([key,label,Icon])=><button key={key} onClick={() => setTab(key)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${tab===key?"bg-blue-50 text-blue-700":"text-slate-600 hover:bg-slate-50"}`}><Icon className="h-4 w-4"/>{label}</button>)}</aside>
      <main className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {tab === "team" && <><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-black">Hospital Team</h2><p className="text-sm text-slate-500">Create staff accounts and control who works in each area.</p></div><button className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm" onClick={() => setShowStaff(true)}><Plus className="h-4 w-4"/> Add Staff</button></div>
          {showStaff && <form onSubmit={addStaff} className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-black">Create hospital staff account</h3><button type="button" onClick={() => setShowStaff(false)}><X className="h-4 w-4"/></button></div><div className="grid gap-3 sm:grid-cols-2"><input className="field" placeholder="Full name *" value={staffForm.full_name} onChange={e=>setStaffForm({...staffForm,full_name:e.target.value})}/><input className="field" placeholder="Employee ID" value={staffForm.employee_id} onChange={e=>setStaffForm({...staffForm,employee_id:e.target.value})}/><input className="field" type="email" placeholder="Login email *" value={staffForm.email} onChange={e=>setStaffForm({...staffForm,email:e.target.value})}/><input className="field" placeholder="Phone *" value={staffForm.phone} onChange={e=>setStaffForm({...staffForm,phone:e.target.value})}/><input className="field" type="password" placeholder="Password (8+ characters) *" value={staffForm.password} onChange={e=>setStaffForm({...staffForm,password:e.target.value})}/><select className="field" value={staffForm.role} onChange={e=>setStaffForm({...staffForm,role:e.target.value})}>{ROLES.map(r=><option key={r}>{r}</option>)}</select><select className="field" value={staffForm.department_id} onChange={e=>setStaffForm({...staffForm,department_id:e.target.value})}><option value="">Department</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select><input className="field" placeholder="License number" value={staffForm.license_number} onChange={e=>setStaffForm({...staffForm,license_number:e.target.value})}/></div><button className="btn-primary mt-3 flex items-center gap-2 rounded-xl px-4 py-2 text-sm" disabled={saving}>{saving?"Creating...":"Create Account"}</button></form>}
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Staff","Role","Department","Phone","Status","Action"].map(h=><th className="px-4 py-3" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{staff.map(s=><tr key={s.id}><td className="px-4 py-4 font-bold">{s.full_name}<div className="text-xs font-normal text-slate-400">{s.employee_id || "No employee ID"}</div></td><td className="px-4 py-4">{s.role}</td><td className="px-4 py-4 text-slate-500">{s.hospital_departments?.name || "Unassigned"}</td><td className="px-4 py-4 text-slate-500">{s.phone || "—"}</td><td className="px-4 py-4"><span className={s.active?"text-emerald-600":"text-slate-400"}>{s.active?"Active":"Inactive"}</span></td><td className="px-4 py-4">{s.active && <button onClick={()=>deactivateStaff(s.id)} className="rounded-lg border border-rose-200 p-2 text-rose-600" title="Deactivate"><Trash2 className="h-4 w-4"/></button>}</td></tr>)}</tbody></table>{!staff.length && <div className="p-10 text-center text-sm text-slate-400">No hospital staff yet. Add your first doctor, nurse, pharmacist or manager.</div>}</div></>}
        {tab === "departments" && <><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-black">Departments</h2><p className="text-sm text-slate-500">Organize doctors and operational teams.</p></div><button className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm" onClick={()=>setShowDepartment(true)}><Plus className="h-4 w-4"/> Add Department</button></div>{showDepartment&&<form onSubmit={addDepartment} className="mb-5 grid gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:grid-cols-3"><input className="field" placeholder="Department name *" value={departmentName} onChange={e=>setDepartmentName(e.target.value)}/><input className="field" placeholder="Code" value={departmentCode} onChange={e=>setDepartmentCode(e.target.value)}/><button className="btn-primary rounded-xl px-4" disabled={saving}>{saving?"Saving...":"Create Department"}</button></form>}<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{departments.map(d=><div key={d.id} className="rounded-xl border border-slate-200 p-4"><p className="font-black">{d.name}</p><p className="mt-1 text-xs text-slate-500">{d.code || "No code"} · {d.active?"Active":"Inactive"}</p></div>)}</div></>}
        {tab === "permissions" && <><div className="mb-5"><h2 className="text-xl font-black">Roles & Permissions</h2><p className="text-sm text-slate-500">Management gets operational access; clinical and financial access can be restricted by role.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Role</th>{PERMISSIONS.map(p=><th key={p} className="px-3 py-3 text-center">{p.replace(/_/g," ")}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{ROLES.map(role=><tr key={role}><td className="px-4 py-3 font-bold">{role}</td>{PERMISSIONS.map(permission=>{const enabled=permissions.find(p=>p.role===role&&p.permission===permission)?.enabled||false;return <td key={permission} className="px-3 py-3 text-center"><button onClick={()=>togglePermission(role,permission,enabled)} className={`rounded-lg p-2 ${enabled?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-300"}`}><Check className="h-4 w-4"/></button></td>})}</tr>)}</tbody></table></div></>}
        {tab === "general" && <div className="space-y-4"><div><h2 className="text-xl font-black">Hospital Information</h2><p className="text-sm text-slate-500">Workspace identity for {shop?.shop_name || "your hospital"}.</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Hospital</p><p className="mt-1 text-lg font-black">{shop?.shop_name || "Artan Hospital"}</p><p className="text-sm text-slate-500">Business type: Hospital</p></div><div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><div className="flex gap-2"><KeyRound className="h-4 w-4 mt-0.5"/><p>Hospital access is tenant-scoped. Staff accounts should only be created from this administration area so their hospital role and department are recorded together.</p></div></div></div>}
      </main>
    </div>
  </div>;
}
