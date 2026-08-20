import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Menu,
  Package,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import sahelLogo from "../assets/sahel_logo_english.svg";

const copy = {
  en: {
    nav: ["Solutions", "Features", "How it works", "About"],
    badge: "A calmer way to run your organization",
    title: "Everything your team needs, in one clear workspace.",
    subtitle:
      "Sahel brings sales, people, inventory, payments, and reporting together so your team can spend less time chasing records and more time moving forward.",
    primary: "Start for free",
    secondary: "See how it works",
    proof: ["No credit card", "Works on mobile", "Set up in minutes"],
    dashboard: "Today at a glance",
    revenue: "Today's revenue",
    orders: "Orders",
    members: "Active members",
    chart: "Revenue this week",
    solutionsEyebrow: "Made for the way you work",
    solutionsTitle: "One system. Three powerful workflows.",
    solutionsSubtitle:
      "Whether you run a shop, school, or gym, Sahel gives your team the right tools without the complexity of enterprise software.",
    featuresEyebrow: "Everything in one place",
    featuresTitle: "Less admin. More momentum.",
    howEyebrow: "Simple from day one",
    howTitle: "Get organized without a long implementation.",
    ctaTitle: "Your next workday can feel a lot simpler.",
    ctaSubtitle:
      "Create your workspace, invite your team, and start running your day from one reliable place.",
    cta: "Create your free workspace",
  },
  so: {
    nav: ["Xalalka", "Astaamaha", "Sida uu u shaqeeyo", "Ku saabsan"],
    badge: "Hab fudud oo lagu maamulo ururkaaga",
    title: "Wax kasta oo kooxdaadu u baahan tahay, hal meel oo cad.",
    subtitle:
      "Sahel wuxuu isku keenaa iibka, dadka, alaabta, lacagaha iyo warbixinnada si kooxdaadu uga yaraato raadinta diiwaannada.",
    primary: "Bilaash ku bilow",
    secondary: "Eeg sida uu u shaqeeyo",
    proof: ["Kaarka lacagta looma baahna", "Mobilka wuu ka shaqeeyaa", "Daqiiqado ku diyaari"],
    dashboard: "Aragtida maanta",
    revenue: "Dakhliga maanta",
    orders: "Dalabaad",
    members: "Xubnaha firfircoon",
    chart: "Dakhliga toddobaadkan",
    solutionsEyebrow: "Loo dhisay shaqadaada",
    solutionsTitle: "Hal nidaam. Saddex hab-shaqo oo awood leh.",
    solutionsSubtitle:
      "Haddii aad maamusho dukaan, dugsi ama jimicsi, Sahel wuxuu kooxdaada siinayaa qalabka saxda ah.",
    featuresEyebrow: "Wax walba hal meel",
    featuresTitle: "Shaqo yar. Horumar badan.",
    howEyebrow: "Fudud bilowgiiba",
    howTitle: "Nadaami shaqadaada adigoon hirgelin dheer.",
    ctaTitle: "Maalintaada shaqo waxay noqon kartaa mid fudud.",
    ctaSubtitle:
      "Samee goobtaada, ku casuum kooxdaada, oo maalintaada ka maamul hal meel.",
    cta: "Samee goobtaada bilaashka ah",
  },
  ar: {
    nav: ["الحلول", "الميزات", "كيف يعمل", "حول"],
    badge: "طريقة أكثر هدوءًا لإدارة مؤسستك",
    title: "كل ما يحتاجه فريقك، في مساحة عمل واحدة واضحة.",
    subtitle:
      "يجمع سهل المبيعات والأفراد والمخزون والمدفوعات والتقارير حتى يقضي فريقك وقتًا أقل في البحث عن السجلات.",
    primary: "ابدأ مجانًا",
    secondary: "شاهد كيف يعمل",
    proof: ["بدون بطاقة ائتمان", "يعمل على الهاتف", "إعداد خلال دقائق"],
    dashboard: "نظرة اليوم",
    revenue: "إيرادات اليوم",
    orders: "الطلبات",
    members: "الأعضاء النشطون",
    chart: "الإيرادات هذا الأسبوع",
    solutionsEyebrow: "مصمم لطريقة عملك",
    solutionsTitle: "نظام واحد. ثلاث طرق عمل قوية.",
    solutionsSubtitle:
      "سواء كنت تدير متجرًا أو مدرسة أو ناديًا رياضيًا، يمنحك سهل الأدوات المناسبة بدون تعقيد.",
    featuresEyebrow: "كل شيء في مكان واحد",
    featuresTitle: "عمل إداري أقل. تقدم أكبر.",
    howEyebrow: "بسيط منذ اليوم الأول",
    howTitle: "نظّم عملك بدون تنفيذ طويل.",
    ctaTitle: "يمكن أن يصبح يوم عملك أبسط بكثير.",
    ctaSubtitle:
      "أنشئ مساحة العمل، ادعُ فريقك، وابدأ بإدارة يومك من مكان واحد.",
    cta: "أنشئ مساحة العمل المجانية",
  },
};

