import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  BarChart3,
  ShoppingCart,
  Wallet,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ───────────────────────────────────────────────────────────
// Copy — English & Somali
// ───────────────────────────────────────────────────────────
const COPY = {
  en: {
    nav: { login: "Login", register: "Register" },
    hero: {
      eyebrow: "Daily Sales Activity",
      headline: "Know who owes you. Know what's left on the shelf.",
      sub: "Sahel replaces the notebook. Track every sale, every customer's deyn, and every item in stock — from your phone, in real time.",
      ctaPrimary: "Start free — no card needed",
      ctaSecondary: "See how it works",
      chartTitle: "This week's sales",
      topProduct: "TOP PRODUCT",
      revenue: "REVENUE",
    },
    features: {
      eyebrow: "The ledger, rebuilt",
      title: "Everything your shop needs",
      sub: "Sahel is more than an app — it's a reliable partner for your business growth.",
      items: [
        { icon: Package, title: "Manage Inventory", body: "Know exactly what's in your store. Get low-stock alerts before you run out." },
        { icon: BarChart3, title: "Track Sales", body: "Record every transaction instantly. Watch your daily revenue and margins in one view." },
        { icon: TrendingUp, title: "Best-Selling Products", body: "See exactly which products move fastest — so you know what to restock first." },
        { icon: Wallet, title: "Track Expenses", body: "Log rent, electricity, and wholesale costs. Know your true profit after every expense." },
        { icon: ShoppingCart, title: "Order Management", body: "Track supplier orders so nothing falls through the cracks." },
        { icon: ShieldCheck, title: "Reliable & Secure", body: "Your business data, private and accessible from any device, any time." },
      ],
    },
    cta: { title: "Ready to put down the notebook?", button: "Start free trial with Sahel" },
  },
  so: {
    nav: { login: "Gal", register: "Diiwaan geli" },
    hero: {
      eyebrow: "Howsha Iibka Maalinlaha ah",
      headline: "Ogow cidda lacagta kuugu leh. Ogow waxa ku hara shelfka.",
      sub: "Sahel waxay beddeshaa buugga. La soco iib kasta, deynta macmiil kasta, iyo alaab kasta oo kaaga jirta bakhaarka — taleefankaaga, waqti dhab ah.",
      ctaPrimary: "Bilow bilaash — kaarka looma baahna",
      ctaSecondary: "Eeg sida ay u shaqayso",
      chartTitle: "Iibka toddobaadkan",
      topProduct: "ALAABTA UGU IIBKA BADAN",
      revenue: "DAKHLIGA",
    },
    features: {
      eyebrow: "Buugga, dib loo dhisay",
      title: "Wax kasta oo dukaankaagu u baahan yahay",
      sub: "Sahel ma aha keliya app — waa lammaane aad ku kalsoonaan karto kobaca ganacsigaaga.",
      items: [
        { icon: Package, title: "Maamul Bakhaarka", body: "Ogow sida sax ah waxa dukaankaaga ku jira. Hel digniin ka hor inta aysan ka dhammaan." },
        { icon: BarChart3, title: "La Soco Iibka", body: "Diiwaan geli dhaqdhaqaaq kasta isla markiiba. Eeg dakhligaaga maalinlaha ah iyo faa'iidada." },
        { icon: TrendingUp, title: "Alaabta Ugu Iibsan", body: "Ogow alaabta si degdeg ah loo iibiyo — si aad u ogaato waxa marka hore dib loogu buuxiyo." },
        { icon: Wallet, title: "La Soco Kharashka", body: "Diiwaan geli kirada, korontada, iyo qiimaha jumlada. Ogow faa'iidadaada dhabta ah." },
        { icon: ShoppingCart, title: "Maamul Dalabka", body: "La soco dalabka alaabta ee suppliers-ka si aysan waxba u dhumin." },
        { icon: ShieldCheck, title: "Aamin & Ammaan", body: "Xogta ganacsigaaga, gaar ah oo laga geli karo qalab kasta, wakhti kasta." },
      ],
    },
    cta: { title: "Diyaar ma u tahay inaad buugga dhigto?", button: "Bilow bilaash Sahel" },
  },
};

