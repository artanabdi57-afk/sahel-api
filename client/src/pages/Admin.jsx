import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Building2,
  Lock,
  Package,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  ShoppingCart,
  Trash2,
  User,
  Users,
  Mail,
  MapPin,
  Calendar
} from "lucide-react";
import { apiRequest, formatMoney } from "../lib/api";

const ADMIN_USER = "sahal2026";
const ADMIN_PASS = "Halimoabdimuse@123";

function AdminMetric({ title, value, icon: Icon, blue = false }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${blue ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-950"}`}>
      <div className="flex items-center justify-between">
        <p className={`text-sm font-bold ${blue ? "text-blue-100" : "text-slate-500"}`}>{title}</p>
        <Icon className={`h-5 w-5 ${blue ? "text-white" : "text-blue-600"}`} />
      </div>
      <p className="mt-4 text-3xl font-black">{value}</p>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("sahel_admin_authed") === "yes");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [ownerCode, setOwnerCode] = useState(localStorage.getItem("sahel_owner_code") || "");
  const [overview, setOverview] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: "", action: "" });
  const [expandedShop, setExpandedShop] = useState(null);

  function handleLogin(e) {
    e.preventDefault();
    if (loginForm.username === ADMIN_USER && loginForm.password === ADMIN_PASS) {
      sessionStorage.setItem("sahel_admin_authed", "yes");
      setAuthed(true);
      setLoginError("");
    } else {
      setLoginError("Incorrect username or password.");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("sahel_admin_authed");
    setAuthed(false);
    setOverview(null);
  }

  async function loadOverview(event) {
    event?.preventDefault();
    if (!ownerCode) return setStatus({ ...status, error: "Owner code required" });
    
    setStatus({ loading: true, error: "", action: "" });
    try {
      const response = await apiRequest("/admin/overview", { headers: { "x-owner-code": ownerCode } });
      localStorage.setItem("sahel_owner_code", ownerCode);
      setOverview(response.data);
      setStatus({ loading: false, error: "", action: "" });
    } catch (error) {
      setStatus({ loading: false, error: "Failed to load data. Check owner code.", action: "" });
    }
  }

  async function runOwnerAction(actionName, request) {
    setStatus({ ...status, loading: true, action: actionName });
    try {
      await request();
      // Reload overview to get fresh data
      const response = await apiRequest("/admin/overview", { headers: { "x-owner-code": ownerCode } });
      setOverview(response.data);
      setStatus({ loading: false, error: "", action: "" });
    } catch (error) {
      setStatus({ loading: false, error: error.message, action: "" });
    }
  }

  function changeShopStatus(shop, nextStatus) {
    const confirmMsg = nextStatus === "suspended" 
      ? `Are you sure you want to SUSPEND ${shop.shop_name}? They will lose access.` 
      : `ACTIVATE ${shop.shop_name}?`;
      
    if (!window.confirm(confirmMsg)) return;

    runOwnerAction(`status-${shop.id}`, () =>
      apiRequest(`/admin/shops/${shop.id}/status`, {
        method: "PUT",
        headers: { "x-owner-code": ownerCode },
        body: JSON.stringify({ status: nextStatus })
      })
    );
  }

  const shops = overview?.shops || [];
  const totals = overview?.totals || {};
  const sortedShops = useMemo(
    () => [...shops].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [shops]
  );

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-slate-950">Sahel Admin</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Access Restricted</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input className="w-full h-12 rounded-xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Username" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} required />
            <input className="w-full h-12 rounded-xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
            {loginError && <div className="text-rose-600 text-sm font-bold">{loginError}</div>}
            <button className="h-12 w-full rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700">Sign In</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-6 rounded-3xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight">Admin Control Center</h1>
            <p className="text-slate-500 font-medium">Manage Sahel client network and subscription status.</p>
          </div>
          <div className="flex gap-3">
            <input 
              type="password" 
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold w-48" 
              placeholder="Owner Code" 
              value={ownerCode} 
              onChange={(e) => setOwnerCode(e.target.value)} 
            />
            <button onClick={loadOverview} className="btn-primary h-11 px-6 rounded-xl" disabled={status.loading}>
              {status.loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Sync Data"}
            </button>
          </div>
        </div>

        {status.error && (
          <div className="mt-4 p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 font-bold">{status.error}</div>
        )}

        {overview && (
          <>
            {/* Stats */}
            <section className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
              <AdminMetric title="Total Shops" value={totals.shops || 0} icon={Building2} blue />
              <AdminMetric title="Sales Activity" value={totals.sales || 0} icon={ShoppingCart} />
              <AdminMetric title="Revenue Processed" value={formatMoney(totals.revenue || 0)} icon={BarChart3} />
              <AdminMetric title="Active Users" value={totals.users || 0} icon={Users} />
            </section>

            {/* Shop Table */}
            <section className="mt-8 rounded-3xl border bg-white overflow-hidden shadow-sm">
              <div className="p-6 border-b bg-slate-50/50">
                <h2 className="text-xl font-black">Client Portfolio</h2>
                <p className="text-sm text-slate-500">View and manage shop accounts. Click row for full details.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Shop Name</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Usage</th>
                      <th className="px-6 py-4">Revenue</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sortedShops.map((shop) => (
                      <React.Fragment key={shop.id}>
                        <tr 
                          className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedShop === shop.id ? 'bg-blue-50/50' : ''}`}
                          onClick={() => setExpandedShop(expandedShop === shop.id ? null : shop.id)}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-600">
                                {shop.shop_name?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{shop.shop_name}</p>
                                <p className="text-xs text-slate-500">{shop.location || "Mogadishu"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-semibold text-slate-700">{shop.owner_email}</p>
                            <p className="text-xs font-bold text-blue-600 flex items-center gap-1">
                              <Phone size={12} /> {shop.phone || "No phone"}
                            </p>
                          </td>
                          <td className="px-6 py-5 font-bold">
                            <p>{shop.usage?.sales || 0} Sales</p>
                            <p className="text-xs text-slate-400">{shop.usage?.products || 0} Products</p>
                          </td>
                          <td className="px-6 py-5 font-black text-slate-900">
                            {formatMoney(shop.usage?.revenue || 0)}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${shop.status === 'suspended' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {shop.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              {shop.status === "suspended" ? (
                                <button 
                                  onClick={() => changeShopStatus(shop, "active")}
                                  className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
                                  title="Activate Shop"
                                >
                                  <ShieldCheck size={18} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => changeShopStatus(shop, "suspended")}
                                  className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100"
                                  title="Suspend Shop"
                                >
                                  <ShieldOff size={18} />
                                </button>
                              )}
                              <button onClick={() => deleteShop(shop)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED DETAILS */}
                        {expandedShop === shop.id && (
                          <tr className="bg-white">
                            <td colSpan="6" className="px-8 py-6 border-x-4 border-blue-500">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                  <h4 className="text-xs font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
                                    <User size={14} /> Full Registration Profile
                                  </h4>
                                  <div className="space-y-3">
                                    <DetailItem label="Shop Owner Phone" value={shop.phone || "Not provided"} />
                                    <DetailItem label="Business Type" value={shop.business_type || "Retailer"} />
                                    <DetailItem label="Location" value={shop.location || "Not set"} />
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
                                    <BarChart3 size={14} /> Onboarding Insights
                                  </h4>
                                  <div className="space-y-3">
                                    <DetailItem label="Main Pain Point" value={shop.main_problem || "Managing Sales"} />
                                    <DetailItem label="Referral Source" value={shop.hear_about || "Direct"} />
                                    <DetailItem label="Signup Date" value={new Date(shop.created_at).toLocaleDateString()} />
                                  </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                  <h4 className="text-xs font-black uppercase text-slate-400 mb-4">Quick Actions</h4>
                                  <div className="grid grid-cols-1 gap-2">
                                    <button onClick={() => resetPassword(shop)} className="w-full text-left px-4 py-2 bg-white border rounded-xl text-sm font-bold hover:bg-slate-100">Reset Shop Password</button>
                                    <button className="w-full text-left px-4 py-2 bg-white border rounded-xl text-sm font-bold hover:bg-slate-100">Contact via Email</button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
      <p className="text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}