const solutions = [
  {
    icon: Store,
    title: "Shops",
    text: "Sales, stock, receipts, customers, and credit — without spreadsheet chaos.",
    tone: "bg-[#e9f1ff] text-[#2563eb]",
  },
  {
    icon: ClipboardList,
    title: "Schools",
    text: "Students, classes, fees, teachers, and records organized in one place.",
    tone: "bg-[#eaf9f1] text-[#159a61]",
  },
  {
    icon: Users,
    title: "Gyms",
    text: "Members, renewals, payments, and daily operations working together.",
    tone: "bg-[#fff1e8] text-[#e56b2f]",
  },
];

const features = [
  [BarChart3, "Clear reporting", "Turn daily activity into decisions your team can act on."],
  [Package, "Inventory control", "Know what is moving, what is low, and what needs attention."],
  [WalletCards, "Payments in one view", "Track balances, dues, and payments without scattered records."],
  [ShieldCheck, "A secure workspace", "Keep your organization’s most important records together."],
];

function StatCard({ label, value, change, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_28px_-20px_rgba(15,23,42,.35)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
          <Icon size={15} strokeWidth={2} />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <strong className="text-2xl font-black tracking-tight text-slate-950">{value}</strong>
        <span className="text-xs font-bold text-emerald-600">{change}</span>
      </div>
    </div>
  );
}

