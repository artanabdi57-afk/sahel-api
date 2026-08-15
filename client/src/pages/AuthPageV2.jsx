import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Eye, EyeOff, Mail, MapPin, Phone, Store, Dumbbell, GraduationCap, ShieldCheck, LockKeyhole } from "lucide-react";
import { apiRequest } from "../lib/api";
import { saveSession } from "../lib/auth";
import { supabase } from "../lib/supabaseClient";
import sahelLogo from "../assets/sahel_logo_english.svg";

const TYPES = [
  { value: "shop", label: "Shop", desc: "Sales, stock & customer credit", icon: Store },
  { value: "school", label: "School", desc: "Students, teachers & fees", icon: GraduationCap },
  { value: "gym", label: "Gym", desc: "Members, check-ins & payments", icon: Dumbbell },
];

const COPY = {
  en: {
    login: "Welcome back", signup: "Create your Sahel workspace",
    loginSub: "Sign in with the account you created. Sahel will automatically open your saved workspace.",
    signupSub: "Choose what you manage and we will personalize your workspace.",
    email: "Email address", password: "Password", phone: "Phone number", name: "Business or organization name", location: "City / location",
    choose: "What are you managing?", create: "Create workspace", signIn: "Sign in", google: "Continue with Google", or: "or", forgot: "Forgot password?",
    new: "New to Sahel?", existing: "Already have an account?", switchToCreate: "Create account", secure: "Your information is private and protected.",
    required: "Please choose your management type and complete the required fields.", invalid: "Phone must be 9 digits and start with 61, 62, or 68.",
    show: "Show password", hide: "Hide password", automatic: "Your workspace is recognized automatically",
    automaticSub: "You do not need to choose Shop, School, or Gym every time you log in. Your account is already connected to its workspace."
  },
  so: {
    login: "Ku soo dhowow", signup: "Samee goobtaada Sahel",
    loginSub: "Ku gal akoonka aad samaysatay. Sahel si toos ah ayuu kuu geynayaa goobtaada kaydsan.",
    signupSub: "Doro waxa aad maamusho, Sahel-na goobtaada ayuu kuu habaynayaa.",
    email: "Email-ka", password: "Erayga sirta ah", phone: "Lambarka telefoonka", name: "Magaca ganacsiga ama hay'adda", location: "Magaalada / goobta",
    choose: "Maxaad maamulaysaa?", create: "Samee goobta", signIn: "Gal", google: "Google ku sii wad", or: "ama", forgot: "Ma ilowday erayga sirta ah?",
    new: "Sahel ma ku cusub tahay?", existing: "Akoon ma leedahay?", switchToCreate: "Samee akoon", secure: "Xogtaadu waa gaar oo la ilaaliyay.",
    required: "Fadlan dooro nooca maamulka oo buuxi meelaha loo baahan yahay.", invalid: "Telefoonku waa inuu noqdaa 9 lambar oo ku bilaabma 61, 62, ama 68.",
    show: "Muuji erayga sirta", hide: "Qari erayga sirta", automatic: "Goobtaada si toos ah ayaa loo aqoonsanayaa",
    automaticSub: "Uma baahnid inaad mar kasta doorato Shop, School, ama Gym. Akoonkaagu wuxuu hore ugu xiran yahay goobtiisa."
  }
};

function Field({ icon: Icon, label, ...props }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span><span className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50"><Icon className="h-4 w-4 text-slate-400"/><input className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" {...props}/></span></label>;
}

