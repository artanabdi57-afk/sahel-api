import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock,
  CreditCard,
  Plus,
  Printer,
  X,
  DollarSign,
  Search,
  Settings,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  WalletCards
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector
} from "recharts";
import { apiRequest, formatMoney, monthISO, todayISO } from "../lib/api";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";
import { useLanguage } from "../lib/i18n";
import Receipt from "../components/Receipt.jsx";

const palette = ["#5b3ff2", "#2f7df6", "#14c6a4", "#ffb84d", "#ff6b6b", "#8b5cf6"];
const DASHBOARD_CACHE_KEY = "sahel_dashboard_cache_v1";
const DASHBOARD_CACHE_TTL = 60 * 1000;

// Helper for the "Expanding" effect on the Pie Chart
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // Makes the slice pop out
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

const emptyDashboardState = {
  loading: true,
  error: "",
  refreshing: false,
  products: [],
  currentProfit: null,
  previousProfit: null,
  credits: null,
  creditList: [],
  daily: [],
  topProducts: [],
  recentSales: [],
  todaySales: []
};

function readDashboardCache() {
  if (typeof window === "undefined") return null;
  try {
    const cached = JSON.parse(localStorage.getItem(DASHBOARD_CACHE_KEY) || "null");
    if (!cached?.data || !cached?.savedAt) return null;
    return {
      data: cached.data,
      stale: Date.now() - cached.savedAt > DASHBOARD_CACHE_TTL
    };
  } catch (error) { return null; }
}

function writeDashboardCache(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch (error) {}
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
  try {
    const response = await apiRequest(path);
    return response.data ?? fallback;
  } catch (error) { return fallback; }
}

function monthStart(value) { return `${value}-01`; }

function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function AnimatedNumber({ value, money = false }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number(value || 0);
    const duration = 850;
    const startedAt = performance.now();
    let frameId;
    function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);
  return money ? formatMoney(display) : Math.round(display).toLocaleString();
}

function TrendPill({ value }) {
  const positive = Number(value) >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span className={["inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"].join(" ")}>
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(Number(value || 0)).toFixed(1)}%
    </span>
  );
}

function MetricCard({ title, value, trend, helper, icon: Icon, featured = false, delay = 0, onClick, money = true }) {
  return (
    <button
      type="button"
      className={["motion-card w-full rounded-3xl p-5 text-left shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-4 focus:ring-blue-100", featured ? "bg-gradient-to-br from-[#5b3ff2] to-[#316bff] text-white" : "border border-slate-100 bg-white text-slate-950"].join(" ")}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className={featured ? "text-sm font-semibold text-white/75" : "text-sm font-semibold text-slate-500"}>{title}</p>
          <p className="mt-3 text-3xl font-black tracking-tight"><AnimatedNumber value={value} money={money} /></p>
        </div>
        <div className={["flex h-10 w-10 items-center justify-center rounded-full", featured ? "bg-white/18 text-white" : "bg-slate-50 text-slate-500"].join(" ")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className={featured ? "text-xs font-medium text-white/70" : "text-xs font-medium text-slate-400"}>{helper}</p>
        <TrendPill value={trend} />
      </div>
    </button>
  );
}

function QuickActions({ onNewSale, onAddProduct, onReports, t }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn-primary h-10 rounded-xl" onClick={onNewSale}><Plus className="h-4 w-4" />{t("quickNewSale")}</button>
      <button type="button" className="btn-secondary h-10 rounded-xl" onClick={onAddProduct}><Plus className="h-4 w-4" />{t("addProduct")}</button>
      <button type="button" className="btn-secondary h-10 rounded-xl" onClick={onReports}>{t("viewReports")}</button>
    </div>
  );
}

