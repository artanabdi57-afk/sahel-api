import React, { useEffect, useState } from "react";
import { DollarSign, Languages, Mail, Moon, Plus, Settings as SettingsIcon, Store, Sun, Trash2, X } from "lucide-react";
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
  const [message, setMessage] = useState("");
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [showAddShop, setShowAddShop] = useState(false);
  const [newShop, setNewShop] = useState({ shop_name: "", location: "" });
  const [addingShop, setAddingShop] = useState(false);
  const [switchingShop, setSwitchingShop] = useState(null);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    loadShops();
  }, []);

  async function loadShops() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from("owner_shops")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: true });
      if (!error) setShops(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingShops(false);
    }
  }

  async function handleAddShop(e) {
    e.preventDefault();
    if (!newShop.shop_name.trim()) return;
    setAddingShop(true);
    try {
      const response = await apiRequest("/auth/setup-shop", {
        method: "POST",
        body: JSON.stringify({ shop_name: newShop.shop_name, location: newShop.location, create_new: true })
      });
      setNewShop({ shop_name: "", location: "" });
      setShowAddShop(false);
      await loadShops();
      setMessage(`Shop "${newShop.shop_name}" created successfully.`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setAddingShop(false);
    }
  }

  async function handleSwitchShop(selectedShop) {
    setSwitchingShop(selectedShop.id);
    try {
      const response = await apiRequest("/auth/switch-shop", {
        method: "POST",
        body: JSON.stringify({ shop_id: selectedShop.id })
      });
      saveSession(response.data);
      setMessage(`Switched to ${selectedShop.shop_name}. Reloading...`);
      setTimeout(() => window.location.href = "/dashboard", 1000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSwitchingShop(null);
    }
  }

  function changeLanguage(language) {
    const nextSettings = { ...settings, language };
    saveSettings(nextSettings);
    setSettings(nextSettings);
  }

  function changeCurrency(currencyCode) {
    saveCurrency(currencyCode);
    setCurrency(currencyCode);
    setMessage(`Currency changed to ${currencyCode}.`);
  }

  function saveShopDetails(event) {
    event.preventDefault();
    updateLocalShop({ shop_name: shopName, location });
    setMessage(`${t("settings")} saved on this device.`);
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

      {message ? (
        <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-700">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage("")}><X className="h-4 w-4" /></button>
        </div>
      ) : null}

      {/* My Shops */}
      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-950">My Shops</h3>
          </div>
          <button
            type="button"
            className="btn-primary h-9 rounded-lg px-3 text-xs"
            onClick={() => setShowAddShop((c) => !c)}
          >
            <Plus className="h-4 w-4" />
            Add Shop
          </button>
        </div>

        {showAddShop ? (
          <form onSubmit={handleAddShop} className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-bold text-slate-700">New Shop</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="field"
                placeholder="Shop name"
                value={newShop.shop_name}
                onChange={(e) => setNewShop({ ...newShop, shop_name: e.target.value })}
                required
              />
              <input
                className="field"
                placeholder="Location"
                value={newShop.location}
                onChange={(e) => setNewShop({ ...newShop, location: e.target.value })}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button className="btn-primary h-9 rounded-lg px-4 text-xs" disabled={addingShop}>
                {addingShop ? "Creating..." : "Create Shop"}
              </button>
              <button type="button" className="btn-secondary h-9 rounded-lg px-4 text-xs" onClick={() => setShowAddShop(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {loadingShops ? (
          <p className="text-sm text-slate-400">Loading shops...</p>
        ) : shops.length === 0 ? (
          <p className="text-sm text-slate-400">No shops found.</p>
        ) : (
          <div className="space-y-2">
            {shops.map((s) => (
              <div
                key={s.id}
                className={`flex items-center justify-between rounded-xl border p-3 ${s.id === shop?.id ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"}`}
              >
                <div>
                  <p className="font-bold text-slate-950">{s.shop_name}</p>
                  <p className="text-xs text-slate-500">{s.location || "No location"} · {s.product_count || 0} products · {s.sales_count || 0} sales</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.id === shop?.id ? (
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">Active</span>
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary h-8 rounded-lg px-3 text-xs"
                      onClick={() => handleSwitchShop(s)}
                      disabled={switchingShop === s.id}
                    >
                      {switchingShop === s.id ? "Switching..." : "Switch"}
                    </button>
                  )}
                </div>
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
            <button
              type="button"
              className={`rounded-lg border p-4 text-left transition ${settings.theme === "light" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}
              onClick={() => setSettings((current) => ({ ...current, theme: "light" }))}
            >
              <Sun className="mb-3 h-5 w-5 text-blue-600" />
              <p className="font-bold text-slate-950">{t("light")}</p>
            </button>
            <button
              type="button"
              className={`rounded-lg border p-4 text-left transition ${settings.theme === "dark" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}
              onClick={() => setSettings((current) => ({ ...current, theme: "dark" }))}
            >
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
          <select className="field" value={settings.language} onChange={(event) => changeLanguage(event.target.value)}>
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
          <select className="field" value={currency} onChange={(event) => changeCurrency(event.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code} — {c.label} ({c.symbol})</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">This applies to all prices across the app.</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <form onSubmit={saveShopDetails} className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-950">{t("shopDetails")}</h3>
          </div>
          <div className="space-y-3">
            <input className="field" value={shopName} onChange={(event) => setShopName(event.target.value)} placeholder="Shop name" />
            <input className="field" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" />
            <button className="btn-primary w-full">{t("saveSettings")}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
