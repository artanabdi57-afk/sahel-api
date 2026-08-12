import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, GraduationCap, AlertTriangle, ClipboardCheck } from "lucide-react";
import { apiRequest, formatMoney } from "../../lib/api";
import { getCurrentShop } from "../../lib/auth";
import { LoadingState, ErrorState } from "../../components/AsyncState";

const COLOR_CLASSES = {
  blue:   "bg-blue-50 text-blue-600",
  green:  "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  red:    "bg-red-50 text-red-600",
};

function StatCard({ icon: Icon, label, value, hint, color = "blue" }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${COLOR_CLASSES[color] || COLOR_CLASSES.blue}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      {hint ? <p className="mt-1 text-xs font-medium text-slate-400">{hint}</p> : null}
    </div>
  );
}

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const shop = getCurrentShop();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [unpaidStudents, setUnpaidStudents] = useState([]);
  const [unpaidTeachers, setUnpaidTeachers] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    (async () => {
      try {
        const [s, c, t, us, ut] = await Promise.all([
          apiRequest("/school/students"),
          apiRequest("/school/classes"),
          apiRequest("/school/teachers"),
          apiRequest("/school/fee-payments/unpaid"),
          apiRequest("/school/salary-payments/unpaid"),
        ]);
        setStudents(s.data || []);
        setClasses(c.data || []);
        setTeachers(t.data || []);
        setUnpaidStudents(us.data || []);
        setUnpaidTeachers(ut.data || []);
        setStatus({ loading: false, error: "" });
      } catch (error) {
        setStatus({ loading: false, error: error.message });
      }
    })();
  }, []);

  const activeStudents = useMemo(() => students.filter((s) => s.status === "active").length, [students]);
  const activeTeachers = useMemo(() => teachers.filter((t) => t.status === "active").length, [teachers]);

  if (status.loading) return <LoadingState variant="dashboard" />;
  if (status.error) return <ErrorState message={status.error} />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">School Dashboard</p>
        <h1 className="text-2xl font-black text-slate-950">{shop?.shop_name || "Your school"}</h1>
        <p className="text-sm font-medium text-slate-500">{shop?.location}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Active students" value={activeStudents} />
        <StatCard icon={BookOpen} label="Classes" value={classes.length} />
        <StatCard icon={GraduationCap} label="Teachers" value={activeTeachers} />
        <StatCard icon={AlertTriangle} label="Unpaid this month" value={unpaidStudents.length} color="red" hint="students" />
      </div>

      {unpaidStudents.length > 0 && (
        <div className="panel p-4">
          <h2 className="mb-3 text-base font-bold text-slate-950">Students who haven't paid this month</h2>
          <div className="flex flex-wrap gap-2">
            {unpaidStudents.slice(0, 10).map((s) => (
              <span key={s.id} className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">{s.name} — {formatMoney(s.monthly_fee)}</span>
            ))}
          </div>
          <button className="btn-secondary mt-3" onClick={() => navigate("/school/fees")}>Go to Fees</button>
        </div>
      )}

      {unpaidTeachers.length > 0 && (
        <div className="panel p-4">
          <h2 className="mb-3 text-base font-bold text-slate-950">Teachers not paid this month</h2>
          <div className="flex flex-wrap gap-2">
            {unpaidTeachers.slice(0, 10).map((t) => (
              <span key={t.id} className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">{t.name} — {formatMoney(t.monthly_salary)}</span>
            ))}
          </div>
          <button className="btn-secondary mt-3" onClick={() => navigate("/school/teachers")}>Go to Teachers</button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Classes", path: "/school/classes", icon: BookOpen },
          { label: "Students", path: "/school/students", icon: Users },
          { label: "Exams", path: "/school/exams", icon: ClipboardCheck },
        ].map(({ label, path, icon: Icon }) => (
          <button key={path} onClick={() => navigate(path)} className="panel flex items-center gap-3 p-4 text-left transition hover:border-blue-200">
            <Icon className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-slate-800">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
