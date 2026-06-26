import React, { useEffect, useState } from "react";
import { 
  Search, Plus, BarChart3, ShoppingBag, CreditCard, DollarSign, 
  WalletCards, Bell, Settings, TrendingUp 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid 
} from "recharts";
import { apiRequest, formatMoney, monthISO, todayISO } from "../lib/api";
import { LoadingState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";

const COLORS = ["#5b3ff2", "#2f7df6", "#14c6a4", "#ffb84d", "#ff6b6b"];

function MetricCard({ title, value, helper, icon: Icon, featured = false, color }) {
  return (
    <div className={`rounded-[2rem] p-6 shadow-sm border transition-transform hover:scale-[1.02] ${featured ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-900 border-slate-100"}`}>
      <div className="flex justify-between items-start mb-4">
        <p className={`text-[10px] font-extrabold uppercase tracking-widest ${featured ? "text-blue-100" : "text-slate-400"}`}>{title}</p>
        <div className={`p-2 rounded-xl ${featured ? "bg-white/20" : "bg-slate-50"}`}><Icon size={18} color={featured ? "white" : color} /></div>
      </div>
      <h2 className="text-3xl font-black mb-1">{featured ? "" : "$"}{value.toLocaleString()}</h2>
      <p className={`text-[10px] font-bold ${featured ? "text-blue-100" : "text-slate-400"}`}>{helper}</p>
    </div>
  );
}

export default function Dashboard() {
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
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  if (state.loading) return <LoadingState />;

  const { daily, profit, top, recent, credits } = state.data;
  const todayRevenue = daily[daily.length - 1]?.total_revenue || 0;

  return (
    <div className="min-h-screen bg-[#f4f7ff] p-6 space-y-8">
      
      {/* 1. SEARCH BAR & HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 shadow-sm border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm" placeholder="Raadi iib, alaab, ama macmiil..." />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white rounded-2xl shadow-sm text-slate-400"><Settings size={20}/></button>
          <button className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 relative">
             <Bell size={20}/>
             <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">SA</div>
        </div>
      </div>

      <section>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Salaan!</h1>
        <p className="text-slate-500 font-bold">Maareynta dukaankaaga oo fudud.</p>
      </section>

      {/* 2. ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate("/sale")} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition">
          <Plus size={20} strokeWidth={3}/> Iib Cusub
        </button>
        <button onClick={() => navigate("/inventory")} className="flex items-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-2xl font-black border border-slate-100 hover:bg-slate-50 transition">
          <Plus size={20}/> Ku dar Alaab
        </button>
        <button onClick={() => navigate("/reports")} className="flex items-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-2xl font-black border border-slate-100 hover:bg-slate-50 transition">
          Eeg Warbixinno
        </button>
      </div>

      {/* 3. METRIC CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Iibka Maanta" value={todayRevenue} helper="Iibka guud ee maanta" icon={ShoppingBag} featured />
        <MetricCard title="Dakhliga Guud" value={profit?.revenue || 0} helper="Dakhliga bishan" icon={DollarSign} color="#2563eb" />
        <MetricCard title="Dayn" value={credits?.total_amount_owed || 0} helper="Lacagta v maqan" icon={CreditCard} color="#f59e0b" />
        <MetricCard title="Faa'iido Saafi ah" value={profit?.net_profit || 0} helper="Faa'iidada dhabta ah" icon={WalletCards} color="#10b981" />
      </div>

      {/* 4. BIG GRAPHS SIDE-BY-SIDE */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* BIG Revenue Graph */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">Garaafka Dakhliga Guud</h3>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <div className="h-[400px]"> {/* Increased height */}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}} />
                <Area type="monotone" dataKey="total_revenue" stroke="#3b82f6" strokeWidth={4} fill="rgba(59, 130, 246, 0.08)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BIG Profit Graph */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">Garaafka Faa'iidada Saafi ah</h3>
            <TrendingUp className="text-emerald-500" size={20} />
          </div>
          <div className="h-[400px]"> {/* Increased height */}
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

      {/* 5. PIE CHART AND RECENT SALES DOWN */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie Chart */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
          <h3 className="text-sm font-black uppercase text-slate-400 mb-8 tracking-widest">Alaabta ugu iibka badan</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={top?.slice(0,5)} dataKey="revenue" nameKey="product_name" innerRadius={70} outerRadius={95} paddingAngle={8}>
                  {top?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900">Iibiyadii u dambeeyey</h3>
            <button onClick={() => navigate("/reports")} className="text-blue-600 font-black text-sm hover:underline">Eeg Dhammaan</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <tr>
                  <th className="px-8 py-5">Alaabta</th>
                  <th className="px-8 py-5">Lacagta</th>
                  <th className="px-8 py-5">Nooca</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recent?.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="px-8 py-6 font-bold text-slate-900">{s.product_name}</td>
                    <td className="px-8 py-6 font-black text-blue-600">{formatMoney(s.total)}</td>
                    <td className="px-8 py-6">
                      <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase">{s.payment_type}</span>
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
