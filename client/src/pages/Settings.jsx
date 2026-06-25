import React, { useEffect, useState } from "react";
import { DollarSign, Languages, Mail, Moon, Plus, Settings as SettingsIcon, Store, Sun, Users, X, Eye, EyeOff } from "lucide-react";
import { getCurrentShop, getCurrentUser, updateLocalShop, saveSession } from "../lib/auth";
import { getSavedSettings, saveSettings, useLanguage } from "../lib/i18n";
import { getSavedCurrency, saveCurrency, apiRequest } from "../lib/api";
import { supabase } from "../lib/supabaseClient";

const CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "SOS", label: "Somali Shilling", symbol: "Sh" },
  { code: "KES", label: "Kenyan Shilling", symbol: "KSh" },
  { code: "ETB", label: "Ethiopian Birr", symbol: "Br" },
  { code: "TZS", label: "Tanzanian Shilling", symbol: "TSh" },
  { code: "UGX", label: "Ugandan Shilling", symbol: "USh" },
  { code: "DJF", label: "Djiboutian Franc", symbol: "Fr" },
  { code: "SAR", label: "Saudi Riyal", symbol: "﷼" },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "TRY", label: "Turkish Lira", symbol: "₺" }
];

export default function Settings() {
  const { t } = useLanguage();
  const user = getCurrentUser();
  const shop = getCurrentShop();
  const [settings, setSettings] = useState(getSavedSettings);
  const [shopName, setShopName] = useState(shop?.shop_name || "");
  const [location, setLocation] = useState(shop?.location || "");
  const [currency, setCurrency] = useState(getSavedCurrency);
  const [message, setMessage] = useState({ text: "", type: "success" });

  // Multi-shop state
  const [myShops, setMyShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [showAddShop, setShowAddShop] = useState(false);
  const [newShop, setNewShop] = useState({ shop_name: "", location: "" });
  const [addingShop, setAddingShop] = useState(false);
  const [switchingShop, setSwitchingShop] = useState(null);
  const [expandedShop, setExpandedShop] = useState(null);

  // Staff state
  const [shopStaff, setShopStaff] = useState({});
  const [showAddStaff, setShowAddStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({ email: "", password: "", name: "" });
  const [addingStaff, setAddingStaff] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { saveSettings(settings); }, [settings]);
  useEffect(() => { loadMyShops(); }, []);

  async function loadMyShops() {
    setLoadingShops(true);
    try {
      const { data, error } = await supabase.rpc("get_my_shops");
      if (!error) setMyShops(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingShops(false);
    }
  }

  async function loadShopStaff(shopId) {
    try {
      const { data, error } = await supabase.rpc("get_shop_staff", { p_shop_id: shopId });
      if (!error) setShopStaff((prev) => ({ ...prev, [shopId]: data || [] }));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddShop(e) {
    e.preventDefault();
    if (!newShop.shop_name.trim()) return;
    setAddingShop(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from("shops")
        .insert({
          shop_name: newShop.shop_name.trim(),
          location: newShop.location.trim(),
          owner_id: session.user.id,
          status: "active",
          plan: "free"
        })
        .select()
        .single();

      if (error) throw error;
      setNewShop({ shop_name: "", location: "" });
      setShowAddShop(false);
      await loadMyShops();
      showMsg(`Shop "${newShop.shop_name}" created! You can now switch to it.`, "success");
    } catch (error) {
      showMsg(error.message, "error");
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
        body: JSON.stringify({ shop_id: selectedShop.id })
      });
      saveSession(response.data);
      showMsg(`Switching to ${selectedShop.shop_name}...`, "success");
      setTimeout(() => window.location.href = "/dashboard", 800);
    } catch {
      // Fallback: save shop directly to localStorage
      const currentSession = JSON.parse(localStorage.getItem("sahel_user") || "{}");
      localStorage.setItem("sahel_shop", JSON.stringify({
        id: selectedShop.id,
        shop_name: selectedShop.shop_name,
        location: selectedShop.location,
        status: selectedShop.status,
        plan: selectedShop.plan
      }));
      showMsg(`Switching to ${selectedShop.shop_name}...`, "success");
      setTimeout(() => window.location.href = "/dashboard", 800);
    } finally {
      setSwitchingShop(null);
    }
  }

  async function handleAddStaff(e, shopId) {
    e.preventDefault();
    if (!newStaff.email.trim() || !newStaff.password.trim()) return;
    setAddingStaff(true);
    try {
      // Create the staff user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newStaff.email.trim(),
        password: newStaff.password.trim(),
        email_confirm: true
      });

      if (authError) throw authError;

      // Link staff to shop in our users table
      const { error: dbError } = await supabase
        .from("users")
        .upsert({
          id: authData.user.id,
          email: newStaff.email.trim(),
          staff_of_shop_id: shopId,
          user_role: "staff",
          status: "active"
        });

      if (dbError) throw dbError;

      setNewStaff({ email: "", password: "", name: "" });
      setShowAddStaff(null);
      await loadShopStaff(shopId);
      showMsg(`Staff account created for ${newStaff.email}. Share the email and password with them.`, "success");
    } catch (error) {
      showMsg(`Error: ${error.message}`, "error");
    } finally {
      setAddingStaff(false);
    }
  }

  function showMsg(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "success" }), 5000);
  }

  function changeLanguage(language) {
    const nextSettings = { ...settings, language };
    saveSettings(nextSettings);
    setSettings(nextSettings);
  }

  function changeCurrency(currencyCode) {
    saveCurrency(currencyCode);
    setCurrency(currencyCode);
    showMsg(`Currency changed to ${currencyCode}.`);
  }

  function saveShopDetails(event) {
    event.preventDefault();
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

      {message.text ? (
        <div className={`flex items-center justify-between rounded-lg p-3 text-sm font-semibold ${message.type === "error" ? "bg-rose-50 text-rose-700" : "bg-green-50 text-green-700"}`}>
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage({ text: "", type: "success" })}><X className="h-4 w-4" /></button>
        </div>
      ) : null}

      {/* My Shops */}
      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-950">My Shops</h3>
              <p className="text-xs text-slate-500">Create multiple shops and switch between them</p>
            </div>
          </div>
          <button type="button" className="btn-primary h-9 rounded-lg px-3 text-xs" onClick={() => setShowAddShop((c) => !c)}>
            <Plus className="h-4 w-4" />
            Add Shop
          </button>
        </div>

        {showAddShop ? (
          <form onSubmit={handleAddShop} className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="mb-3 text-sm font-bold text-slate-700">New Shop Details</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input className="field" placeholder="Shop name" value={newShop.shop_name} onChange={(e) => setNewShop({ ...newShop, shop_name: e.target.value })} required />
              <input className="field" placeholder="Location (optional)" value={newShop.location} onChange={(e) => setNewShop({ ...newShop, location: e.target.value })} />
            </div>
            <div className="mt-3 flex gap-2">
              <button className="btn-primary h-9 rounded-lg px-4 text-xs" disabled={addingShop}>{addingShop ? "Creating..." : "Create Shop"}</button>
              <button type="button" className="btn-secondary h-9 rounded-lg px-4 text-xs" onClick={() => setShowAddShop(false)}>Cancel</button>
            </div>
          </form>
        ) : null}

        {loadingShops ? (
          <p className="text-sm text-slate-400">Loading your shops...</p>
        ) : myShops.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-sm font-semibold text-slate-500">No shops yet. Click "Add Shop" to create one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myShops.map((s) => (
              <div key={s.id} className={`rounded-xl border ${s.id === shop?.id ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-950">{s.shop_name}</p>
                      {s.id === shop?.id ? <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">Active</span> : null}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${s.plan === "paid" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{s.plan || "free"}</span>
                    </div>
                    <p className="text-xs text-slate-500">{s.location || "No location"} · {s.product_count || 0} products · {s.sales_count || 0} sales</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary h-8 rounded-lg px-3 text-xs"
                      onClick={() => {
                        const next = expandedShop === s.id ? null : s.id;
                        setExpandedShop(next);
                        if (next) loadShopStaff(s.id);
                      }}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Staff
                    </button>
                    {s.id !== shop?.id ? (
                      <button
                        type="button"
                        className="btn-primary h-8 rounded-lg px-3 text-xs"
                        onClick={() => handleSwitchShop(s)}
                        disabled={switchingShop === s.id}
                      >
                        {switchingShop === s.id ? "Switching..." : "Switch"}
                      </button>
                    ) : null}
                  </div>
                </div>

                {expandedShop === s.id ? (
                  <div className="border-t border-slate-200 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-700">Staff Accounts</p>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                        onClick={() => setShowAddStaff(showAddStaff === s.id ? null : s.id)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Staff
                      </button>
                    </div>

                    {showAddStaff === s.id ? (
                      <form onSubmit={(e) => handleAddStaff(e, s.id)} className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="mb-2 text-xs font-bold text-slate-600">Create staff login for {s.shop_name}</p>
                        <div className="space-y-2">
                          <input className="field text-sm" type="email" placeholder="Staff email address" value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} required />
                          <div className="relative">
                            <input className="field pr-10 text-sm" type={showPassword ? "text" : "password"} placeholder="Password (min 8 characters)" value={newStaff.password} onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })} required minLength={8} />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword((c) => !c)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500">The staff member will use this email and password to log in. They will only see {s.shop_name}.</p>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button className="btn-primary h-8 rounded-lg px-3 text-xs" disabled={addingStaff}>{addingStaff ? "Creating..." : "Create Login"}</button>
                          <button type="button" className="btn-secondary h-8 rounded-lg px-3 text-xs" onClick={() => setShowAddStaff(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : null}

                    {shopStaff[s.id] && shopStaff[s.id].length > 0 ? (
                      <div className="space-y-2">
                        {shopStaff[s.id].map((staff) => (
                          <div key={staff.id} className="flex items-center justify-between rounded-lg bg-white p-2 text-sm">
                            <div>
                              <p className="font-semibold text-slate-800">{staff.email}</p>
                              <p className="text-xs text-slate-500 capitalize">{staff.user_role}</p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${staff.status === "active" ? "bg-green-50 text-green-700" : "bg-rose-50 text-rose-700"}`}>
                              {staff.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No staff accounts yet. Add one above.</p>
                    )}
                  </div>
                ) : null}
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
