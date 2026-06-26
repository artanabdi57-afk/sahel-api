import React, { useEffect, useState } from "react";
import { 
  Search, Plus, BarChart3, ShoppingBag, CreditCard, DollarSign, 
  WalletCards, Bell, Settings, TrendingUp, Activity, X 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid, BarChart, Bar 
} from "recharts";
import { apiRequest, formatMoney, monthISO, todayISO } from "../lib/api";
import { LoadingState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";
import { useLanguage } from "../lib/i18n";

const COLORS = ["#3b82f6", "#6366f1", "#10b981", "#f59e0b", "#ef4444"];

function MetricCard({ title, value, helper, icon: Icon, featured = false, color }) {
  return (
    <div className={`rounded-[2rem] p-5 lg:p-7 shadow-xl border transition-all ${
      featured 
        ? "bg-[#2563eb] text-white border-blue-700" 
        : "bg-white text-slate-900 border-slate-200 shadow-slate-200/50"
    }`}>
      <div className="flex justify-between items-start mb-4">
        <p className={`text-[10px] lg:text-[12px] font-black uppercase tracking-widest ${featured ? "text-blue-100" : "text-slate-400"}`}>
          {title}
        </p>
        <div className={`p-2 rounded-xl ${featured ? "bg-white/20" : "bg-slate-100"}`}>
          <Icon size={18} color={featured ? "white" : color} />
        </div>
      </div>
      {/* Responsive font size specifically for iPad/Mobile to prevent overflow */}
      <h2 className="text-2xl md:text-xl lg:text-3xl font-black tracking-tight">
        {featured ? "" : "$"}{value.toLocaleString()}
      </h2>
      <p className={`text-[10px] font-bold mt-2 ${featured ? "text-blue-200" : "text-slate-400"}`}>
        {helper}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, data: null });
  const [showNotifications, setShowNotifications] = useState(false);
  const shop = getCurrentShop();

  useEffect(() => {
    async function load() {
      const today = todayISO();
      const month = monthISO();
      try {
        const [daily, profit, top, recent, credits, products] = await Promise.all([
          apiRequest("/reports/daily").then(r => r.data),
          apiRequest(`/reports/profit?month=${month}`).then(r => r.data),
          apiRequest(`/reports/top-products?from=${month}-01&to=${today}`).then(r => r.data),
          apiRequest("/sales?limit=5").then(r => r.data),
          apiRequest("/credits/summary").then(r => r.data),
          apiRequest("/products").then(r => r.data)
        ]);
        setState({ loading: false, data: { daily, profit, top, recent, credits, products } });
      } catch (e) { console.error("Error:", e); }
    }
    load();
  }, []);

  if (state.loading) return <LoadingState />;

  const { daily, profit, top, recent, credits, products } = state.data;
  const todayRevenue = daily[daily.length - 1]?.total_revenue || 0;
  const lowStock = products.filter(p => Number(p.quantity) <= Number(p.low_stock_threshold));

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 lg:p-10 font-sans" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. HEADER: Small Search + Functional Icons */}
      <header className="flex flex-col gap-6 mb-10">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              className="w-full bg-white rounded-2xl py-3 pl-12 pr-4 shadow-sm border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs" 
              placeholder={t("searchPlaceholder")} 
            />
          </div>
          <div className="flex items-center gap-3">
            {/* Functional Buttons */}
            <button onClick={() => navigate("/settings")} className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 text-slate-500 hover:text-blue-600 transition-all active:scale-90"><Settings size={20}/></button>
            
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 text-slate-500 hover:text-blue-600 transition-all">
                <Bell size={20}/>
                {lowStock.length > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 p-5">
                  <p className="font-black text-xs uppercase mb-4 text-slate-400">Stock Alerts</p>
                  {lowStock.length === 0 ? <p className="text-xs">No alerts</p> : 
                    lowStock.slice(0,3).map(p => <div key={p.id} className="p-3 bg-slate-50 rounded-xl mb-2 text-[11px] font-bold border border-slate-100">{p.name}: {p.quantity} left</div>)
                  }
                </div>
              )}
            </div>

            <div onClick={() => navigate("/profile")} className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-200 cursor-pointer hover:scale-105 active:scale-95 transition-all">SA</div>
          </div>
        </div>

        {/* Buttons on same line for Phone */}
        <div className="flex flex-row gap-3 overflow-x-auto no-scrollbar">
          <button onClick={() => navigate("/sale")} className="flex-shrink-0 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-blue-100 flex items-center gap-2"><Plus size={14} strokeWidth={3}/> {t("quickNewSale")}</button>
          <button onClick={() => navigate("/inventory")} className="flex-shrink-0 bg-white text-slate-700 px-6 py-3 rounded-2xl font-black text-xs border border-slate-200 shadow-sm flex items-center gap-2"><Plus size={14}/> {t("addProduct")}</button>
          <button onClick={() => navigate("/reports")} className="flex-shrink-0 bg-white text-slate-700 px-6 py-3 rounded-2xl font-black text-xs border border-slate-200 shadow-sm flex items-center gap-2"><BarChart3 size={14}/> {t("viewReports")}</button>
        </div>
      </header>

      {/* 2. CARDS: 2 columns on iPad, 4 on Desktop to prevent number overflow */}
      <section className="grid gap-5 grid-cols-2 lg:grid-cols-4 mb-10">
        <MetricCard title={t("todaySales")} value={todayRevenue} helper="Real-time" icon={ShoppingBag} featured />
        <MetricCard title={t("totalRevenue")} value={profit?.revenue || 0} helper="This month" icon={DollarSign} color="#2563eb" />
        <MetricCard title={t("credits")} value={credits?.total_amount_owed || 0} helper="Pending" icon={CreditCard} color="#f59e0b" />
        <MetricCard title={t("netProfit")} value={profit?.net_profit || 0} helper="Final earnings" icon={WalletCards} color="#10b981" />
      </section>

      {/* 3. CHARTS: Added borders for separation */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-10">{t("totalRevenue")} Garaafka</h3>
          <div className="h-[300px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <Tooltip cursor={{fill: '#f8faff'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                <Bar dataKey="total_revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-10">{t("netProfit")} Garaafka</h3>
          <div className="h-[300px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                <Area type="monotone" dataKey="total_revenue" stroke="#10b981" strokeWidth={4} fill="rgba(16, 185, 129, 0.08)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. PIE & TABLE: High Contrast Separation */}
      <section className="grid gap-6 lg:grid-cols-3 mt-10">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 flex flex-col items-center">
          <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-8 self-start">Products Selling</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={top?.slice(0,5)} dataKey="revenue" nameKey="product_name" innerRadius={75} outerRadius={100} paddingAngle={8}>
                  {top?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">${(top.reduce((a,b)=>a+b.revenue,0)/1000).toFixed(1)}k</span>
              <span className="text-[10px] font-bold text-slate-400">TOTAL</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-black text-slate-900">{t("recentSales")}</h3>
            <button onClick={() => navigate("/reports")} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                <tr><th className="px-8 py-5">Product</th><th className="px-8 py-5">Amount</th><th className="px-8 py-5 text-right">Type</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent?.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-900">{s.product_name}</td>
                    <td className="px-8 py-6 font-black text-blue-600">{formatMoney(s.total)}</td>
                    <td className="px-8 py-6 text-right"><span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{s.payment_type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
