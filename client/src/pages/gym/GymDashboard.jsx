import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, Wallet, AlertTriangle, Dumbbell } from "lucide-react";
import { apiRequest, formatMoney } from "../../lib/api";
import { getCurrentShop } from "../../lib/auth";
import { LoadingState, ErrorState } from "../../components/AsyncState";

// Tailwind can't see dynamically-built class names at build time, so this
// maps each color to a fully-written class string instead of interpolating.
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

export default function GymDashboard() {
  const navigate = useNavigate();
  const shop = getCurrentShop();
  const [members, setMembers] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    (async () => {
      try {
        const [m, c, p] = await Promise.all([
          apiRequest("/gym/members"),
          apiRequest("/gym/checkins?limit=200"),
          apiRequest("/gym/payments"),
        ]);
        setMembers(m.data || []);
        setCheckins(c.data || []);
        setPayments(p.data || []);
        setStatus({ loading: false, error: "" });
      } catch (error) {
        setStatus({ loading: false, error: error.message });
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const active = members.filter((m) => m.status === "active");
    const men = active.filter((m) => m.gender === "male").length;
    const women = active.filter((m) => m.gender === "female").length;
    const today = new Date().toISOString().slice(0, 10);
    const todaysCheckins = checkins.filter((c) => c.checked_in_at?.slice(0, 10) === today).length;
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthRevenue = payments.filter((p) => p.paid_at?.slice(0, 7) === thisMonth).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const expiringSoon = active.filter((m) => {
      if (!m.registration_paid_until) return true;
      const days = (new Date(m.registration_paid_until) - new Date()) / 86400000;
      return days <= 7;
    });
    return { total: active.length, men, women, todaysCheckins, monthRevenue, expiringSoon };
  }, [members, checkins, payments]);

  if (status.loading) return <LoadingState variant="dashboard" />;
  if (status.error) return <ErrorState message={status.error} />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Gym Dashboard</p>
        <h1 className="text-2xl font-black text-slate-950">{shop?.shop_name || "Your gym"}</h1>
        <p className="text-sm font-medium text-slate-500">{shop?.location}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Active members" value={stats.total} hint={`${stats.men} men · ${stats.women} women`} />
        <StatCard icon={UserCheck} label="Checked in today" value={stats.todaysCheckins} color="green" />
        <StatCard icon={Wallet} label="This month's revenue" value={formatMoney(stats.monthRevenue)} color="orange" />
        <StatCard icon={AlertTriangle} label="Registration expiring ≤7 days" value={stats.expiringSoon.length} color="red" />
      </div>

      {stats.expiringSoon.length > 0 && (
        <div className="panel p-4">
          <h2 className="mb-3 text-base font-bold text-slate-950">Needs attention — registration due soon</h2>
          <div className="space-y-2">
            {stats.expiringSoon.slice(0, 8).map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm">
                <span className="font-semibold text-slate-800">{m.name}</span>
                <span className="text-red-600">{m.registration_paid_until ? `Due ${new Date(m.registration_paid_until).toLocaleDateString()}` : "No payment on record"}</span>
              </div>
            ))}
          </div>
          <button className="btn-secondary mt-3" onClick={() => navigate("/gym/payments")}>Record a payment</button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Members", path: "/gym/members", icon: Users },
          { label: "Check-ins", path: "/gym/checkins", icon: UserCheck },
          { label: "Staff", path: "/gym/staff", icon: Dumbbell },
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
