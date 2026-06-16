import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Building2,
  Lock,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  ShoppingCart,
  Trash2,
  Users
} from "lucide-react";
import { apiRequest, formatMoney } from "../lib/api";

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
  const [ownerCode, setOwnerCode] = useState(localStorage.getItem("sahel_owner_code") || "");
  const [overview, setOverview] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: "", action: "" });

  async function loadOverview(event) {
    event?.preventDefault();
    setStatus({ loading: true, error: "", action: "" });

    try {
      const response = await apiRequest("/admin/overview", {
        headers: {
          "x-owner-code": ownerCode
        }
      });
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
      apiRequest(`/admin/shops/${shop.id}`, {
        method: "DELETE",
        headers: ownerHeaders()
      })
    );
  }

  const shops = overview?.shops || [];
  const totals = overview?.totals || {};
  const sortedShops = useMemo(
    () => [...shops].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [shops]
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">Sahel Owner</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Client Usage Dashboard</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">See how many businesses are using your software.</p>
          </div>

          <form onSubmit={loadOverview} className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[520px] sm:flex-row">
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
              View
            </button>
            <Link className="btn-secondary h-12 rounded-xl px-5" to="/signup">
              <Plus className="h-4 w-4" />
              Create Client
            </Link>
          </form>
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
                <h2 className="text-xl font-black">Businesses Using Sahel</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Revenue shown here is total sales entered by each shop.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Business</th>
                      <th className="px-5 py-3">Owner Email</th>
                      <th className="px-5 py-3">Signup Date</th>
                      <th className="px-5 py-3">Products</th>
                      <th className="px-5 py-3">Sales</th>
                      <th className="px-5 py-3">Revenue</th>
                      <th className="px-5 py-3">Expenses</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedShops.map((shop) => (
                      <tr key={shop.id} className="hover:bg-blue-50/40">
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-950">{shop.shop_name}</p>
                          <p className="text-xs font-semibold text-slate-500">{shop.location || "No location"}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-600">{shop.owner_email}</td>
                        <td className="px-5 py-4 font-semibold text-slate-600">
                          {new Date(shop.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 font-black">{shop.usage.products}</td>
                        <td className="px-5 py-4 font-black">{shop.usage.sales}</td>
                        <td className="px-5 py-4 font-black text-blue-600">{formatMoney(shop.usage.revenue)}</td>
                        <td className="px-5 py-4 font-black text-slate-600">{formatMoney(shop.usage.expenses_total)}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                            shop.status === "suspended"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-green-50 text-green-700"
                          }`}>
                            {shop.status || "active"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex min-w-[300px] flex-wrap gap-2">
                            {shop.status === "suspended" ? (
                              <button
                                className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-3 py-2 text-xs font-black text-green-700 hover:bg-green-50"
                                disabled={status.action === `active-${shop.id}`}
                                onClick={() => changeShopStatus(shop, "active")}
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Activate
                              </button>
                            ) : (
                              <button
                                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-50"
                                disabled={status.action === `suspended-${shop.id}`}
                                onClick={() => changeShopStatus(shop, "suspended")}
                              >
                                <ShieldOff className="h-3.5 w-3.5" />
                                Suspend
                              </button>
                            )}
                            <button
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-black text-blue-700 hover:bg-blue-50"
                              disabled={status.action === `password-${shop.id}`}
                              onClick={() => resetPassword(shop)}
                            >
                              <Lock className="h-3.5 w-3.5" />
                              Reset password
                            </button>
                            <button
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-black text-rose-700 hover:bg-rose-50"
                              disabled={status.action === `delete-${shop.id}`}
                              onClick={() => deleteShop(shop)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-black">Enter your owner setup code to see client usage.</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">This page is for you only.</p>
          </div>
        )}
      </div>
    </main>
  );
}
