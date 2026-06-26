import React, { useEffect, useState } from "react";
import { 
  Search, Plus, BarChart3, ShoppingBag, CreditCard, DollarSign, 
  WalletCards, Bell, Settings, TrendingUp, Activity, X, Package 
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

const COLORS = ["#1E40AF", "#3B82F6", "#F97316", "#FB923C", "#94A3B8"];

function MetricCard({ title, value, helper, icon: Icon, featured = false, color, isOrange = false }) {
  return (
    <div className={`rounded-[1.5rem] p-5 shadow-lg border transition-all hover:scale-[1.02] ${
      featured 
        ? "bg-[#1E40AF] text-white border-blue-900" 
        : isOrange 
        ? "bg-white text-slate-900 border-orange-200" 
        : "bg-white text-slate-900 border-slate-200"
    }`}>
      <div className="flex justify-between items-start mb-3">
        <p className={`text-[10px] font-black uppercase tracking-widest ${featured ? "text-blue-200" : isOrange ? "text-orange-500" : "text-blue-600"}`}>
          {title}
        </p>
        <div className={`p-2 rounded-lg ${featured ? "bg-white/20" : "bg-slate-50"}`}>
          <Icon size={16} color={featured ? "white" : isOrange ? "#F97316" : "#1E40AF"} />
        </div>
      </div>
      <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight truncate">
        {featured ? "" : "$"}{value.toLocaleString()}
      </h2>
      <p className={`text-[10px] font-bold mt-1 ${featured ? "text-blue-200" : "text-slate-400"}`}>
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
      try {
        const [daily, profit, top, recent, credits, products] = await Promise.all([
          apiRequest("/reports/daily").then(r => r.data),
          apiRequest(`/reports/profit?month=${monthISO()}`).then(r => r.data),
          apiRequest(`/reports/top-products?from=${monthISO()}-01&to=${todayISO()}`).then(r => r.data),
          apiRequest("/sales?limit=6").then(r => r.data),
          apiRequest("/credits/summary").then(r => r.data),
          apiRequest("/products").then(r => r.data)
        ]);
        setState({ loading: false, data: { daily, profit, top, recent, credits, products } });
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  if (state.loading) return <LoadingState />;

  const { daily, profit, top, recent, credits, products } = state.data;
  const todayRevenue = daily[daily.length - 1]?.total_revenue || 0;
  const lowStock = products.filter(p => Number(p.quantity) <= Number(p.low_stock_threshold));

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-4 lg:p-10 font-sans" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. COMPACT HEADER */}
      <header className="flex flex-col gap-5 mb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              className="w-full bg-white rounded-xl py-2.5 pl-12 pr-4 shadow-sm border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs" 
              placeholder={t("searchPlaceholder")} 
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/settings")} className="p-2.5 bg-white rounded-xl shadow-md border border-slate-200 text-slate-400 hover:text-blue-600 transition-all"><Settings size={18}/></button>
            
            {/* WORKING NOTIFICATION BELL */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 bg-white rounded-xl shadow-md border border-slate-200 text-slate-400 hover:text-blue-600 transition-all">
                <Bell size={18}/>
                {lowStock.length > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white animate-pulse"></span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4">
                  <div className="flex justify-between items-center mb-4"><h4 className="text-xs font-black uppercase text-slate-400">Stock Alerts</h4><X size={14} onClick={()=>setShowNotifications(false)} className="cursor-pointer"/></div>
                  {lowStock.length === 0 ? <p className="text-xs text-slate-500">Stock levels are healthy.</p> : 
                    lowStock.slice(0,3).map(p => <div key={p.id} className="p-2 bg-orange-50 rounded-lg mb-2 text-[10px] font-bold text-orange-700 border border-orange-100">{p.name}: {p.quantity} remaining</div>)
                  }
                </div>
              )}
            </div>

            <div onClick={() => navigate("/profile")} className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white font-black shadow-lg cursor-pointer hover:bg-orange-500 transition-all">SA</div>
          </div>
        </div>

        {/* Action Buttons on One Line for Mobile */}
        <div className="flex flex-row gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => navigate("/sale")} className="flex-shrink-0 bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"><Plus size={14} strokeWidth={3}/> {t("quickNewSale")}</button>
          <button onClick={() => navigate("/inventory")} className="flex-shrink-0 bg-white text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs border border-slate-200 flex items-center gap-2"><Plus size={14}/> {t("addProduct")}</button>
          <button onClick={() => navigate("/reports")} className="flex-shrink-0 bg-white text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs border border-slate-200 flex items-center gap-2"><Activity size={14}/> {t("viewReports")}</button>
        </div>
      </header>

      {/* 2. CARDS: 2-col on iPad, 4-col on Desktop (Fixes number overflow) */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard title={t("todaySales")} value={todayRevenue} helper="Live tracking" icon={ShoppingBag} featured />
        <MetricCard title={t("totalRevenue")} value={profit?.revenue || 0} helper="Monthly gross" icon={DollarSign} color="#1E40AF" />
        <MetricCard title={t("credits")} value={credits?.total_amount_owed || 0} helper="Customer debts" icon={CreditCard} isOrange />
        <MetricCard title={t("netProfit")} value={profit?.net_profit || 0} helper="Final earnings" icon={WalletCards} color="#10B981" />
      </section>

      {/* 3. CHARTS: Added borders for separation */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
          <h3 className="text-[10px] font-black uppercase text-blue-800 tracking-widest mb-10">{t("totalRevenue")} Performance</h3>
          <div className="h-[300px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" hide />
                <Tooltip cursor={{fill: '#F8F9FA'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}} />
                <Bar dataKey="total_revenue" fill="#1E40AF" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
          <h3 className="text-[10px] font-black uppercase text-blue-800 tracking-widest mb-10">{t("netProfit")} Growth</h3>
          <div className="h-[300px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                <Area type="monotone" dataKey="total_revenue" stroke="#F97316" strokeWidth={4} fill="rgba(249, 115, 22, 0.05)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. DONUT & TABLE: Modern iPad layout */}
      <section className="grid gap-6 lg:grid-cols-3 mt-8">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 flex flex-col items-center">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-8 self-start">Product Share</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={top?.slice(0,5)} dataKey="revenue" nameKey="product_name" innerRadius={70} outerRadius={95} paddingAngle={8}>
                  {top?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">${(top.reduce((a,b)=>a+b.revenue,0)/1000).toFixed(1)}k</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Top 5 Total</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-sm font-black text-slate-900">{t("recentSales")}</h3>
            <button onClick={() => navigate("/reports")} className="text-orange-600 font-bold text-[10px] uppercase tracking-widest hover:underline">Full Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                <tr><th className="px-8 py-5">Product</th><th className="px-8 py-5">Amount</th><th className="px-8 py-5 text-right">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent?.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-900">{s.product_name}</td>
                    <td className="px-8 py-6 font-black text-blue-700">{formatMoney(s.total)}</td>
                    <td className="px-8 py-6 text-right"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">{s.payment_type}</span></td>
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
