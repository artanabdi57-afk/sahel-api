import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Check, Download, Dumbbell, GraduationCap, Globe2, Menu, Package, ReceiptText, ShieldCheck, Store, Users, WalletCards, X, Zap } from "lucide-react";
import sahelLogo from "../assets/sahel_logo_english.svg";

const languages = [
  { key: "en", label: "English", short: "EN", dir: "ltr" },
  { key: "so", label: "Somali", short: "SO", dir: "ltr" },
  { key: "ar", label: "العربية", short: "AR", dir: "rtl" },
];

const copy = {
  en: {
    solutions: "Solutions", features: "Features", install: "Install", how: "How it works", login: "Log in", start: "Get started",
    badge: "One platform. Many organizations.", heroPrefix: "Manage your", heroSuffix: "with Sahel.", startSahel: "Start with Sahel", installSahel: "Install Sahel", workspace: "Sahel workspace",
    built: "Built for the way you work", businessesTitle: "School. Shop. Gym. One Sahel.", businessesText: "Your workspace changes around your organization. Choose the solution that fits your work.",
    everything: "Everything important", featureTitle: "Less empty space. More useful information.", featureText: "Sahel brings the important work forward: admissions, shop operations, gym memberships, payments, reports and more.",
    installTitle: "Use Sahel like an app on your phone or computer.", installText: "On supported browsers, tap Install and Sahel can be added to your home screen or desktop.", phone: "Home-screen app", desktop: "Install on PC / laptop", phoneText: "Open Sahel from your phone like a normal app.", desktopText: "Install from a supported browser without changing the desktop layout.",
    setup: "Simple setup", setupTitle: "Choose your organization. Sahel does the rest.",
    finalTitle: "One platform for the work that matters.", finalText: "From school admissions to shop sales to gym memberships, keep the important parts of your organization in one place.", create: "Create your workspace",
    footer: "Business management software built for organizations in Somalia.", installed: "Sahel is installed", installHelp: "If your browser does not show the install prompt, use the browser menu and choose Install Sahel or Add to Home Screen.",
  },
  so: {
    solutions: "Xalalka", features: "Astaamaha", install: "Rakib", how: "Sida uu u shaqeeyo", login: "Gal", start: "Bilow",
    badge: "Hal madal. Ururro badan.", heroPrefix: "Maamul", heroSuffix: "adigoo adeegsanaya Sahel.", startSahel: "Ku bilow Sahel", installSahel: "Rakib Sahel", workspace: "Goobta Sahel",
    built: "Loogu dhisay sida aad u shaqeyso", businessesTitle: "Dugsi. Dukaan. Jim. Hal Sahel.", businessesText: "Goobtaada shaqadu waxay la qabsataa ururkaaga. Dooro xalka ku habboon shaqadaada.",
    everything: "Wax kasta oo muhiim ah", featureTitle: "Meel bannaan yar. Macluumaad faa'iido badan.", featureText: "Sahel wuxuu kuu soo hormariyaa shaqada muhiimka ah: ardayda, iibka, xubinnimada jim-ka, lacagaha, warbixinnada iyo wax kale.",
    installTitle: "Sahel uga isticmaal sida app telefoonka ama kombiyuutarka.", installText: "Browser-yada taageera, taabo Rakib si Sahel loogu daro shaashadda telefoonka ama desktop-ka.", phone: "App-ka telefoonka", desktop: "Ku rakib PC / laptop", phoneText: "Sahel telefoonkaaga uga fur sida app caadi ah.", desktopText: "Ku rakib browser-ka taageera adigoon beddelin muuqaalka desktop-ka.",
    setup: "Dejin fudud", setupTitle: "Dooro ururkaaga. Sahel ayaa inta kale qabanaya.",
    finalTitle: "Hal madal oo loogu talagalay shaqada muhiimka ah.", finalText: "Laga bilaabo diiwaangelinta ardayda ilaa iibka dukaanka iyo xubinnimada jim-ka, wax walba hal meel ku hay.", create: "Samee goobtaada",
    footer: "Software maamul ganacsi oo loogu talagalay ururrada Soomaaliya.", installed: "Sahel waa la rakibay", installHelp: "Haddii browser-ku uusan soo bandhigin rakibidda, fur menu-ga browser-ka oo dooro Install Sahel ama Add to Home Screen.",
  },
  ar: {
    solutions: "الحلول", features: "المزايا", install: "تثبيت", how: "كيف يعمل", login: "تسجيل الدخول", start: "ابدأ الآن",
    badge: "منصة واحدة. مؤسسات متعددة.", heroPrefix: "أدر", heroSuffix: "باستخدام Sahel.", startSahel: "ابدأ مع Sahel", installSahel: "تثبيت Sahel", workspace: "مساحة عمل Sahel",
    built: "مصمم لطريقة عملك", businessesTitle: "مدرسة. متجر. نادٍ رياضي. Sahel واحد.", businessesText: "تتغير مساحة العمل حسب مؤسستك. اختر الحل المناسب لعملك.",
    everything: "كل ما هو مهم", featureTitle: "مساحة فارغة أقل. معلومات أكثر فائدة.", featureText: "يضع Sahel العمل المهم أمامك: الطلاب، المبيعات، العضويات، المدفوعات والتقارير والمزيد.",
    installTitle: "استخدم Sahel كتطبيق على هاتفك أو جهاز الكمبيوتر.", installText: "في المتصفحات المدعومة، اضغط تثبيت لإضافة Sahel إلى الشاشة الرئيسية أو سطح المكتب.", phone: "تطبيق على الهاتف", desktop: "تثبيت على الكمبيوتر", phoneText: "افتح Sahel من هاتفك مثل أي تطبيق عادي.", desktopText: "ثبّته من متصفح مدعوم دون تغيير تجربة سطح المكتب.",
    setup: "إعداد بسيط", setupTitle: "اختر مؤسستك. Sahel يتولى الباقي.",
    finalTitle: "منصة واحدة للعمل الذي يهمك.", finalText: "من تسجيل الطلاب إلى مبيعات المتجر وعضويات النادي الرياضي، احتفظ بكل شيء مهم في مكان واحد.", create: "أنشئ مساحة عملك",
    footer: "برنامج لإدارة الأعمال مصمم للمؤسسات في الصومال.", installed: "تم تثبيت Sahel", installHelp: "إذا لم يظهر خيار التثبيت، افتح قائمة المتصفح واختر Install Sahel أو Add to Home Screen.",
  },
};

