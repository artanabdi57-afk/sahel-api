import React, { useEffect, useState } from "react";
import { 
  Search, Plus, BarChart3, ShoppingBag, CreditCard, DollarSign, 
  WalletCards, Bell, Settings, TrendingUp, Activity 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid, BarChart, Bar, Legend 
} from "recharts";
import { apiRequest, formatMoney, monthISO, todayISO } from "../lib/api";
import { LoadingState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";
import { useLanguage } from "../lib/i18n"; // Using your existing language hook

const COLORS = ["#5b3ff2", "#2f7df6", "#14c6a4", "#ffb84d", "#ff6b6b"];

function MetricCard({ title, value, helper, icon: Icon, featured = false, color }) {
  return (
    <div className={`rounded-[2rem] p-6 shadow-sm border transition-all hover:shadow-md ${featured ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-900 border-slate-100"}`}>
      <div className="flex justify-between items-start mb-4">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${featured ? "text-blue-100" : "text-slate-400"}`}>{title}</p>
        <div className={`p-2.5 rounded-xl ${featured ? "bg-white/20" : "bg-slate-50"}`}><Icon size={18} color={featured ? "white" : color} /></div>
      </div>
      <h2 className="text-3xl font-extrabold mb-1">{featured ? "" : "$"}{value.toLocaleString()}</h2>
      <p className={`text-[10px] font-medium ${featured ? "text-blue-100" : "text-slate-400"}`}>{helper}</p>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage(); // This hook handles English/Somali/Arabic
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, data: null });
  const shop = getCurrentShop();

  useEffect(() => {
    async function load() {
      const today = todayISO();
      const month = monthISO();
      try {
        const [daily, profit, top, recent, credits] = await Promise.all([
          apiRequest("/reports/daily").then(r => r.data),
          apiRequest(`/reports/profit?month=${month}`).then(r => r.data),
          apiRequest(`/reports/top-products?from=${month}-01&to=${today}`).then(r => r.data),
          apiRequest("/sales?limit=6").then(r => r.data),
          apiRequest("/credits/summary").then(r => r.data)
        ]);
        setState({ loading: false, data: { daily, profit, top, recent, credits } });
      } catch (e) { console.error("Load Error:", e); }
    }
    load();
  }, []);

  if (state.loading) return <LoadingState />;

  const { daily, profit, top, recent, credits } = state.data;
  const todayRevenue = daily[daily.length - 1]?.total_revenue || 0;

  return (
    <div className="min-h-screen bg-[#f4f7ff] p-6 space-y-8 font-sans" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. TOP SEARCH BAR */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 shadow-sm border-none outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm text-slate-700" 
            placeholder={t("searchPlaceholder") || "Search products, sales, or customers..."} 
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-blue-600 transition-colors"><Settings size={20}/></button>
          <button className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 relative">
             <Bell size={20}/>
             <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-lg">SA</div>
        </div>
      </div>

      <section>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t("hello") || "Welcome Back!"}</h1>
        <p className="text-slate-500 font-semibold text-sm mt-1">{t("dashboardSubtext") || "Here is what's happening with your shop today."}</p>
      </section>

      {/* 2. ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate("/sale")} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-[1.02]">
          <Plus size={18} strokeWidth={3}/> {t("quickNewSale") || "New Sale"}
        </button>
        <button onClick={() => navigate("/inventory")} className="flex items-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-2xl font-bold border border-slate-100 hover:bg-slate-50 transition-all">
          <Plus size={18}/> {t("addProduct") || "Add Product"}
        </button>
        <button onClick={() => navigate("/reports")} className="flex items-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-2xl font-bold border border-slate-100 hover:bg-slate-50 transition-all">
          <Activity size={18}/> {t("viewReports") || "Reports"}
        </button>
      </div>

      {/* 3. FOUR METRIC CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t("todaySales") || "Today Sales"} value={todayRevenue} helper="Gross sales for today" icon={ShoppingBag} featured />
        <MetricCard title={t("totalRevenue") || "Total Revenue"} value={profit?.revenue || 0} helper="Revenue this month" icon={DollarSign} color="#2563eb" />
        <MetricCard title={t("credits") || "Credits"} value={credits?.total_amount_owed || 0} helper="Unpaid customer balance" icon={CreditCard} color="#f59e0b" />
        <MetricCard title={t("netProfit") || "Net Profit"} value={profit?.net_profit || 0} helper="Profit after expenses" icon={WalletCards} color="#10b981" />
      </div>

      {/* 4. LARGE GRAPHS SIDE-BY-SIDE */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* BAR CHART for Revenue */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-[0.2em]">{t("totalRevenue") || "Total Revenue Graph"}</h3>
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8faff'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}} />
                <Bar dataKey="total_revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AREA CHART for Profit */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-[0.2em]">{t("netProfit") || "Net Profit Graph"}</h3>
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}} />
                <Area type="monotone" dataKey="total_revenue" stroke="#10b981" strokeWidth={4} fill="rgba(16, 185, 129, 0.08)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. PIE CHART AND RECENT SALES */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie Chart with Labels */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
          <h3 className="text-[11px] font-bold uppercase text-slate-400 mb-8 tracking-[0.2em]">{t("salesByCategory") || "Top Selling Products"}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={top?.slice(0,5)} 
                  dataKey="revenue" 
                  nameKey="product_name" 
                  innerRadius={60} 
                  outerRadius={85} 
                  paddingAngle={8}
                  label={({name}) => name.slice(0,10)} // Added labels
                >
                  {top?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px', fontWeight: 'bold'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-extrabold text-slate-900">{t("recentSales") || "Recent Transactions"}</h3>
            <button onClick={() => navigate("/reports")} className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">{t("viewAll") || "View All"}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5">Product</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recent?.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-900">{s.product_name}</td>
                    <td className="px-8 py-6 font-extrabold text-blue-600">{formatMoney(s.total)}</td>
                    <td className="px-8 py-6">
                      <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{s.payment_type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
