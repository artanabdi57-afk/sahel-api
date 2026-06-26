import React, { useEffect, useMemo, useState } from "react";
import {
  Bell, ChevronRight, Clock, CreditCard, Plus, Printer, X,
  DollarSign, Search, Settings, ShoppingBag, TrendingUp,
  WalletCards, Info, ArrowUpRight, BarChart3, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { apiRequest, formatMoney, monthISO, todayISO } from "../lib/api";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";
import { useLanguage } from "../lib/i18n";
import Receipt from "../components/Receipt.jsx";

// --- DATA HELPERS (Required for your app to function) ---
const DASHBOARD_CACHE_KEY = "sahel_dashboard_cache_v2";
const emptyState = {
  loading: true, error: "", products: [], currentProfit: null, 
  previousProfit: null, credits: null, daily: [], recentSales: [], todaySales: []
};

function readCache() {
  try { return JSON.parse(localStorage.getItem(DASHBOARD_CACHE_KEY)).data; } catch (e) { return null; }
}

async function safeReq(path, fallback) {
  try { const r = await apiRequest(path); return r.data ?? fallback; } catch (e) { return fallback; }
}

// --- NEW COMPONENT: LARGE GRAPH METRIC CARD ---
function VisualMetricCard({ title, value, data, color, icon: Icon, unit = "$" }) {
  return (
    <div className="group overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <Icon size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{title}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-900">
            {unit === "$" ? formatMoney(value) : value}
          </p>
        </div>
      </div>
      
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
              itemStyle={{ fontWeight: '800', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={4} 
              fillOpacity={1} 
              fill={`url(#color${title})`} 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [state, setState] = useState(emptyState);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    async function load() {
      const currentMonth = monthISO();
      const today = todayISO();
      const [products, currentProfit, daily, credits, recentSales] = await Promise.all([
        safeReq("/products", []),
        safeReq(`/reports/profit?month=${currentMonth}`, { revenue: 0, net_profit: 0 }),
        safeReq("/reports/daily", []),
        safeReq("/credits/summary", { total_amount_owed: 0 }),
        safeReq("/sales?limit=10", [])
      ]);
      
      const newState = { loading: false, products, currentProfit, daily, credits, recentSales };
      setState(newState);
      localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({ data: newState }));
    }
    load();
  }, []);

  // Prepare Chart Data
  const revenueData = useMemo(() => state.daily.map(d => ({ name: d.date, value: d.total_revenue })), [state.daily]);
  const profitData = useMemo(() => state.daily.map(d => ({ name: d.date, value: d.total_revenue * 0.4 })), [state.daily]);
  const rateData = useMemo(() => state.daily.map(d => ({ name: d.date, value: d.total_revenue / 100 })), [state.daily]);
  const todayData = useMemo(() => state.daily.slice(-3).map(d => ({ name: d.date, value: d.total_revenue })), [state.daily]);

  if (state.loading) return <LoadingState variant="dashboard" />;

  return (
    <div className="min-h-screen space-y-8 bg-[#f8faff] p-4 sm:p-8">
      
      {/* 1. TOP SECTION: ACTION BUTTONS */}
      <section className="flex flex-wrap gap-4">
        <button 
          onClick={() => navigate("/sale")}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:scale-105 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> {t("quickNewSale")}
        </button>
        <button 
          onClick={() => navigate("/inventory")}
          className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-8 py-4 font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Plus size={20} /> {t("addProduct")}
        </button>
        <button 
          onClick={() => navigate("/reports")}
          className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-8 py-4 font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <BarChart3 size={20} /> View Profit Report
        </button>
      </section>

      {/* 2. SEARCH & HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            className="w-full rounded-[1.5rem] border-none bg-white px-12 py-4 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder={t("searchPlaceholder")} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-slate-400 hover:text-blue-600">
            <Bell size={20} />
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-black text-white shadow-md cursor-pointer" onClick={() => navigate("/profile")}>
            SA
          </div>
        </div>
      </header>

      {/* 3. MIDDLE SECTION: THE GRAPHS */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <VisualMetricCard 
          title="Today Sales" 
          value={state.daily[state.daily.length - 1]?.total_revenue || 0} 
          data={todayData} 
          color="#5b3ff2" 
          icon={ShoppingBag} 
        />
        <VisualMetricCard 
          title="Total Revenue" 
          value={state.currentProfit?.revenue || 0} 
          data={revenueData} 
          color="#2f7df6" 
          icon={DollarSign} 
        />
        <VisualMetricCard 
          title="Current Rate" 
          value={(revenueData.length * 1.2).toFixed(1)} 
          data={rateData} 
          color="#14c6a4" 
          icon={Activity} 
          unit="pt"
        />
        <VisualMetricCard 
          title="Net Profit" 
          value={state.currentProfit?.net_profit || 0} 
          data={profitData} 
          color="#ffb84d" 
          icon={WalletCards} 
        />
      </section>

      {/* 4. BOTTOM SECTION: RECENT SALES */}
      <section className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-50 p-8">
          <div>
            <h2 className="text-xl font-black text-slate-900">{t("recentSales")}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Live Transaction Stream</p>
          </div>
          <button onClick={() => navigate("/reports")} className="text-sm font-black text-blue-600 hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-8 py-5">Product Name</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.recentSales.map((sale) => (
                <tr key={sale.id} className="group hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => setSelectedSale(sale)}>
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900">{sale.product_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(sale.sale_date).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-600">{sale.customer_name || "Walk-in"}</td>
                  <td className="px-8 py-6 font-black text-blue-600">{formatMoney(sale.total)}</td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase text-emerald-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      {sale.payment_type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedSale && <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </div>
  );
}

// Minimal Detail Modal for the interactive table
function SaleDetailModal({ sale, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900">Sale Details</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        <div className="space-y-4">
           <div className="p-4 bg-slate-50 rounded-2xl">
             <p className="text-xs font-bold text-slate-400 uppercase">Product</p>
             <p className="text-lg font-black">{sale.product_name}</p>
           </div>
           <div className="p-4 bg-slate-50 rounded-2xl">
             <p className="text-xs font-bold text-slate-400 uppercase">Total Paid</p>
             <p className="text-2xl font-black text-blue-600">{formatMoney(sale.total)}</p>
           </div>
        </div>
        <button onClick={onClose} className="w-full mt-8 bg-slate-900 py-4 rounded-2xl font-black text-white">Close Summary</button>
      </div>
    </div>
  );
}
