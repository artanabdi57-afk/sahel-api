import React, { useEffect, useState } from "react";
import { DollarSign, Eye, EyeOff, Languages, Mail, Moon, Phone, Plus, Settings as SettingsIcon, Store, Sun, Trash2, Users, X } from "lucide-react";
import { getCurrentShop, getCurrentUser, updateLocalShop } from "../lib/auth";
import { getSavedSettings, saveSettings, useLanguage } from "../lib/i18n";
import { getSavedCurrency, saveCurrency, apiRequest } from "../lib/api";
import { supabase } from "../lib/supabaseClient";

const CURRENCIES = [
  { code: "USD", label: "US Dollar",           symbol: "$"   },
  { code: "SOS", label: "Somali Shilling",      symbol: "Sh"  },
  { code: "KES", label: "Kenyan Shilling",      symbol: "KSh" },
  { code: "ETB", label: "Ethiopian Birr",       symbol: "Br"  },
  { code: "TZS", label: "Tanzanian Shilling",   symbol: "TSh" },
  { code: "UGX", label: "Ugandan Shilling",     symbol: "USh" },
  { code: "DJF", label: "Djiboutian Franc",     symbol: "Fr"  },
  { code: "SAR", label: "Saudi Riyal",          symbol: "﷼"  },
  { code: "AED", label: "UAE Dirham",           symbol: "د.إ" },
  { code: "GBP", label: "British Pound",        symbol: "£"  },
  { code: "EUR", label: "Euro",                 symbol: "€"  },
  { code: "TRY", label: "Turkish Lira",         symbol: "₺"  },
];

