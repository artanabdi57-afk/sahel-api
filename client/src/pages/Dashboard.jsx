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

// Updated Palette: Deep Blues and Vibrant Orange
const COLORS = ["#1E40AF", "#3B82F6", "#F97316", "#FB923C", "#60A5FA"];

function MetricCard({ title, value, helper, icon: Icon, featured = false, color, isOrange = false }) {
  return (
    <div className={`rounded-[2rem] p-5 lg:p-7 shadow-2xl border transition-all hover:scale-[1.02] ${
      featured 
        ? "bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] text-white border-blue-800 shadow-blue-200/50" 
        : isOrange
        ? "bg-white text-slate-900 border-orange-200 shadow-orange-100/50"
        : "bg-white text-slate-900 border-blue-100 shadow-blue-100/20"
    }`}>
      <div className="flex justify-between items-start mb-4">
        <p className={`text-[10px] lg:text-[12px] font-black uppercase tracking-widest ${featured ? "text-blue-100" : isOrange ? "text-orange-500" : "text-blue-600"}`}>
          {title}
        </p>
        <div className={`p-2 rounded-xl ${featured ? "bg-white/20" : isOrange ? "bg-orange-50" : "bg-blue-50"}`}>
          <Icon size={18} color={featured ? "white" : isOrange ? "#F97316" : "#1E40AF"} />
        </div>
      </div>
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

  useEffect(() => {
    async function load() {
      try {
        const [daily, profit, top, recent, credits, products] = await Promise.all([
          apiRequest("/reports/daily").then(r => r.data),
          apiRequest(`/reports/profit?month=${monthISO()}`).then(r => r.data),
          apiRequest(`/reports/top-products?from=${monthISO()}-01&to=${todayISO()}`).then(r => r.data),
          apiRequest("/sales?limit=5").then(r => r.data),
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
  const lowStock = products.filter(p => Number(p.quantity) <= Number(p.low_stock_threshold));

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-4 lg:p-10 font-sans" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. HEADER: Blue themed items on Cream */}
      <header className="flex flex-col gap-6 mb-10">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
            <input 
              className="w-full bg-white/80 backdrop-blur-md rounded-2xl py-3 pl-12 pr-4 shadow-inner border border-blue-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs text-blue-900" 
              placeholder={t("searchPlaceholder")} 
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/settings")} className="p-3 bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Settings size={20}/></button>
            
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                <Bell size={20}/>
                {lowStock.length > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>}
              </button>
            </div>

            <div onClick={() => navigate("/profile")} className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-300/50 cursor-pointer hover:bg-orange-500 transition-all">SA</div>
          </div>
        </div>

        {/* Action Buttons with Blue & Orange punch */}
        <div className="flex flex-row gap-3 overflow-x-auto no-scrollbar">
          <button onClick={() => navigate("/sale")} className="flex-shrink-0 bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-blue-200 flex items-center gap-2 hover:bg-blue-800 transition-all"><Plus size={14} strokeWidth={4}/> {t("quickNewSale")}</button>
          <button onClick={() => navigate("/inventory")} className="flex-shrink-0 bg-white text-blue-700 px-8 py-3.5 rounded-2xl font-black text-xs border-2 border-blue-100 shadow-md flex items-center gap-2 hover:border-blue-700 transition-all"><Plus size={14}/> {t("addProduct")}</button>
          <button onClick={() => navigate("/reports")} className="flex-shrink-0 bg-orange-500 text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-orange-200 flex items-center gap-2 hover:bg-orange-600 transition-all"><Activity size={14}/> {t("viewReports")}</button>
        </div>
      </header>

      {/* 2. CARDS: Blue and Orange Mix */}
      <section className="grid gap-5 grid-cols-2 lg:grid-cols-4 mb-10">
        <MetricCard title={t("todaySales")} value={daily[daily.length-1]?.total_revenue || 0} helper="Real-time volume" icon={ShoppingBag} featured />
        <MetricCard title={t("totalRevenue")} value={profit?.revenue || 0} helper="Monthly gross" icon={DollarSign} color="#1E40AF" />
        <MetricCard title={t("credits")} value={credits?.total_amount_owed || 0} helper="Outstanding Debt" icon={CreditCard} isOrange />
        <MetricCard title={t("netProfit")} value={profit?.net_profit || 0} helper="Actual Earnings" icon={WalletCards} color="#10B981" />
      </section>

      {/* 3. CHARTS: High contrast blue on white-chocolate */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-100/20 border border-blue-50">
          <h3 className="text-[11px] font-black uppercase text-blue-800 tracking-widest mb-10">{t("totalRevenue")} Performance</h3>
          <div className="h-[350px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" hide />
                <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="total_revenue" fill="#1E40AF" radius={[8, 8, 0, 0]} barSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-100/20 border border-blue-50">
          <h3 className="text-[11px] font-black uppercase text-blue-800 tracking-widest mb-10">{t("netProfit")} Growth</h3>
          <div className="h-[350px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                   <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#F97316" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" hide />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                <Area type="monotone" dataKey="total_revenue" stroke="#F97316" strokeWidth={5} fill="url(#colorOrange)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. DONUT & TABLE: Deep Blue Theme */}
      <section className="grid gap-6 lg:grid-cols-3 mt-10">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-blue-50 flex flex-col items-center">
          <h3 className="text-[11px] font-black uppercase text-blue-800 tracking-widest mb-8 self-start">Product Distribution</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={top?.slice(0,5)} dataKey="revenue" nameKey="product_name" innerRadius={80} outerRadius={105} paddingAngle={10}>
                  {top?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-blue-900">${(top.reduce((a,b)=>a+b.revenue,0)/1000).toFixed(1)}k</span>
              <span className="text-[10px] font-bold text-orange-500 uppercase">Top Sales</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-blue-50 overflow-hidden">
          <div className="p-8 border-b border-blue-50 flex justify-between items-center bg-blue-50/20">
            <h3 className="text-lg font-black text-blue-900">{t("recentSales")}</h3>
            <button onClick={() => navigate("/reports")} className="text-orange-600 font-black text-xs uppercase tracking-widest hover:text-blue-700 transition-colors">Full Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">
                <tr><th className="px-8 py-5">Item</th><th className="px-8 py-5">Amount</th><th className="px-8 py-5 text-right">Payment</th></tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {recent?.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-800">{s.product_name}</td>
                    <td className="px-8 py-6 font-black text-blue-700">{formatMoney(s.total)}</td>
                    <td className="px-8 py-6 text-right"><span className="bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-orange-100">{s.payment_type}</span></td>
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
