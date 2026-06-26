import React, { useEffect, useMemo, useState } from "react";
import {
  Bell, ChevronRight, Clock, CreditCard, Plus, Printer, X,
  DollarSign, Search, Settings, ShoppingBag, TrendingDown,
  TrendingUp, WalletCards, Info, ArrowUpRight, BarChart3, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Sector
} from "recharts";
import { apiRequest, formatMoney, monthISO, todayISO } from "../lib/api";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";
import { useLanguage } from "../lib/i18n";
import Receipt from "../components/Receipt.jsx";

const palette = ["#5b3ff2", "#2f7df6", "#14c6a4", "#ffb84d", "#ff6b6b", "#8b5cf6"];

// --- HELPERS (Essential for data loading) ---
const DASHBOARD_CACHE_KEY = "sahel_dashboard_full_v3";
const emptyState = {
  loading: true, error: "", products: [], currentProfit: null, 
  previousProfit: null, credits: null, daily: [], recentSales: [], topProducts: []
};

function initialDashboardState() {
  try {
    const cached = JSON.parse(localStorage.getItem(DASHBOARD_CACHE_KEY));
    if (cached && (Date.now() - cached.time < 60000)) return { ...cached.data, loading: false };
  } catch (e) {}
  return emptyState;
}

// --- SUB-COMPONENTS ---
function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-xl bg-slate-50" style={{ color: color }}><Icon size={20} /></div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</p>
      </div>
      <h3 className="text-2xl font-black text-slate-900">{formatMoney(value)}</h3>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [state, setState] = useState(initialDashboardState);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [products, currentProfit, prevProfit, daily, credits, top, recent] = await Promise.all([
          apiRequest("/products").then(r => r.data),
          apiRequest(`/reports/profit?month=${monthISO()}`).then(r => r.data),
          apiRequest(`/reports/profit?month=${todayISO().slice(0, 7)}`).then(r => r.data),
          apiRequest("/reports/daily").then(r => r.data),
          apiRequest("/credits/summary").then(r => r.data),
          apiRequest(`/reports/top-products?from=${todayISO().slice(0, 7)}-01&to=${todayISO()}`).then(r => r.data),
          apiRequest("/sales?limit=10").then(r => r.data)
        ]);
        const data = { loading: false, products, currentProfit, previousProfit: prevProfit, daily, credits, topProducts: top, recentSales: recent };
        setState(data);
        localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({ data, time: Date.now() }));
      } catch (e) { setState(s => ({ ...s, loading: false, error: "Failed to load data" })); }
    }
    load();
  }, []);

  if (state.loading) return <LoadingState variant="dashboard" />;

  const todayRevenue = state.daily[state.daily.length - 1]?.total_revenue || 0;

  return (
    <div className="min-h-screen space-y-6 bg-[#f8faff] p-4 sm:p-8">
      
      {/* 1. SEARCH BAR ON TOP */}
      <header className="relative w-full max-w-4xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          className="w-full rounded-2xl border-none bg-white px-12 py-4 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder={t("searchPlaceholder")} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </header>

      {/* 2. ACTION BUTTONS */}
      <section className="flex flex-wrap gap-3">
        <button onClick={() => navigate("/sale")} className="btn-primary py-2 px-6 rounded-xl text-sm"><Plus size={16}/> New Sale</button>
        <button onClick={() => navigate("/inventory")} className="btn-secondary py-2 px-6 rounded-xl text-sm">Add Product</button>
        <button onClick={() => navigate("/reports")} className="btn-secondary py-2 px-6 rounded-xl text-sm">Reports</button>
      </section>

      {/* 3. FOUR METRIC CARDS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Today Sales" value={todayRevenue} icon={ShoppingBag} color="#5b3ff2" />
        <MetricCard title="Credits" value={state.credits?.total_amount_owed || 0} icon={CreditCard} color="#ff6b6b" />
        <MetricCard title="Total Revenue" value={state.currentProfit?.revenue || 0} icon={DollarSign} color="#2f7df6" />
        <MetricCard title="Net Profit" value={state.currentProfit?.net_profit || 0} icon={WalletCards} color="#14c6a4" />
      </section>

      {/* 4. CHARTS SECTION (PIE + REVENUE + PROFIT) */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Pie Chart: Top Products */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-black uppercase text-slate-400 mb-4">Good Products Selling</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={state.topProducts?.slice(0,5)} dataKey="revenue" nameKey="product_name" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {state.topProducts?.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Revenue Graph */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-black uppercase text-slate-400 mb-4">Total Revenue Graph</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={state.daily}>
                <XAxis dataKey="date" hide />
                <Tooltip />
                <Area type="monotone" dataKey="total_revenue" stroke="#2f7df6" fill="#2f7df6" fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Graph */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-black uppercase text-slate-400 mb-4">Profit Graph</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={state.daily}>
                <XAxis dataKey="date" hide />
                <Tooltip />
                <Area type="monotone" dataKey="total_revenue" stroke="#14c6a4" fill="#14c6a4" fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 5. RECENT SALES */}
      <section className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50"><h2 className="font-black">Recent Sales</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.recentSales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold">{s.product_name}</td>
                  <td className="px-6 py-4">{s.customer_name || "Walk-in"}</td>
                  <td className="px-6 py-4 font-black text-blue-600">{formatMoney(s.total)}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">{s.payment_type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
