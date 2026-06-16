import React, { useEffect, useState } from "react";
import { Languages, Mail, Moon, Settings as SettingsIcon, Store, Sun } from "lucide-react";
import { getCurrentShop, getCurrentUser, updateLocalShop } from "../lib/auth";
import { getSavedSettings, saveSettings, useLanguage } from "../lib/i18n";

export default function Settings() {
  const { t } = useLanguage();
  const user = getCurrentUser();
  const shop = getCurrentShop();
  const [settings, setSettings] = useState(getSavedSettings);
  const [shopName, setShopName] = useState(shop?.shop_name || "");
  const [location, setLocation] = useState(shop?.location || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  function changeLanguage(language) {
    const nextSettings = { ...settings, language };
    saveSettings(nextSettings);
    setSettings(nextSettings);
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
