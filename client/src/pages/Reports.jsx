import React, { useEffect, useState, useMemo } from "react";
import { 
  BarChart3, 
  Receipt as ReceiptIcon, 
  Trash2, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  CreditCard, 
  Wallet,
  ArrowUpRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { apiRequest, formatMoney, todayISO } from "../lib/api";
import { EmptyState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";
import Receipt from "../components/Receipt.jsx";

// Custom Card for Interactive Stats
const InteractiveStat = ({ label, value, helper, icon: Icon, colorClass, delay }) => (
  <div 
    className={`group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
        <h3 className="mt-2 text-2xl font-black text-slate-900">{value}</h3>
      </div>
      <div className={`rounded-2xl p-3 ${colorClass} transition-transform group-hover:scale-110`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <p className="mt-4 text-xs font-bold text-slate-400">{helper}</p>
  </div>
);

export default function Reports() {
  const [reportDate, setReportDate] = useState(todayISO());
  const [daily, setDaily] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [profit, setProfit] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "", deletingSaleId: "" });
  const [receiptSale, setReceiptSale] = useState(null);
  const shop = getCurrentShop();

  async function loadReports(selectedDate = reportDate) {
    setStatus({ loading: true, error: "" });
    const selectedMonth = selectedDate.slice(0, 7);
    const from = `${selectedMonth}-01`;
    const to = todayISO();

    try {
      const [dailyReport, profitReport, topReport, todaySalesReport] = await Promise.all([
        apiRequest("/reports/daily"),
        apiRequest(`/reports/profit?month=${selectedMonth}`),
        apiRequest(`/reports/top-products?from=${from}&to=${to}`),
        apiRequest(`/sales?from=${selectedDate}T00:00:00.000Z&to=${selectedDate}T23:59:59.999Z&limit=100`)
      ]);
      setDaily(dailyReport.data || []);
      setProfit(profitReport.data || null);
      setTopProducts(topReport.data || []);
      setDailySales(todaySalesReport.data || []);
    } catch (error) {
      setStatus({ loading: false, error: error.message, deletingSaleId: "" });
      return;
    }
    setStatus({ loading: false, error: "", deletingSaleId: "" });
  }

  async function removeSale(saleId) {
    if (!window.confirm("Remove this sale and restore stock?")) return;
    setStatus((c) => ({ ...c, deletingSaleId: saleId }));
    try {
      await apiRequest(`/sales/${saleId}`, { method: "DELETE" });
      await loadReports(reportDate);
    } catch (error) {
      setStatus({ loading: false, error: error.message, deletingSaleId: "" });
    }
  }

  function openReceipt(sale) {
    setReceiptSale({
      productName: sale.product_name,
      quantity_sold: sale.quantity_sold,
      selling_price: sale.quantity_sold ? Number(sale.total) / Number(sale.quantity_sold) : sale.total,
      payment_type: sale.payment_type,
      customer_name: sale.customer_name,
      customer_phone: sale.customer_phone,
      sale_date: sale.sale_date,
      receipt_no: sale.id
    });
  }

  useEffect(() => { loadReports(reportDate); }, []);

  const todaySalesTotal = dailySales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const totalItemsSold = dailySales.reduce((sum, s) => sum + Number(s.quantity_sold || 0), 0);
  const cashRevenue = dailySales.filter(s => s.payment_type === "cash").reduce((sum, s) => sum + Number(s.total || 0), 0);
  const creditRevenue = dailySales.filter(s => s.payment_type === "credit").reduce((sum, s) => sum + Number(s.total || 0), 0);
  const maxProductRevenue = Math.max(...topProducts.map(p => Number(p.revenue || 0)), 1);

  function formatDayLabel(dateValue) {
    return new Date(`${dateValue}T00:00:00`).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      {/* HEADER CONTROLS */}
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Intelligence</h1>
          <p className="text-sm font-semibold text-slate-400">Review your shop performance and data insights.</p>
        </div>
        <div className="flex gap-2">
          <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" type="date" value={reportDate} onChange={(e) => { setReportDate(e.target.value); loadReports(e.target.value); }} />
          <button className="rounded-xl bg-blue-600 px-6 py-2 font-bold text-white transition hover:bg-blue-700" onClick={() => loadReports(reportDate)} disabled={status.loading}>
            {status.loading ? "Loading..." : "Sync Reports"}
          </button>
        </div>
      </section>

      {/* TOP ROW STATS (INTERACTIVE) */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InteractiveStat label="Monthly Revenue" value={formatMoney(profit?.revenue)} helper={`${reportDate.slice(0, 7)} Summary`} icon={TrendingUp} colorClass="bg-blue-50 text-blue-600" delay={0} />
        <InteractiveStat label="Cost of Goods" value={formatMoney(profit?.cost_of_goods_sold)} helper="Inventory Costs" icon={Package} colorClass="bg-slate-100 text-slate-600" delay={100} />
        <InteractiveStat label="Expenses" value={formatMoney(profit?.total_expenses)} helper="Operational Costs" icon={Wallet} colorClass="bg-rose-50 text-rose-600" delay={200} />
        <InteractiveStat label="Net Profit" value={formatMoney(profit?.net_profit)} helper="Real Earnings" icon={ArrowUpRight} colorClass="bg-emerald-50 text-emerald-600" delay={300} />
      </section>

      {/* SECOND ROW STATS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InteractiveStat label="Transactions" value={dailySales.length} helper="Sales Count" icon={ReceiptIcon} colorClass="bg-purple-50 text-purple-600" delay={400} />
        <InteractiveStat label="Items Handled" value={totalItemsSold} helper="Total units sold" icon={ShoppingBag} colorClass="bg-orange-50 text-orange-600" delay={500} />
        <InteractiveStat label="Cash In Hand" value={formatMoney(cashRevenue)} helper="Direct Payment" icon={Wallet} colorClass="bg-blue-50 text-blue-600" delay={600} />
        <InteractiveStat label="On Credit" value={formatMoney(creditRevenue)} helper="Pending Collection" icon={CreditCard} colorClass="bg-amber-50 text-amber-600" delay={700} />
      </section>

      {/* MAIN CHART SECTION */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* REVENUE PITCH GRAPH */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Revenue Pitch (7 Days)</h2>
            <BarChart3 className="text-blue-600 h-5 w-5" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickFormatter={(val) => val.slice(8,10)} axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  formatter={(val) => [formatMoney(val), 'Revenue']}
                />
                <Area type="monotone" dataKey="total_revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP PRODUCTS PROGRESS */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-black text-slate-900">Top Performing Products</h2>
          </div>
          <div className="space-y-4">
            {topProducts.length === 0 ? <EmptyState title="No data yet" /> : 
              topProducts.slice(0, 5).map((product, i) => (
                <div key={product.product_id} className="group relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-black text-slate-700">{i + 1}. {product.product_name}</span>
                    <span className="text-sm font-black text-blue-600">{formatMoney(product.revenue)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-50 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-blue-600 transition-all duration-1000" 
                      style={{ width: `${(Number(product.revenue) / maxProductRevenue) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.quantity_sold} Units Sold</p>
                </div>
              ))
            }
          </div>
        </div>
      </section>

      {/* SALES TABLE PANEL */}
      <section className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between bg-slate-50/30">
          <div>
            <h2 className="text-lg font-black text-slate-900">Detailed Daily Report</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formatDayLabel(reportDate)}</p>
          </div>
          <div className="rounded-2xl bg-white border border-blue-100 px-6 py-3 text-right shadow-sm">
            <p className="text-[10px] font-black uppercase text-blue-600">Day Settlement</p>
            <p className="text-xl font-black text-slate-900">{formatMoney(todaySalesTotal)}</p>
          </div>
        </div>

        {dailySales.length === 0 ? (
          <div className="p-10"><EmptyState title="No transactions found" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dailySales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900">{sale.product_name}</p>
                      <p className="text-[10px] font-bold text-slate-400">QTY: {sale.quantity_sold}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700">{sale.customer_name || "Walk-in"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900">{formatMoney(sale.total)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${sale.payment_type === 'cash' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                        {sale.payment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(sale.sale_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openReceipt(sale)} className="p-2 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all text-blue-600">
                          <ReceiptIcon size={16} />
                        </button>
                        <button onClick={() => removeSale(sale.id)} className="p-2 rounded-xl border border-slate-100 hover:bg-rose-50 hover:text-rose-600 transition-all text-slate-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {receiptSale && <Receipt sale={receiptSale} shop={shop} onClose={() => setReceiptSale(null)} />}
    </div>
  );
}
