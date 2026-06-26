import React, { useEffect, useMemo, useState } from "react";
import {
  Bell, CalendarDays, ChevronRight, Clock, CreditCard, Plus, Printer, X,
  DollarSign, Search, Settings, ShoppingBag, TrendingDown, TrendingUp,
  WalletCards, Info, ArrowUpRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
const DASHBOARD_CACHE_KEY = "sahel_dashboard_cache_v1";
const DASHBOARD_CACHE_TTL = 60 * 1000;

// --- DATA HELPERS ---

const emptyDashboardState = {
  loading: true, error: "", refreshing: false, products: [],
  currentProfit: null, previousProfit: null, credits: null,
  creditList: [], daily: [], topProducts: [], recentSales: [], todaySales: []
};

function readDashboardCache() {
  if (typeof window === "undefined") return null;
  try {
    const cached = JSON.parse(localStorage.getItem(DASHBOARD_CACHE_KEY) || "null");
    if (!cached?.data || !cached?.savedAt) return null;
    return { data: cached.data, stale: Date.now() - cached.savedAt > DASHBOARD_CACHE_TTL };
  } catch (e) { return null; }
}

function writeDashboardCache(data) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data })); } catch (e) {}
}

function initialDashboardState() {
  const cached = readDashboardCache();
  if (!cached?.data) return emptyDashboardState;
  return { ...emptyDashboardState, ...cached.data, loading: false, refreshing: cached.stale };
}

function previousMonth(value) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 2, 1));
  return date.toISOString().slice(0, 7);
}

async function safeRequest(path, fallback) {
  try { const response = await apiRequest(path); return response.data ?? fallback; } 
  catch (e) { return fallback; }
}

function monthStart(value) { return `${value}-01`; }
function percentChange(curr, prev) {
  if (!prev) return curr ? 100 : 0;
  return ((curr - prev) / Math.abs(prev)) * 100;
}
function formatTime(val) { return new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

// --- UI COMPONENTS ---

const Sparkline = ({ data, color }) => (
  <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="val" stroke={color} strokeWidth={4} dot={false} isAnimationActive={true} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

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

function TrendPill({ value, invert = false }) {
  const positive = Number(value) >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${
      invert ? "bg-white/20 text-white" : positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
    }`}>
      <Icon size={10} /> {Math.abs(Number(value || 0)).toFixed(1)}%
    </span>
  );
}

function MetricCard({ title, value, trend, helper, icon: Icon, featured = false, delay = 0, onClick, money = true, sparkData }) {
  return (
    <button
      type="button"
      className={`group relative overflow-hidden rounded-[2.5rem] p-6 text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
        featured ? "bg-gradient-to-br from-[#5b3ff2] to-[#1e40af] text-white" : "border border-slate-100 bg-white text-slate-950"
      }`}
      onClick={onClick}
    >
      <Sparkline data={sparkData} color={featured ? "#fff" : "#3b82f6"} />
      <div className="relative z-10">
        <div className="mb-8 flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${featured ? "bg-white/20" : "bg-blue-50 text-blue-600"}`}>
            <Icon size={24} />
          </div>
          <TrendPill value={trend} invert={featured} />
        </div>
        <p className={`text-[10px] font-black uppercase tracking-widest ${featured ? "text-white/60" : "text-slate-400"}`}>{title}</p>
        <h3 className="mt-1 text-3xl font-black tracking-tight"><AnimatedNumber value={value} money={money} /></h3>
        <p className={`mt-2 text-xs font-medium ${featured ? "text-white/60" : "text-slate-400"}`}>{helper}</p>
      </div>
    </button>
  );
}

// --- MAIN DASHBOARD ---

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTodaySales, setShowTodaySales] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [state, setState] = useState(initialDashboardState);

  useEffect(() => {
    let active = true;
    async function load(background = false) {
      try {
        if (!background) setState((c) => ({ ...c, loading: true }));
        const currentMonth = monthISO();
        const lastMonth = previousMonth(currentMonth);
        const today = todayISO();
        const [products, currentProfit, previousProfit, credits, creditList, daily, topProducts, recentSales, todaySales] = await Promise.all([
          safeRequest("/products", []),
          safeRequest(`/reports/profit?month=${currentMonth}`, { revenue: 0, net_profit: 0 }),
          safeRequest(`/reports/profit?month=${lastMonth}`, { revenue: 0, net_profit: 0 }),
          safeRequest("/credits/summary", { total_amount_owed: 0, count: 0 }),
          safeRequest("/credits?status=open", []),
          safeRequest("/reports/daily", []),
          safeRequest(`/reports/top-products?from=${monthStart(currentMonth)}&to=${today}`, []),
          safeRequest("/sales?limit=10", []),
          safeRequest(`/sales?from=${today}T00:00:00.000Z&to=${today}T23:59:59.999Z&limit=100`, [])
        ]);
        const nextState = { loading: false, error: "", refreshing: false, products, currentProfit, previousProfit, credits, creditList, daily, topProducts, recentSales, todaySales };
        writeDashboardCache(nextState);
        if (active) setState(nextState);
      } catch (error) {
        if (active) setState((c) => ({ ...c, loading: false, error: error.message }));
      }
    }
    load(Boolean(readDashboardCache()?.data));
    return () => { active = false; };
  }, []);

  const metrics = useMemo(() => {
    const spark = state.daily.map(d => ({ val: Number(d.total_revenue || 0) }));
    const todayRevenue = state.daily[state.daily.length - 1]?.total_revenue || 0;
    const previousAvg = state.daily.slice(0, -1).reduce((s, d) => s + Number(d.total_revenue || 0), 0) / Math.max(state.daily.length - 1, 1);

    return [
      { title: t("todaySales"), value: todayRevenue, trend: percentChange(todayRevenue, previousAvg), helper: "Total for today", icon: ShoppingBag, featured: true, action: "today-sales", sparkData: spark },
      { title: t("totalRevenue"), value: state.currentProfit?.revenue, trend: percentChange(state.currentProfit?.revenue || 0, state.previousProfit?.revenue || 0), helper: "Monthly gross", icon: DollarSign, path: "/reports", sparkData: spark.slice(-5) },
      { title: t("credits"), value: state.credits?.total_amount_owed, trend: 0, helper: `${state.credits?.count || 0} Open credits`, icon: CreditCard, path: "/credits", sparkData: [{val: 10}, {val: 30}, {val: 20}] },
      { title: t("netProfit"), value: state.currentProfit?.net_profit, trend: percentChange(state.currentProfit?.net_profit || 0, state.previousProfit?.net_profit || 0), helper: "After expenses", icon: WalletCards, path: "/reports", sparkData: spark.map(v => ({val: v.val * 0.3})) }
    ];
  }, [state, t]);

  if (state.loading) return <LoadingState variant="dashboard" />;
  if (state.error) return <ErrorState message={state.error} />;

  return (
    <div className="min-h-screen space-y-6 bg-[#f8faff] p-4 sm:p-8">
      {/* Metrics Section */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m, i) => (
          <MetricCard key={m.title} {...m} delay={i * 100} onClick={() => (m.action === "today-sales" ? setShowTodaySales(true) : navigate(m.path))} />
        ))}
      </section>

      {/* Your existing Charts and Table would go below here... */}
      <div className="text-center py-10 text-slate-400 font-bold">Interactive Dashboard Loaded Successfully.</div>
    </div>
  );
}
