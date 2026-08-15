import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BarChart3, Check, Download, Dumbbell, GraduationCap,
  Menu, Package, ReceiptText, Store, Users, WalletCards, X, ShieldCheck,
  Smartphone, MonitorDown
} from "lucide-react";
import sahelLogo from "../assets/sahel_logo_english.svg";

const solutions = [
  { icon: Store, name: "Shops", title: "Run your shop without spreadsheets.", text: "Sales, stock, receipts, customers and credit in one calm workspace." },
  { icon: GraduationCap, name: "Schools", title: "Keep your school organized.", text: "Students, teachers, classes, fees, exams and records in one place." },
  { icon: Dumbbell, name: "Gyms", title: "Make membership simple.", text: "Members, payments, renewals and daily gym operations together." },
];

const features = [
  [ReceiptText, "Sales & receipts", "Create receipts and keep a clean history of daily transactions."],
  [Package, "Inventory", "Know what you have, what is moving and what needs attention."],
  [Users, "People & members", "Keep customers, students and members organized."],
  [WalletCards, "Payments", "Track fees, balances, dues and payments without scattered records."],
  [BarChart3, "Reports", "Turn daily activity into clear information you can act on."],
  [ShieldCheck, "Secure workspace", "Keep important organizational records in one controlled place."],
];

const chart = [38, 50, 44, 61, 53, 69, 62, 80, 72, 91, 84, 98];

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
}

