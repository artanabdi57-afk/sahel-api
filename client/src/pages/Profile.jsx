import React, { useState } from "react";
import { Camera, Mail, Phone, Save, Store, UserRound } from "lucide-react";
import { apiRequest } from "../lib/api";
import { getCurrentShop, getCurrentUser, updateLocalShop, updateLocalUser } from "../lib/auth";

export default function Profile() {
  const user = getCurrentUser();
  const shop = getCurrentShop();
  const [ownerName, setOwnerName] = useState(user?.name || "");
  const [businessPhone, setBusinessPhone] = useState(shop?.business_phone || "");
  const [shopName, setShopName] = useState(shop?.shop_name || "");
  const [logo, setLogo] = useState(shop?.logo || "");
  const [message, setMessage] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "" });
  const [passwordStatus, setPasswordStatus] = useState({ saving: false, error: "", success: "" });

  function pickLogo(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  }

  function saveProfile(event) {
    event.preventDefault();
    updateLocalUser({ name: ownerName });
    updateLocalShop({ shop_name: shopName, business_phone: businessPhone, logo });
    setMessage("Profile saved on this device.");
  }

  async function changePassword(event) {
    event.preventDefault();
    setPasswordStatus({ saving: true, error: "", success: "" });

    try {
      await apiRequest("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify(passwordForm)
      });
      setPasswordForm({ current_password: "", new_password: "" });
      setPasswordStatus({ saving: false, error: "", success: "Password changed." });
    } catch (error) {
      setPasswordStatus({ saving: false, error: error.message, success: "" });
    }
  }

  return (
    <div className="space-y-5">
      <section className="panel overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500" />
        <div className="p-5">
          <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-soft">
                {logo ? (
                  <img src={logo} alt="Shop logo" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-blue-700">SA</span>
                )}
                <label className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={pickLogo} />
                </label>
              </div>
              <div className="pb-2">
                <h2 className="text-2xl font-black text-slate-950">{shopName || "Sahel Shop"}</h2>
                <p className="text-sm font-medium text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {message ? <div className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</div> : null}

      <form onSubmit={saveProfile} className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="panel p-5">
          <h3 className="mb-4 font-bold text-slate-950">Profile Details</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="field pl-10" value={ownerName} onChange={(event) => setOwnerName(event.target.value)} placeholder="Owner name" />
            </label>
            <label className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="field pl-10" value={user?.email || ""} disabled />
            </label>
            <label className="relative">
              <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="field pl-10" value={shopName} onChange={(event) => setShopName(event.target.value)} placeholder="Business name" />
            </label>
            <label className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="field pl-10" value={businessPhone} onChange={(event) => setBusinessPhone(event.target.value)} placeholder="Business phone number" />
            </label>
          </div>
          <button className="btn-primary mt-4">
            <Save className="h-4 w-4" />
            Save profile
          </button>
        </section>

        <aside className="panel p-5">
          <h3 className="mb-4 font-bold text-slate-950">Business Details</h3>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-slate-500">Business phone</p>
              <p className="mt-1 font-bold text-slate-950">{businessPhone || "Not added"}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-slate-500">Login email</p>
              <p className="mt-1 break-all font-bold text-slate-950">{user?.email || "Not available"}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-slate-500">Logo</p>
              <p className="mt-1 font-bold text-slate-950">{logo ? "Added" : "Default SA logo"}</p>
            </div>
          </div>
        </aside>
      </form>

      <form onSubmit={changePassword} className="panel p-5">
        <h3 className="font-bold text-slate-950">Change Password</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">Use this if the shop owner wants to change their own password.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className="field"
            type="password"
            placeholder="Current password"
            value={passwordForm.current_password}
            onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })}
            required
          />
          <input
            className="field"
            type="password"
            placeholder="New password"
            value={passwordForm.new_password}
            onChange={(event) => setPasswordForm({ ...passwordForm, new_password: event.target.value })}
            minLength={8}
            required
          />
        </div>
        {passwordStatus.error ? <p className="mt-3 text-sm font-semibold text-rose-600">{passwordStatus.error}</p> : null}
        {passwordStatus.success ? <p className="mt-3 text-sm font-semibold text-green-700">{passwordStatus.success}</p> : null}
        <button className="btn-primary mt-4" disabled={passwordStatus.saving}>
          <Save className="h-4 w-4" />
          {passwordStatus.saving ? "Changing..." : "Change password"}
        </button>
      </form>
    </div>
  );
}
