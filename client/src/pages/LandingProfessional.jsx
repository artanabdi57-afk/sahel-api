import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  ArrowRight, BarChart3, Check, Download, Dumbbell, GraduationCap, Menu,
  Package, ReceiptText, ShieldCheck, Store, Users, WalletCards, X,
  MessageCircle, Mail, MapPin, Wallet, UserCheck, ClipboardCheck,
} from "lucide-react";
import sahelLogo from "../assets/sahel_logo_english.svg";
import { buildWhatsAppLink } from "../components/WhatsAppSupportButton.jsx";

const businesses = [
  { icon: Store, title: "Retail & Shops", text: "Sales, inventory, customer credit, expenses and receipts in one place.", items: ["Sales & receipts", "Inventory", "Customer credit"] },
  { icon: GraduationCap, title: "School Management", text: "Classes, students, teachers, fees and exams — all in one workspace.", items: ["Students & classes", "Fees & payroll", "Exams & results"] },
  { icon: Dumbbell, title: "Gym Management", text: "Members, check-ins, payments and staff, organized without spreadsheets.", items: ["Members & check-ins", "Payments & renewals", "Staff & payroll"] },
];

const features = [
  [ReceiptText, "Sales & receipts", "Create clear receipts and keep a reliable daily sales history."],
  [Package, "Inventory", "See stock levels, movement, and items that need attention."],
  [Users, "Customers & members", "Keep the important people, balances and activity organized."],
  [WalletCards, "Payments & fees", "Track payments, outstanding balances and recurring dues."],
  [BarChart3, "Reports", "Turn daily records into simple information you can act on."],
  [ShieldCheck, "Secure workspace", "Keep your organization in one controlled, professional workspace."],
];

// ── Interactive demo data — one set per vertical, same shape, different numbers ──
const DEMO_DATA = {
  shop: {
    label: "Shop", icon: Store,
    heading: "Shop overview", metricLabel: "Sales performance",
    stats: [["Sales today", "$1,840"], ["Stock value", "$12,480"], ["Money due", "$2,160"]],
    trend: [38, 52, 46, 67, 59, 78, 70, 92, 84, 98, 90, 105, 96, 112],
  },
  gym: {
    label: "Gym", icon: Dumbbell,
    heading: "Gym overview", metricLabel: "Membership revenue",
    stats: [["Active members", "146"], ["Checked in today", "38"], ["This month", "$2,920"]],
    trend: [20, 34, 30, 48, 40, 55, 61, 58, 70, 66, 80, 74, 88, 92],
  },
  school: {
    label: "School", icon: GraduationCap,
    heading: "School overview", metricLabel: "Fees collected",
    stats: [["Active students", "312"], ["Classes", "14"], ["Fees this month", "$4,380"]],
    trend: [50, 44, 60, 58, 72, 68, 80, 76, 90, 85, 98, 92, 108, 115],
  },
};

function DemoTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-xs font-black text-blue-700 shadow-lg">
      {payload[0].value}
    </div>
  );
}