export default function LandingProfessional() {
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState("Shops");
  const [installAvailable, setInstallAvailable] = useState(Boolean(window.__sahelInstallPrompt));
  const [installed, setInstalled] = useState(isStandalone());
  const [installOpen, setInstallOpen] = useState(false);

  useEffect(() => {
    const available = () => setInstallAvailable(Boolean(window.__sahelInstallPrompt));
    const done = () => {
      setInstallAvailable(false);
      setInstalled(true);
      setInstallOpen(false);
    };
    window.addEventListener("sahel-install-available", available);
    window.addEventListener("sahel-app-installed", done);
    return () => {
      window.removeEventListener("sahel-install-available", available);
      window.removeEventListener("sahel-app-installed", done);
    };
  }, []);

  const selectedSolution = solutions.find((item) => item.name === selected) || solutions[0];
  const SelectedIcon = selectedSolution.icon;

  async function install() {
    const prompt = window.__sahelInstallPrompt;
    if (prompt) {
      try {
        await prompt.prompt();
        const result = await prompt.userChoice;
        if (result?.outcome === "accepted") {
          window.__sahelInstallPrompt = null;
          setInstallAvailable(false);
        }
      } catch {
        setInstallOpen(true);
      }
      return;
    }
    setInstallOpen(true);
    requestAnimationFrame(() => document.getElementById("install-help")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#111116]">
      <header className="relative z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/welcome" className="shrink-0" aria-label="Sahel home"><img src={sahelLogo} alt="Sahel" className="h-11 w-auto" /></Link>
          <nav className="hidden items-center gap-9 text-sm font-semibold text-slate-500 md:flex">
            <a href="#home" className="hover:text-slate-950">Home</a><a href="#solutions" className="hover:text-slate-950">Solutions</a><a href="#features" className="hover:text-slate-950">Features</a><a href="#about" className="hover:text-slate-950">About</a>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <button onClick={install} className="rounded-full bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700">{installed ? "Sahel installed" : "Install Sahel"}</button>
            <Link to="/login" className="px-3 py-2 text-sm font-bold text-slate-600 hover:text-slate-950">Log in</Link>
            <Link to="/signup" className="rounded-full bg-slate-950 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-blue-700">Sign up</Link>
          </div>
          <button onClick={() => setMenu(!menu)} className="rounded-xl p-2 md:hidden" aria-label="Open menu">{menu ? <X /> : <Menu />}</button>
        </div>
        {menu && <div className="border-t border-slate-100 bg-white px-5 pb-5 md:hidden"><div className="grid gap-1 pt-3 text-sm font-semibold"><a href="#solutions" onClick={() => setMenu(false)} className="rounded-xl px-3 py-3">Solutions</a><a href="#features" onClick={() => setMenu(false)} className="rounded-xl px-3 py-3">Features</a><a href="#about" onClick={() => setMenu(false)} className="rounded-xl px-3 py-3">About</a><button onClick={install} className="rounded-xl bg-blue-600 px-3 py-3 text-left text-white">Install Sahel</button><Link to="/login" className="rounded-xl px-3 py-3">Log in</Link><Link to="/signup" className="rounded-xl bg-slate-950 px-3 py-3 text-white">Sign up</Link></div></div>}
      </header>

      <section id="home" className="relative overflow-hidden bg-white">
        <div className="absolute inset-y-0 right-0 hidden w-[48%] bg-[#eaf7ff] lg:block" />
        <div className="absolute right-[36%] top-20 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center lg:min-h-[650px] lg:grid-cols-[.86fr_1.14fr]">
          <div className="relative z-10 px-5 pb-12 pt-16 sm:px-8 sm:pt-20 lg:px-10 lg:pb-20 lg:pt-20">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> Built for growing organizations</div>
            <h1 className="max-w-xl text-[3.7rem] font-black leading-[.95] tracking-[-.055em] sm:text-6xl lg:text-[5.2rem]">Your business<br /><span className="text-blue-600">workspace</span><br />simplified.</h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-slate-500 sm:text-lg">Boost productivity by keeping sales, people, inventory, payments and reports together in one simple Sahel workspace.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700">Get started free <ArrowRight className="h-4 w-4" /></Link><button onClick={install} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-extrabold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700"><Download className="h-4 w-4" /> Install app</button></div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-slate-400"><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Free to start</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> No credit card</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Mobile ready</span></div>
          </div>

          <div className="relative min-h-[500px] overflow-hidden bg-[#eaf7ff] px-4 py-10 sm:px-10 lg:min-h-[650px] lg:bg-transparent lg:px-5">
            <div className="absolute right-0 top-10 h-[430px] w-[430px] rounded-full bg-white/80 blur-3xl" />
            <div className="relative mx-auto h-[440px] max-w-[650px] sm:h-[520px] lg:h-[570px]">
              <div className="absolute left-1/2 top-1/2 h-[300px] w-[90%] -translate-x-1/2 -translate-y-1/2 rotate-[-7deg] rounded-[32px] bg-white/60 shadow-2xl shadow-blue-200/60 sm:h-[360px]" />
              <div className="absolute left-[4%] top-[12%] w-[68%] rotate-[-7deg] rounded-[22px] border border-slate-200 bg-white p-2 shadow-[0_30px_70px_rgba(30,64,175,.22)] sm:left-[5%] sm:top-[13%] sm:w-[65%]"><div className="overflow-hidden rounded-[16px] bg-[#f7f9fc]"><div className="flex h-10 items-center justify-between border-b bg-white px-3"><div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-200"/><span className="h-2 w-2 rounded-full bg-slate-200"/><span className="h-2 w-2 rounded-full bg-slate-200"/></div><span className="text-[8px] font-black text-slate-400">SAHEL WORKSPACE</span><span className="h-5 w-5 rounded-full bg-blue-100" /></div><div className="grid grid-cols-[58px_1fr]"><div className="border-r bg-white p-2"><div className="mb-5 h-6 w-6 rounded-lg bg-blue-600"/>{[1,2,3,4,5].map((i)=><div key={i} className={`mb-2 h-2 rounded ${i===1?"bg-blue-100":"bg-slate-100"}`}/>)}</div><div className="p-3 sm:p-4"><div className="flex items-center justify-between"><div><p className="text-[7px] font-bold text-slate-400">OVERVIEW</p><p className="mt-1 text-xs font-black">Good morning 👋</p></div><div className="rounded-lg bg-blue-600 p-1.5 text-white"><BarChart3 className="h-3 w-3"/></div></div><div className="mt-3 grid grid-cols-3 gap-1.5">{[["Revenue","$18.2K"],["Sales","1,248"],["People","326"]].map(([a,b])=><div key={a} className="rounded-lg border bg-white p-2"><p className="text-[6px] text-slate-400">{a}</p><p className="mt-1 text-[9px] font-black">{b}</p><p className="mt-1 text-[6px] font-bold text-emerald-500">+18.2%</p></div>)}</div><div className="mt-2 rounded-lg border bg-white p-2"><div className="flex justify-between text-[7px] font-bold text-slate-400"><span>Business performance</span><span className="text-blue-600">This month</span></div><svg viewBox="0 0 400 95" preserveAspectRatio="none" className="mt-2 h-20 w-full"><polyline points={chart.map((v,i)=>`${(i/(chart.length-1))*400},${88-v*.72}`).join(" ")} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div></div></div></div></div>
              <div className="absolute right-[1%] top-[5%] w-[43%] rotate-[8deg] rounded-[18px] border border-slate-200 bg-white p-2 shadow-[0_25px_60px_rgba(30,64,175,.2)] sm:right-[3%] sm:w-[40%]"><div className="rounded-xl bg-slate-50 p-3"><div className="flex items-center justify-between"><span className="text-[8px] font-bold text-slate-400">TOTAL REVENUE</span><span className="text-[7px] font-black text-emerald-500">+18.2%</span></div><p className="mt-2 text-lg font-black">$18,392.07</p><svg viewBox="0 0 180 55" className="mt-2 h-12 w-full"><polyline points="0,42 25,36 47,39 72,20 98,30 124,15 148,22 180,5" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round"/></svg></div></div>
              <div className="absolute bottom-[5%] right-[9%] w-[43%] rotate-[7deg] rounded-[20px] border border-slate-200 bg-white p-2 shadow-[0_25px_60px_rgba(30,64,175,.2)] sm:bottom-[3%] sm:right-[10%] sm:w-[38%]"><div className="rounded-xl bg-slate-950 p-3 text-white"><div className="flex items-center justify-between"><span className="text-[8px] font-bold text-slate-400">MONTHLY SALES</span><span className="text-[7px] text-emerald-400">+12%</span></div><p className="mt-2 text-lg font-black">$16,349</p><div className="mt-3 flex h-14 items-end gap-1">{[28,40,33,48,55,43,62,51,68,58,75,70].map((h,i)=><span key={i} className="flex-1 rounded-t bg-blue-400/80" style={{height:`${h}%`}}/>)}</div></div></div>
              <div className="absolute bottom-[8%] left-[1%] hidden w-[27%] rotate-[-8deg] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:block"><p className="text-[7px] font-black text-slate-400">ACTIVE PEOPLE</p><p className="mt-1 text-xl font-black">326</p><div className="mt-2 flex h-7 items-end gap-1">{[45,65,38,80,55,90,72].map((h,i)=><span key={i} className="flex-1 rounded-t bg-blue-200" style={{height:`${h}%`}}/>)}</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="border-t border-slate-100 bg-white"><div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">One platform</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Built around your work.</h2></div><p className="max-w-xl leading-7 text-slate-500">Choose the workflow that fits your organization. Sahel adapts to the way you work instead of forcing every team into the same system.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{solutions.map(({icon:Icon,name,title,text})=><button key={name} onClick={()=>setSelected(name)} className={`group rounded-[28px] border p-7 text-left transition duration-300 hover:-translate-y-1 ${selected===name?"border-blue-200 bg-blue-50/60 shadow-xl shadow-blue-100":"border-slate-200 bg-white hover:shadow-xl"}`}><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${selected===name?"bg-blue-600 text-white":"bg-slate-100 text-slate-700"}`}><Icon/></div><p className="mt-6 text-xs font-black uppercase tracking-wider text-blue-600">{name}</p><h3 className="mt-2 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{text}</p><span className="mt-6 inline-flex items-center text-sm font-extrabold">Explore <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1"/></span></button>)}</div><div className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-600"><SelectedIcon className="h-5 w-5 text-blue-600"/><span><strong>{selectedSolution.name} workspace:</strong> {selectedSolution.text}</span></div></div></section>

      <section id="features" className="border-y border-slate-100 bg-[#f8faff]"><div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">Everything in one place</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">Less busywork. More control.</h2><p className="mt-5 leading-7 text-slate-500">Bring everyday records into one organized workspace so your team can spend less time searching and more time running the organization.</p></div><div className="mt-12 grid overflow-hidden rounded-[28px] border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-3">{features.map(([Icon,title,text])=><div key={title} className="border-b border-slate-100 p-7 lg:border-r lg:[&:nth-child(3n)]:border-r-0"><Icon className="h-6 w-6 text-blue-600"/><h3 className="mt-5 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>)}</div></div></section>

      <section id="about" className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8 lg:py-28"><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">Install Sahel</p><h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-5xl">Take your workspace with you.</h2><p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-500">Install Sahel like an app on your phone or computer for a faster, focused experience.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-200">Create free workspace <ArrowRight className="h-4 w-4"/></Link><button onClick={install} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-7 py-3.5 text-sm font-bold"><Download className="h-4 w-4"/> {installed?"Installed":"Install Sahel"}</button></div><div id="install-help" className={`mx-auto mt-8 max-w-2xl rounded-3xl border p-6 text-left transition ${installOpen?"border-blue-200 bg-blue-50/60 shadow-lg":"border-slate-100 bg-slate-50"}`}><div className="flex items-start gap-4"><div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm"><Download className="h-5 w-5"/></div><div className="flex-1"><p className="font-black">{installed?"Sahel is installed":installAvailable?"Sahel is ready to install":"Install availability"}</p>{installed?<p className="mt-1 text-sm text-slate-500">Open Sahel from your device's apps or desktop for the app experience.</p>:installAvailable?<p className="mt-1 text-sm text-slate-500">Your browser supports direct installation. Tap an Install Sahel button to open the native install prompt.</p>:<div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white p-4"><div className="flex items-center gap-2 font-bold"><MonitorDown className="h-4 w-4 text-blue-600"/> Computer</div><p className="mt-2 text-xs leading-5 text-slate-500">In Chrome or Edge, open the browser menu and choose <strong>Install Sahel</strong> or <strong>Install this site as an app</strong>.</p></div><div className="rounded-2xl bg-white p-4"><div className="flex items-center gap-2 font-bold"><Smartphone className="h-4 w-4 text-blue-600"/> Phone</div><p className="mt-2 text-xs leading-5 text-slate-500">Android: use the browser menu and choose <strong>Install app</strong>. iPhone/iPad: tap <strong>Share → Add to Home Screen</strong>.</p></div></div>}</div></div></div></section>

      <footer className="border-t border-slate-100 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-slate-400 sm:px-8 md:flex-row md:items-center md:justify-between"><img src={sahelLogo} alt="Sahel" className="h-9 w-auto"/><div className="flex gap-6"><a href="#solutions" className="hover:text-slate-900">Solutions</a><a href="#features" className="hover:text-slate-900">Features</a><a href="#about" className="hover:text-slate-900">Install</a></div><span>© 2026 Sahel. Built for growing organizations.</span></div></footer>
    </main>
  );
}