function TypeSelector({ value, onChange, title }) {
  return <div className="mb-6"><p className="mb-3 text-sm font-bold text-slate-800">{title}</p><div className="grid gap-3 sm:grid-cols-3">{TYPES.map(({ value: v, label, desc, icon: Icon }) => <button type="button" key={v} onClick={() => onChange(v)} className={`relative min-h-[118px] rounded-2xl border p-4 text-left transition ${value === v ? "border-blue-600 bg-blue-50 ring-4 ring-blue-50" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"}`}><Icon className={`h-6 w-6 ${value === v ? "text-blue-600" : "text-slate-500"}`}/><p className="mt-4 text-sm font-black">{label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>{value === v && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white"><Check className="h-3 w-3"/></span>}</button>)}</div></div>;
}

export default function AuthPageV2({ mode }) {
  const signup = mode === "signup";
  const navigate = useNavigate(), location = useLocation();
  const [lang, setLang] = useState("en"), [type, setType] = useState(""), [show, setShow] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", phone: "", shop_name: "", location: "" });
  const t = COPY[lang];
  const set = (k, v) => setForm(x => ({ ...x, [k]: v }));

  async function submit(e) {
    e.preventDefault(); setError("");
    if (signup && !type) { setError(t.required); return; }
    if (signup && form.phone && !/^(61|62|68)\d{7}$/.test(form.phone.replace(/\D/g, ""))) { setError(t.invalid); return; }
    setLoading(true);
    try {
      // Login does NOT send a management type. The backend looks up the account
      // by email and returns the workspace that belongs to that account.
      const body = signup
        ? { ...form, phone: form.phone.replace(/\D/g, ""), business_type: type }
        : { email: form.email, password: form.password };
      const response = await apiRequest(signup ? "/auth/signup" : "/auth/login", { method: "POST", body: JSON.stringify(body) });
      saveSession(response.data);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) { setError(err.message || "Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  async function google() {
    setError("");
    // During signup, the user must choose the workspace that will be created.
    // During login, Google identifies the existing account, so no type is needed.
    if (signup && !type) { setError(t.required); return; }
    localStorage.setItem("sahel_google_flow", signup ? "signup" : "login");
    if (signup) localStorage.setItem("sahel_google_business_type", type);
    else localStorage.removeItem("sahel_google_business_type");
    setLoading(true);
    try {
      const { error: e } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/auth/callback" } });
      if (e) throw e;
    } catch (e) { setError(e.message); setLoading(false); }
  }

  return <main className="min-h-screen bg-[#f6f8fc] text-slate-900"><div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_.95fr]">
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-700 to-indigo-950 p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"/><div><img src={sahelLogo} className="h-9 brightness-0 invert" alt="Sahel"/><div className="mt-20 max-w-lg"><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-200">One platform. Your workspace.</p><h1 className="mt-5 text-5xl font-black leading-[1.08]">Run your organization with clarity.</h1><p className="mt-6 text-lg leading-8 text-blue-100">Create your workspace once. Every future login takes you back to the same Shop, School, or Gym workspace.</p></div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><ShieldCheck className="mb-3 h-5 w-5 text-blue-200"/><p className="text-sm font-bold">Locked workspace</p></div><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><Check className="mb-3 h-5 w-5 text-blue-200"/><p className="text-sm font-bold">Automatic routing</p></div></div></aside>
    <section className="flex items-center justify-center p-5 sm:p-8"><div className="w-full max-w-xl"><div className="mb-7 flex items-center justify-between"><Link to="/welcome"><img src={sahelLogo} className="h-8 lg:hidden" alt="Sahel"/></Link><div className="ml-auto flex rounded-full bg-white p-1 shadow-sm">{["en", "so"].map(x => <button key={x} onClick={() => setLang(x)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${lang === x ? "bg-blue-600 text-white" : "text-slate-500"}`}>{x.toUpperCase()}</button>)}</div></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,.08)] sm:p-9"><div className="mb-7"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50"><img src={sahelLogo} className="h-7" alt="Sahel"/></div><h2 className="text-3xl font-black tracking-tight">{signup ? t.signup : t.login}</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{signup ? t.signupSub : t.loginSub}</p></div>
        {signup ? <TypeSelector value={type} onChange={setType} title={t.choose}/> : <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm"><LockKeyhole className="h-4 w-4"/></div><div><p className="text-sm font-black text-slate-900">{t.automatic}</p><p className="mt-1 text-xs leading-5 text-slate-600">{t.automaticSub}</p></div></div>}
        <form onSubmit={submit} className="space-y-4">{signup && <><Field icon={Store} label={t.name} placeholder="e.g. Sahel Academy / Hassan Store" value={form.shop_name} onChange={e => set("shop_name", e.target.value)} required/><div className="grid gap-4 sm:grid-cols-2"><Field icon={Phone} label={t.phone} placeholder="61 234 5678" value={form.phone} onChange={e => set("phone", e.target.value)} required/><Field icon={MapPin} label={t.location} placeholder="Mogadishu" value={form.location} onChange={e => set("location", e.target.value)} required/></div></>}<Field icon={Mail} label={t.email} type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} required/><label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{t.password}</span><span className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50"><input className="w-full bg-transparent text-sm font-medium outline-none" type={show ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} minLength={8} required/><button type="button" onClick={() => setShow(!show)} aria-label={show ? t.hide : t.show}>{show ? <EyeOff className="h-4 w-4 text-slate-400"/> : <Eye className="h-4 w-4 text-slate-400"/>}</button></span></label>
          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700">{error}</div>}
          <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60">{loading ? "Please wait…" : signup ? t.create : t.signIn}<ArrowRight className="h-4 w-4"/></button></form>
        <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200"/><span className="text-xs font-bold uppercase text-slate-400">{t.or}</span><div className="h-px flex-1 bg-slate-200"/></div><button onClick={google} disabled={loading} className="h-12 w-full rounded-xl border border-slate-200 bg-white text-sm font-bold hover:bg-slate-50">{t.google}</button>
        <div className="mt-6 text-center text-sm text-slate-500">{signup ? t.existing : t.new} <Link className="font-black text-blue-600 hover:underline" to={signup ? "/login" : "/signup"}>{signup ? t.signIn : t.switchToCreate}</Link>{!signup && <><span className="mx-2 text-slate-300">·</span><Link className="font-bold text-slate-600 hover:text-blue-600" to="/forgot-password">{t.forgot}</Link></>}</div><p className="mt-6 text-center text-xs font-medium text-slate-400">{t.secure}</p>
      </div></div></section></div></main>;
}
