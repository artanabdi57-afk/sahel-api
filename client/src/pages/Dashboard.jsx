import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock,
  CreditCard,
  Plus,
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
import { apiRequest, formatMoney, monthISO, todayISO } from "../lib/api";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";
import { useLanguage } from "../lib/i18n";

const palette = ["#5b3ff2", "#2f7df6", "#14c6a4", "#ffb84d", "#ff6b6b", "#8b5cf6"];
const DASHBOARD_CACHE_KEY = "sahel_dashboard_cache_v1";
const DASHBOARD_CACHE_TTL = 60 * 1000;

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
  } catch (error) {
    return null;
  }
}

function writeDashboardCache(data) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      DASHBOARD_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        data
      })
    );
  } catch (error) {
    // If storage is full or blocked, the live API data still renders normally.
  }
}

function initialDashboardState() {
  const cached = readDashboardCache();
  if (!cached?.data) return emptyDashboardState;

  return {
    ...emptyDashboardState,
    ...cached.data,
    loading: false,
    refreshing: cached.stale
  };
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
  } catch (error) {
    return fallback;
  }
}

function monthStart(value) {
  return `${value}-01`;
}

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

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
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
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
        positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(Number(value || 0)).toFixed(1)}%
    </span>
  );
}

function MetricCard({ title, value, trend, helper, icon: Icon, featured = false, delay = 0, onClick, money = true }) {
  return (
    <button
      type="button"
      className={[
        "motion-card w-full rounded-3xl p-5 text-left shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-4 focus:ring-blue-100",
        featured
          ? "bg-gradient-to-br from-[#5b3ff2] to-[#316bff] text-white"
          : "border border-slate-100 bg-white text-slate-950"
      ].join(" ")}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className={featured ? "text-sm font-semibold text-white/75" : "text-sm font-semibold text-slate-500"}>
            {title}
          </p>
          <p className="mt-3 text-3xl font-black tracking-tight">
            <AnimatedNumber value={value} money={money} />
          </p>
        </div>
        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-full",
            featured ? "bg-white/18 text-white" : "bg-slate-50 text-slate-500"
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className={featured ? "text-xs font-medium text-white/70" : "text-xs font-medium text-slate-400"}>
          {helper}
        </p>
        <TrendPill value={trend} />
      </div>
    </button>
  );
}

function QuickActions({ onNewSale, onAddProduct, onReports, t }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn-primary h-10 rounded-xl" onClick={onNewSale}>
        <Plus className="h-4 w-4" />
        {t("quickNewSale")}
      </button>
      <button type="button" className="btn-secondary h-10 rounded-xl" onClick={onAddProduct}>
        <Plus className="h-4 w-4" />
        {t("addProduct")}
      </button>
      <button type="button" className="btn-secondary h-10 rounded-xl" onClick={onReports}>
        {t("viewReports")}
      </button>
    </div>
  );
}