const demoSalesData = [
  { day: "Mon", sales: 400 },
  { day: "Tue", sales: 800 },
  { day: "Wed", sales: 600 },
  { day: "Thu", sales: 1300 },
  { day: "Fri", sales: 1100 },
  { day: "Sat", sales: 1700 },
  { day: "Sun", sales: 2100 },
];

// ───────────────────────────────────────────────────────────
// Design tokens
// Palette: deep indigo ledger blue, warm amber accent (market gold),
// warm paper background — rooted in "ledger book" + "marketplace" world,
// not generic SaaS blue.
// ───────────────────────────────────────────────────────────
const styles = `
  .sahel-web {
    font-family: 'Inter', -apple-system, sans-serif;
    background: #FBF8F2;
    color: #15203B;
    scroll-behavior: smooth;
  }
  .sahel-web h1, .sahel-web h2, .sahel-web h3 {
    font-family: 'Lora', Georgia, 'Times New Roman', serif;
  }

  .navbar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 6%; background: rgba(251,248,242,0.92); backdrop-filter: blur(8px);
    border-bottom: 1px solid #EAE3D3; position: sticky; top: 0; z-index: 100;
  }
  .logo-container { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .logo-text { font-family: 'Lora', serif; font-size: 24px; font-weight: 700; color: #15203B; letter-spacing: -0.3px; }

  .lang-toggle {
    display: flex; background: #F1ECDE; border-radius: 999px; padding: 3px;
    border: 1px solid #E2D9C2;
  }
  .lang-btn {
    border: none; background: transparent; padding: 6px 14px; border-radius: 999px;
    font-size: 13px; font-weight: 700; cursor: pointer; color: #6B6452; transition: 0.2s;
  }
  .lang-btn.active { background: #15203B; color: #FBF8F2; }

  .hero-box {
    display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px;
    padding: 88px 6% 96px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800;
    letter-spacing: 1.2px; text-transform: uppercase; color: #B8860B;
    background: #FBF1DA; border: 1px solid #F0DDA8; padding: 6px 14px; border-radius: 999px;
    margin-bottom: 22px;
  }
  .hero-content h1 { font-size: 50px; font-weight: 700; line-height: 1.12; color: #15203B; margin: 0 0 22px; }
  .hero-content p { font-size: 18px; color: #4B5170; margin-bottom: 36px; line-height: 1.65; max-width: 520px; font-family: 'Inter', sans-serif; }

  .actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn-primary {
    background: #15203B; color: #FBF8F2; padding: 16px 28px; border-radius: 10px;
    font-weight: 700; text-decoration: none; border: none; cursor: pointer;
    transition: 0.2s; font-size: 15px; display: inline-block;
  }
  .btn-primary:hover { background: #0D1529; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(21,32,59,0.18); }
  .btn-ghost {
    background: transparent; color: #15203B; padding: 16px 24px; border-radius: 10px;
    font-weight: 700; text-decoration: none; border: 1.5px solid #D8CFB8; cursor: pointer;
    transition: 0.2s; font-size: 15px;
  }
  .btn-ghost:hover { background: #F1ECDE; }

  .graph-card {
    background: #ffffff; border-radius: 22px; padding: 30px;
    border: 1px solid #EAE3D3; box-shadow: 0 24px 48px rgba(21,32,59,0.08);
  }
  .graph-label { font-size: 11px; font-weight: 800; color: #B0A98F; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; display: block; }

  .about-section { padding: 100px 6% 110px; background: #ffffff; border-top: 1px solid #EAE3D3; }
  .section-header { text-align: center; margin-bottom: 64px; }
  .section-eyebrow { font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #B8860B; margin-bottom: 10px; }
  .section-header h2 { font-size: 36px; font-weight: 700; color: #15203B; margin: 0 0 12px; }
  .section-header p { color: #6B7290; font-size: 17px; margin: 0; font-family: 'Inter', sans-serif; }

  .tool-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 24px; }
  .tool-card { padding: 32px; border-radius: 18px; background: #FBF8F2; border: 1px solid #EAE3D3; transition: 0.25s; }
  .tool-card:hover { background: #ffffff; border-color: #15203B; transform: translateY(-6px); box-shadow: 0 16px 32px rgba(21,32,59,0.08); }
  .tool-icon {
    width: 48px; height: 48px; background: #15203B; color: #F2C14E; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
  }
  .tool-card h3 { font-size: 19px; font-weight: 700; margin: 0 0 10px; color: #15203B; }
  .tool-card p { color: #6B7290; line-height: 1.6; font-size: 14.5px; margin: 0; font-family: 'Inter', sans-serif; }

  .final-cta { background: #15203B; padding: 90px 6%; text-align: center; }
  .final-cta h2 { font-size: 30px; font-weight: 700; margin-bottom: 26px; color: #FBF8F2; }

  @media (max-width: 1024px) {
    .hero-box { grid-template-columns: 1fr; text-align: center; padding-top: 48px; }
    .hero-content h1 { font-size: 38px; }
    .hero-content p { margin: 0 auto 32px; }
    .actions { justify-content: center; }
    .navbar { padding: 16px 5%; }
  }
`;

