import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Check, Download, Dumbbell, GraduationCap, Menu, Package, ReceiptText, Store, Users, WalletCards, X } from "lucide-react";
import sahelLogo from "../assets/sahel_logo_english.svg";

const solutions = [
  { icon: Store, name: "Shops", title: "Run your shop without the spreadsheets.", text: "Sales, stock, receipts, customers and credit in one calm workspace." },
  { icon: GraduationCap, name: "Schools", title: "Keep your school organized.", text: "Students, teachers, classes, fees, exams and records in one place." },
  { icon: Dumbbell, name: "Gyms", title: "Make membership simple.", text: "Members, payments, renewals and daily gym operations together." },
];

const features = [
  [ReceiptText, "Sales & receipts", "Create receipts and keep a clean history of daily transactions."],
  [Package, "Inventory", "Know what you have, what is moving and what needs attention."],
  [Users, "People & members", "Keep customers, students and members organized."],
  [WalletCards, "Payments", "Track fees, balances, dues and payments without scattered records."],
  [BarChart3, "Reports", "Turn your daily activity into clear information you can act on."],
];

const chart = [35, 44, 40, 57, 50, 66, 61, 78, 69, 87, 82, 96];

export default function LandingProfessional() {
  const [menu, setMenu] = useState(false);
  const [installEvent, setInstallEvent] = useState(null);
  const [selected, setSelected] = useState("Shops");

  useEffect(() => {
    const handler = (event) => { event.preventDefault(); setInstallEvent(event); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!installEvent) {
      document.getElementById("install-help")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    installEvent.prompt();
    const result = await installEvent.userChoice;
    if (result.outcome === "accepted") setInstallEvent(null);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#111116]">
      <header className="relative z-50 bg-white">
        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 sm:px-10">
          <Link to="/welcome" className="shrink-0"><img src={sahelLogo} alt="Sahel" className="h-10 w-auto" /></Link>
          <nav className="hidden items-center gap-9 text-sm font-medium text-slate-500 md:flex">
            <a href="#home" className="hover:text-slate-950">Home</a>
            <a href="#solutions" className="hover:text-slate-950">Solutions</a>
            <a href="#features" className="hover:text-slate-950">Features</a>
            <a href="#about" className="hover:text-slate-950">About</a>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <button onClick={install} className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-[0_0_0_2px_rgba(37,99,235,.2),0_5px_16px_rgba(37,99,235,.25)] transition hover:-translate-y-0.5 hover:bg-blue-700">Install Sahel</button>
            <Link to="/login" className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-950">Log in</Link>
          </div>
          <button onClick={() => setMenu(!menu)} className="rounded-lg p-2 md:hidden" aria-label="Open menu">{menu ? <X /> : <Menu />}</button>
        </div>
        {menu && <div className="border-t border-slate-100 bg-white px-5 pb-5 md:hidden"><div className="grid gap-1 pt-3 text-sm font-semibold"><a href="#solutions" className="rounded-lg px-3 py-3">Solutions</a><a href="#features" className="rounded-lg px-3 py-3">Features</a><a href="#about" className="rounded-lg px-3 py-3">About</a><button onClick={install} className="rounded-lg bg-blue-600 px-3 py-3 text-left text-white">Install Sahel</button><Link to="/login" className="rounded-lg px-3 py-3">Log in</Link></div></div>}
      </header>

      <section id="home" className="relative bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-20 h-[520px] opacity-70" style={{ background: "radial-gradient(ellipse at 50% 62%, rgba(82,75,255,.13), rgba(255,255,255,0) 58%)" }} />
        <div className="pointer-events-none absolute inset-0 opacity-[.035]" style={{ backgroundImage: "radial-gradient(#111 0.7px, transparent 0.7px)", backgroundSize: "7px 7px" }} />
        <div className="relative mx-auto max-w-6xl px-5 pb-0 pt-20 text-center sm:px-8 sm:pt-28 lg:pt-32">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-[4rem] font-black leading-[.92] tracking-[-.055em] sm:text-7xl lg:text-[6.7rem]">
              Business software<br />
              <span className="font-serif font-medium italic tracking-[-.04em] text-blue-600">that works.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">No more spreadsheets, disconnected tools or messy records. Sahel gives your organization one simple workspace to run the work that matters.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-[0_0_0_2px_rgba(37,99,235,.2),0_8px_22px_rgba(37,99,235,.25)] transition hover:-translate-y-0.5 hover:bg-blue-700">Get started free <ArrowRight className="h-4 w-4" /></Link>
              <a href="#solutions" className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300">Explore Sahel</a>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-400">Completely free • No credit card • Built for growing organizations</p>
          </div>

          <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
            <div className="absolute -inset-10 -z-10 rounded-full bg-blue-400/10 blur-3xl" />
            <div className="overflow-hidden rounded-t-[24px] border border-slate-200 bg-white p-2 shadow-[0_30px_90px_rgba(35,40,100,.18)] sm:p-3">
              <div className="overflow-hidden rounded-[18px] border border-slate-100 bg-[#f7f8fc] text-left">
                <div className="flex h-12 items-center justify-between border-b bg-white px-4 sm:px-6">
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-200"/><span className="h-2.5 w-2.5 rounded-full bg-slate-200"/><span className="h-2.5 w-2.5 rounded-full bg-slate-200"/></div>
                  <span className="text-[10px] font-bold text-slate-400">Sahel workspace</span>
                  <div className="h-6 w-6 rounded-full bg-blue-100" />
                </div>
                <div className="grid min-h-[310px] grid-cols-[54px_1fr] sm:grid-cols-[155px_1fr]">
                  <aside className="border-r bg-white p-3 sm:p-4"><div className="mb-6 flex items-center gap-2"><div className="h-7 w-7 rounded-lg bg-blue-600"/><span className="hidden text-xs font-black sm:block">SAHEL</span></div>{["Overview","Sales","People","Inventory","Reports"].map((item,i)=><div key={item} className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-bold ${i===0?"bg-blue-50 text-blue-700":"text-slate-400"}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/><span className="hidden sm:block">{item}</span></div>)}</aside>
                  <div className="p-4 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Overview</p><h2 className="mt-1 text-lg font-black sm:text-xl">Good morning 👋</h2></div><div className="rounded-xl bg-blue-600 p-2 text-white"><BarChart3 className="h-4 w-4"/></div></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{[["Revenue","$12,840","+18.2%"],["Sales","1,248","+8.4%"],["Customers","326","Active"],["Outstanding","$2,160","Attention"]].map(([a,b,c])=><div key={a} className="rounded-xl border bg-white p-3"><p className="text-[9px] text-slate-400">{a}</p><p className="mt-1 text-sm font-black sm:text-base">{b}</p><p className="mt-1 text-[8px] font-bold text-emerald-600">{c}</p></div>)}</div><div className="mt-3 grid gap-3 sm:grid-cols-[1.6fr_1fr]"><div className="rounded-xl border bg-white p-3 sm:p-4"><div className="flex justify-between"><p className="text-[10px] font-bold text-slate-500">Business performance</p><span className="text-[9px] font-black text-blue-600">This month</span></div><svg viewBox="0 0 500 120" preserveAspectRatio="none" className="mt-2 h-24 w-full"><polyline points={chart.map((v,i)=>`${(i/(chart.length-1))*500},${110-v}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="4" className="text-blue-600" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div className="rounded-xl border bg-white p-3 sm:p-4"><p className="text-[10px] font-bold text-slate-500">Quick actions</p><div className="mt-2 space-y-2">{["Create receipt","Add customer","View report"].map(x=><div key={x} className="rounded-lg bg-slate-50 px-2.5 py-2 text-[9px] font-bold text-slate-500">{x}<ArrowRight className="float-right h-3 w-3"/></div>)}</div></div></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="mx-auto max-w-7xl px-5 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">One platform, your workflow</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Software that fits the way you work.</h2><p className="mt-5 leading-7 text-slate-500">Choose the organization type that matches your work. Sahel keeps the experience focused instead of making everyone use the same system.</p></div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">{solutions.map(({icon:Icon,name,title,text})=><button key={name} onClick={()=>setSelected(name)} className={`group rounded-3xl border p-7 text-left transition duration-300 hover:-translate-y-1 ${selected===name?"border-blue-200 bg-blue-50/50 shadow-xl shadow-blue-100":"border-slate-200 bg-white hover:shadow-xl"}`}><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${selected===name?"bg-blue-600 text-white":"bg-slate-100 text-slate-700"}`}><Icon/></div><p className="mt-6 text-xs font-black uppercase tracking-wider text-blue-600">{name}</p><h3 className="mt-2 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{text}</p><span className="mt-6 inline-flex items-center text-sm font-extrabold text-slate-700">Explore <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1"/></span></button>)}</div>
      </section>

      <section id="features" className="border-y border-slate-100 bg-[#f8f9fc]"><div className="mx-auto max-w-7xl px-5 py-20 sm:px-10 lg:py-28"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">Everything in one place</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">Less busywork.<br/><span className="font-serif font-medium italic">More control.</span></h2></div><p className="max-w-xl leading-7 text-slate-500">Sahel brings your everyday records into one organized workspace so you can spend less time searching and more time running your organization.</p></div><div className="mt-12 grid overflow-hidden rounded-3xl border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-3">{features.map(([Icon,title,text])=><div key={title} className="border-b border-slate-100 p-7 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0"><Icon className="h-6 w-6 text-blue-600"/><h3 className="mt-5 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>)}</div></div></section>

      <section id="about" className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-10 lg:py-28"><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">Built for growth</p><h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-5xl">Start with a better way to run your organization.</h2><p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-500">Sahel is completely free to start. Create your workspace, choose your business type and get to work.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-200">Create free workspace <ArrowRight className="h-4 w-4"/></Link><button onClick={install} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-7 py-3.5 text-sm font-bold"><Download className="h-4 w-4"/>Install Sahel</button></div><p id="install-help" className="mt-5 text-xs text-slate-400">If your browser supports installation, the Install button opens the app installation prompt. Otherwise use your browser's Add to Home Screen option.</p></section>

      <footer className="border-t border-slate-100 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-slate-400 sm:px-10 md:flex-row md:items-center md:justify-between"><img src={sahelLogo} alt="Sahel" className="h-8 w-auto"/><div className="flex gap-6"><a href="#solutions" className="hover:text-slate-900">Solutions</a><a href="#features" className="hover:text-slate-900">Features</a><a href="#about" className="hover:text-slate-900">About</a></div><span>© 2026 Sahel. Completely free.</span></div></footer>
    </main>
  );
}
