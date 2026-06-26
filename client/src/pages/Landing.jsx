import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Package, 
  BarChart3, 
  PlayCircle, 
  ChevronRight, 
  ArrowRight,
  MousePointer2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// Simulated Dynamic Data for the Demo Graph
const demoData = [
  { name: "Mon", sales: 400, stock: 240 },
  { name: "Tue", sales: 300, stock: 139 },
  { name: "Wed", sales: 900, stock: 980 },
  { name: "Thu", sales: 1480, stock: 390 },
  { name: "Fri", sales: 1890, stock: 480 },
  { name: "Sat", sales: 2390, stock: 380 },
  { name: "Sun", sales: 3490, stock: 430 },
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

:root {
  --primary: #2563eb;
  --primary-glow: rgba(37, 99, 235, 0.15);
  --bg: #ffffff;
  --text-main: #0f172a;
  --text-sub: #64748b;
}

.sahel-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: var(--bg);
  color: var(--text-main);
  scroll-behavior: smooth;
}

.nav-blur {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid #e2e8f0;
}

.hero-gradient {
  background: radial-gradient(circle at 50% 0%, #eff6ff 0%, #ffffff 50%);
}

.btn-main {
  background: var(--primary);
  color: white;
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-main:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px var(--primary-glow);
}

.btn-outline {
  border: 1px solid #e2e8f0;
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  color: var(--text-main);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #f8fafc;
}

.glass-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.floating {
  animation: floating 4s ease-in-out infinite;
}

@keyframes floating {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

.reveal-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.reveal-on-scroll.active {
  opacity: 1;
  transform: translateY(0);
}
`;

export default function SahelInsightsLanding() {
  const [scrolled, setScrolled] = useState(false);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="sahel-pro">
      <style>{styles}</style>

      {/* Navigation */}
      <nav className={`nav-blur ${scrolled ? 'py-4' : 'py-6'} transition-all`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* LOGO POSITION */}
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
               <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Sahel<span className="text-blue-600">Insights</span></span>
          </div>
          <div className="hidden md:flex gap-8 font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#demo" className="hover:text-blue-600 transition">Demo</a>
            <Link to="/login" className="hover:text-blue-600 transition">Log In</Link>
          </div>
          <Link to="/signup" className="btn-main text-sm py-3">Start with free trial</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal-on-scroll">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <BarChart3 size={16} />
              Next-Gen Business Intelligence
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-8">
              Visualize your <span className="text-blue-600">Growth</span> in real-time.
            </h1>
            <p className="text-xl text-slate-500 mb-10 max-w-lg leading-relaxed">
              Track sales, manage inventory, and optimize your shop with high-fidelity graphics. Data clarity for modern shop owners.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-main text-lg px-10">
                Start with free trial
              </Link>
              <a href="#demo" className="btn-outline text-lg px-10">
                <PlayCircle size={20} />
                Viewable demo
              </a>
            </div>
          </div>

          {/* DYNAMIC GRAPH DEMO */}
          <div className="reveal-on-scroll floating" id="demo">
            <div className="glass-card">
              <div className="p-6 bg-slate-50 border-bottom border-slate-200 flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sahel Dashboard Preview</span>
              </div>
              <div className="p-8">
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-400 mb-1">WEEKLY REVENUE</h3>
                  <p className="text-3xl font-black text-slate-900">$12,480.00</p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={demoData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <
