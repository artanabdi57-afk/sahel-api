import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BarChart3, Check, Download, Dumbbell, GraduationCap,
  Menu, Package, ReceiptText, Store, Users, WalletCards, X, ShieldCheck,
  Smartphone, MonitorDown, Zap, Clock, Rocket
} from "lucide-react";
import sahelLogo from "../assets/sahel_logo_english.svg";

const solutions = [
  { id: "shops", icon: Store, name: "Shops", title: "Run your shop without spreadsheets.", text: "Sales, stock, receipts, and credit in one workspace.", time: "Set up in 5m" },
  { id: "schools", icon: GraduationCap, name: "Schools", title: "Keep your school organized.", text: "Students, teachers, fees, and exams in one place.", time: "Set up in 15m" },
  { id: "gyms", icon: Dumbbell, name: "Gyms", title: "Make membership simple.", text: "Members, payments, and renewals managed daily.", time: "Set up in 10m" },
];

const features = [
  { icon: ReceiptText, title: "Sales & receipts", text: "Create receipts and keep a clean history of daily transactions." },
  { icon: Package, title: "Inventory", text: "Know what you have, what is moving and what needs attention." },
  { icon: Users, title: "People & members", text: "Keep customers, students and members organized." },
  { icon: WalletCards, title: "Payments", text: "Track fees, balances, dues and payments." },
  { icon: BarChart3, title: "Reports", text: "Turn daily activity into clear information you can act on." },
  { icon: ShieldCheck, title: "Secure workspace", text: "Keep important records in one controlled place." },
];