export default function LandingProfessional() {
  const [menu, setMenu] = useState(false);
  const [installEvent, setInstallEvent] = useState(null);
  const [demoType, setDemoType] = useState("shop");

  useEffect(() => {
    const h = (e) => { e.preventDefault(); setInstallEvent(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  async function install() {
    if (!installEvent) { document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth" }); return; }
    installEvent.prompt();
    const r = await installEvent.userChoice;
    if (r.outcome === "accepted") setInstallEvent(null);
  }

  const demo = DEMO_DATA[demoType];
  const chartData = useMemo(
    () => demo.trend.map((v, i) => ({ i, v })),
    [demo]
  );

  return (
    <main className="min-h-screen bg-white text-slate-950">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-blue-50 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Link to="/welcome"><img src={sahelLogo} className="h-9 w-auto sm:h-10" alt="Sahel" /></Link>
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-600 md:flex">
            <a href="#demo" className="hover:text-blue-700">See it in action</a>
            <a href="#businesses" className="hover:text-blue-700">Businesses</a>
            <a href="#features" className="hover:text-blue-700">Features</a>
            <a href="#about" className="hover:text-blue-700">About & contact</a>
          </nav>
          <div className="hidden items-center gap-2 sm:flex">
            <button onClick={install} className="rounded-xl border border-blue-100 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50">
              <Download className="mr-1 inline h-4 w-4" />Install
            </button>
            <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:text-blue-700">Log in</Link>
            <Link to="/signup" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">Get started</Link>
          </div>
          <button className="rounded-xl p-2 text-blue-700 sm:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <div className="border-t border-blue-50 bg-white p-4 sm:hidden">
            <div className="grid gap-2 text-sm font-bold">
              <a className="rounded-xl px-3 py-3" href="#demo">See it in action</a>
              <a className="rounded-xl px-3 py-3" href="#businesses">Businesses</a>
              <a className="rounded-xl px-3 py-3" href="#features">Features</a>
              <a className="rounded-xl px-3 py-3" href="#about">About & contact</a>
              <button onClick={install} className="rounded-xl border border-blue-100 px-3 py-3 text-left text-blue-700">Install Sahel</button>
              <Link className="px-3 py-3" to="/login">Log in</Link>
              <Link className="rounded-xl bg-blue-600 px-4 py-3 text-center text-white" to="/signup">Get started</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero: "Right now" — get started immediately ──────────────────── */}
      <section id="get-started" className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-32 top-40 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-8 sm:py-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-black text-blue-700 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" /> Right now — set up your workspace in minutes
          </div>
          <h1 className="mt-6 text-[2.6rem] font-black leading-[1.05] tracking-tight sm:text-6xl">
            One platform.<br /><span className="text-blue-600">Built around your work.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Sahel brings the right tools to shops, schools and gyms — log in and install Sahel, and start working today.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700">
              Create your workspace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-7 py-3.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50">
              Log in
            </Link>
            <button onClick={install} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-7 py-3.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50">
              <Download className="h-4 w-4" /> Install Sahel
            </button>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-bold text-slate-500">
            <span><Check className="mr-1 inline h-4 w-4 text-blue-600" />Mobile ready</span>
            <span><Check className="mr-1 inline h-4 w-4 text-blue-600" />English & Somali</span>
            <span><Check className="mr-1 inline h-4 w-4 text-blue-600" />One organized workspace</span>
          </div>
        </div>
      </section>

      {/* ── Interactive demo: toggle shop/gym/school, same widget updates live ── */}
      <section id="demo" className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">See it in action</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Switch it and watch the workspace change.</h2>
          <p className="mt-3 text-slate-600">The same Sahel widget, showing what a shop, a gym, and a school each actually see.</p>
        </div>

        <div className="mx-auto mt-8 flex w-fit rounded-full border border-blue-100 bg-blue-50 p-1">
          {Object.entries(DEMO_DATA).map(([key, d]) => {
            const Icon = d.icon;
            const active = demoType === key;
            return (
              <button
                key={key}
                onClick={() => setDemoType(key)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition ${
                  active ? "bg-blue-600 text-white shadow-md" : "text-blue-700 hover:bg-blue-100"
                }`}
              >
                <Icon className="h-4 w-4" /> {d.label}
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-[1.75rem] border border-blue-100 bg-white p-3 shadow-[0_25px_70px_rgba(37,99,235,.14)] sm:p-6">
          <div className="rounded-2xl bg-blue-50/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-blue-400">Sahel • {demo.label}</p>
                <p className="mt-1 text-lg font-black text-slate-950">{demo.heading}</p>
              </div>
              <div className="rounded-xl bg-blue-600 p-2.5 text-white">
                <demo.icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {demo.stats.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-blue-100 bg-white p-3">
                  <p className="text-[10px] font-bold text-slate-400">{label}</p>
                  <p className="mt-1 text-lg font-black text-blue-700 sm:text-xl">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-blue-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">{demo.metricLabel}</p>
                <span className="text-xs font-black text-blue-600">+18.6%</span>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="landingDemoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#EEF2FF" />
                  <XAxis dataKey="i" hide />
                  <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                  <Tooltip content={<DemoTooltip />} />
                  <Area type="monotone" dataKey="v" stroke="#2563EB" strokeWidth={3} fill="url(#landingDemoGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── Businesses ─────────────────────────────────────────────────── */}
      <section id="businesses" className="bg-blue-50/50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Designed by vertical</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">The right experience for the work you actually do.</h2>
            <p className="mt-4 leading-7 text-slate-600">Choose your organization type during setup — Sahel keeps the relevant modules and workflow front and center, permanently.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {businesses.map(({ icon: Icon, title, text, items }) => (
              <article key={title} className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <Icon />
                </div>
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                <div className="mt-5 space-y-2">
                  {items.map((x) => (
                    <div key={x} className="text-sm font-bold text-slate-700">
                      <Check className="mr-2 inline h-4 w-4 text-blue-600" />{x}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — light, on-brand, no more black section ─────────────── */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">One calm system</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Everything important, without the clutter.</h2>
          <p className="mt-4 leading-7 text-slate-600">Sales, inventory, people, payments and reports are organized into one professional workspace.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([Icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6 transition hover:border-blue-300 hover:bg-blue-50">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="bg-blue-50/50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Get started right now</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Three steps to your own workspace.</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              ["01", "Choose your workspace", "Select Shop, School or Gym during account creation."],
              ["02", "Add your organization details", "Name, phone, location — the details that make the workspace yours."],
              ["03", "Work in a focused dashboard", "Your modules and navigation are tailored to what you selected."],
            ].map(([n, t, x]) => (
              <div key={n} className="rounded-3xl border border-blue-100 bg-white p-6">
                <span className="text-sm font-black text-blue-600">{n}</span>
                <h3 className="mt-6 text-xl font-black">{t}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{x}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About + Contact ────────────────────────────────────────────── */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Get to know Sahel</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">One professional system for everyday business.</h2>
          <p className="mt-4 leading-7 text-slate-600">
            Sahel helps organizations manage shop sales and inventory, school classes and fees, and gym members and payments —
            built for the way businesses in Somalia actually work.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 text-center">
            <p className="text-2xl font-black text-blue-600">3+</p>
            <p className="mt-1 text-sm font-bold text-slate-700">Business workflows</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 text-center">
            <p className="text-2xl font-black text-blue-600">1</p>
            <p className="mt-1 text-sm font-bold text-slate-700">Organized workspace</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 text-center">
            <p className="text-2xl font-black text-blue-600">24/7</p>
            <p className="mt-1 text-sm font-bold text-slate-700">Access on your devices</p>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-blue-100 bg-blue-50/40 p-6 sm:p-8">
          <p className="text-center text-xs font-black uppercase tracking-[.18em] text-blue-600">Talk to us</p>
          <h3 className="mt-2 text-center text-2xl font-black">Questions before you get started?</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <a href={buildWhatsAppLink("Hi, I'd like to know more about Sahel")} target="_blank" rel="noreferrer"
               className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4 transition hover:border-blue-300 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><MessageCircle className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400">WhatsApp</p>
                <p className="text-sm font-black text-slate-950">Chat with us</p>
              </div>
            </a>
            <a href="mailto:hello@mysahelapp.com" className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4 transition hover:border-blue-300 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><Mail className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400">Email</p>
                <p className="text-sm font-black text-slate-950">hello@mysahelapp.com</p>
              </div>
            </a>
            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><MapPin className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400">Based in</p>
                <p className="text-sm font-black text-slate-950">Mogadishu, Somalia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="bg-blue-600">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 text-white sm:px-8 sm:py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-100">Ready to build your workspace?</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Log in, install Sahel, and start right now.</h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button onClick={install} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/20">
              <Download className="h-4 w-4" />Install
            </button>
            <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-blue-700 transition hover:bg-blue-50">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-blue-950 text-blue-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:px-8 md:flex-row md:items-center md:justify-between">
          <img src={sahelLogo} className="h-8 brightness-0 invert" alt="Sahel" />
          <p>Business management software built for organizations in Somalia.</p>
          <p>© 2026 Sahel. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
