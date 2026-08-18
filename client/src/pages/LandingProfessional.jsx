import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, BarChart3, Check, Download, Dumbbell,
  GraduationCap, Menu, Package, ReceiptText, Store, Users, WalletCards,
  X, ShieldCheck, Smartphone, MonitorDown, Zap, LayoutGrid, Sparkles,
} from "lucide-react";
import sahelLogo from "../assets/sahel_logo_english.svg";

/* ------------------------------------------------------------------ */
/*  Content — swap freely, nothing below this block cares what's here */
/* ------------------------------------------------------------------ */

const solutions = [
  { icon: Store, name: "Shops", title: "Run your shop without spreadsheets.", text: "Sales, stock, receipts, customers and credit in one calm workspace.", eta: "Live in a day" },
  { icon: GraduationCap, name: "Schools", title: "Keep your school organized.", text: "Students, teachers, classes, fees, exams and records in one place.", eta: "Live in a week" },
  { icon: Dumbbell, name: "Gyms", title: "Make membership simple.", text: "Members, payments, renewals and daily gym operations together.", eta: "Live in a day" },
];

const features = [
  [ReceiptText, "Sales & receipts", "Create receipts and keep a clean history of daily transactions."],
  [Package, "Inventory", "Know what you have, what is moving and what needs attention."],
  [Users, "People & members", "Keep customers, students and members organized."],
  [WalletCards, "Payments", "Track fees, balances, dues and payments without scattered records."],
  [BarChart3, "Reports", "Turn daily activity into clear information you can act on."],
  [ShieldCheck, "Secure workspace", "Keep important organizational records in one controlled place."],
];

const steps = [
  { n: "01", title: "Create your workspace", text: "Pick shop, school or gym — Sahel sets up the right workflow for you." },
  { n: "02", title: "Bring in your data", text: "Add people, stock or members. Import a spreadsheet or start fresh." },
  { n: "03", title: "Go live", text: "Install Sahel on your phone or computer and run your day from it." },
];

const proof = [
  { n: "1", accent: "workspace", label: "for everything you run" },
  { n: "3", accent: "verticals", label: "shops, schools & gyms" },
  { n: "0", accent: "spreadsheets", label: "once you switch to Sahel" },
];

const chart = [38, 50, 44, 61, 53, 69, 62, 80, 72, 91, 84, 98];

/* ------------------------------------------------------------------ */
/*  Small motion utilities                                            */
/* ------------------------------------------------------------------ */

// Reveal-on-scroll wrapper, mirrors the [data-reveal] pattern
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

// Headline whose per-character weight thickens near the cursor
function WeightedHeading({ text, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
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
  }, [text]);

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

// Gently drifting icon tile
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

// Loads three.js from CDN once (no npm dependency needed) and resolves with window.THREE
let threePromise = null;
function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (threePromise) return threePromise;
  threePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-sahel-three]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.THREE));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true;
    script.dataset.sahelThree = "1";
    script.onload = () => resolve(window.THREE);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return threePromise;
}