const verticals = [
  { key: "school", icon: GraduationCap, color: "from-blue-600 to-indigo-700", title: { en: "School Management", so: "Maamulka Dugsiga", ar: "إدارة المدارس" }, short: { en: "schools", so: "dugsiyada", ar: "المدارس" }, text: { en: "Admissions, students, teachers, classes, fees, exams and school records in one focused workspace.", so: "Diiwaangelinta, ardayda, macallimiinta, fasallada, lacagaha, imtixaannada iyo diiwaannada dugsiga hal meel.", ar: "القبول والطلاب والمعلمون والفصول والرسوم والاختبارات والسجلات المدرسية في مساحة واحدة." }, items: { en: ["Admissions & students", "Teachers & classes", "Fees & exams"], so: ["Diiwaangelin & arday", "Macallimiin & fasallo", "Lacagaha & imtixaannada"], ar: ["القبول والطلاب", "المعلمون والفصول", "الرسوم والاختبارات"] } },
  { key: "shop", icon: Store, color: "from-emerald-500 to-teal-700", title: { en: "Shop Management", so: "Maamulka Dukaanka", ar: "إدارة المتاجر" }, short: { en: "shops", so: "dukaamada", ar: "المتاجر" }, text: { en: "Sales, inventory, receipts, customer credit, expenses and reports without spreadsheet clutter.", so: "Iibka, kaydka, rasiidhada, deymaha macaamiisha, kharashaadka iyo warbixinnada.", ar: "المبيعات والمخزون والإيصالات وديون العملاء والمصروفات والتقارير دون فوضى الجداول." }, items: { en: ["Sales & receipts", "Inventory", "Customer credit"], so: ["Iibka & rasiidhada", "Kaydka", "Deynta macaamiisha"], ar: ["المبيعات والإيصالات", "المخزون", "ائتمان العملاء"] } },
  { key: "gym", icon: Dumbbell, color: "from-violet-600 to-purple-800", title: { en: "Gym Management", so: "Maamulka Jim-ka", ar: "إدارة النوادي الرياضية" }, short: { en: "gyms", so: "jim-yada", ar: "النوادي الرياضية" }, text: { en: "Members, payments, staff and membership renewals in one simple system.", so: "Xubnaha, lacagaha, shaqaalaha iyo cusboonaysiinta xubinnimada hal nidaam fudud.", ar: "الأعضاء والمدفوعات والموظفون وتجديد العضويات في نظام بسيط واحد." }, items: { en: ["Members & profiles", "Payments & renewals", "Staff management"], so: ["Xubnaha & profiles", "Lacagaha & cusboonaysiinta", "Maamulka shaqaalaha"], ar: ["الأعضاء والملفات", "المدفوعات والتجديد", "إدارة الموظفين"] } },
];