function SearchDropdown({ query, products, credits, onClose, onNavigate }) {
  if (!query) return null;

  const normalized = query.toLowerCase();
  const productMatches = products
    .filter((product) => product.name?.toLowerCase().includes(normalized))
    .slice(0, 5);
  const customerMatches = credits
    .filter((credit) => credit.customer_name?.toLowerCase().includes(normalized))
    .slice(0, 5);

  if (!productMatches.length && !customerMatches.length) {
    return (
      <div className="absolute left-0 top-14 z-30 w-full rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
        <p className="text-sm font-semibold text-slate-500">No dashboard results found.</p>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-14 z-30 w-full rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
      {productMatches.length ? (
        <div>
          <p className="px-2 pb-2 text-xs font-black uppercase text-slate-400">Products</p>
          <div className="space-y-1">
            {productMatches.map((product) => (
              <button
                type="button"
                key={product.id}
                className="flex w-full items-center justify-between rounded-xl p-2 text-left transition hover:bg-blue-50"
                onClick={() => {
                  onClose();
                  onNavigate("/inventory");
                }}
              >
                <span className="font-bold text-slate-950">{product.name}</span>
                <span className="text-sm font-semibold text-slate-500">{product.quantity} in stock</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {customerMatches.length ? (
        <div className={productMatches.length ? "mt-3 border-t border-slate-100 pt-3" : ""}>
          <p className="px-2 pb-2 text-xs font-black uppercase text-slate-400">Customers</p>
          <div className="space-y-1">
            {customerMatches.map((credit) => (
              <button
                type="button"
                key={credit.id}
                className="flex w-full items-center justify-between rounded-xl p-2 text-left transition hover:bg-blue-50"
                onClick={() => {
                  onClose();
                  onNavigate("/credits");
                }}
              >
                <span>
                  <span className="block font-bold text-slate-950">{credit.customer_name}</span>
                  <span className="text-xs font-semibold text-slate-500">{credit.customer_phone}</span>
                </span>
                <span className="font-black text-blue-700">{formatMoney(credit.amount_owed)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SalesDrawer({ open, sales, onClose, onSaleClick }) {
  return (
    <div className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-slate-950/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">Today's Sales</h2>
            <p className="text-sm font-semibold text-slate-500">{sales.length} sales today</p>
          </div>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          {sales.length ? (
            sales.map((sale) => (
              <button
                type="button"
                key={sale.id}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                onClick={() => onSaleClick(sale)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{sale.product_name}</p>
                    <p className="text-sm font-semibold text-slate-500">{sale.customer_name || "Walk-in"}</p>
                  </div>
                  <p className="font-black text-blue-700">{formatMoney(sale.total)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{formatTime(sale.sale_date)}</span>
                  <span className="rounded-full bg-white px-2 py-1 capitalize">{sale.payment_type}</span>
                </div>
              </button>
            ))
          ) : (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No sales recorded today.</p>
          )}
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
          <div>
            <h2 className="text-xl font-black text-slate-950">Sale Details</h2>
            <p className="text-sm font-semibold text-slate-500">{new Date(sale.sale_date).toLocaleString()}</p>
          </div>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Product", sale.product_name],
            ["Quantity", sale.quantity_sold],
            ["Amount", formatMoney(sale.total)],
            ["Payment", sale.payment_type],
            ["Customer", sale.customer_name || "Walk-in"],
            ["Phone", sale.customer_phone || "N/A"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-black uppercase text-slate-400">{label}</p>
              <p className="mt-1 font-black capitalize text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarChart({ data, onOpenReports, t }) {
  const max = Math.max(...data.map((day) => Number(day.total_revenue || 0)), 1);

  return (
    <div className="motion-card rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">{t("revenue")}</h2>
          <p className="text-xs font-semibold text-slate-400">{t("last7Days")}</p>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-blue-700"
          onClick={onOpenReports}
          title="Open reports"
        >
          <TrendingUp className="h-4 w-4" />
        </button>
      </div>
      <div className="flex h-56 items-end gap-3">
        {data.map((day) => {
          const height = Math.max((Number(day.total_revenue || 0) / max) * 100, 8);
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-3">
              <div className="flex h-44 w-full items-end">
                <div
                  className="dashboard-bar w-full rounded-t-2xl bg-gradient-to-t from-[#5b3ff2] to-[#2f7df6] shadow-[0_12px_25px_rgba(91,63,242,0.25)] transition-all duration-700 hover:brightness-110"
                  style={{ "--bar-height": `${height}%`, height: `${height}%` }}
                  title={`${day.date}: ${formatMoney(day.total_revenue)}`}
                />
              </div>
              <p className="text-xs font-bold text-slate-400">{day.date.slice(5).replace("-", "/")}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DonutChart({ products, onOpenReports, t }) {
  const total = products.reduce((sum, product) => sum + Number(product.quantity_sold || 0), 0);
  let current = 0;
  const slices = products.slice(0, 5).map((product, index) => {
    const start = current;
    const size = total ? (Number(product.quantity_sold || 0) / total) * 100 : 20;
    current += size;
    return `${palette[index % palette.length]} ${start}% ${current}%`;
  });
  const background = slices.length ? `conic-gradient(${slices.join(", ")})` : "conic-gradient(#5b3ff2 0% 45%, #2f7df6 45% 70%, #14c6a4 70% 100%)";

  return (
    <div className="motion-card rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">{t("salesByCategory")}</h2>
          <p className="text-xs font-semibold text-slate-400">{t("topProductsThisMonth")}</p>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-blue-700"
          onClick={onOpenReports}
          title="Open reports"
        >
          <TrendingUp className="h-4 w-4" />
        </button>
      </div>
      <div className="grid items-center gap-5 sm:grid-cols-[180px_1fr]">
        <div className="dashboard-donut relative mx-auto h-44 w-44 rounded-full" style={{ background }}>
          <div className="absolute inset-8 rounded-full bg-white shadow-inner" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-950">{total}</p>
              <p className="text-xs font-bold text-slate-400">sold</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {(products.length ? products.slice(0, 5) : [{ product_name: "No sales yet", quantity_sold: 0 }]).map(
            (product, index) => (
              <div key={`${product.product_id || product.product_name}-${index}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                  <p className="text-sm font-semibold text-slate-600">{product.product_name || "Unknown product"}</p>
                </div>
                <p className="text-sm font-black text-slate-950">{product.quantity_sold}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const paid = status === "paid";
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-xs font-bold capitalize",
        paid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
      ].join(" ")}
    >
      {status}
    </span>
  );
}

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
        if (!background) {
          setState((current) => ({ ...current, loading: true, error: "" }));
        } else {
          setState((current) => ({ ...current, refreshing: true, error: "" }));
        }

        const currentMonth = monthISO();
        const lastMonth = previousMonth(currentMonth);
        const today = todayISO();
        const [products, currentProfit, previousProfit, credits, creditList, daily, topProducts, recentSales, todaySales] = await Promise.all([
          safeRequest("/products", []),
          safeRequest(`/reports/profit?month=${currentMonth}`, {
            revenue: 0,
            cost_of_goods_sold: 0,
            total_expenses: 0,
            net_profit: 0
          }),
          safeRequest(`/reports/profit?month=${lastMonth}`, {
            revenue: 0,
            cost_of_goods_sold: 0,
            total_expenses: 0,
            net_profit: 0
          }),
          safeRequest("/credits/summary", {
            total_amount_owed: 0,
            count: 0
          }),
          safeRequest("/credits?status=open", []),
          safeRequest("/reports/daily", []),
          safeRequest(`/reports/top-products?from=${monthStart(currentMonth)}&to=${today}`, []),
          safeRequest("/sales?limit=10", []),
          safeRequest(`/sales?from=${today}T00:00:00.000Z&to=${today}T23:59:59.999Z&limit=100`, [])
        ]);

        const nextState = {
          loading: false,
          error: "",
          refreshing: false,
          products,
          currentProfit,
          previousProfit,
          credits,
          creditList,
          daily,
          topProducts,
          recentSales,
          todaySales
        };

        writeDashboardCache(nextState);

        if (active) {
          setState(nextState);
        }
      } catch (error) {
        if (active) {
          setState((current) => ({
            ...current,
            loading: false,
            refreshing: false,
            error: current.products.length || current.daily.length ? "" : error.message
          }));
        }
      }
    }

    const cached = readDashboardCache();
    if (cached?.data && !cached.stale) {
      return () => {
        active = false;
      };
    }

    load(Boolean(cached?.data));

    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const todayRevenue = state.daily[state.daily.length - 1]?.total_revenue || 0;
    const previousAvg =
      state.daily.slice(0, -1).reduce((sum, day) => sum + Number(day.total_revenue || 0), 0) /
      Math.max(state.daily.length - 1, 1);

    return [
      {
        title: t("todaySales"),
        value: todayRevenue,
        trend: percentChange(todayRevenue, previousAvg),
        helper: "Compared to 7-day avg",
        icon: ShoppingBag,
        featured: true,
        action: "today-sales"
      },
      {
        title: t("totalRevenue"),
        value: state.currentProfit?.revenue,
        trend: percentChange(state.currentProfit?.revenue || 0, state.previousProfit?.revenue || 0),
        helper: "This month vs last",
        icon: DollarSign,
        path: "/reports"
      },
      {
        title: t("credits"),
        value: state.credits?.total_amount_owed,
        trend: 0,
        helper: `${state.credits?.count || 0} unpaid or partial`,
        icon: CreditCard,
        path: "/credits"
      },
      {
        title: t("netProfit"),
        value: state.currentProfit?.net_profit,
        trend: percentChange(state.currentProfit?.net_profit || 0, state.previousProfit?.net_profit || 0),
        helper: "After expenses",
        icon: WalletCards,
        path: "/reports"
      }
    ];
  }, [state, t]);

  if (state.loading) return <LoadingState variant="dashboard" />;
  if (state.error) return <ErrorState message={state.error} />;

  const searchQuery = searchTerm.trim().toLowerCase();
  const filteredSales = state.recentSales.filter((sale) => {
    if (!searchQuery) return true;
    return [sale.product_name, sale.customer_name, sale.customer_phone, sale.payment_type, sale.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchQuery));
  });
  const filteredTopProducts = state.topProducts.filter((product) => {
    if (!searchQuery) return true;
    return [product.product_name, product.product_id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchQuery));
  });
  const lowStockProducts = state.products.filter((product) => {
    return Number(product.quantity || 0) <= Number(product.low_stock_threshold || 0);
  });

  const todayLabel = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date());
  const shop = getCurrentShop();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] space-y-5 rounded-[2rem] bg-[#f4f7ff] p-3 sm:p-5">
      <header className="flex flex-col gap-4 rounded-[1.75rem] bg-white/70 p-3 shadow-[0_16px_45px_rgba(15,23,42,0.05)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex h-11 items-center gap-3 rounded-2xl bg-white px-4 shadow-sm transition focus-within:ring-4 focus-within:ring-blue-100 sm:w-96">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <SearchDropdown
            query={searchTerm}
            products={state.products}
            credits={state.creditList}
            onClose={() => setSearchTerm("")}
            onNavigate={navigate}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="hidden items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-blue-700 shadow-sm md:flex">
            <CalendarDays className="h-4 w-4" />
            {shop?.shop_name || "Your shop"} - {todayLabel}
          </div>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
            onClick={() => navigate("/settings")}
            title="Open settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <div className="relative">
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setShowNotifications((current) => !current)}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {lowStockProducts.length > 0 ? (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              ) : null}
            </button>
            {showNotifications ? (
              <div className="absolute right-0 top-14 z-20 w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-black text-slate-950">{t("notifications")}</p>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                    {lowStockProducts.length}
                  </span>
                </div>
                {lowStockProducts.length === 0 ? (
                  <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                    {t("stockHealthy")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lowStockProducts.slice(0, 5).map((product) => (
                      <button
                        type="button"
                        key={product.id}
                        className="flex w-full items-center justify-between rounded-xl bg-rose-50 p-3 text-left transition hover:bg-rose-100"
                        onClick={() => navigate("/inventory")}
                      >
                        <div>
                          <p className="font-bold text-slate-950">{product.name}</p>
                          <p className="text-xs font-semibold text-rose-600">
                            {product.quantity} left, threshold {product.low_stock_threshold}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-rose-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <div className="relative">
          <button
            type="button"
            className="h-11 w-11 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-0.5 shadow-sm transition hover:scale-105"
            onClick={() => navigate("/profile")}
            title="Open profile"
          >
            {shop?.logo ? (
              <img src={shop.logo} alt="Shop logo" className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-sm font-black text-blue-700">
                SA
              </div>
            )}
          </button>
          </div>
        </div>
      </header>

      <section>
        <p className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{t("hello")}</p>
        <p className="mt-2 text-sm font-medium text-slate-500">{t("dashboardSubtext")}</p>
      </section>

      <QuickActions
        onNewSale={() => navigate("/sale")}
        onAddProduct={() => navigate("/inventory")}
        onReports={() => navigate("/reports")}
        t={t}
      />

      <section className="grid gap-4 md:grid-cols-2">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            {...metric}
            delay={index * 80}
            onClick={() => (metric.action === "today-sales" ? setShowTodaySales(true) : navigate(metric.path))}
          />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.9fr]">
        <BarChart data={state.daily} onOpenReports={() => navigate("/reports")} t={t} />
        <DonutChart products={filteredTopProducts} onOpenReports={() => navigate("/reports")} t={t} />
      </section>

      <section className="motion-card rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">{t("recentSales")}</h2>
            <p className="text-xs font-semibold text-slate-400">
              {searchQuery ? `Filtered by "${searchTerm}"` : t("latestTransactions")}
            </p>
          </div>
          <button
            type="button"
            className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            onClick={() => navigate("/reports")}
          >
            {t("viewReports")}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50 text-xs uppercase text-slate-400">
                <th className="px-4 py-3 font-black">{t("time")}</th>
                <th className="px-4 py-3 font-black">{t("product")}</th>
                <th className="px-4 py-3 font-black">{t("qty")}</th>
                <th className="px-4 py-3 font-black">{t("amount")}</th>
                <th className="px-4 py-3 font-black">{t("payment")}</th>
                <th className="px-4 py-3 font-black">{t("customer")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center font-semibold text-slate-400" colSpan="6">
                    {searchQuery ? "No matching sales found." : t("noSales")}
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="cursor-pointer transition hover:bg-slate-50" onClick={() => setSelectedSale(sale)}>
                    <td className="px-4 py-4 font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(sale.sale_date)}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-black text-slate-950">{sale.product_name}</td>
                    <td className="px-4 py-4 font-semibold text-slate-600">{sale.quantity_sold}</td>
                    <td className="px-4 py-4 font-semibold text-slate-950">{formatMoney(sale.total)}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700">
                        {sale.payment_type}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-600">{sale.customer_name || "Walk-in"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <SalesDrawer
        open={showTodaySales}
        sales={state.todaySales}
        onClose={() => setShowTodaySales(false)}
        onSaleClick={(sale) => setSelectedSale(sale)}
      />
      <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
    </div>
  );
}
