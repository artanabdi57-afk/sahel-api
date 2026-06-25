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
  Users
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

function PlanBadge({ plan }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${plan === "paid" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
      {plan || "free"}
    </span>
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
    setStatus({ loading: true, error: "", action: "" });
    try {
      const response = await apiRequest("/admin/overview", { headers: { "x-owner-code": ownerCode } });
      localStorage.setItem("sahel_owner_code", ownerCode);
      setOverview(response.data);
      setStatus({ loading: false, error: "", action: "" });
    } catch (error) {
      setStatus({ loading: false, error: error.message, action: "" });
    }
  }

  async function runOwnerAction(actionName, request) {
    setStatus({ loading: false, error: "", action: actionName });
    try {
      await request();
      await loadOverview();
    } catch (error) {
      setStatus({ loading: false, error: error.message, action: "" });
    }
  }

  function ownerHeaders() {
    return { "x-owner-code": ownerCode };
  }

  function changeShopStatus(shop, nextStatus) {
    runOwnerAction(`${nextStatus}-${shop.id}`, () =>
      apiRequest(`/admin/shops/${shop.id}/status`, {
        method: "PUT",
        headers: ownerHeaders(),
        body: JSON.stringify({ status: nextStatus })
      })
    );
  }

  function changeShopPlan(shop, plan) {
    runOwnerAction(`plan-${shop.id}`, () =>
      apiRequest(`/admin/shops/${shop.id}/plan`, {
        method: "PUT",
        headers: ownerHeaders(),
        body: JSON.stringify({ plan })
      })
    );
  }

  function resetPassword(shop) {
    const newPassword = window.prompt(`Enter a new password for ${shop.shop_name}. Minimum 8 characters.`);
    if (!newPassword) return;
    runOwnerAction(`password-${shop.id}`, () =>
      apiRequest(`/admin/shops/${shop.id}/password`, {
        method: "PUT",
        headers: ownerHeaders(),
        body: JSON.stringify({ password: newPassword })
      })
    );
  }

  function deleteShop(shop) {
    const confirmed = window.confirm(`Delete ${shop.shop_name} and all its data? This cannot be undone.`);
    if (!confirmed) return;
    runOwnerAction(`delete-${shop.id}`, () =>
      apiRequest(`/admin/shops/${shop.id}`, { method: "DELETE", headers: ownerHeaders() })
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
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-slate-950">Admin Panel</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Sahel owner access only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <User className="h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none"
                placeholder="Username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
              />
            </label>
            <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none"
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </label>
            {loginError ? (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{loginError}</div>
            ) : null}
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-[0_12px_25px_rgba(37,99,235,0.20)] transition hover:bg-blue-700">
              <Lock className="h-4 w-4" />
              Sign in to Admin
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">Sahel Owner</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Admin Panel</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Manage all client accounts, plans, and data.</p>
          </div>
          <div className="flex flex-col gap-2 sm:w-auto sm:min-w-[520px] sm:flex-row">
            <form onSubmit={loadOverview} className="flex flex-1 gap-2">
              <label className="flex h-12 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm font-bold outline-none"
                  type="password"
                  placeholder="Owner setup code"
                  value={ownerCode}
                  onChange={(event) => setOwnerCode(event.target.value)}
                />
              </label>
              <button className="btn-primary h-12 rounded-xl px-5" disabled={status.loading}>
                {status.loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                Load
              </button>
            </form>
            <Link className="btn-secondary h-12 rounded-xl px-5" to="/signup">
              <Plus className="h-4 w-4" />
              New Client
            </Link>
            <button className="btn-secondary h-12 rounded-xl px-5" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>

        {status.error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {status.error}
          </div>
        ) : null}

        {overview ? (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AdminMetric title="Client Shops" value={totals.shops || 0} icon={Building2} blue />
              <AdminMetric title="User Accounts" value={totals.users || 0} icon={Users} />
              <AdminMetric title="Total Sales Records" value={totals.sales || 0} icon={ShoppingCart} />
              <AdminMetric title="Products Managed" value={totals.products || 0} icon={Package} />
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h2 className="text-xl font-black">All Client Accounts</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Click a row to see onboarding data.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Business</th>
                      <th className="px-5 py-3">Owner Email</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Signup</th>
                      <th className="px-5 py-3">Products</th>
                      <th className="px-5 py-3">Sales</th>
                      <th className="px-5 py-3">Revenue</th>
                      <th className="px-5 py-3">Plan</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedShops.map((shop) => (
                      <>
                        <tr
                          key={shop.id}
                          className="cursor-pointer hover:bg-blue-50/40"
                          onClick={() => setExpandedShop(expandedShop === shop.id ? null : shop.id)}
                        >
                          <td className="px-5 py-4">
                            <p className="font-black text-slate-950">{shop.shop_name}</p>
                            <p className="text-xs font-semibold text-slate-500">{shop.location || "No location"}</p>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-600">{shop.owner_email}</td>
                          <td className="px-5 py-4">
                            {shop.phone ? (
                              <a href={`tel:${shop.phone}`} className="font-semibold text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                <Phone className="mr-1 inline h-3.5 w-3.5" />
                                {shop.phone}
                              </a>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-600">
                            {new Date(shop.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 font-black">{shop.usage?.products || 0}</td>
                          <td className="px-5 py-4 font-black">{shop.usage?.sales || 0}</td>
                          <td className="px-5 py-4 font-black text-blue-600">{formatMoney(shop.usage?.revenue || 0)}</td>
                          <td className="px-5 py-4">
                            <select
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold outline-none focus:border-blue-500"
                              value={shop.plan || "free"}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => changeShopPlan(shop, e.target.value)}
                              disabled={status.action === `plan-${shop.id}`}
                            >
                              <option value="free">Free</option>
                              <option value="paid">Paid</option>
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${shop.status === "suspended" ? "bg-rose-50 text-rose-700" : "bg-green-50 text-green-700"}`}>
                              {shop.status || "active"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex min-w-[220px] flex-wrap gap-2">
                              {shop.status === "suspended" ? (
                                <button
                                  className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-3 py-2 text-xs font-black text-green-700 hover:bg-green-50"
                                  disabled={status.action === `active-${shop.id}`}
                                  onClick={(e) => { e.stopPropagation(); changeShopStatus(shop, "active"); }}
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  Activate
                                </button>
                              ) : (
                                <button
                                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-50"
                                  disabled={status.action === `suspended-${shop.id}`}
                                  onClick={(e) => { e.stopPropagation(); changeShopStatus(shop, "suspended"); }}
                                >
                                  <ShieldOff className="h-3.5 w-3.5" />
                                  Suspend
                                </button>
                              )}
                              <button
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-black text-rose-700 hover:bg-rose-50"
                                disabled={status.action === `delete-${shop.id}`}
                                onClick={(e) => { e.stopPropagation(); deleteShop(shop); }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedShop === shop.id ? (
                          <tr key={`${shop.id}-expanded`} className="bg-blue-50/30">
                            <td colSpan="10" className="px-5 py-4">
                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl bg-white p-3 shadow-sm">
                                  <p className="text-xs font-black uppercase text-slate-400">Where they heard</p>
                                  <p className="mt-1 font-semibold text-slate-700">{shop.hear_about || "—"}</p>
                                </div>
                                <div className="rounded-xl bg-white p-3 shadow-sm">
                                  <p className="text-xs font-black uppercase text-slate-400">Business type</p>
                                  <p className="mt-1 font-semibold text-slate-700">{shop.business_type || "—"}</p>
                                </div>
                                <div className="rounded-xl bg-white p-3 shadow-sm">
                                  <p className="text-xs font-black uppercase text-slate-400">Main problem</p>
                                  <p className="mt-1 font-semibold text-slate-700">{shop.main_problem || "—"}</p>
                                </div>
                                <div className="rounded-xl bg-white p-3 shadow-sm">
                                  <p className="text-xs font-black uppercase text-slate-400">Expenses total</p>
                                  <p className="mt-1 font-semibold text-slate-700">{formatMoney(shop.usage?.expenses_total || 0)}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-black">Enter your owner setup code to load client data.</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">This page is for you only.</p>
          </div>
        )}
      </div>
    </main>
  );
}