// The rotating faceted hero mesh — the "significant" moving detail
function HeroMesh() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
    let renderer, raf, mesh, resizeHandler, cancelled = false;

    loadThree().then((THREE) => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.z = 15;

      const geometry = new THREE.IcosahedronGeometry(3, 0);
      const material = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        emissive: 0x0b1a3d,
        roughness: 0.3,
        metalness: 0.6,
        flatShading: true,
      });
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
      mainLight.position.set(10, 10, 10);
      scene.add(mainLight);
      const fillLight = new THREE.DirectionalLight(0x3b82f6, 0.7);
      fillLight.position.set(-10, -5, 5);
      scene.add(fillLight);

      resizeHandler = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        mesh.position.x = w < 1024 ? 0 : 4.5;
      };
      window.addEventListener("resize", resizeHandler);
      resizeHandler();

      let t = 0;
      const frame = () => {
        t += 0.01;
        mesh.rotation.x = t * 0.2;
        mesh.rotation.y = t * 0.3;
        mesh.position.y = 0.4 + Math.sin(t * 1.2) * 0.3;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };
      frame();
    });

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (renderer) renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-80" />;
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
  const bloomRef = useRef(null);

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

  return (
    <main className="min-h-screen bg-[#eef1f6] font-sans text-[#111116] antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mx-auto max-w-[1440px] px-2 pt-2 sm:px-4 sm:pt-4">

        {/* ================= HERO SHELL ================= */}
        <section className="relative flex min-h-[100svh] flex-col overflow-hidden rounded-[28px] bg-[#f6f8fb] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_60px_-30px_rgba(15,23,42,0.25)] sm:rounded-[40px]">
          {/* rotating faceted mesh */}
          <HeroMesh />
          {/* atmosphere */}
          <div ref={bloomRef} className="pointer-events-none absolute -right-40 top-0 h-[720px] w-[720px] rounded-full opacity-70 blur-3xl transition-transform duration-700 ease-out" style={{ background: "radial-gradient(circle at 55% 45%, rgba(37,99,235,0.45), rgba(56,143,255,0.22) 40%, rgba(246,248,251,0) 70%)" }} />
          <div className="pointer-events-none absolute -left-52 top-24 h-[640px] w-[640px] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle at 50% 50%, rgba(15,23,42,0.25), rgba(100,116,139,0.12) 45%, rgba(246,248,251,0) 72%)" }} />
          <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[420px] w-[560px] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.22), rgba(246,248,251,0) 70%)" }} />

          {/* floating nav */}
          <div className="sticky top-3 z-50 flex justify-center px-3 pt-4 sm:top-5 sm:pt-6">
            <nav className={`flex w-full max-w-[880px] items-center justify-between rounded-full border border-white/70 bg-white/80 py-2.5 pl-4 pr-2.5 backdrop-blur-xl transition-shadow duration-500 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_30px_-14px_rgba(15,23,42,0.25)] ${navShadow ? "shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_18px_44px_-14px_rgba(15,23,42,0.35)]" : ""}`}>
              <Link to="/welcome" className="flex shrink-0 items-center gap-2.5" aria-label="Sahel home">
                <img src={sahelLogo} alt="Sahel" className="h-7 w-auto" />
              </Link>
              <div className="hidden items-center gap-1 text-sm font-semibold text-slate-500 md:flex">
                <a href="#home" className="rounded-full px-3.5 py-2 transition hover:bg-black/5 hover:text-slate-950">Home</a>
                <a href="#solutions" className="rounded-full px-3.5 py-2 transition hover:bg-black/5 hover:text-slate-950">Solutions</a>
                <a href="#features" className="rounded-full px-3.5 py-2 transition hover:bg-black/5 hover:text-slate-950">Features</a>
                <a href="#about" className="rounded-full px-3.5 py-2 transition hover:bg-black/5 hover:text-slate-950">About</a>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden px-3 py-2 text-sm font-bold text-slate-600 hover:text-slate-950 sm:inline-block">Log in</Link>
                <Link to="/signup" className="group hidden items-center gap-1.5 rounded-full bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 sm:inline-flex shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_10px_22px_-10px_rgba(15,23,42,0.7)] hover:shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_16px_28px_-10px_rgba(15,23,42,0.8)]">
                  Sign up
                  <ArrowRight className="-ml-4 h-4 w-4 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100" strokeWidth={1.75} />
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
                <a href="#home" onClick={() => setMenu(false)} className="rounded-xl px-4 py-3 hover:bg-black/5">Home</a>
                <a href="#solutions" onClick={() => setMenu(false)} className="rounded-xl px-4 py-3 hover:bg-black/5">Solutions</a>
                <a href="#features" onClick={() => setMenu(false)} className="rounded-xl px-4 py-3 hover:bg-black/5">Features</a>
                <a href="#about" onClick={() => setMenu(false)} className="rounded-xl px-4 py-3 hover:bg-black/5">About</a>
                <button onClick={() => { install(); setMenu(false); }} className="mt-1 rounded-xl bg-blue-50 px-4 py-3 text-left text-blue-700">Install Sahel</button>
                <Link to="/login" onClick={() => setMenu(false)} className="rounded-xl px-4 py-3 hover:bg-black/5">Log in</Link>
                <Link to="/signup" onClick={() => setMenu(false)} className="mt-2 rounded-full bg-[#0f172a] px-5 py-3 text-center text-white shadow-lg">Sign up</Link>
              </div>
            </div>
          )}

          {/* hero content */}
          <div id="home" className="relative z-10 mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-24 pt-10 text-center sm:pt-16 lg:pb-32">
            <Reveal className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/90 px-4 py-2 text-sm font-bold text-blue-700 backdrop-blur shadow-[0_6px_16px_-8px_rgba(15,23,42,0.2)]">
              <Zap className="h-4 w-4" strokeWidth={1.75} />
              Built for growing organizations
            </Reveal>

            <div className="relative mt-7">
              <h1 className="text-5xl font-black leading-[1.02] tracking-[-.045em] text-[#0f172a] sm:text-7xl lg:text-8xl">
                <Reveal as="span" delay={120} className="block">
                  <WeightedHeading text="Your business" />
                </Reveal>
                <Reveal as="span" delay={220} className="block text-blue-600">
                  <WeightedHeading text="workspace," />
                </Reveal>
                <Reveal as="span" delay={320} className="block">
                  <WeightedHeading text="simplified." />
                </Reveal>
              </h1>

              <DriftTile className="absolute -right-6 -top-8 hidden rotate-6 md:flex" bg="bg-blue-600" delay={0}>
                <Store className="h-5 w-5" strokeWidth={1.75} />
              </DriftTile>
              <DriftTile className="absolute -right-24 top-16 hidden -rotate-6 lg:flex" bg="bg-emerald-500" delay={220}>
                <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
              </DriftTile>
              <DriftTile className="absolute -bottom-12 right-4 hidden rotate-3 md:flex" bg="bg-slate-900" delay={440}>
                <Dumbbell className="h-5 w-5" strokeWidth={1.75} />
              </DriftTile>
            </div>

            <Reveal delay={400} className="mt-9 max-w-xl text-lg leading-relaxed text-slate-500">
              Boost productivity by keeping sales, people, inventory, payments and reports together in one simple Sahel workspace.
            </Reveal>

            <Reveal delay={520} className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link to="/signup" className="group inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-7 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_14px_28px_-12px_rgba(15,23,42,0.75)] hover:shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_20px_34px_-12px_rgba(15,23,42,0.85)]">
                Get started free
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.75} />
              </Link>
              <button onClick={install} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-7 py-3.5 text-base font-semibold text-[#0f172a] transition-all duration-300 hover:-translate-y-0.5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_22px_-12px_rgba(15,23,42,0.3)] hover:shadow-[0_16px_30px_-12px_rgba(15,23,42,0.35)]">
                <Download className="h-4 w-4" strokeWidth={1.75} />
                {installed ? "Sahel installed" : "Install app"}
              </button>
            </Reveal>

            <Reveal delay={640} className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Free to start</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Mobile ready</span>
            </Reveal>
          </div>

          {/* preview chip */}
          <Reveal delay={700} className="absolute bottom-6 right-6 z-20 hidden items-center gap-3 rounded-2xl border border-white/70 bg-white/90 p-2.5 pr-4 backdrop-blur lg:flex shadow-[0_14px_30px_-14px_rgba(15,23,42,0.35)]">
            <span className="flex h-10 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f172a] to-[#334155]">
              <LayoutGrid className="h-4 w-4 text-white/80" strokeWidth={1.75} />
            </span>
            <div className="text-left">
              <p className="text-sm font-bold leading-tight">Today's revenue</p>
              <p className="text-xs text-slate-400">$18,392.07 · +18.2%</p>
            </div>
          </Reveal>
        </section>

        {/* ================= SOLUTIONS ================= */}
        <section id="solutions" className="px-4 py-16 sm:px-10 lg:px-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">Solutions</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#0f172a] sm:text-5xl">
              Built around your work.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-500">
              Choose the workflow that fits your organization. Sahel adapts to
              how you work instead of forcing every team into the same system.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map(({ icon: Icon, name, title, text, eta }, i) => (
              <Reveal key={name} delay={i * 120} className="group rounded-3xl border border-black/5 bg-white p-6 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_30px_-18px_rgba(15,23,42,0.25)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_44px_-18px_rgba(15,23,42,0.3)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/5 bg-[#eef1f6] text-blue-600">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <p className="text-xs font-black uppercase tracking-wider text-blue-600">{name}</p>
                </div>
                <h3 className="mt-4 text-lg font-black">{title}</h3>
                <p className="mt-1.5 text-base leading-relaxed text-slate-500">{text}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#eef1f6] px-3 py-1.5 text-xs font-bold text-slate-500">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {eta}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ================= PROOF STRIP ================= */}
        <section className="px-4 pb-16 sm:px-10 lg:px-16 lg:pb-20">
          <div className="grid gap-px overflow-hidden rounded-[24px] border border-black/5 bg-black/5 sm:grid-cols-3">
            {proof.map((p, i) => (
              <Reveal key={p.accent} delay={i * 120} className="bg-white px-6 py-6">
                <p className="text-3xl font-black text-[#0f172a] sm:text-4xl">
                  {p.n} <span className="text-blue-600">{p.accent}</span>
                </p>
                <p className="mt-1 text-sm text-slate-500">{p.label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ================= FEATURES (dark bento) ================= */}
        <section id="features" className="px-4 pb-16 sm:px-10 lg:px-16 lg:pb-20">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">Everything in one place</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#0f172a] sm:text-5xl">
              Less busywork. More control.
            </h2>
          </div>
          <div className="mt-10 rounded-[28px] bg-[#0f172a] p-3 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_30px_60px_-30px_rgba(15,23,42,0.8)] sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(([Icon, title, text], i) => (
                <Reveal key={title} delay={i * 90} className="flex items-start gap-4 rounded-[20px] border border-white/5 bg-[#161f33] p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-400">
                    <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-black text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/50">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================= STEPS ================= */}
        <section className="px-4 pb-16 sm:px-10 lg:px-16 lg:pb-20">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">Getting started</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#0f172a] sm:text-5xl">
              Up and running in three steps.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 130} className="relative rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_16px_36px_-20px_rgba(15,23,42,0.25)]">
                <span className="text-sm font-black text-blue-200">{s.n}</span>
                <h3 className="mt-2 text-xl font-black text-[#0f172a]">{s.title}</h3>
                <p className="mt-1.5 text-base leading-relaxed text-slate-500">{s.text}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 text-blue-200 lg:block" strokeWidth={1.75} />
                )}
              </Reveal>
            ))}
          </div>
        </section>

        {/* ================= ABOUT / INSTALL ================= */}
        <section id="about" className="px-4 pb-16 sm:px-10 lg:px-16 lg:pb-20">
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            <Reveal className="rounded-[22px] bg-[#0f172a] p-6 shadow-[0_20px_44px_-24px_rgba(15,23,42,0.5)]">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Shops</span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Schools</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/60" strokeWidth={1.75} />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-white/90">
                "We switched three shops to Sahel in one afternoon — no more
                end-of-day spreadsheet chaos."
              </p>
              <p className="mt-3 text-xs text-white/50">— Early Sahel merchant</p>
            </Reveal>

            <Reveal delay={150} className="flex flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-white p-6 text-center shadow-[0_20px_44px_-24px_rgba(15,23,42,0.2)]">
              <img src={sahelLogo} alt="Sahel" className="h-8 w-auto" />
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                One workspace for shops, schools and gyms — built for growing
                organizations across the region.
              </p>
              <a href="#solutions" className="mt-4 rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                See solutions
              </a>
            </Reveal>

            <Reveal delay={300} className="rounded-[22px] bg-[#0f172a] p-6 shadow-[0_20px_44px_-24px_rgba(15,23,42,0.5)]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Take it with you</p>
              <h3 className="mt-2 text-2xl font-black text-white">Install Sahel.</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Add Sahel to your phone or computer for a faster, focused
                experience — no browser tabs to hunt for.
              </p>
              <button onClick={install} className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0f172a] transition hover:-translate-y-0.5">
                <Download className="h-4 w-4" strokeWidth={1.75} />
                {installed ? "Installed" : "Install app"}
              </button>
            </Reveal>
          </div>

          <div id="install-help" className={`mx-auto mt-4 max-w-5xl rounded-3xl border p-6 text-left transition ${installOpen ? "border-blue-200 bg-blue-50/60 shadow-lg" : "border-slate-100 bg-slate-50"}`}>
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm"><Download className="h-5 w-5" strokeWidth={1.75} /></div>
              <div className="flex-1">
                <p className="font-black">{installed ? "Sahel is installed" : installAvailable ? "Sahel is ready to install" : "Install availability"}</p>
                {installed ? (
                  <p className="mt-1 text-sm text-slate-500">Open Sahel from your device's apps or desktop for the app experience.</p>
                ) : installAvailable ? (
                  <p className="mt-1 text-sm text-slate-500">Your browser supports direct installation. Tap an Install button to open the native install prompt.</p>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4">
                      <div className="flex items-center gap-2 font-bold"><MonitorDown className="h-4 w-4 text-blue-600" strokeWidth={1.75} /> Computer</div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">In Chrome or Edge, open the browser menu and choose <strong>Install Sahel</strong> or <strong>Install this site as an app</strong>.</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <div className="flex items-center gap-2 font-bold"><Smartphone className="h-4 w-4 text-blue-600" strokeWidth={1.75} /> Phone</div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">Android: use the browser menu and choose <strong>Install app</strong>. iPhone/iPad: tap <strong>Share → Add to Home Screen</strong>.</p>
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
                Ready to run your day
                <br className="hidden sm:block" />
                from one workspace?
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-500">
                Create your free Sahel workspace in minutes — no credit card,
                no setup call required.
              </p>
              <div className="mx-auto mt-10 flex max-w-lg flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/signup" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#0f172a] px-7 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_14px_28px_-12px_rgba(15,23,42,0.75)]">
                  Get started free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-base font-semibold text-[#0f172a] transition-all duration-300 hover:-translate-y-0.5">
                  Log in
                </Link>
              </div>
            </div>

            <div className="relative mx-auto mt-10 flex max-w-5xl flex-col items-center justify-between gap-6 border-t border-black/5 pt-8 text-center sm:flex-row sm:text-left">
              <img src={sahelLogo} alt="Sahel" className="h-8 w-auto" />
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-500">
                <a href="#solutions" className="hover:text-[#0f172a]">Solutions</a>
                <a href="#features" className="hover:text-[#0f172a]">Features</a>
                <a href="#about" className="hover:text-[#0f172a]">Install</a>
              </div>
              <p className="text-xs text-slate-400">© 2026 Sahel. Built for growing organizations.</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