export default function Settings() {
  const { t } = useLanguage();
  const user     = getCurrentUser();
  const shop     = getCurrentShop();
  const [settings,  setSettings]  = useState(getSavedSettings);
  const [shopName,  setShopName]  = useState(shop?.shop_name || "");
  const [location,  setLocation]  = useState(shop?.location  || "");
  const [currency,  setCurrency]  = useState(getSavedCurrency);
  const [message,   setMessage]   = useState({ text: "", type: "success" });

  const [myShops,       setMyShops]       = useState([]);
  const [loadingShops,  setLoadingShops]  = useState(true);
  const [showAddShop,   setShowAddShop]   = useState(false);
  const [newShop,       setNewShop]       = useState({ shop_name: "", location: "", phone: "" });
  const [addingShop,    setAddingShop]    = useState(false);
  const [switchingShop, setSwitchingShop] = useState(null);
  const [deletingShop,  setDeletingShop]  = useState(null);
  const [expandedShop,  setExpandedShop]  = useState(null);

  const [shopStaff,    setShopStaff]    = useState({});
  const [showAddStaff, setShowAddStaff] = useState(null);
  const [newStaff,     setNewStaff]     = useState({ name: "", email: "", phone: "", password: "" });
  const [addingStaff,  setAddingStaff]  = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { saveSettings(settings); }, [settings]);
  useEffect(() => { loadMyShops(); }, []);

  async function loadMyShops() {
    setLoadingShops(true);
    try {
      const response = await apiRequest("/api/shops");
      setMyShops(response.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingShops(false);
    }
  }

  async function loadShopStaff(shopId) {
    try {
      const { data, error } = await supabase.rpc("get_shop_staff", { p_shop_id: shopId });
      if (!error) setShopStaff(prev => ({ ...prev, [shopId]: data || [] }));
    } catch (e) { console.error(e); }
  }

  async function handleAddShop(e) {
    e.preventDefault();
    if (!newShop.shop_name.trim()) return;
    if (!newShop.phone.trim())    { showMsg("Phone number is required.", "error"); return; }
    if (!newShop.location.trim()) { showMsg("Location is required.",     "error"); return; }
    setAddingShop(true);
    try {
      await apiRequest("/api/shops", {
        method: "POST",
        body: JSON.stringify({
          shop_name: newShop.shop_name.trim(),
          location:  newShop.location.trim(),
          phone:     newShop.phone.trim(),
        }),
      });
      setNewShop({ shop_name: "", location: "", phone: "" });
      setShowAddShop(false);
      await loadMyShops();
      showMsg(`Shop "${newShop.shop_name}" created!`, "success");
    } catch (err) {
      showMsg(err.message, "error");
    } finally {
      setAddingShop(false);
    }
  }

  async function handleSwitchShop(selectedShop) {
    if (selectedShop.id === shop?.id) return;
    setSwitchingShop(selectedShop.id);
    try {
      const response = await apiRequest("/auth/switch-shop", {
        method: "POST",
        body: JSON.stringify({ shop_id: selectedShop.id }),
      });
      const { token, user: newUser, shop: newShop } = response.data;
      localStorage.setItem("sahel_auth_token", token);
      localStorage.setItem("sahel_user",       JSON.stringify(newUser));
      localStorage.setItem("sahel_shop",       JSON.stringify(newShop));
      showMsg(`Switching to ${selectedShop.shop_name}…`, "success");
      setTimeout(() => window.location.href = "/dashboard", 800);
    } catch (err) {
      showMsg(err.message, "error");
    } finally {
      setSwitchingShop(null);
    }
  }

  async function handleDeleteShop(s) {
    if (s.id === shop?.id) {
      showMsg("Cannot delete your active shop. Switch to another shop first.", "error");
      return;
    }
    if (!window.confirm(`Delete "${s.shop_name}"? This cannot be undone.`)) return;
    setDeletingShop(s.id);
    try {
      await apiRequest(`/api/shops/${s.id}`, { method: "DELETE" });
      await loadMyShops();
      showMsg(`"${s.shop_name}" deleted.`, "success");
    } catch (err) {
      showMsg(err.message, "error");
    } finally {
      setDeletingShop(null);
    }
  }

  async function handleAddStaff(e, shopId) {
    e.preventDefault();
    if (!newStaff.name.trim())        { showMsg("Staff name is required.",          "error"); return; }
    if (!newStaff.email.trim())       { showMsg("Staff email is required.",         "error"); return; }
    if (!newStaff.phone.trim())       { showMsg("Staff phone is required.",         "error"); return; }
    if (!newStaff.password.trim())    { showMsg("Password is required.",            "error"); return; }
    if (newStaff.password.length < 8) { showMsg("Password must be 8+ characters.", "error"); return; }
    setAddingStaff(true);
    try {
      const { data, error } = await supabase.rpc("create_staff_member", {
        p_shop_id:  shopId,
        p_name:     newStaff.name.trim(),
        p_email:    newStaff.email.trim(),
        p_password: newStaff.password.trim(),
        p_phone:    newStaff.phone.trim(),
      });
      if (error) throw error;
      const staffEmail = newStaff.email.trim();
      setNewStaff({ name: "", email: "", phone: "", password: "" });
      setShowAddStaff(null);
      await loadShopStaff(shopId);
      showMsg(`Staff created! They log in at mysahelapp.com/login using ${staffEmail}`, "success");
    } catch (err) {
      showMsg(err.message, "error");
    } finally {
      setAddingStaff(false);
    }
  }

  function showMsg(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "success" }), 7000);
  }

  function changeCurrency(code) {
    saveCurrency(code);
    setCurrency(code);
    showMsg(`Currency changed to ${code}.`);
  }

  function saveShopDetails(e) {
    e.preventDefault();
    updateLocalShop({ shop_name: shopName, location });
    showMsg(`${t("settings")} saved.`);
  }

  return (
    <div className="space-y-5">

      <section className="panel p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">{t("settings")}</h2>
            <p className="text-sm text-slate-500">{t("settingsIntro")}</p>
          </div>
        </div>
      </section>

      {message.text && (
        <div className={`flex items-start justify-between gap-3 rounded-lg p-3 text-sm font-semibold ${message.type === "error" ? "bg-rose-50 text-rose-700" : "bg-green-50 text-green-700"}`}>
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage({ text: "", type: "success" })}><X className="h-4 w-4" /></button>
        </div>
      )}

      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-950">My Shops</h3>
              <p className="text-xs text-slate-500">Up to 4 shops per account. Each shop has its own data and staff.</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-primary h-9 rounded-lg px-3 text-xs"
            onClick={() => setShowAddShop(c => !c)}
            disabled={myShops.length >= 4}
          >
            <Plus className="h-4 w-4" />
            {myShops.length >= 4 ? "Max shops reached" : "Add Shop"}
          </button>
        </div>

        {showAddShop && (
          <form onSubmit={handleAddShop} className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
            <p className="text-sm font-bold text-slate-700">New Shop Details</p>
            <input className="field" placeholder="Shop name *" value={newShop.shop_name} onChange={e => setNewShop({ ...newShop, shop_name: e.target.value })} required />
            <input className="field" placeholder="Location (city / area) *" value={newShop.location} onChange={e => setNewShop({ ...newShop, location: e.target.value })} required />
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="field pl-9" placeholder="Shop phone number *" type="tel" value={newShop.phone} onChange={e => setNewShop({ ...newShop, phone: e.target.value })} required />
            </div>
            <div className="flex gap-2 pt-1">
              <button className="btn-primary h-9 rounded-lg px-4 text-xs" disabled={addingShop}>{addingShop ? "Creating..." : "Create Shop"}</button>
              <button type="button" className="btn-secondary h-9 rounded-lg px-4 text-xs" onClick={() => setShowAddShop(false)}>Cancel</button>
            </div>
          </form>
        )}

        {loadingShops ? (
          <p className="text-sm text-slate-400">Loading your shops…</p>
        ) : myShops.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-sm font-semibold text-slate-500">No shops yet. Click "Add Shop" to create one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myShops.map(s => (
              <div key={s.id} className={`rounded-xl border ${s.id === shop?.id ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-950">{s.shop_name}</p>
                      {s.id === shop?.id && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">Active</span>}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${s.plan === "paid" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{s.plan || "free"}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {s.location && <span>📍 {s.location}</span>}
                      {s.phone    && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-2">
                    <button type="button" className="btn-secondary h-8 rounded-lg px-3 text-xs" onClick={() => { const next = expandedShop === s.id ? null : s.id; setExpandedShop(next); if (next) loadShopStaff(s.id); }}>
                      <Users className="h-3.5 w-3.5" /> Staff
                    </button>
                    {s.id !== shop?.id && (
                      <>
                        <button type="button" className="btn-primary h-8 rounded-lg px-3 text-xs" onClick={() => handleSwitchShop(s)} disabled={switchingShop === s.id}>
                          {switchingShop === s.id ? "…" : "Switch"}
                        </button>
                        <button type="button" className="h-8 w-8 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center" onClick={() => handleDeleteShop(s)} disabled={deletingShop === s.id} title="Delete shop">
                          {deletingShop === s.id ? "…" : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {expandedShop === s.id && (
                  <div className="border-t border-slate-200 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-700">Staff — {s.shop_name}</p>
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700" onClick={() => setShowAddStaff(showAddStaff === s.id ? null : s.id)}>
                        <Plus className="h-3.5 w-3.5" /> Add Staff
                      </button>
                    </div>
                    {showAddStaff === s.id && (
                      <form onSubmit={e => handleAddStaff(e, s.id)} className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                        <p className="text-xs font-bold text-slate-600">Create a staff login for {s.shop_name}</p>
                        <input className="field text-sm" placeholder="Full name *" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} required />
                        <input className="field text-sm" type="email" placeholder="Email address *" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} required />
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input className="field pl-9 text-sm" type="tel" placeholder="Phone number *" value={newStaff.phone} onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })} required />
                        </div>
                        <div className="relative">
                          <input className="field pr-10 text-sm" type={showPassword ? "text" : "password"} placeholder="Password (min 8 characters) *" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} required minLength={8} />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword(c => !c)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-2 text-xs text-blue-700 font-semibold">
                          Staff log in at <strong>mysahelapp.com/login</strong> with their email & password.
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button className="btn-primary h-8 rounded-lg px-3 text-xs" disabled={addingStaff}>{addingStaff ? "Creating…" : "Create Login"}</button>
                          <button type="button" className="btn-secondary h-8 rounded-lg px-3 text-xs" onClick={() => setShowAddStaff(null)}>Cancel</button>
                        </div>
                      </form>
                    )}
                    {shopStaff[s.id]?.length > 0 ? (
                      <div className="space-y-2">
                        {shopStaff[s.id].map(staff => (
                          <div key={staff.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{staff.name}</p>
                              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                <span>{staff.email}</span>
                                {staff.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{staff.phone}</span>}
                                <span>· {staff.role}</span>
                              </div>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${staff.status === "active" ? "bg-green-50 text-green-700" : "bg-rose-50 text-rose-700"}`}>{staff.status}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No staff yet. Add one above.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-950">{t("loginDetails")}</h3>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{t("loggedEmail")}</p>
              <p className="mt-1 font-bold text-slate-950">{user?.email || t("notAvailable")}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{t("shopId")}</p>
              <p className="mt-1 break-all font-mono text-xs font-bold text-slate-700">{shop?.id || t("notAvailable")}</p>
            </div>
          </div>
        </div>
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sun className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-950">{t("appearance")}</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className={`rounded-lg border p-4 text-left transition ${settings.theme === "light" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`} onClick={() => setSettings(c => ({ ...c, theme: "light" }))}>
              <Sun className="mb-3 h-5 w-5 text-blue-600" />
              <p className="font-bold text-slate-950">{t("light")}</p>
            </button>
            <button type="button" className={`rounded-lg border p-4 text-left transition ${settings.theme === "dark" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`} onClick={() => setSettings(c => ({ ...c, theme: "dark" }))}>
              <Moon className="mb-3 h-5 w-5 text-blue-600" />
              <p className="font-bold text-slate-950">{t("dark")}</p>
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <Languages className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-950">{t("language")}</h3>
          </div>
          <select className="field" value={settings.language} onChange={e => { const n = { ...settings, language: e.target.value }; saveSettings(n); setSettings(n); }}>
            <option value="English">English</option>
            <option value="Somali">Somali</option>
            <option value="Arabic">العربية</option>
          </select>
        </div>
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-950">Currency</h3>
          </div>
          <select className="field" value={currency} onChange={e => changeCurrency(e.target.value)}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.label} ({c.symbol})</option>)}
          </select>
          <p className="mt-2 text-xs text-slate-500">Applies to all prices across the app.</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <form onSubmit={saveShopDetails} className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-950">{t("shopDetails")}</h3>
          </div>
          <div className="space-y-3">
            <input className="field" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="Shop name" />
            <input className="field" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" />
            <button className="btn-primary w-full">{t("saveSettings")}</button>
          </div>
        </form>
      </section>

    </div>
  );
}
