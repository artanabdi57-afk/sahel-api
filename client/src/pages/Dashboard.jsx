import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, CalendarDays, ChevronRight, Clock, CreditCard, Plus, Printer, X,
  DollarSign, Search, Settings, ShoppingBag, TrendingDown, TrendingUp,
  WalletCards, Info, ArrowUpRight
} from "lucide-react";
import {
  BarChart as RBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Sector, LineChart, Line
} from "recharts";
import { apiRequest, formatMoney, monthISO, todayISO } from "../lib/api";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";
import { useLanguage } from "../lib/i18n";
import Receipt from "../components/Receipt.jsx";

const palette = ["#5b3ff2", "#2f7df6", "#14c6a4", "#ffb84d", "#ff6b6b", "#8b5cf6"];

// --- NEW COMPONENT: MINI SPARKLINE FOR CARDS ---
const Sparkline = ({ data, color }) => (
  <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="val" 
          stroke={color} 
          strokeWidth={3} 
          dot={false} 
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// --- UPDATED INTERACTIVE METRIC CARD ---
function MetricCard({ title, value, trend, helper, icon: Icon, featured = false, delay = 0, onClick, money = true, sparkData }) {
  return (
    <button
      type="button"
      className={[
        "group relative overflow-hidden rounded-[2.5rem] p-6 text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(15,23,42,0.15)] focus:outline-none focus:ring-4 focus:ring-blue-100",
        featured
          ? "bg-gradient-to-br from-[#5b3ff2] via-[#316bff] to-[#1e40af] text-white"
          : "border border-slate-100 bg-white text-slate-950"
      ].join(" ")}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      {/* Background Sparkline */}
      <Sparkline data={sparkData} color={featured ? "#fff" : "#3b82f6"} />

      <div className="relative z-10">
        <div className="mb-8 flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-12 ${featured ? "bg-white/20" : "bg-blue-50 text-blue-600"}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-end">
            <TrendPill value={trend} invert={featured} />
            <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
               <span className="text-[10px] font-bold uppercase tracking-widest">View Details</span>
               <ArrowUpRight size={12} />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className={featured ? "text-xs font-bold text-white/70" : "text-xs font-bold text-slate-400"}>
              {title.toUpperCase()}
            </p>
            <Info size={12} className="opacity-40" />
          </div>
          <h3 className="mt-1 text-3xl font-black tracking-tight">
            <AnimatedNumber value={value} money={money} />
          </h3>
          <p className={`mt-2 text-xs font-medium ${featured ? "text-white/60" : "text-slate-400"}`}>
            {helper}
          </p>
        </div>
      </div>
    </button>
  );
}

// Rest of the logic helpers... (PercentChange, AnimatedNumber, etc.)
function TrendPill({ value, invert = false }) {
  const positive = Number(value) >= 0;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black ${
      invert 
        ? "bg-white/20 text-white" 
        : positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
    }`}>
      {positive ? "+" : ""}{Math.abs(Number(value || 0)).toFixed(1)}%
    </span>
  );
}

function AnimatedNumber({ value, money = false }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number(value || 0);
    const duration = 1000;
    const startedAt = performance.now();
    let frameId;
    function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(target * eased);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);
  return money ? formatMoney(display) : Math.round(display).toLocaleString();
}

// ... (Keep your existing BarChart, DonutChart, and Helper functions)

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [state, setState] = useState(initialDashboardState);
  const [showTodaySales, setShowTodaySales] = useState(false);

  // Load logic (keep your existing useEffect)

  const metrics = useMemo(() => {
    // Generate trend data for sparklines from state.daily
    const sparkData = state.daily.map(d => ({ val: Number(d.total_revenue || 0) }));
    
    const todayRevenue = state.daily[state.daily.length - 1]?.total_revenue || 0;
    const previousAvg = state.daily.slice(0, -1).reduce((s, d) => s + Number(d.total_revenue || 0), 0) / Math.max(state.daily.length - 1, 1);

    return [
      {
        title: t("todaySales"),
        value: todayRevenue,
        trend: percentChange(todayRevenue, previousAvg),
        helper: "Live tracking from today",
        icon: ShoppingBag,
        featured: true,
        action: "today-sales",
        sparkData: sparkData
      },
      {
        title: t("totalRevenue"),
        value: state.currentProfit?.revenue,
        trend: percentChange(state.currentProfit?.revenue || 0, state.previousProfit?.revenue || 0),
        helper: "Gross income this month",
        icon: DollarSign,
        path: "/reports",
        sparkData: sparkData.slice(-5)
      },
      {
        title: t("credits"),
        value: state.credits?.total_amount_owed,
        trend: 0,
        helper: `${state.credits?.count || 0} Open credits`,
        icon: CreditCard,
        path: "/credits",
        sparkData: [{val: 10}, {val: 40}, {val: 20}, {val: 80}] // Replace with real credit trend if available
      },
      {
        title: t("netProfit"),
        value: state.currentProfit?.net_profit,
        trend: percentChange(state.currentProfit?.net_profit || 0, state.previousProfit?.net_profit || 0),
        helper: "After all expenses deducted",
        icon: WalletCards,
        path: "/reports",
        sparkData: sparkData.map(v => ({ val: v.val * 0.4 })) // Simplified profit trend
      }
    ];
  }, [state, t]);

  // Main UI Render (the rest remains the same, just calling the updated MetricCard)
  return (
    <div className="min-h-screen space-y-6 bg-[#f8faff] p-4 sm:p-8">
      {/* ... Header and Search ... */}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            {...metric}
            delay={index * 100}
            onClick={() => (metric.action === "today-sales" ? setShowTodaySales(true) : navigate(metric.path))}
          />
        ))}
      </section>

      {/* ... Charts and Table sections ... */}
    </div>
  );
}