function SearchDropdown({ query, products, credits, onClose, onNavigate }) {
  if (!query) return null;
  const normalized = query.toLowerCase();
  const productMatches = products.filter((p) => p.name?.toLowerCase().includes(normalized)).slice(0, 5);
  const customerMatches = credits.filter((c) => c.customer_name?.toLowerCase().includes(normalized)).slice(0, 5);
  if (!productMatches.length && !customerMatches.length) return <div className="absolute left-0 top-14 z-30 w-full rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.14)]"><p className="text-sm font-semibold text-slate-500">No results found.</p></div>;
  return (
    <div className="absolute right-0 top-14 z-20 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
      {productMatches.length > 0 && (
        <div><p className="px-2 pb-2 text-xs font-black uppercase text-slate-400">Products</p>
          {productMatches.map((p) => (<button key={p.id} onClick={() => {onClose(); onNavigate("/inventory")}} className="flex w-full items-center justify-between rounded-xl p-2 transition hover:bg-blue-50 text-left"><span className="font-bold text-slate-950">{p.name}</span><span className="text-sm font-semibold text-slate-500">{p.quantity} in stock</span></button>))}
        </div>
      )}
      {customerMatches.length > 0 && (
        <div className={productMatches.length ? "mt-3 border-t border-slate-100 pt-3" : ""}>
          <p className="px-2 pb-2 text-xs font-black uppercase text-slate-400">Customers</p>
          {customerMatches.map((c) => (<button key={c.id} onClick={() => {onClose(); onNavigate("/credits")}} className="flex w-full items-center justify-between rounded-xl p-2 transition hover:bg-blue-50 text-left"><span><span className="block font-bold text-slate-950">{c.customer_name}</span><span className="text-xs font-semibold text-slate-500">{c.customer_phone}</span></span><span className="font-black text-blue-700">{formatMoney(c.amount_owed)}</span></button>))}
        </div>
      )}
    </div>
  );
}

function SalesDrawer({ open, sales, onClose, onSaleClick, onPrintCashSummary }) {
  const cashSales = sales.filter((sale) => sale.payment_type === "cash");
  const cashTotal = cashSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  return (
    <div className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-slate-950/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="mb-5 flex items-center justify-between">
          <div><h2 className="text-xl font-black text-slate-950">Today's Sales</h2><p className="text-sm font-semibold text-slate-500">{sales.length} sales today</p></div>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {cashSales.length > 0 && (<button type="button" onClick={onPrintCashSummary} className="btn-primary mb-4 w-full justify-center"><Printer className="h-4 w-4" />Print Cash Sales ({cashSales.length}, {formatMoney(cashTotal)})</button>)}
        <div className="space-y-3">
          {sales.length ? sales.map((sale) => (
            <button key={sale.id} className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50" onClick={() => onSaleClick(sale)}>
              <div className="flex items-start justify-between gap-3"><div><p className="font-black text-slate-950">{sale.product_name}</p><p className="text-sm font-semibold text-slate-500">{sale.customer_name || "Walk-in"}</p></div><p className="font-black text-blue-700">{formatMoney(sale.total)}</p></div>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500"><span>{formatTime(sale.sale_date)}</span><span className="rounded-full bg-white px-2 py-1 capitalize">{sale.payment_type}</span></div>
            </button>
          )) : <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No sales recorded today.</p>}
        </div>
      </aside>
    </div>
  );
}

function SaleDetailModal({ sale, onClose }) {
  if (!sale) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="motion-card w-full max-w-lg rounded-3xl bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-5 flex items-center justify-between">
          <div><h2 className="text-xl font-black text-slate-950">Sale Details</h2><p className="text-sm font-semibold text-slate-500">{new Date(sale.sale_date).toLocaleString()}</p></div>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[["Product", sale.product_name], ["Quantity", sale.quantity_sold], ["Amount", formatMoney(sale.total)], ["Payment", sale.payment_type], ["Customer", sale.customer_name || "Walk-in"], ["Phone", sale.customer_phone || "N/A"]].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black uppercase text-slate-400">{label}</p><p className="mt-1 font-black capitalize text-slate-950">{value}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.15)]">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{formatMoney(payload[0].value)}</p>
    </div>
  );
}

// INTERACTIVE BAR CHART COMPONENT
function BarChart({ data, onOpenReports, t }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  const chartData = data.map((day) => ({
    date: day.date.slice(5).replace("-", "/"),
    fullDate: day.date,
    revenue: Number(day.total_revenue || 0)
  }));

  return (
    <div className="motion-card rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">{t("revenue")}</h2>
          <p className="text-xs font-semibold text-slate-400">{t("last7Days")}</p>
        </div>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-blue-700" onClick={onOpenReports}><TrendingUp className="h-4 w-4" /></button>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RBarChart 
            data={chartData} 
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            onMouseMove={(state) => {
              if (state.activeTooltipIndex !== undefined) setHoveredBar(state.activeTooltipIndex);
            }}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<RevenueTooltip />} cursor={{ fill: "transparent" }} />
            <Bar dataKey="revenue" radius={[10, 10, 0, 0]} cursor="pointer" onClick={onOpenReports}>
              {chartData.map((entry, index) => (
                <Cell 
                   key={`cell-${index}`} 
                   fill={hoveredBar === index ? "#5b3ff2" : "#8b5cf6"} 
                   fillOpacity={hoveredBar === null || hoveredBar === index ? 1 : 0.3} // Interactive opacity
                   className="transition-all duration-300"
                />
              ))}
            </Bar>
          </RBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.15)]">
      <p className="text-sm font-black text-slate-950">{entry.name}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{entry.value} sold</p>
    </div>
  );
}

