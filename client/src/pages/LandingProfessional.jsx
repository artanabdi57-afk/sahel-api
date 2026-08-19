import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, BarChart3, Check, Download, Dumbbell,
  GraduationCap, Menu, Package, ReceiptText, Store, Users, WalletCards,
  X, ShieldCheck, Smartphone, MonitorDown, Zap, LayoutGrid, Sparkles, Globe,
} from "lucide-react";
import sahelLogo from "../assets/sahel_logo_english.svg";

/* ------------------------------------------------------------------ */
/*  i18n — English, Somali, Arabic (RTL)                              */
/* ------------------------------------------------------------------ */

const LANGS = [
  { code: "en", label: "EN", dir: "ltr" },
  { code: "so", label: "SO", dir: "ltr" },
  { code: "ar", label: "AR", dir: "rtl" },
];

const solutionMeta = [
  { key: "shops", icon: Store },
  { key: "schools", icon: GraduationCap },
  { key: "gyms", icon: Dumbbell },
];
const featureMeta = [
  { key: "sales", icon: ReceiptText },
  { key: "inventory", icon: Package },
  { key: "people", icon: Users },
  { key: "payments", icon: WalletCards },
  { key: "reports", icon: BarChart3 },
  { key: "secure", icon: ShieldCheck },
];
const stepMeta = ["create", "data", "live"];
const proofMeta = ["workspace", "verticals", "spreadsheets"];