const features = [
  [ReceiptText, { en: "Sales & receipts", so: "Iibka & rasiidhada", ar: "المبيعات والإيصالات" }, { en: "Create clear receipts and keep daily records organized.", so: "Samee rasiidh cad oo diiwaannada maalinlaha ah habee.", ar: "أنشئ إيصالات واضحة وحافظ على تنظيم السجلات اليومية." }],
  [Package, { en: "Inventory", so: "Kaydka", ar: "المخزون" }, { en: "Know what you have, what is moving and what needs attention.", so: "Ogow waxa kuu yaal, waxa socda iyo waxa u baahan fiiro.", ar: "اعرف ما لديك وما يتحرك وما يحتاج إلى اهتمام." }],
  [Users, { en: "People management", so: "Maamulka dadka", ar: "إدارة الأشخاص" }, { en: "Students, customers, members and staff in the right workspace.", so: "Arday, macaamiil, xubno iyo shaqaale meel sax ah.", ar: "الطلاب والعملاء والأعضاء والموظفون في مساحة العمل المناسبة." }],
  [WalletCards, { en: "Payments", so: "Lacagaha", ar: "المدفوعات" }, { en: "Track payments, outstanding balances and recurring dues.", so: "La soco lacagaha, baaqiga iyo lacagaha soo noqnoqda.", ar: "تابع المدفوعات والأرصدة المستحقة والرسوم المتكررة." }],
  [BarChart3, { en: "Reports", so: "Warbixinnada", ar: "التقارير" }, { en: "Turn your daily records into information you can act on.", so: "Diiwaannada maalinlaha ah u beddel xog aad ku shaqayn karto.", ar: "حوّل سجلاتك اليومية إلى معلومات تساعدك على اتخاذ القرار." }],
  [ShieldCheck, { en: "Secure workspace", so: "Goob ammaan ah", ar: "مساحة عمل آمنة" }, { en: "Keep your organization in one controlled, professional workspace.", so: "Ururkaaga ku hay hal goob oo ammaan ah oo xirfad leh.", ar: "حافظ على مؤسستك في مساحة عمل آمنة واحترافية." }],
];

