import React, { useEffect, useMemo, useState } from "react";
import { 
  Search, Plus, BarChart3, ShoppingBag, CreditCard, DollarSign, 
  WalletCards, Bell, Settings, Clock, ArrowUpRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from "recharts";
import { apiRequest, formatMoney, monthISO, todayISO } from "../lib/api";
import { LoadingState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";

const COLORS = ["#5b3ff2", "#2f7df6", "#14c6a4", "#ffb84d", "#ff6b6b"];

// Small sparkline for the metric cards
const Spark = ({ data, color }) => (
  <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

function MetricCard({ title, value, helper, icon: Icon, featured = false, sparkData, color }) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 shadow-sm border ${featured ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-900 border-slate-100"}`}>
      <Spark data={sparkData} color={featured ? "#fff" : color} />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <p className={`text-xs font-bold uppercase tracking-widest ${featured ? "text-blue-100" : "text-slate-400"}`}>{title}</p>
          <div className={`p-2 rounded-xl ${featured ? "bg-white/20" : "bg-slate-50"}`}><Icon size={18} color={featured ? "white" : color} /></div>
        </div>
        <h2 className="text-3xl font-black mb-1">{featured ? "" : "$"}{value.toLocaleString()}</h2>
        <p className={`text-xs ${featured ? "text-blue-100" : "text-slate-400"}`}>{helper}</p>
      </div>
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
          apiRequest("/sales?limit=8").then(r => r.data),
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
  const sparkItems = daily.map(d => ({ v: d.total_revenue }));

  return (
    <div className="min-h-screen bg-[#f4f7ff] p-6 space-y-8">
      
      {/* 1. SEARCH BAR ON TOP */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 shadow-sm border-none outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
            placeholder="Raadi iib, alaab, ama macmiil..." 
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-sm text-slate-500 font-bold hidden md:block">
            {shop?.shop_name} — {new Date().toLocaleDateString('so-SO', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <button className="p-3 bg-white rounded-2xl shadow-sm text-slate-400"><Settings size={20}/></button>
          <button className="p-3 bg-white rounded-2xl shadow-sm text-slate-400"><Bell size={20}/></button>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">SA</div>
        </div>
      </div>

      <section>
        <h1 className="text-4xl font-black text-slate-900">Salaan!</h1>
        <p className="text-slate-500 font-medium">Tani waa waxa ka socda dukaankaaga bishan</p>
      </section>

      {/* 2. ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate("/sale")} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition">
          <Plus size={20}/> Iib Cusub
        </button>
        <button onClick={() => navigate("/inventory")} className="flex items-center gap-2 bg-white text-slate-700 px-8 py-3 rounded-2xl font-bold border border-slate-100 hover:bg-slate-50 transition">
          <Plus size={20}/> Ku dar Alaab
        </button>
        <button onClick={() => navigate("/reports")} className="flex items-center gap-2 bg-white text-slate-700 px-8 py-3 rounded-2xl font-bold border border-slate-100 hover:bg-slate-50 transition">
          Eeg Warbixinno
        </button>
      </div>

      {/* 3. METRIC CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Iibka Maanta" value={todayRevenue} helper="Compared to 7-day avg" icon={ShoppingBag} featured sparkData={sparkItems} />
        <MetricCard title="Dakhliga Guud" value={profit?.revenue || 0} helper="This month vs last" icon={DollarSign} color="#2563eb" sparkData={sparkItems} />
        <MetricCard title="Dayn" value={credits?.total_amount_owed || 0} helper="Unpaid or partial" icon={CreditCard} color="#f59e0b" sparkData={sparkItems.map(s => ({ v: s.v * 0.2 }))} />
        <MetricCard title="Faa'iido Saafi ah" value={profit?.net_profit || 0} helper="After expenses" icon={WalletCards} color="#10b981" sparkData={sparkItems.map(s => ({ v: s.v * 0.4 }))} />
      </div>

      {/* 4. CHARTS IN THE MIDDLE */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Products Pie Chart */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50">
          <h3 className="text-sm font-black uppercase text-slate-400 mb-6">Alaabta ugu iibka badan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={top?.slice(0,5)} dataKey="revenue" nameKey="product_name" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {top?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Graph */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50">
          <h3 className="text-sm font-black uppercase text-slate-400 mb-6">Garaafka Dakhliga</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <XAxis dataKey="date" hide />
                <Tooltip />
                <Area type="monotone" dataKey="total_revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Graph */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50">
          <h3 className="text-sm font-black uppercase text-slate-400 mb-6">Garaafka Faa'iidada</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <XAxis dataKey="date" hide />
                <Tooltip />
                <Area type="monotone" dataKey="total_revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. RECENT SALES */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900">Iibiyadii u dambeeyey</h3>
          <button onClick={() => navigate("/reports")} className="text-blue-600 font-bold hover:underline">Eeg dhammaan</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-8 py-4">Waqtiga</th>
                <th className="px-8 py-4">Alaabta</th>
                <th className="px-8 py-4">Lacagta</th>
                <th className="px-8 py-4">Nooca</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recent?.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="px-8 py-5 text-slate-400 font-medium">
                    {new Date(s.sale_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-900">{s.product_name}</td>
                  <td className="px-8 py-5 font-black text-blue-600">{formatMoney(s.total)}</td>
                  <td className="px-8 py-5">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{s.payment_type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