function DashboardPreview({ t }) {
  return (
    <div className="relative mx-auto w-full max-w-[610px]">
      <div className="absolute -inset-5 rounded-[38px] bg-blue-200/30 blur-3xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white p-3 shadow-[0_34px_80px_-30px_rgba(37,99,235,.45)] sm:p-4">
        <div className="rounded-[22px] bg-[#f7f9fc] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-blue-600">{t.dashboard}</p>
              <h3 className="mt-1 text-xl font-black text-slate-950">Good morning, team</h3>
            </div>
            <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 sm:block">
              This week <ChevronDown className="ml-1 inline" size={13} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatCard label={t.revenue} value="$18,392" change="+18.2%" icon={CircleDollarSign} />
            <StatCard label={t.orders} value="284" change="+12.4%" icon={ClipboardList} />
            <StatCard label={t.members} value="1,248" change="+8.7%" icon={Users} />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1.35fr_.8fr]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">{t.chart}</p>
                <span className="text-xs font-bold text-emerald-600">+18.2%</span>
              </div>
              <div className="mt-5 flex h-32 items-end gap-2">
                {[38, 52, 46, 70, 58, 84, 96].map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col justify-end gap-2">
                    <div
                      className={`rounded-t-lg ${index === 6 ? "bg-blue-600" : "bg-blue-100"}`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-center text-[10px] font-semibold text-slate-400">
                      {["M", "T", "W", "T", "F", "S", "S"][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Tasks today</p>
                <Sparkles size={16} className="text-blue-300" />
              </div>
              <div className="mt-4 space-y-3">
                {["Review stock levels", "Follow up payments", "Send weekly report"].map((task, index) => (
                  <div key={task} className="flex items-center gap-2 text-xs text-white/75">
                    <span className={`grid h-4 w-4 place-items-center rounded-full ${index < 2 ? "bg-emerald-400 text-slate-950" : "border border-white/20"}`}>
                      {index < 2 && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className={index < 2 ? "line-through opacity-50" : ""}>{task}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-emerald-400" />
              </div>
              <p className="mt-2 text-[11px] text-white/45">2 of 3 completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SahelLandingPageImproved() {
  const [language, setLanguage] = useState("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const t = copy[language];
  const rtl = language === "ar";

  return (
    <main dir={rtl ? "rtl" : "ltr"} className="min-h-screen overflow-hidden bg-[#fbfcfe] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-70 [background-image:linear-gradient(rgba(15,23,42,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.035)_1px,transparent_1px)] [background-size:44px_44px]" />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link to="/" className="shrink-0">
          <img src={sahelLogo} alt="Sahel" className="h-8 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 lg:flex">
          {t.nav.map((item, index) => (
            <a key={item} href={["#solutions", "#features", "#how-it-works", "#about"][index]} className="transition hover:text-slate-950">{item}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent text-xs font-bold text-slate-500 outline-none">
            <option value="en">EN</option>
            <option value="so">SO</option>
            <option value="ar">AR</option>
          </select>
          <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 transition hover:text-slate-950">Log in</Link>
          <Link to="/signup" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5">Get started</Link>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl border border-slate-200 bg-white p-2.5 lg:hidden" aria-label="Toggle menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {menuOpen && (
        <div className="mx-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl lg:hidden">
          <div className="grid gap-2 text-sm font-semibold text-slate-600">
            {t.nav.map((item, index) => <a key={item} href={["#solutions", "#features", "#how-it-works", "#about"][index]} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 hover:bg-slate-50">{item}</a>)}
          </div>
          <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
            <Link to="/login" className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-center text-sm font-bold">Log in</Link>
            <Link to="/signup" className="flex-1 rounded-full bg-slate-950 px-4 py-2.5 text-center text-sm font-bold text-white">Get started</Link>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-10 lg:pb-28">
        <div className="grid items-center gap-14 lg:grid-cols-[.92fr_1.08fr] lg:gap-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              {t.badge}
            </div>
            <h1 className="mt-6 max-w-xl text-5xl font-black leading-[.98] tracking-[-.055em] text-slate-950 sm:text-6xl lg:text-[5.2rem]">
              {t.title}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-500 sm:text-xl">{t.subtitle}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-[0_16px_32px_-14px_rgba(37,99,235,.7)] transition hover:-translate-y-0.5 hover:bg-blue-700">
                {t.primary}
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1 rtl:rotate-180" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-base font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300">
                {t.secondary}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-400">
              {t.proof.map((item) => <span key={item} className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" strokeWidth={3} />{item}</span>)}
            </div>
          </div>
          <DashboardPreview t={t} />
        </div>
      </section>

      <section id="solutions" className="border-y border-slate-100 bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">{t.solutionsEyebrow}</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] text-slate-950 sm:text-5xl">{t.solutionsTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-slate-500">{t.solutionsSubtitle}</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {solutions.map(({ icon: Icon, title, text, tone }) => (
              <article key={title} className="group rounded-[28px] border border-slate-200/80 bg-[#fbfcfe] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-[0_24px_50px_-28px_rgba(37,99,235,.4)]">
                <span className={`inline-flex rounded-2xl p-3 ${tone}`}><Icon size={22} /></span>
                <h3 className="mt-8 text-2xl font-black tracking-tight">{title}</h3>
                <p className="mt-3 leading-7 text-slate-500">{text}</p>
                <a href="#features" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-slate-900">Explore workflow <ArrowRight size={15} className="transition group-hover:translate-x-1 rtl:rotate-180" /></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-10">
            <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">{t.featuresEyebrow}</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">{t.featuresTitle}</h2>
            <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white">
              <Sparkles className="text-blue-300" size={22} />
              <p className="mt-5 text-lg font-bold leading-8">“The best system is the one your team actually enjoys using.”</p>
              <p className="mt-4 text-sm text-white/45">Designed for clarity, not clutter.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(([Icon, title, text], index) => (
              <article key={title} className={`rounded-[26px] border border-slate-200 bg-white p-6 ${index === 1 ? "sm:translate-y-8" : ""}`}>
                <Icon size={22} className="text-blue-600" />
                <h3 className="mt-8 text-xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#eef4ff] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">{t.howEyebrow}</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">{t.howTitle}</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Create your workspace", "Choose your workflow and start with the essentials."],
              ["02", "Bring in your data", "Add your people, products, members, or import a spreadsheet."],
              ["03", "Run your day", "Invite your team and keep the important work in one place."],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-3xl border border-blue-100 bg-white p-6">
                <span className="text-sm font-black text-blue-600">{number}</span>
                <h3 className="mt-7 text-xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-4xl rounded-[36px] bg-slate-950 px-6 py-14 text-center text-white sm:px-12 lg:py-20">
          <p className="text-xs font-black uppercase tracking-[.2em] text-blue-300">Sahel</p>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-black tracking-[-.04em] sm:text-5xl">{t.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/55">{t.ctaSubtitle}</p>
          <Link to="/signup" className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-bold text-slate-950 transition hover:-translate-y-0.5">
            {t.cta}
            <ArrowRight size={17} className="rtl:rotate-180" />
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-400 sm:flex-row sm:px-8 sm:text-left lg:px-10">
        <img src={sahelLogo} alt="Sahel" className="h-7 w-auto opacity-80" />
        <span>© 2026 Sahel. Built for growing organizations.</span>
      </footer>
    </main>
  );
}