export default function LandingV2() {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState(0);
  const [installEvent, setInstallEvent] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem("sahel-language") || "en");
  const [langOpen, setLangOpen] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0, active: false });
  const current = verticals[active];
  const t = copy[language] || copy.en;
  const selectedLanguage = languages.find((item) => item.key === language) || languages[0];

  useEffect(() => {
    localStorage.setItem("sahel-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = selectedLanguage.dir;
  }, [language, selectedLanguage.dir]);

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallEvent(e); };
    const onInstalled = () => { setInstalled(true); setInstallEvent(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    setInstalled(window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActive((i) => (i + 1) % verticals.length), 5500);
    return () => clearInterval(timer);
  }, []);

  const progress = useMemo(() => `${((active + 1) / verticals.length) * 100}%`, [active]);
  const floatX = pointer.active ? pointer.x * 18 : 0;
  const floatY = pointer.active ? pointer.y * 14 : 0;

  function handleVisualMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setPointer({ x, y, active: true });
  }

  function changeLanguage(key) {
    setLanguage(key);
    setLangOpen(false);
  }

  async function installApp() {
    if (!installEvent) { document.getElementById("install-help")?.scrollIntoView({ behavior: "smooth" }); return; }
    installEvent.prompt();
    const result = await installEvent.userChoice;
    if (result.outcome === "accepted") setInstallEvent(null);
  }

  return <main className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-950" dir={selectedLanguage.dir}>
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link to="/welcome" className="shrink-0"><img src={sahelLogo} className="h-12 w-auto sm:h-14" alt="Sahel" /></Link>
        <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 lg:flex"><a href="#businesses" className="hover:text-blue-600">{t.solutions}</a><a href="#features" className="hover:text-blue-600">{t.features}</a><a href="#install" className="hover:text-blue-600">{t.install}</a><a href="#how" className="hover:text-blue-600">{t.how}</a></nav>
        <div className="hidden items-center gap-2 md:flex">
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50" aria-label="Language"><Globe2 className="h-4 w-4 text-blue-600"/>{selectedLanguage.short}</button>
            {langOpen && <div className="absolute end-0 top-12 z-50 w-36 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">{languages.map((item) => <button key={item.key} onClick={() => changeLanguage(item.key)} className={`w-full rounded-xl px-3 py-2 text-start text-sm font-bold hover:bg-blue-50 ${item.key === language ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}>{item.label}</button>)}</div>}
          </div>
          {!installed && <button onClick={installApp} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-black text-blue-700 hover:bg-blue-100"><Download className="h-4 w-4"/> {t.install}</button>}
          <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">{t.login}</Link>
          <Link to="/signup" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700">{t.start}</Link>
        </div>
        <button className="rounded-xl p-2 md:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X/> : <Menu/>}</button>
      </div>
      {menu && <div className="border-t border-slate-100 bg-white p-5 md:hidden"><div className="grid gap-3 text-sm font-bold"><div className="flex gap-2">{languages.map((item) => <button key={item.key} onClick={() => changeLanguage(item.key)} className={`rounded-lg px-3 py-2 ${item.key === language ? "bg-blue-600 text-white" : "bg-slate-100"}`}>{item.short}</button>)}</div><a href="#businesses" onClick={() => setMenu(false)}>{t.solutions}</a><a href="#features" onClick={() => setMenu(false)}>{t.features}</a><a href="#install" onClick={() => setMenu(false)}>{t.install}</a><a href="#how" onClick={() => setMenu(false)}>{t.how}</a><Link to="/login">{t.login}</Link><Link to="/signup" className="rounded-xl bg-blue-600 px-4 py-3 text-center text-white">{t.start}</Link></div></div>}
    </header>

    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950"/><div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl"/>
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:py-16">
        <div className="order-2 lg:order-1" dir={selectedLanguage.dir}><div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-white/10 px-3 py-1.5 text-xs font-black text-blue-200"><Zap className="h-3.5 w-3.5"/> {t.badge}</div><h1 className="mt-5 max-w-2xl text-[2.65rem] font-black leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[3.75rem]">{t.heroPrefix} <span className="text-blue-400">{current.short[language]}</span> {t.heroSuffix}</h1><p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">{current.text[language]}</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500">{t.startSahel} <ArrowRight className="h-4 w-4"/></Link><button onClick={installApp} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-black text-white hover:bg-white/15"><Download className="h-4 w-4"/> {t.installSahel}</button></div></div>

        <div className="order-1 lg:order-2" onMouseMove={handleVisualMove} onMouseLeave={() => setPointer({ x: 0, y: 0, active: false })}>
          <div className="relative mx-auto h-[390px] max-w-[650px] sm:h-[500px]" style={{ perspective: "1200px" }}>
            <div className="absolute inset-x-6 top-8 h-[310px] rounded-[2.5rem] bg-blue-300/10 blur-3xl sm:inset-x-10 sm:top-12 sm:h-[390px]"/>
            <div className="absolute left-[5%] top-[18%] w-[82%] rounded-[2rem] border border-slate-200/70 bg-white p-3 shadow-2xl transition-transform duration-200 ease-out sm:left-[4%] sm:top-[16%]" style={{ transform: `rotate(-5deg) translate3d(${floatX}px, ${floatY}px, 0)` }}>
              <div className="rounded-[1.5rem] bg-slate-50 p-4 sm:p-5"><div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{t.workspace}</p><p className="mt-1 text-sm font-black text-slate-900">Good morning 👋</p></div><div className="h-8 w-8 rounded-lg bg-blue-600"/></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-xl border border-slate-200 bg-white p-2"><p className="text-[8px] text-slate-400">Revenue</p><p className="mt-1 text-xs font-black text-slate-900">$18.2K</p><p className="mt-1 text-[8px] font-bold text-emerald-500">+18.2%</p></div><div className="rounded-xl border border-slate-200 bg-white p-2"><p className="text-[8px] text-slate-400">Sales</p><p className="mt-1 text-xs font-black text-slate-900">1,248</p><p className="mt-1 text-[8px] font-bold text-emerald-500">+18.2%</p></div><div className="rounded-xl border border-slate-200 bg-white p-2"><p className="text-[8px] text-slate-400">People</p><p className="mt-1 text-xs font-black text-slate-900">326</p><p className="mt-1 text-[8px] font-bold text-emerald-500">+18.2%</p></div></div><div className="mt-3 rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-center justify-between"><p className="text-[9px] font-bold text-slate-400">Business performance</p><p className="text-[8px] font-bold text-blue-600">This month</p></div><svg viewBox="0 0 500 130" className="mt-2 h-20 w-full overflow-visible"><polyline points="5,110 60,85 120,88 175,55 235,60 290,25 350,30 405,5 465,8 500,-5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"/><line x1="5" y1="118" x2="500" y2="118" stroke="currentColor" strokeOpacity=".12"/></svg></div></div>
            </div>
            <div className="absolute right-[1%] top-[3%] w-[46%] rounded-[1.7rem] border border-white/80 bg-white p-3 shadow-2xl transition-transform duration-200 ease-out sm:right-[3%] sm:top-[1%]" style={{ transform: `rotate(7deg) translate3d(${floatX * 1.25}px, ${floatY * 1.15}px, 0)` }}><div className="rounded-[1.25rem] bg-slate-50 p-4"><p className="text-[9px] font-black uppercase text-slate-400">Total revenue</p><p className="mt-2 text-2xl font-black text-slate-950">$18,392.07</p><p className="mt-1 text-[9px] font-black text-emerald-500">+18.2%</p><svg viewBox="0 0 220 60" className="mt-2 h-14 w-full"><polyline points="5,42 40,35 75,48 110,18 145,43 180,20 215,34" fill="none" stroke="currentColor" strokeWidth="3" className="text-violet-600"/></svg></div></div>
            <div className="absolute bottom-[3%] left-[1%] w-[35%] rounded-[1.5rem] border border-white bg-white p-3 shadow-2xl transition-transform duration-200 ease-out sm:left-[0%] sm:bottom-[2%]" style={{ transform: `rotate(-8deg) translate3d(${floatX * 1.45}px, ${floatY * 1.35}px, 0)` }}><p className="text-[8px] font-black uppercase text-slate-400">Active people</p><p className="mt-1 text-2xl font-black text-slate-950">326</p><div className="mt-3 flex items-end gap-1.5">{[18,30,22,38,28,45,52].map((h, i) => <span key={i} className="flex-1 rounded-t-md bg-blue-200" style={{ height: `${h}px` }}/>)}</div></div>
            <div className="absolute bottom-[1%] right-[7%] w-[43%] rounded-[1.7rem] border border-white bg-white p-3 shadow-2xl transition-transform duration-200 ease-out sm:right-[6%]" style={{ transform: `rotate(7deg) translate3d(${floatX * -1.1}px, ${floatY * -1.25}px, 0)` }}><div className="rounded-[1.25rem] bg-slate-950 p-4 text-white"><p className="text-[9px] font-black uppercase text-blue-300">Monthly sales</p><p className="mt-1 text-2xl font-black">$16,349</p><div className="mt-4 flex h-14 items-end gap-1">{[30,38,34,48,44,55,42,60,50,64,55,48].map((h, i) => <span key={i} className="flex-1 rounded-t-sm bg-blue-400/80" style={{ height: `${h}px` }}/>)}</div></div></div>
          </div>
        </div>
      </div>
    </section>

    <section id="businesses" className="mx-auto max-w-7xl px-4 py-20 sm:px-8"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">{t.built}</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.businessesTitle}</h2><p className="mt-4 text-base leading-7 text-slate-600">{t.businessesText}</p></div><div className="mt-10 grid gap-5 md:grid-cols-3">{verticals.map((v, i) => { const Icon = v.icon; return <button key={v.key} onClick={() => setActive(i)} className={`group min-w-0 rounded-3xl border p-6 text-start transition duration-300 hover:-translate-y-2 hover:shadow-2xl sm:p-7 ${i === active ? "border-blue-300 bg-blue-50/50 shadow-lg shadow-blue-100" : "border-slate-200 bg-white"}`}><div className="flex items-center justify-between"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${v.color} text-white`}><Icon/></span><ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"/></div><h3 className="mt-6 min-h-[2.5rem] text-lg font-black leading-tight sm:text-xl">{v.title[language]}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{v.text[language]}</p><div className="mt-5 space-y-2">{v.items[language].map(x => <div key={x} className="flex items-start gap-2 text-sm font-bold leading-5 text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"/>{x}</div>)}</div></button>; })}</div></section>

    <section id="features" className="bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-8"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">{t.everything}</p><h2 className="mt-3 text-4xl font-black tracking-tight">{t.featureTitle}</h2></div><p className="max-w-xl text-base leading-7 text-slate-600">{t.featureText}</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(([Icon,title,text]) => <article key={title.en} className="group rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:scale-110"><Icon/></div><h3 className="mt-5 text-base font-black leading-tight">{title[language]}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text[language]}</p></article>)}</div></div></section>

    <section id="install" className="bg-blue-600 text-white"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-8 lg:grid-cols-[1fr_.8fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-blue-100">{t.installSahel}</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.installTitle}</h2><p className="mt-4 max-w-2xl text-base leading-7 text-blue-100">{t.installText}</p><button onClick={installApp} disabled={installed} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-blue-700 shadow-xl disabled:opacity-70"><Download className="h-4 w-4"/>{installed ? t.installed : t.installSahel}</button><p id="install-help" className="mt-4 text-xs text-blue-100">{t.installHelp}</p></div><div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><div className="rounded-2xl bg-white/10 p-5"><p className="text-xs font-bold text-blue-100">{t.phone}</p><p className="mt-1 font-black">{t.phone}</p><p className="mt-2 text-sm text-blue-100">{t.phoneText}</p></div><div className="rounded-2xl bg-white/10 p-5"><p className="text-xs font-bold text-blue-100">{t.desktop}</p><p className="mt-1 font-black">{t.desktop}</p><p className="mt-2 text-sm text-blue-100">{t.desktopText}</p></div></div></div></div></section>

    <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-8"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">{t.setup}</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.setupTitle}</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3">{[["01", { en: "Choose your workspace", so: "Dooro goobtaada", ar: "اختر مساحة العمل" }, { en: "Select School Management, Shop Management or Gym Management during setup.", so: "Dooro maamulka dugsiga, dukaanka ama jim-ka marka aad bilaabayso.", ar: "اختر إدارة المدرسة أو المتجر أو النادي الرياضي أثناء الإعداد." }],["02", { en: "Your workspace adapts", so: "Goobtaadu way la qabsataa", ar: "مساحة العمل تتكيف معك" }, { en: "The relevant modules and terminology stay in front of you.", so: "Qaybaha iyo erayada ku habboon shaqadaada ayaa kuu muuqanaya.", ar: "تظهر لك الوحدات والمصطلحات المناسبة لعملك." }],["03", { en: "Work anywhere", so: "Meel kasta ka shaqee", ar: "اعمل من أي مكان" }, { en: "Use the same account on desktop, laptop or phone.", so: "Isticmaal isla akoonka desktop, laptop ama telefoonka.", ar: "استخدم الحساب نفسه على الكمبيوتر أو الهاتف." }]].map(([n,title,text]) => <div key={n} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><span className="text-sm font-black text-blue-600">{n}</span><h3 className="mt-7 text-xl font-black leading-tight">{title[language]}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{text[language]}</p></div>)}</div></section>

    <section className="bg-slate-950 text-white"><div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-8"><p className="text-sm font-bold text-blue-300">Sahel</p><h2 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">{t.finalTitle}</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">{t.finalText}</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white hover:bg-blue-500">{t.create} <ArrowRight className="h-4 w-4"/></Link><button onClick={installApp} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-black hover:bg-white/10"><Download className="h-4 w-4"/> {t.installSahel}</button></div></div></section>

    <footer className="bg-slate-950 text-slate-400"><div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/10 px-4 py-8 text-sm sm:px-8 md:flex-row md:items-center md:justify-between"><img src={sahelLogo} className="h-10 w-auto brightness-0 invert" alt="Sahel"/><p>{t.footer}</p><p>© 2026 Sahel. All rights reserved.</p></div></footer>
  </main>;
}