export default function SahelPremium() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-[#ECEDEE] text-[#232427] antialiased font-sans selection:bg-[#E34A32]/20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Instrument+Serif:ital@1&display=swap');
        .font-serif-accent { font-family: 'Instrument Serif', serif; font-style: italic; }
        .glass-card { 
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 20px 40px -20px rgba(0,0,0,0.1);
        }
        .hero-gradient {
          background: radial-gradient(circle at 50% 50%, #F4F5F5 0%, #ECEDEE 100%);
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 pt-2 sm:pt-4">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-[28px] sm:rounded-[40px] bg-[#F4F5F5] shadow-[0_20px_60px_-30px_rgba(35,36,39,0.2)] min-h-[90vh] flex flex-col">
          
          {/* Atmospheric Blooms */}
          <div className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[600px] rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(227,74,50,0.4), transparent 70%)' }}></div>
          <div className="pointer-events-none absolute -left-52 top-24 h-[600px] w-[600px] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(46,48,52,0.2), transparent 70%)' }}></div>

          {/* STICKY NAV */}
          <div className="sticky top-3 z-50 flex justify-center px-4 pt-4">
            <nav className={`flex w-full max-w-[900px] items-center justify-between rounded-full border border-white/70 bg-white/75 py-2 pl-5 pr-2 backdrop-blur-xl transition-all duration-500 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
              <Link to="/" className="flex items-center gap-2.5">
                <span className="relative flex h-6 w-9 items-center">
                  <span className="absolute left-0 h-6 w-6 rounded-full bg-[#171719]"></span>
                  <span className="absolute left-3.5 h-6 w-6 rounded-full bg-[#E34A32]"></span>
                </span>
                <span className="text-base font-bold tracking-tight">Sahel</span>
              </Link>
              <div className="hidden md:flex items-center gap-1 text-sm font-medium text-[#4b4d52]">
                {['Solutions', 'Features', 'Install'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="rounded-full px-4 py-2 hover:bg-black/5 transition">{item}</a>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-semibold text-[#55575c]">Log in</Link>
                <Link to="/signup" className="group inline-flex items-center gap-1.5 rounded-full bg-[#171719] px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 shadow-lg">
                  Get Started
                  <ArrowRight className="h-4 w-4 opacity-0 -ml-4 transition-all group-hover:opacity-100 group-hover:ml-0" />
                </Link>
                <button onClick={() => setMenu(!menu)} className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white border border-black/5">
                  {menu ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </nav>
          </div>

          {/* HERO CONTENT */}
          <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-16 text-center sm:pt-24 flex-1 justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-[#E34A32] backdrop-blur shadow-sm mb-8">
              <Zap size={16} fill="currentColor" />
              Built for growing organizations
            </div>

            <div className="relative">
              <h1 className="text-5xl font-extrabold leading-[1.05] text-[#2E3034] sm:text-7xl lg:text-8xl tracking-tight">
                Your business <br />
                <span className="font-serif-accent text-[#E34A32]">workspace</span> simplified.
              </h1>
              
              {/* Floating Icons mimicking SprintForge tiles */}
              <div className="absolute -right-8 -top-10 hidden rotate-6 md:flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-black/5 shadow-xl">
                 <Store className="text-blue-500" />
              </div>
              <div className="absolute -left-12 top-20 hidden -rotate-12 lg:flex h-14 w-14 items-center justify-center rounded-xl bg-white border border-black/5 shadow-lg">
                 <GraduationCap className="text-emerald-500" />
              </div>
              <div className="absolute -right-20 bottom-0 hidden rotate-12 lg:flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-black/5 shadow-xl">
                 <Dumbbell className="text-orange-500" />
              </div>
            </div>

            <p className="mt-10 max-w-xl text-lg leading-relaxed text-[#55575c]">
              Boost productivity by keeping sales, inventory, and reports 
              together in one calm, model-connected workspace.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link to="/signup" className="group inline-flex items-center gap-2 rounded-full bg-[#171719] px-8 py-4 text-base font-bold text-white transition-all hover:-translate-y-0.5 shadow-xl">
                Create Free Workspace
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="glass-card px-8 py-4 rounded-full text-base font-bold hover:-translate-y-0.5 transition-all">
                View Demo
              </button>
            </div>
          </div>
        </section>

        {/* SOLUTIONS SECTION */}
        <section id="solutions" className="px-4 py-24 sm:px-10 lg:px-16">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-[#E34A32]">One Platform</p>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-[#2E3034] sm:text-5xl tracking-tight">
              Built around your work.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((item) => (
              <div key={item.id} className="glass-card group rounded-[32px] p-8 hover:-translate-y-2 transition-all duration-500">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4F5F5] border border-black/5 text-[#E34A32] mb-6 transition-colors group-hover:bg-[#E34A32] group-hover:text-white">
                  <item.icon size={28} strokeWidth={1.5} />
                </span>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-[#55575c] leading-relaxed mb-6">{item.text}</p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter text-[#8a8c91] bg-[#F4F5F5] w-fit px-3 py-1.5 rounded-full">
                  <Clock size={14} />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES GRID (DARK SECTION) */}
        <section id="features" className="px-4 pb-24 sm:px-10">
          <div className="rounded-[40px] bg-[#171719] p-8 sm:p-16 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E34A32] opacity-10 blur-[120px]"></div>
            
            <div className="max-w-2xl mb-16 relative z-10">
              <p className="text-sm font-bold uppercase tracking-widest text-[#E34A32]">Capabilities</p>
              <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">Less busywork. <br /><span className="text-white/40">More control.</span></h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
              {features.map((f, i) => (
                <div key={i} className="border-t border-white/10 pt-8">
                  <f.icon className="text-[#E34A32] mb-4" size={24} />
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER CTA */}
        <footer id="install" className="px-2 pb-4">
          <div className="relative overflow-hidden rounded-[40px] bg-[#F4F5F5] px-6 py-20 text-center shadow-inner">
            {/* Atmospheric Bloom */}
            <div className="pointer-events-none absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(227,74,50,0.3), transparent 70%)' }}></div>
            
            <div className="relative mx-auto max-w-3xl">
              <h2 className="text-4xl font-bold text-[#2E3034] sm:text-6xl tracking-tight mb-6">
                Take your workspace <br /> with you.
              </h2>
              <p className="text-lg text-[#55575c] mb-10">
                Install Sahel on your phone or computer for a faster, focused experience.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-[#171719] text-white px-8 py-4 rounded-full font-bold shadow-xl hover:-translate-y-1 transition-all">
                  Install Sahel App
                </button>
                <Link to="/signup" className="glass-card px-8 py-4 rounded-full font-bold hover:-translate-y-1 transition-all">
                  Create Free Workspace
                </Link>
              </div>

              <div className="mt-16 pt-8 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-5 w-8 items-center">
                    <span className="absolute left-0 h-5 w-5 rounded-full bg-[#171719]"></span>
                    <span className="absolute left-3 h-5 w-5 rounded-full bg-[#E34A32]"></span>
                  </span>
                  <span className="text-base font-bold">Sahel</span>
                </div>
                <p className="text-xs text-[#8a8c91]">© 2026 Sahel Studio. Built for growing organizations.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