// INTERACTIVE DONUT CHART COMPONENT
function DonutChart({ products, onOpenReports, t }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);

  const hasData = products.length > 0;
  const chartData = hasData
    ? products.slice(0, 5).map((product) => ({
        name: product.product_name || "Unknown",
        value: Number(product.quantity_sold || 0),
        productId: product.product_id
      }))
    : [{ name: "No sales yet", value: 1, productId: null }];

  const total = hasData ? chartData.reduce((sum, item) => sum + item.value, 0) : 0;

  const onPieEnter = (_, index) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  function handleSliceClick(entry) {
    if (entry?.productId) navigate(`/inventory?highlight=${entry.productId}`);
    else onOpenReports();
  }

  // Calculate current hovered info for the center text
  const currentItem = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div className="motion-card rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">{t("salesByCategory")}</h2>
          <p className="text-xs font-semibold text-slate-400">{t("topProductsThisMonth")}</p>
        </div>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-blue-700" onClick={onOpenReports}><TrendingUp className="h-4 w-4" /></button>
      </div>
      <div className="grid items-center gap-5 sm:grid-cols-[220px_1fr]">
        <div className="relative mx-auto h-52 w-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                cursor="pointer"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                onClick={handleSliceClick}
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={hasData ? palette[index % palette.length] : "#e2e8f0"}
                    stroke="#fff"
                    strokeWidth={2}
                    style={{ outline: 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Dynamic Center Content */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center px-8">
              {currentItem ? (
                <>
                  <p className="text-lg font-black text-slate-950 truncate max-w-[100px] leading-tight">
                    {currentItem.name}
                  </p>
                  <p className="text-xs font-bold text-blue-600">{currentItem.value} items</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-black text-slate-950">{total}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {chartData.map((entry, index) => (
            <button
              type="button"
              key={`${entry.productId || entry.name}-${index}`}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${activeIndex === index ? 'bg-blue-50 scale-[1.02]' : 'hover:bg-slate-50'}`}
              onMouseEnter={() => onPieEnter(null, index)}
              onMouseLeave={onPieLeave}
              onClick={() => handleSliceClick(entry)}
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: hasData ? palette[index % palette.length] : "#e2e8f0" }} />
                <p className={`text-sm font-semibold ${activeIndex === index ? 'text-blue-700' : 'text-slate-600'}`}>{entry.name}</p>
              </div>
              <p className="text-sm font-black text-slate-950">{hasData ? entry.value : "-"}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Dashboard stays mostly the same logic-wise, but looks better with interactive charts
export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTodaySales, setShowTodaySales] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [cashSummaryReceipt, setCashSummaryReceipt] = useState(null);
  const [state, setState] = useState(initialDashboardState);

  useEffect(() => {
    let active = true;
    async function load(background = false) {
      try {
        if (!background) setState((c) => ({ ...c, loading: true, error: "" }));
        else setState((c) => ({ ...c, refreshing: true, error: "" }));
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
        if (active) setState((c) => ({ ...c, loading: false, refreshing: false, error: c.products.length ? "" : error.message }));
      }
    }
    const cached = readDashboardCache();
    if (cached?.data && !cached.stale) return () => { active = false; };
    load(Boolean(cached?.data));
    return () => { active = false; };
  }, []);

  const metrics = useMemo(() => {
    const todayRevenue = state.daily[state.daily.length - 1]?.total_revenue || 0;
    const previousAvg = state.daily.slice(0, -1).reduce((s, d) => s + Number(d.total_revenue || 0), 0) / Math.max(state.daily.length - 1, 1);
    return [
      { title: t("todaySales"), value: todayRevenue, trend: percentChange(todayRevenue, previousAvg), helper: "Compared to 7-day avg", icon: ShoppingBag, featured: true, action: "today-sales" },
      { title: t("totalRevenue"), value: state.currentProfit?.revenue, trend: percentChange(state.currentProfit?.revenue || 0, state.previousProfit?.revenue || 0), helper: "This month vs last", icon: DollarSign, path: "/reports" },
      { title: t("credits"), value: state.credits?.total_amount_owed, trend: 0, helper: `${state.credits?.count || 0} unpaid`, icon: CreditCard, path: "/credits" },
      { title: t("netProfit"), value: state.currentProfit?.net_profit, trend: percentChange(state.currentProfit?.net_profit || 0, state.previousProfit?.net_profit || 0), helper: "After expenses", icon: WalletCards, path: "/reports" }
    ];
  }, [state, t]);

  if (state.loading) return <LoadingState variant="dashboard" />;
  if (state.error) return <ErrorState message={state.error} />;

  const searchQuery = searchTerm.trim().toLowerCase();
  const filteredSales = state.recentSales.filter((s) => !searchQuery || [s.product_name, s.customer_name].some(v => String(v).toLowerCase().includes(searchQuery)));
  const lowStockProducts = state.products.filter((p) => Number(p.quantity || 0) <= Number(p.low_stock_threshold || 0));
  const shop = getCurrentShop();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] space-y-5 rounded-[2rem] bg-[#f4f7ff] p-3 sm:p-5">
      <header className="flex flex-col gap-4 rounded-[1.75rem] bg-white/70 p-3 shadow-[0_16px_45px_rgba(15,23,42,0.05)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex h-11 items-center gap-3 rounded-2xl bg-white px-4 shadow-sm transition focus-within:ring-4 focus-within:ring-blue-100 sm:w-96">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none" placeholder={t("searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <SearchDropdown query={searchTerm} products={state.products} credits={state.creditList} onClose={() => setSearchTerm("")} onNavigate={navigate} />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm hover:bg-blue-50" onClick={() => navigate("/settings")}><Settings className="h-4 w-4" /></button>
          <div className="relative">
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm" onClick={() => setShowNotifications(!showNotifications)}><Bell className="h-4 w-4" />{lowStockProducts.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />}</button>
            {showNotifications && (
               <div className="absolute right-0 top-14 z-20 w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
                 <p className="font-black mb-3">Stock Alerts</p>
                 {lowStockProducts.length === 0 ? <p className="text-sm text-emerald-600">All stock healthy!</p> : lowStockProducts.slice(0, 5).map(p => <div key={p.id} className="p-2 bg-rose-50 rounded-lg mb-2 text-xs font-bold text-rose-700">{p.name}: {p.quantity} left</div>)}
               </div>
            )}
          </div>
          <button className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-0.5 shadow-sm" onClick={() => navigate("/profile")}>
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-xs font-black text-blue-700">SA</div>
          </button>
        </div>
      </header>

      <section>
        <p className="text-3xl font-black text-slate-950">{t("hello")}</p>
        <p className="text-sm text-slate-500">{t("dashboardSubtext")}</p>
      </section>

      <QuickActions onNewSale={() => navigate("/sale")} onAddProduct={() => navigate("/inventory")} onReports={() => navigate("/reports")} t={t} />

      <section className="grid gap-4 md:grid-cols-2">
        {metrics.map((m, i) => <MetricCard key={m.title} {...m} delay={i * 80} onClick={() => (m.action === "today-sales" ? setShowTodaySales(true) : navigate(m.path))} />)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.9fr]">
        <BarChart data={state.daily} onOpenReports={() => navigate("/reports")} t={t} />
        <DonutChart products={state.topProducts} onOpenReports={() => navigate("/reports")} t={t} />
      </section>

      <section className="motion-card rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <h2 className="text-lg font-black text-slate-950 mb-4">{t("recentSales")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody>
              {filteredSales.map(s => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedSale(s)}>
                  <td className="px-4 py-4 text-slate-500">{formatTime(s.sale_date)}</td>
                  <td className="px-4 py-4 font-black">{s.product_name}</td>
                  <td className="px-4 py-4 font-bold text-blue-700">{formatMoney(s.total)}</td>
                  <td className="px-4 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{s.payment_type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SalesDrawer open={showTodaySales} sales={state.todaySales} onClose={() => setShowTodaySales(false)} onSaleClick={setSelectedSale} />
      <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
    </div>
  );
}