// Logo mark matching the app icon: rounded indigo square, ascending bars, amber dot accent
function SahelMark({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="13" fill="#15203B" />
      <circle cx="35" cy="13" r="4" fill="#F2C14E" />
      <rect x="10" y="28" width="6" height="11" rx="2" fill="#7E88B0" />
      <rect x="21" y="20" width="6" height="19" rx="2" fill="#A9B1CE" />
      <rect x="32" y="14" width="6" height="25" rx="2" fill="#FBF8F2" />
    </svg>
  );
}

export default function SahelLanding() {
  const aboutRef = useRef(null);
  const [lang, setLang] = useState("en");
  const t = COPY[lang];
  const handleScroll = () => aboutRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="sahel-web">
      <style>{styles}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <Link to="/" className="logo-container">
          <SahelMark />
          <span className="logo-text">Sahel</span>
        </Link>
        <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          <div className="lang-toggle">
            <button
              className={`lang-btn ${lang === "en" ? "active" : ""}`}
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
            <button
              className={`lang-btn ${lang === "so" ? "active" : ""}`}
              onClick={() => setLang("so")}
              aria-pressed={lang === "so"}
            >
              SO
            </button>
          </div>
          <Link to="/login" style={{ textDecoration: "none", color: "#4B5170", fontWeight: 600, fontSize: 14 }}>
            {t.nav.login}
          </Link>
          <Link to="/signup" className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>
            {t.nav.register}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-box">
        <div className="hero-content">
          <span className="hero-eyebrow">{t.hero.eyebrow}</span>
          <h1>{t.hero.headline}</h1>
          <p>{t.hero.sub}</p>
          <div className="actions">
            <Link to="/signup" className="btn-primary">{t.hero.ctaPrimary}</Link>
            <button onClick={handleScroll} className="btn-ghost">{t.hero.ctaSecondary}</button>
          </div>
        </div>

        <div className="graph-card">
          <span className="graph-label">{t.hero.eyebrow}</span>
          <h3 style={{ margin: "0 0 26px", fontSize: 21, fontWeight: 700, color: "#15203B" }}>{t.hero.chartTitle}</h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={demoSalesData}>
                <defs>
                  <linearGradient id="chartGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15203B" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#15203B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#15203B" strokeWidth={3.5} fillOpacity={1} fill="url(#chartGold)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 18, borderTop: "1px solid #EAE3D3" }}>
            <div>
              <p style={{ fontSize: 11, color: "#B0A98F", margin: 0, fontWeight: 800, letterSpacing: 0.5 }}>{t.hero.topProduct}</p>
              <p style={{ margin: 0, fontWeight: 700, color: "#15203B" }}>Sugar (50kg)</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "#B0A98F", margin: 0, fontWeight: 800, letterSpacing: 0.5 }}>{t.hero.revenue}</p>
              <p style={{ margin: 0, fontWeight: 700, color: "#B8860B" }}>$2,450.00</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="about-section" ref={aboutRef}>
        <div className="section-header">
          <div className="section-eyebrow">{t.features.eyebrow}</div>
          <h2>{t.features.title}</h2>
          <p>{t.features.sub}</p>
        </div>

        <div className="tool-grid">
          {t.features.items.map((item, i) => (
            <div className="tool-card" key={i}>
              <div className="tool-icon"><item.icon size={24} /></div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="final-cta">
        <h2>{t.cta.title}</h2>
        <Link to="/signup" className="btn-primary" style={{ background: "#F2C14E", color: "#15203B" }}>
          {t.cta.button}
        </Link>
      </div>
    </div>
  );
}