const translations = {
  en: {
    nav: { home: "Home", solutions: "Solutions", features: "Features", about: "About", login: "Log in", signup: "Sign up" },
    badge: "Built for growing organizations",
    heroLines: ["Run your business", "the simple", "way."],
    subtitle: "Sales, people, inventory, payments and reports — all in one simple workspace for shops, schools and gyms.",
    ctaPrimary: "Get started free",
    ctaInstall: "Install app",
    ctaInstalled: "Sahel installed",
    trust: ["Free to start", "No credit card", "Mobile ready"],
    previewChip: { title: "Today's revenue", sub: "$18,392.07 · +18.2%" },
    solutionsSection: { eyebrow: "Solutions", title: "Built around your work.", subtitle: "Choose the workflow that fits your organization. Sahel adapts to how you work instead of forcing every team into the same system." },
    solutions: {
      shops: { name: "Shops", title: "Run your shop without spreadsheets.", text: "Sales, stock, receipts, customers and credit in one calm workspace.", eta: "Live in a day" },
      schools: { name: "Schools", title: "Keep your school organized.", text: "Students, teachers, classes, fees, exams and records in one place.", eta: "Live in a week" },
      gyms: { name: "Gyms", title: "Make membership simple.", text: "Members, payments, renewals and daily gym operations together.", eta: "Live in a day" },
    },
    featuresSection: { eyebrow: "Everything in one place", title: "Less busywork. More control." },
    features: {
      sales: { title: "Sales & receipts", text: "Create receipts and keep a clean history of daily transactions." },
      inventory: { title: "Inventory", text: "Know what you have, what is moving and what needs attention." },
      people: { title: "People & members", text: "Keep customers, students and members organized." },
      payments: { title: "Payments", text: "Track fees, balances, dues and payments without scattered records." },
      reports: { title: "Reports", text: "Turn daily activity into clear information you can act on." },
      secure: { title: "Secure workspace", text: "Keep important organizational records in one controlled place." },
    },
    stepsSection: { eyebrow: "Getting started", title: "Up and running in three steps." },
    steps: {
      create: { title: "Create your workspace", text: "Pick shop, school or gym — Sahel sets up the right workflow for you." },
      data: { title: "Bring in your data", text: "Add people, stock or members. Import a spreadsheet or start fresh." },
      live: { title: "Go live", text: "Install Sahel on your phone or computer and run your day from it." },
    },
    proof: {
      workspace: { n: "1", accent: "workspace", label: "for everything you run" },
      verticals: { n: "3", accent: "verticals", label: "shops, schools & gyms" },
      spreadsheets: { n: "0", accent: "spreadsheets", label: "once you switch to Sahel" },
    },
    about: {
      badges: ["Shops", "Schools"],
      quote: "\u201cWe switched three shops to Sahel in one afternoon — no more end-of-day spreadsheet chaos.\u201d",
      attribution: "— Early Sahel merchant",
      midText: "One workspace for shops, schools and gyms — built for growing organizations across the region.",
      midCta: "See solutions",
      installEyebrow: "Take it with you",
      installTitle: "Install Sahel.",
      installText: "Add Sahel to your phone or computer for a faster, focused experience — no browser tabs to hunt for.",
    },
    installHelp: {
      installedTitle: "Sahel is installed",
      installedText: "Open Sahel from your device's apps or desktop for the app experience.",
      availableTitle: "Sahel is ready to install",
      availableText: "Your browser supports direct installation. Tap an Install button to open the native install prompt.",
      fallbackTitle: "Install availability",
      computerTitle: "Computer",
      computerText: "In Chrome or Edge, open the browser menu and choose Install Sahel or Install this site as an app.",
      phoneTitle: "Phone",
      phoneText: "Android: use the browser menu and choose Install app. iPhone/iPad: tap Share → Add to Home Screen.",
    },
    footer: {
      title1: "Ready to run your day",
      title2: "from one workspace?",
      subtitle: "Create your free Sahel workspace in minutes — no credit card, no setup call required.",
      cta: "Get started free",
      login: "Log in",
      navSolutions: "Solutions",
      navFeatures: "Features",
      navInstall: "Install",
      copyright: "© 2026 Sahel. Built for growing organizations.",
    },
  },

  so: {
    nav: { home: "Bogga hore", solutions: "Xalalka", features: "Astaamaha", about: "Ku saabsan", login: "Gal", signup: "Isdiiwaangeli" },
    badge: "U dhisan ururo koraya",
    heroLines: ["Ganacsigaaga", "si fudud", "u maamul."],
    subtitle: "Iibka, macaamiisha, alaabta, lacag-bixinta iyo warbixinnada — dhammaantood hal goob shaqo oo fudud, oo u dhisan dukaanno, dugsiyo iyo jimicsiyo.",
    ctaPrimary: "Bilaw bilaash ah",
    ctaInstall: "Rakib app-ka",
    ctaInstalled: "Sahel waa la rakibay",
    trust: ["Bilaash ku bilow", "Kaarka lacagta lama baahna", "Diyaar u ah mobilka"],
    previewChip: { title: "Dakhliga maanta", sub: "$18,392.07 · +18.2%" },
    solutionsSection: { eyebrow: "Xalalka", title: "Loo dhisay shaqadaada.", subtitle: "Dooro habka shaqada ee ku habboon ururkaaga. Sahel wuxuu la qabsadaa siday kooxdaadu u shaqeyso, halkii uu wax walba ku qasbi lahaa hab keliya." },
    solutions: {
      shops: { name: "Dukaanno", title: "Maamul dukaankaaga adigoon isticmaalin xaashi.", text: "Iibka, alaabta, rasiidhada, macaamiisha iyo deynta — dhammaantood hal goob oo xasilloon.", eta: "Diyaar maalin gudaheed" },
      schools: { name: "Dugsiyo", title: "Nadaamiso dugsigaaga.", text: "Ardayda, macallimiinta, fasallada, lacagaha, imtixaanada iyo diiwaanada — dhammaantood hal meel.", eta: "Diyaar toddobaad gudihiis" },
      gyms: { name: "Jimicsiyo", title: "U fududee xubinnimada.", text: "Xubnaha, lacag-bixinta, cusboonaysiinta iyo hawlaha maalinlaha ah ee jimicsiga — dhammaantood si isku dhafan.", eta: "Diyaar maalin gudaheed" },
    },
    featuresSection: { eyebrow: "Wax walba hal meel", title: "Hawl yar. Xakameyn badan." },
    features: {
      sales: { title: "Iibka & rasiidhada", text: "Samee rasiidhado oo hay taariikh nadiif ah oo macaamil maalinle ah." },
      inventory: { title: "Alaabta", text: "Ogow waxa aad haysato, waxa socda iyo waxa u baahan feejignaan." },
      people: { title: "Dadka & xubnaha", text: "Nadaamiso macaamiishaada, ardaydaada iyo xubnaha." },
      payments: { title: "Lacag-bixinta", text: "La soco lacagaha, hadhaaga, deynaha iyo lacag-bixinta iyada oo aan diiwaano kala firdhisan la isticmaalin." },
      reports: { title: "Warbixinnada", text: "U beddel hawlaha maalinlaha ah macluumaad cad oo aad ku fali karto." },
      secure: { title: "Goob shaqo ammaan ah", text: "Diiwaanada muhiimka ah ee ururka hal meel oo xasilloon ku hay." },
    },
    stepsSection: { eyebrow: "Bilawga", title: "Saddex tallaabo oo isku diyaarsan." },
    steps: {
      create: { title: "Samayso goobtaada shaqo", text: "Dooro dukaan, dugsi ama jimicsi — Sahel ayaa kuu diyaarin doona habka ku habboon." },
      data: { title: "Ku soo dar xogtaada", text: "Ku dar dadka, alaabta ama xubnaha. Ka soo dejii xog-ururin ama ka bilow bilow cusub." },
      live: { title: "Bilow shaqada", text: "Rakib Sahel taleefankaaga ama kombiyuutarkaaga oo maalintaada ka maamul." },
    },
    proof: {
      workspace: { n: "1", accent: "goob shaqo", label: "wax kasta oo aad maamusho" },
      verticals: { n: "3", accent: "qaybood", label: "dukaanno, dugsiyo iyo jimicsiyo" },
      spreadsheets: { n: "0", accent: "xaashiyo", label: "marka aad u beddesho Sahel" },
    },
    about: {
      badges: ["Dukaanno", "Dugsiyo"],
      quote: "\u201cSaddex dukaan ayaan Sahel ku beddelnay hal galab — dib uma noqonayo qaska xaashida dhamaadka maalinta.\u201d",
      attribution: "— Ganacsade hore oo Sahel isticmaala",
      midText: "Hal goob shaqo oo loogu talagalay dukaanno, dugsiyo iyo jimicsiyo — loo dhisay ururo koraya oo gobolka ku sugan.",
      midCta: "Arag xalalka",
      installEyebrow: "La qaado meel kastoo aad tagto",
      installTitle: "Rakib Sahel.",
      installText: "Ku dar Sahel taleefankaaga ama kombiyuutarkaaga si aad u hesho waayo-aragnimo degdeg ah oo diirad saaran — adigoon u baahnayn inaad ka dhex raadiso tabab browser ah.",
    },
    installHelp: {
      installedTitle: "Sahel waa la rakibay",
      installedText: "Sahel ka fur aaladaha qalabkaaga ama desktop-ka si aad u hesho waayo-aragnimada app-ka.",
      availableTitle: "Sahel waa diyaar u ah in la rakibo",
      availableText: "Biraawsarkaagu wuxuu taageeraa rakibid toos ah. Riix batoonka Rakib si aad u furto talaabada rakibidda.",
      fallbackTitle: "Diyaarnimada rakibidda",
      computerTitle: "Kombiyuutar",
      computerText: "Chrome ama Edge, fur menu-ga biraawsarka oo dooro Rakib Sahel ama Rakib boggan sida app.",
      phoneTitle: "Taleefan",
      phoneText: "Android: isticmaal menu-ga biraawsarka oo dooro Rakib app. iPhone/iPad: taabo Wadaag → Ku dar Bogga Guriga.",
    },
    footer: {
      title1: "Diyaar ma u tahay inaad",
      title2: "hal goob ka maamusho maalintaada?",
      subtitle: "Samayso goobtaada bilaashka ah ee Sahel daqiiqado gudahood — kaarka lacagta looma baahna, wax lagu kalsoonaan karo lama baahna.",
      cta: "Bilaw bilaash ah",
      login: "Gal",
      navSolutions: "Xalalka",
      navFeatures: "Astaamaha",
      navInstall: "Rakibidda",
      copyright: "© 2026 Sahel. U dhisan ururo koraya.",
    },
  },

  ar: {
    nav: { home: "الرئيسية", solutions: "الحلول", features: "الميزات", about: "حول", login: "تسجيل الدخول", signup: "إنشاء حساب" },
    badge: "مصمم للمؤسسات النامية",
    heroLines: ["أدر عملك", "بطريقة", "بسيطة."],
    subtitle: "المبيعات والعملاء والمخزون والمدفوعات والتقارير — كلها في مساحة عمل واحدة بسيطة، مصممة للمتاجر والمدارس والنوادي الرياضية.",
    ctaPrimary: "ابدأ مجانًا",
    ctaInstall: "تثبيت التطبيق",
    ctaInstalled: "تم تثبيت سهل",
    trust: ["ابدأ مجانًا", "بدون بطاقة ائتمان", "جاهز على الجوال"],
    previewChip: { title: "إيرادات اليوم", sub: "$18,392.07 · +18.2%" },
    solutionsSection: { eyebrow: "الحلول", title: "مصمم حسب عملك.", subtitle: "اختر سير العمل المناسب لمؤسستك. يتكيّف سهل مع طريقة عملك بدلاً من إجبار كل فريق على استخدام نفس النظام." },
    solutions: {
      shops: { name: "متاجر", title: "أدر متجرك دون جداول بيانات.", text: "المبيعات والمخزون والإيصالات والعملاء والائتمان، كل ذلك في مساحة عمل هادئة واحدة.", eta: "جاهز خلال يوم" },
      schools: { name: "مدارس", title: "نظّم مدرستك.", text: "الطلاب والمعلمون والفصول والرسوم والامتحانات والسجلات، كل ذلك في مكان واحد.", eta: "جاهز خلال أسبوع" },
      gyms: { name: "نوادٍ رياضية", title: "اجعل العضوية بسيطة.", text: "الأعضاء والمدفوعات والتجديدات والعمليات اليومية للنادي معًا.", eta: "جاهز خلال يوم" },
    },
    featuresSection: { eyebrow: "كل شيء في مكان واحد", title: "عمل روتيني أقل. تحكم أكبر." },
    features: {
      sales: { title: "المبيعات والإيصالات", text: "أنشئ إيصالات واحتفظ بسجل واضح للمعاملات اليومية." },
      inventory: { title: "المخزون", text: "اعرف ما تملكه، وما يتحرك، وما يحتاج إلى انتباه." },
      people: { title: "الأشخاص والأعضاء", text: "حافظ على تنظيم عملائك وطلابك وأعضائك." },
      payments: { title: "المدفوعات", text: "تتبّع الرسوم والأرصدة والمستحقات والمدفوعات دون سجلات متفرقة." },
      reports: { title: "التقارير", text: "حوّل النشاط اليومي إلى معلومات واضحة يمكنك التصرف بناءً عليها." },
      secure: { title: "مساحة عمل آمنة", text: "احتفظ بسجلات مؤسستك المهمة في مكان واحد يمكن التحكم به." },
    },
    stepsSection: { eyebrow: "البدء", title: "جاهز للعمل خلال ثلاث خطوات." },
    steps: {
      create: { title: "أنشئ مساحة عملك", text: "اختر متجرًا أو مدرسة أو ناديًا رياضيًا — سيقوم سهل بإعداد سير العمل المناسب لك." },
      data: { title: "أدخل بياناتك", text: "أضف الأشخاص أو المخزون أو الأعضاء. استورد جدول بيانات أو ابدأ من جديد." },
      live: { title: "ابدأ الاستخدام", text: "ثبّت سهل على هاتفك أو حاسوبك وأدر يومك منه." },
    },
    proof: {
      workspace: { n: "1", accent: "مساحة عمل", label: "لكل ما تديره" },
      verticals: { n: "3", accent: "قطاعات", label: "متاجر، مدارس، ونوادٍ رياضية" },
      spreadsheets: { n: "0", accent: "جداول بيانات", label: "بعد انتقالك إلى سهل" },
    },
    about: {
      badges: ["متاجر", "مدارس"],
      quote: "\u201cحوّلنا ثلاثة متاجر إلى سهل في عصر واحد — لا مزيد من فوضى جداول البيانات في نهاية اليوم.\u201d",
      attribution: "— أحد تجار سهل الأوائل",
      midText: "مساحة عمل واحدة للمتاجر والمدارس والنوادي الرياضية — مصممة للمؤسسات النامية في المنطقة.",
      midCta: "عرض الحلول",
      installEyebrow: "خذه معك أينما ذهبت",
      installTitle: "ثبّت سهل.",
      installText: "أضف سهل إلى هاتفك أو حاسوبك للحصول على تجربة أسرع وأكثر تركيزًا — دون الحاجة للبحث بين علامات تبويب المتصفح.",
    },
    installHelp: {
      installedTitle: "تم تثبيت سهل",
      installedText: "افتح سهل من تطبيقات جهازك أو سطح المكتب للحصول على تجربة التطبيق.",
      availableTitle: "سهل جاهز للتثبيت",
      availableText: "متصفحك يدعم التثبيت المباشر. اضغط على زر التثبيت لفتح نافذة التثبيت الأصلية.",
      fallbackTitle: "توفر التثبيت",
      computerTitle: "الحاسوب",
      computerText: "في Chrome أو Edge، افتح قائمة المتصفح واختر تثبيت سهل أو تثبيت هذا الموقع كتطبيق.",
      phoneTitle: "الهاتف",
      phoneText: "أندرويد: استخدم قائمة المتصفح واختر تثبيت التطبيق. آيفون/آيباد: اضغط على مشاركة ثم إضافة إلى الشاشة الرئيسية.",
    },
    footer: {
      title1: "هل أنت جاهز لإدارة",
      title2: "يومك من مساحة عمل واحدة؟",
      subtitle: "أنشئ مساحة عمل سهل المجانية خلال دقائق — دون الحاجة لبطاقة ائتمان أو مكالمة إعداد.",
      cta: "ابدأ مجانًا",
      login: "تسجيل الدخول",
      navSolutions: "الحلول",
      navFeatures: "الميزات",
      navInstall: "التثبيت",
      copyright: "© 2026 سهل. مصمم للمؤسسات النامية.",
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Motion utilities                                                  */
/* ------------------------------------------------------------------ */

function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Headline whose per-character weight thickens near the cursor.
// Arabic script must NOT be split into individual characters — doing so
// breaks contextual letter joining, so it falls back to a plain, static span.
function WeightedHeading({ text, splitChars = true, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!splitChars) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
    const spans = Array.from(el.querySelectorAll("[data-wchar]"));
    let mx = -9999, my = -9999, raf;

    const move = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("pointermove", move, { passive: true });

    const tick = () => {
      for (const s of spans) {
        const r = s.getBoundingClientRect();
        if (r.bottom < -80 || r.top > window.innerHeight + 80) continue;
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        const w = d < 220 ? 700 + (1 - d / 220) * 300 : 700;
        s.style.fontVariationSettings = `'wght' ${Math.round(w)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, [text, splitChars]);

  if (!splitChars) {
    return <span style={{ fontVariationSettings: "'wght' 800" }} className={className}>{text}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {text.split("").map((ch, i) =>
        ch === " " ? " " : (
          <span key={i} data-wchar style={{ display: "inline-block", fontVariationSettings: "'wght' 700", willChange: "font-variation-settings" }}>
            {ch}
          </span>
        )
      )}
    </span>
  );
}

function DriftTile({ className = "", delay = 0, bg, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
    let t = delay / 300, raf;
    const loop = () => {
      t += 0.008;
      if (ref.current) ref.current.style.transform = `translateY(${Math.sin(t) * 6}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [delay]);
  return (
    <div ref={ref} className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_18px_35px_-14px_rgba(15,23,42,0.35)] ${className}`}>
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${bg}`}>{children}</span>
    </div>
  );
}

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
}

// Compact language switcher — three pill buttons, works in nav and mobile sheet
function LangSwitch({ lang, setLang, className = "" }) {
  return (
    <div className={`flex items-center gap-0.5 rounded-full border border-black/5 bg-black/5 p-0.5 ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-full px-2.5 py-1.5 text-xs font-bold transition ${lang === l.code ? "bg-white text-[#0f172a] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          aria-pressed={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingMotion() {
  const [menu, setMenu] = useState(false);
  const [navShadow, setNavShadow] = useState(false);
  const [installAvailable, setInstallAvailable] = useState(Boolean(window.__sahelInstallPrompt));
  const [installed, setInstalled] = useState(isStandalone());
  const [installOpen, setInstallOpen] = useState(false);
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("sahel-lang") || "en"; } catch { return "en"; }
  });
  const bloomRef = useRef(null);

  const langMeta = LANGS.find((l) => l.code === lang) || LANGS[0];
  const dir = langMeta.dir;
  const t = translations[lang];

  useEffect(() => {
    try { localStorage.setItem("sahel-lang", lang); } catch {}
  }, [lang]);

  useEffect(() => {
    const available = () => setInstallAvailable(Boolean(window.__sahelInstallPrompt));
    const done = () => { setInstallAvailable(false); setInstalled(true); setInstallOpen(false); };
    window.addEventListener("sahel-install-available", available);
    window.addEventListener("sahel-app-installed", done);
    return () => {
      window.removeEventListener("sahel-install-available", available);
      window.removeEventListener("sahel-app-installed", done);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setNavShadow(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
    const onMove = (e) => {
      if (!bloomRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 24;
      const y = (e.clientY / window.innerHeight - 0.5) * 24;
      bloomRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

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

  const fontFamily = lang === "ar" ? "'Segoe UI', Tahoma, Geneva, Arial, sans-serif" : "'Inter', sans-serif";
  const splitChars = lang !== "ar"; // never split Arabic into per-character spans

  return (
    <main dir={dir} lang={lang} className="min-h-screen bg-[#eef1f6] text-[#111116] antialiased" style={{ fontFamily }}>
      <div className="mx-auto max-w-[1440px] px-2 pt-2 sm:px-4 sm:pt-4">

        {/* ================= HERO SHELL ================= */}
        <section className="relative flex min-h-[100svh] flex-col overflow-hidden rounded-[28px] bg-[#f6f8fb] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_60px_-30px_rgba(15,23,42,0.25)] sm:rounded-[40px]">
          {/* Static gradient backdrop — replaces the old rotating 3D mesh, which
              covered the screen on small viewports. No motion, works at every size. */}
          <div className="pointer-events-none absolute inset-0 z-0" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.16) 0%, rgba(56,143,255,0.08) 35%, rgba(246,248,251,0) 65%)" }} />
          <div ref={bloomRef} className="pointer-events-none absolute -right-40 top-0 h-[820px] w-[820px] rounded-full opacity-80 blur-3xl transition-transform duration-700 ease-out rtl:-right-auto rtl:-left-40" style={{ background: "radial-gradient(circle at 55% 45%, rgba(37,99,235,0.5), rgba(56,143,255,0.26) 40%, rgba(246,248,251,0) 70%)" }} />
          <div className="pointer-events-none absolute -left-52 top-24 h-[640px] w-[640px] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle at 50% 50%, rgba(15,23,42,0.25), rgba(100,116,139,0.12) 45%, rgba(246,248,251,0) 72%)" }} />
          <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[420px] w-[560px] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.22), rgba(246,248,251,0) 70%)" }} />

          {/* floating nav */}
          <div className="sticky top-3 z-50 flex justify-center px-3 pt-4 sm:top-5 sm:pt-6">
            <nav className={`flex w-full max-w-[920px] items-center justify-between rounded-full border border-white/70 bg-white/80 py-2.5 pl-4 pr-2.5 backdrop-blur-xl transition-shadow duration-500 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_30px_-14px_rgba(15,23,42,0.25)] ${navShadow ? "shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_18px_44px_-14px_rgba(15,23,42,0.35)]" : ""}`}>
              <Link to="/welcome" className="flex shrink-0 items-center gap-2.5" aria-label="Sahel home">
                <img src={sahelLogo} alt="Sahel" className="h-9 w-auto sm:h-10" />
              </Link>
              <div className="hidden items-center gap-1 text-sm font-semibold text-slate-500 md:flex">
                <a href="#home" className="rounded-full px-3.5 py-2 transition hover:bg-black/5 hover:text-slate-950">{t.nav.home}</a>
                <a href="#solutions" className="rounded-full px-3.5 py-2 transition hover:bg-black/5 hover:text-slate-950">{t.nav.solutions}</a>
                <a href="#features" className="rounded-full px-3.5 py-2 transition hover:bg-black/5 hover:text-slate-950">{t.nav.features}</a>
                <a href="#about" className="rounded-full px-3.5 py-2 transition hover:bg-black/5 hover:text-slate-950">{t.nav.about}</a>
              </div>
              <div className="flex items-center gap-2">
                <LangSwitch lang={lang} setLang={setLang} className="hidden sm:flex" />
                <Link to="/login" className="hidden px-3 py-2 text-sm font-bold text-slate-600 hover:text-slate-950 sm:inline-block">{t.nav.login}</Link>
                <Link to="/signup" className="group hidden items-center gap-1.5 rounded-full bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 sm:inline-flex shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_10px_22px_-10px_rgba(15,23,42,0.7)] hover:shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_16px_28px_-10px_rgba(15,23,42,0.8)]">
                  {t.nav.signup}
                  <ArrowRight className="-ml-4 h-4 w-4 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100 rtl:rotate-180" strokeWidth={1.75} />
                </Link>
                <button onClick={() => setMenu(!menu)} className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm md:hidden" aria-label="Open menu">
                  {menu ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
                </button>
              </div>
            </nav>
          </div>

          {menu && (
            <div className="relative z-40 mx-4 mt-3 rounded-3xl border border-white/70 bg-white/95 p-4 backdrop-blur-xl shadow-lg md:hidden">
              <div className="flex flex-col text-base font-semibold">
                <a href="#home" onClick={() => setMenu(false)} className="rounded-xl px-4 py-3 hover:bg-black/5">{t.nav.home}</a>
                <a href="#solutions" onClick={() => setMenu(false)} className="rounded-xl px-4 py-3 hover:bg-black/5">{t.nav.solutions}</a>
                <a href="#features" onClick={() => setMenu(false)} className="rounded-xl px-4 py-3 hover:bg-black/5">{t.nav.features}</a>
                <a href="#about" onClick={() => setMenu(false)} className="rounded-xl px-4 py-3 hover:bg-black/5">{t.nav.about}</a>
                <LangSwitch lang={lang} setLang={setLang} className="mt-2 self-start" />
                <button onClick={() => { install(); setMenu(false); }} className="mt-2 rounded-xl bg-blue-50 px-4 py-3 text-left text-blue-700">{t.ctaInstall}</button>
                <Link to="/login" onClick={() => setMenu(false)} className="rounded-xl px-4 py-3 hover:bg-black/5">{t.nav.login}</Link>
                <Link to="/signup" onClick={() => setMenu(false)} className="mt-2 rounded-full bg-[#0f172a] px-5 py-3 text-center text-white shadow-lg">{t.nav.signup}</Link>
              </div>
            </div>
          )}

          {/* hero content */}
          <div id="home" className="relative z-10 mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-24 pt-10 text-center sm:pt-16 lg:pb-32">
            <Reveal className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/90 px-4 py-2 text-sm font-bold text-blue-700 backdrop-blur shadow-[0_6px_16px_-8px_rgba(15,23,42,0.2)]">
              <Zap className="h-4 w-4" strokeWidth={1.75} />
              {t.badge}
            </Reveal>

            <div className="relative mt-7">
              <h1 className="text-5xl font-black leading-[1.05] tracking-[-.03em] text-[#0f172a] sm:text-7xl lg:text-8xl">
                <Reveal as="span" delay={120} className="block">
                  <WeightedHeading text={t.heroLines[0]} splitChars={splitChars} />
                </Reveal>
                <Reveal as="span" delay={220} className="block text-blue-600">
                  <WeightedHeading text={t.heroLines[1]} splitChars={splitChars} />
                </Reveal>
                <Reveal as="span" delay={320} className="block">
                  <WeightedHeading text={t.heroLines[2]} splitChars={splitChars} />
                </Reveal>
              </h1>

              <DriftTile className="absolute -right-6 -top-8 hidden rotate-6 md:flex rtl:right-auto rtl:-left-6 rtl:-rotate-6" bg="bg-blue-600" delay={0}>
                <Store className="h-5 w-5" strokeWidth={1.75} />
              </DriftTile>
              <DriftTile className="absolute -right-24 top-16 hidden -rotate-6 lg:flex rtl:right-auto rtl:-left-24 rtl:rotate-6" bg="bg-emerald-500" delay={220}>
                <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
              </DriftTile>
            </div>

            <Reveal delay={400} className="mt-9 max-w-xl text-lg leading-relaxed text-slate-500">
              {t.subtitle}
            </Reveal>

            <Reveal delay={520} className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link to="/signup" className="group inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-7 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_14px_28px_-12px_rgba(15,23,42,0.75)] hover:shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_20px_34px_-12px_rgba(15,23,42,0.85)]">
                {t.ctaPrimary}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" strokeWidth={1.75} />
              </Link>
              <button onClick={install} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-7 py-3.5 text-base font-semibold text-[#0f172a] transition-all duration-300 hover:-translate-y-0.5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_22px_-12px_rgba(15,23,42,0.3)] hover:shadow-[0_16px_30px_-12px_rgba(15,23,42,0.35)]">
                <Download className="h-4 w-4" strokeWidth={1.75} />
                {installed ? t.ctaInstalled : t.ctaInstall}
              </button>
            </Reveal>

            <Reveal delay={640} className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-slate-400">
              {t.trust.map((item) => (
                <span key={item} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> {item}</span>
              ))}
            </Reveal>

            <Reveal delay={720} className="mt-6 sm:hidden">
              <LangSwitch lang={lang} setLang={setLang} />
            </Reveal>
          </div>

          <Reveal delay={700} className="absolute bottom-6 right-6 z-20 hidden items-center gap-3 rounded-2xl border border-white/70 bg-white/90 p-2.5 pr-4 backdrop-blur lg:flex shadow-[0_14px_30px_-14px_rgba(15,23,42,0.35)] rtl:right-auto rtl:left-6 rtl:pl-4 rtl:pr-2.5">
            <span className="flex h-10 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f172a] to-[#334155]">
              <LayoutGrid className="h-4 w-4 text-white/80" strokeWidth={1.75} />
            </span>
            <div className="text-left rtl:text-right">
              <p className="text-sm font-bold leading-tight">{t.previewChip.title}</p>
              <p className="text-xs text-slate-400">{t.previewChip.sub}</p>
            </div>
          </Reveal>
        </section>

        {/* ================= SOLUTIONS ================= */}
        <section id="solutions" className="px-4 py-16 sm:px-10 lg:px-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">{t.solutionsSection.eyebrow}</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#0f172a] sm:text-5xl">{t.solutionsSection.title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-500">{t.solutionsSection.subtitle}</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solutionMeta.map(({ key, icon: Icon }, i) => {
              const s = t.solutions[key];
              return (
                <Reveal key={key} delay={i * 120} className="group rounded-3xl border border-black/5 bg-white p-6 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_30px_-18px_rgba(15,23,42,0.25)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_44px_-18px_rgba(15,23,42,0.3)]">
                  <div className="flex items-center gap-3 rtl:flex-row-reverse rtl:justify-end">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/5 bg-[#eef1f6] text-blue-600">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <p className="text-xs font-black uppercase tracking-wider text-blue-600">{s.name}</p>
                  </div>
                  <h3 className="mt-4 text-lg font-black">{s.title}</h3>
                  <p className="mt-1.5 text-base leading-relaxed text-slate-500">{s.text}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#eef1f6] px-3 py-1.5 text-xs font-bold text-slate-500">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {s.eta}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ================= PROOF STRIP ================= */}
        <section className="px-4 pb-16 sm:px-10 lg:px-16 lg:pb-20">
          <div className="grid gap-px overflow-hidden rounded-[24px] border border-black/5 bg-black/5 sm:grid-cols-3">
            {proofMeta.map((key, i) => {
              const p = t.proof[key];
              return (
                <Reveal key={key} delay={i * 120} className="bg-white px-6 py-6">
                  <p className="text-3xl font-black text-[#0f172a] sm:text-4xl">
                    {p.n} <span className="text-blue-600">{p.accent}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{p.label}</p>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ================= FEATURES (dark bento) ================= */}
        <section id="features" className="px-4 pb-16 sm:px-10 lg:px-16 lg:pb-20">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">{t.featuresSection.eyebrow}</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#0f172a] sm:text-5xl">{t.featuresSection.title}</h2>
          </div>
          <div className="mt-10 rounded-[28px] bg-[#0f172a] p-3 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_30px_60px_-30px_rgba(15,23,42,0.8)] sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featureMeta.map(({ key, icon: Icon }, i) => {
                const f = t.features[key];
                return (
                  <Reveal key={key} delay={i * 90} className="flex items-start gap-4 rounded-[20px] border border-white/5 bg-[#161f33] p-5 rtl:flex-row-reverse rtl:text-right">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-400">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="font-black text-white">{f.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/50">{f.text}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= STEPS ================= */}
        <section className="px-4 pb-16 sm:px-10 lg:px-16 lg:pb-20">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">{t.stepsSection.eyebrow}</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#0f172a] sm:text-5xl">{t.stepsSection.title}</h2>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {stepMeta.map((key, i) => {
              const s = t.steps[key];
              return (
                <Reveal key={key} delay={i * 130} className="relative rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_16px_36px_-20px_rgba(15,23,42,0.25)]">
                  <span className="text-sm font-black text-blue-200">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 text-xl font-black text-[#0f172a]">{s.title}</h3>
                  <p className="mt-1.5 text-base leading-relaxed text-slate-500">{s.text}</p>
                  {i < stepMeta.length - 1 && (
                    <ArrowRight className="absolute -right-3.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 text-blue-200 lg:block rtl:right-auto rtl:left-3.5 rtl:rotate-180" strokeWidth={1.75} />
                  )}
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ================= ABOUT / INSTALL ================= */}
        <section id="about" className="px-4 pb-16 sm:px-10 lg:px-16 lg:pb-20">
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            <Reveal className="rounded-[22px] bg-[#0f172a] p-6 shadow-[0_20px_44px_-24px_rgba(15,23,42,0.5)]">
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div className="flex gap-2">
                  {t.about.badges.map((b) => (
                    <span key={b} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">{b}</span>
                  ))}
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/60 rtl:-scale-x-100" strokeWidth={1.75} />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-white/90">{t.about.quote}</p>
              <p className="mt-3 text-xs text-white/50">{t.about.attribution}</p>
            </Reveal>

            <Reveal delay={150} className="flex flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-white p-6 text-center shadow-[0_20px_44px_-24px_rgba(15,23,42,0.2)]">
              <img src={sahelLogo} alt="Sahel" className="h-8 w-auto" />
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{t.about.midText}</p>
              <a href="#solutions" className="mt-4 rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50">{t.about.midCta}</a>
            </Reveal>

            <Reveal delay={300} className="rounded-[22px] bg-[#0f172a] p-6 shadow-[0_20px_44px_-24px_rgba(15,23,42,0.5)]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">{t.about.installEyebrow}</p>
              <h3 className="mt-2 text-2xl font-black text-white">{t.about.installTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{t.about.installText}</p>
              <button onClick={install} className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0f172a] transition hover:-translate-y-0.5">
                <Download className="h-4 w-4" strokeWidth={1.75} />
                {installed ? t.ctaInstalled : t.ctaInstall}
              </button>
            </Reveal>
          </div>

          <div id="install-help" className={`mx-auto mt-4 max-w-5xl rounded-3xl border p-6 text-left rtl:text-right transition ${installOpen ? "border-blue-200 bg-blue-50/60 shadow-lg" : "border-slate-100 bg-slate-50"}`}>
            <div className="flex items-start gap-4 rtl:flex-row-reverse">
              <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm shrink-0"><Download className="h-5 w-5" strokeWidth={1.75} /></div>
              <div className="flex-1">
                <p className="font-black">{installed ? t.installHelp.installedTitle : installAvailable ? t.installHelp.availableTitle : t.installHelp.fallbackTitle}</p>
                {installed ? (
                  <p className="mt-1 text-sm text-slate-500">{t.installHelp.installedText}</p>
                ) : installAvailable ? (
                  <p className="mt-1 text-sm text-slate-500">{t.installHelp.availableText}</p>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4">
                      <div className="flex items-center gap-2 font-bold rtl:flex-row-reverse"><MonitorDown className="h-4 w-4 text-blue-600" strokeWidth={1.75} /> {t.installHelp.computerTitle}</div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{t.installHelp.computerText}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <div className="flex items-center gap-2 font-bold rtl:flex-row-reverse"><Smartphone className="h-4 w-4 text-blue-600" strokeWidth={1.75} /> {t.installHelp.phoneTitle}</div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{t.installHelp.phoneText}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= FOOTER CTA ================= */}
        <footer className="px-2 pb-2 sm:px-0 sm:pb-4">
          <div className="relative overflow-hidden rounded-[28px] bg-[#f6f8fb] px-6 py-14 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_60px_-30px_rgba(15,23,42,0.25)] sm:rounded-[40px] sm:px-12 lg:py-20">
            <div className="pointer-events-none absolute -left-40 bottom-0 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.3), transparent 70%)" }} />
            <div className="pointer-events-none absolute -right-40 -top-20 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle, rgba(15,23,42,0.25), transparent 70%)" }} />

            <div className="relative mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-black leading-tight text-[#0f172a] sm:text-6xl">
                {t.footer.title1}
                <br className="hidden sm:block" />
                {t.footer.title2}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-500">{t.footer.subtitle}</p>
              <div className="mx-auto mt-10 flex max-w-lg flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/signup" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#0f172a] px-7 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_14px_28px_-12px_rgba(15,23,42,0.75)]">
                  {t.footer.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" strokeWidth={1.75} />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-base font-semibold text-[#0f172a] transition-all duration-300 hover:-translate-y-0.5">
                  {t.footer.login}
                </Link>
              </div>
            </div>

            <div className="relative mx-auto mt-10 flex max-w-5xl flex-col items-center justify-between gap-6 border-t border-black/5 pt-8 text-center sm:flex-row sm:text-left rtl:sm:text-right">
              <img src={sahelLogo} alt="Sahel" className="h-8 w-auto" />
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-500">
                <a href="#solutions" className="hover:text-[#0f172a]">{t.footer.navSolutions}</a>
                <a href="#features" className="hover:text-[#0f172a]">{t.footer.navFeatures}</a>
                <a href="#about" className="hover:text-[#0f172a]">{t.footer.navInstall}</a>
              </div>
              <p className="text-xs text-slate-400">{t.footer.copyright}</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
