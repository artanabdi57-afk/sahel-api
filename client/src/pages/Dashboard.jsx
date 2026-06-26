import React, { useEffect, useState, useMemo } from "react";
import { 
  Search, Plus, BarChart3, ShoppingBag, CreditCard, DollarSign, 
  WalletCards, Bell, Settings, TrendingUp, X, PieChart as PieIcon 
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

const COLORS = ["#5b3ff2", "#2f7df6", "#14c6a4", "#ffb84d", "#ff6b6b"];

// --- CUSTOM COMPONENTS ---

function MetricCard({ title, value, helper, icon: Icon, featured = false, color }) {
  return (
    <div className={`rounded-[1.5rem] p-4 lg:p-6 shadow-sm border transition-all hover:shadow-md ${
      featured ? "bg-[#2563eb] text-white border-blue-600" : "bg-white text-slate-900 border-slate-200/60"
    }`}>
      <div className="flex justify-between items-start mb-3 lg:mb-4">
        <p className={`text-[10px] lg:text-[11px] font-bold uppercase tracking-widest ${featured ? "text-blue-100" : "text-slate-400"}`}>
          {title}
        </p>
        <div className={`p-2 rounded-lg ${featured ? "bg-white/20" : "bg-slate-50"}`}>
          <Icon size={16} color={featured ? "white" : color} />
        </div>
      </div>
      {/* Dynamic font size to prevent overflow on iPad */}
      <h2 className="text-xl md:text-2xl lg:text-3xl font-black truncate">
        {featured ? "" : "$"}{value.toLocaleString()}
      </h2>
      <p className={`text-[10px] font-medium mt-1 truncate ${featured ? "text-blue-100" : "text-slate-400"}`}>
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
        const [daily, profit, top, recent, credits] = await Promise.all([
          apiRequest("/reports/daily").then(r => r.data),
          apiRequest(`/reports/profit?month=${month}`).then(r => r.data),
          apiRequest(`/reports/top-products?from=${month}-01&to=${today}`).then(r => r.data),
          apiRequest("/sales?limit=6").then(r => r.data),
          apiRequest("/credits/summary").then(r => r.data)
        ]);
        setState({ loading: false, data: { daily, profit, top, recent, credits } });
      } catch (e) { console.error("Error:", e); }
    }
    load();
  }, []);

  if (state.loading) return <LoadingState />;

  const { daily, profit, top, recent, credits } = state.data;
  const todayRevenue = daily[daily.length - 1]?.total_revenue || 0;
  const totalTopSales = top.reduce((acc, curr) => acc + Number(curr.revenue), 0);

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-3 md:p-6 lg:p-8 font-sans" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. COMPACT HEADER (Responsive for Phone/iPad) */}
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              className="w-full bg-white rounded-xl py-2.5 pl-10 pr-4 shadow-sm border border-slate-200/50 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold" 
              placeholder={t("searchPlaceholder")} 
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/settings")} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200/50 text-slate-400"><Settings size={18}/></button>
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200/50 text-slate-400"><Bell size={18}/></button>
            <div onClick={() => navigate("/profile")} className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-md cursor-pointer text-sm">SA</div>
          </div>
        </div>

        {/* Action Buttons on same line for mobile */}
        <div className="flex flex-row gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button onClick={() => navigate("/sale")} className="flex-shrink-0 flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md">
            <Plus size={14} strokeWidth={3}/> {t("quickNewSale")}
          </button>
          <button onClick={() => navigate("/inventory")} className="flex-shrink-0 flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs border border-slate-200 shadow-sm">
            <Plus size={14}/> {t("addProduct")}
          </button>
          <button onClick={() => navigate("/reports")} className="flex-shrink-0 flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs border border-slate-200 shadow-sm">
            <BarChart3 size={14}/> {t("viewReports")}
          </button>
        </div>
      </header>

      {/* 2. METRIC CARDS (Responsive Grid) */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t("todaySales")} value={todayRevenue} helper="Gross Sales" icon={ShoppingBag} featured />
        <MetricCard title={t("totalRevenue")} value={profit?.revenue || 0} helper="Monthly Revenue" icon={DollarSign} color="#2563eb" />
        <MetricCard title={t("credits")} value={credits?.total_amount_owed || 0} helper="Customer Balance" icon={CreditCard} color="#f59e0b" />
        <MetricCard title={t("netProfit")} value={profit?.net_profit || 0} helper="After Expenses" icon={WalletCards} color="#10b981" />
      </section>

      {/* 3. BIG GRAPHS SIDE-BY-SIDE (iPad View) */}
      <section className="grid gap-6 lg:grid-cols-2 mt-8">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/50">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-6">{t("totalRevenue")}</h3>
          <div className="h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <Tooltip cursor={{fill: '#f8faff'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                <Bar dataKey="total_revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/50">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-6">{t("netProfit")}</h3>
          <div className="h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                <Area type="monotone" dataKey="total_revenue" stroke="#10b981" strokeWidth={3} fill="rgba(16, 185, 129, 0.05)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. PIE CHART & TABLE (Responsive) */}
      <section className="grid gap-6 lg:grid-cols-3 mt-8">
        {/* Redesigned Donut Chart */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/50 flex flex-col items-center">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-4 self-start">Top Selling Products</h3>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={top?.slice(0,5)} dataKey="revenue" nameKey="product_name" innerRadius={60} outerRadius={80} paddingAngle={6}>
                  {top?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900">${(totalTopSales/1000).toFixed(1)}k</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Sales</span>
            </div>
          </div>
          <div className="w-full mt-4 space-y-2">
             {top?.slice(0,3).map((p, i) => (
               <div key={i} className="flex justify-between items-center text-[11px] font-bold">
                 <span className="text-slate-500 truncate max-w-[100px]">{p.product_name}</span>
                 <span className="text-slate-900">${p.revenue.toLocaleString()}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-200/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900">{t("recentSales")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs lg:text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                <tr><th className="px-6 py-4">Product</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Type</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recent?.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{s.product_name}</td>
                    <td className="px-6 py-4 font-extrabold text-blue-600">{formatMoney(s.total)}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">{s.payment_type}</span>
                    </td>
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
