import React, { useEffect, useState } from "react";
import { DollarSign, Languages, Mail, Moon, Settings as SettingsIcon, Store, Sun } from "lucide-react";
import { getCurrentShop, getCurrentUser, updateLocalShop } from "../lib/auth";
import { getSavedSettings, saveSettings, useLanguage } from "../lib/i18n";
import { getSavedCurrency, saveCurrency } from "../lib/api";

// Currencies most relevant to East Africa + common international ones
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

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  function changeLanguage(language) {
    const nextSettings = { ...settings, language };
    saveSettings(nextSettings);
    setSettings(nextSettings);
  }

  function changeCurrency(currencyCode) {
    saveCurrency(currencyCode);
    setCurrency(currencyCode);
    setMessage(`Currency changed to ${currencyCode}. Prices will update across the app.`);
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

      {message ? <div className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</div> : null}

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
          <select
            className="field"
            value={settings.language}
            onChange={(event) => changeLanguage(event.target.value)}
          >
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
          <select
            className="field"
            value={currency}
            onChange={(event) => changeCurrency(event.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.label} ({c.symbol})
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            This applies to all prices across the app — receipts, inventory, reports, and dashboard.
          </p>
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
