import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Store, Phone, Globe } from "lucide-react";
import { apiRequest } from "../lib/api";
import { saveSession } from "../lib/auth";
import sahelIcon from "../assets/sahel_logo_icon_only.svg";

const t = {
  en: {
    title: "Set up your shop",
    subtitle: "Tell us about your business so we can set up your workspace.",
    shopName: "Shop name",
    location: "Location (city / district)",
    phone: "Phone number (optional)",
    language: "Preferred language",
    hearAbout: "Where did you hear about us?",
    hearOptions: ["Friend or family", "Facebook / Social media", "WhatsApp", "Google Search", "Other"],
    businessType: "What type of business do you run?",
    businessOptions: ["General retail / grocery", "Clothes & fashion", "Electronics", "Food & restaurant", "School / education", "Other"],
    problem: "What is your biggest challenge managing your business?",
    problemPlaceholder: "e.g. tracking stock, managing credit customers...",
    continue: "Continue to dashboard",
    saving: "Saving...",
    required: "Shop name is required."
  },
  so: {
    title: "Dukaanadaada dejiso",
    subtitle: "Noo sheeg ganacsigaaga si aan u diyaarino goobta shaqada.",
    shopName: "Magaca dukaamka",
    location: "Goobta (magaalo / xaafad)",
    phone: "Lambarka telefoonka (ikhtiyaari)",
    language: "Luqadda aad doorbidayso",
    hearAbout: "Xagee baad naga maqashay?",
    hearOptions: ["Saaxiib ama qoys", "Facebook / Baraha bulshada", "WhatsApp", "Raadinta Google", "Kale"],
    businessType: "Nooca ganacsiga aad wato?",
    businessOptions: ["Khadar guud / baakoorada", "Dhar & qaabdhismeedka", "Elektaroonik", "Cunto & maqaayad", "Dugsiga / waxbarashada", "Kale"],
    problem: "Waa maxay caqabadda ugu weyn maaraynta ganacsigaaga?",
    problemPlaceholder: "tusaale. raadinta sahayda, macaamiisha deynta...",
    continue: "U sii",
    saving: "Kaydinta...",
    required: "Magaca dukaamka ayaa loo baahan yahay."
  }
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const l = t[lang];
  const [form, setForm] = useState({
    shop_name: "",
    location: "",
    phone: "",
    hear_about: "",
    business_type: "",
    main_problem: ""
  });
  const [status, setStatus] = useState({ loading: false, error: "" });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.shop_name.trim()) {
      setStatus({ loading: false, error: l.required });
      return;
    }
    setStatus({ loading: true, error: "" });
    try {
      const response = await apiRequest("/auth/setup-shop", {
        method: "POST",
        body: JSON.stringify(form)
      });
      saveSession(response.data);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-[#f7fbff] to-[#edf6ff] p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <img className="mx-auto h-14 w-14" src={sahelIcon} alt="Sahel" />

        <div className="mt-4 flex justify-center gap-2">
          <button type="button" onClick={() => setLang("en")} className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${lang === "en" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>English</button>
          <button type="button" onClick={() => setLang("so")} className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${lang === "so" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Soomaali</button>
        </div>

        <h1 className="mt-5 text-center text-3xl font-black tracking-tight text-slate-950">{l.title}</h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm font-medium leading-6 text-slate-500">{l.subtitle}</p>

        <div className="mt-6 space-y-3">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <Store className="h-4 w-4 text-slate-400" />
            <input className="w-full bg-transparent text-sm font-medium outline-none" placeholder={l.shopName} value={form.shop_name} onChange={(e) => set("shop_name", e.target.value)} required />
          </label>

          <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <MapPin className="h-4 w-4 text-slate-400" />
            <input className="w-full bg-transparent text-sm font-medium outline-none" placeholder={l.location} value={form.location} onChange={(e) => set("location", e.target.value)} />
          </label>

          <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <Phone className="h-4 w-4 text-slate-400" />
            <input className="w-full bg-transparent text-sm font-medium outline-none" placeholder={l.phone} value={form.phone} onChange={(e) => set("phone", e.target.value)} inputMode="numeric" maxLength={9} />
          </label>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="mb-2 text-xs font-bold text-slate-500">{l.hearAbout}</p>
            <div className="flex flex-wrap gap-2">
              {l.hearOptions.map((opt, i) => (
                <button key={i} type="button" onClick={() => set("hear_about", opt)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${form.hear_about === opt ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{opt}</button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="mb-2 text-xs font-bold text-slate-500">{l.businessType}</p>
            <div className="flex flex-wrap gap-2">
              {l.businessOptions.map((opt, i) => (
                <button key={i} type="button" onClick={() => set("business_type", opt)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${form.business_type === opt ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{opt}</button>
              ))}
            </div>
          </div>

          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none shadow-sm transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            rows={3}
            placeholder={l.problemPlaceholder}
            value={form.main_problem}
            onChange={(e) => set("main_problem", e.target.value)}
          />
        </div>

        {status.error ? (
          <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{status.error}</div>
        ) : null}

        <button className="btn-primary mt-5 h-12 w-full rounded-xl" disabled={status.loading}>
          {status.loading ? l.saving : l.continue}
        </button>
      </form>
    </main>
  );
}
