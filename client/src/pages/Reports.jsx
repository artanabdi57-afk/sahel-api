import React from "react";
import { useEffect, useState } from "react";
import { BarChart3, Receipt as ReceiptIcon, Trash2, Trophy } from "lucide-react";
import { apiRequest, formatMoney, todayISO } from "../lib/api";
import StatCard from "../components/StatCard";
import { EmptyState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";
import Receipt from "../components/Receipt.jsx";

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
    const confirmed = window.confirm("Remove this sale and restore the product stock?");
    if (!confirmed) return;

    setStatus((current) => ({ ...current, error: "", deletingSaleId: saleId }));

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

  useEffect(() => {
    loadReports(reportDate);
  }, []);

  const maxDaily = Math.max(...daily.map((day) => Number(day.total_revenue || 0)), 1);
  const todaySalesTotal = dailySales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const totalItemsSold = dailySales.reduce((sum, sale) => sum + Number(sale.quantity_sold || 0), 0);
  const cashRevenue = dailySales
    .filter((sale) => sale.payment_type === "cash")
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const creditRevenue = dailySales
    .filter((sale) => sale.payment_type === "credit")
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const averageSale = dailySales.length ? todaySalesTotal / dailySales.length : 0;

  function formatDayLabel(dateValue) {
    return new Date(`${dateValue}T00:00:00`).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function chooseReportDate(nextDate) {
    setReportDate(nextDate);
    loadReports(nextDate);
  }

  return (
    <div className="w-full max-w-none space-y-5">
      <section className="panel p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">Performance Reports</h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="field" type="date" value={reportDate} onChange={(e) => chooseReportDate(e.target.value)} />
            <button className="btn-primary" onClick={() => loadReports(reportDate)} disabled={status.loading}>
              Load
            </button>
          </div>
        </div>
        {status.error ? <p className="mt-3 text-sm text-red-600">{status.error}</p> : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatMoney(profit?.revenue)} helper={reportDate.slice(0, 7)} icon={BarChart3} />
        <StatCard label="COGS" value={formatMoney(profit?.cost_of_goods_sold)} helper="Cost of goods sold" />
        <StatCard label="Expenses" value={formatMoney(profit?.total_expenses)} helper="Monthly total" />
        <StatCard label="Net Profit" value={formatMoney(profit?.net_profit)} helper="Revenue minus costs" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sales Count" value={dailySales.length} helper={formatDayLabel(reportDate)} />
        <StatCard label="Items Sold" value={totalItemsSold} helper="Quantity sold" />
        <StatCard label="Cash Sales" value={formatMoney(cashRevenue)} helper="Paid now" />
        <StatCard label="Credit Sales" value={formatMoney(creditRevenue)} helper={`Avg sale ${formatMoney(averageSale)}`} />
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">Sales Report - {formatDayLabel(reportDate)}</h2>
            <p className="text-sm text-slate-500">Remove a wrong sale here. Stock will be added back automatically.</p>
          </div>
          <div className="rounded-lg bg-blue-50 px-4 py-2 text-right">
            <p className="text-xs font-semibold uppercase text-blue-600">Day total</p>
            <p className="text-lg font-bold text-slate-950">{formatMoney(todaySalesTotal)}</p>
          </div>
        </div>

        {dailySales.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No sales today" description="Sales recorded today will appear here." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Qty</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailySales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-950">{sale.product_name}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{sale.customer_name || "Walk-in"}</p>
                      <p className="text-xs text-slate-500">{sale.customer_phone || "N/A"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{sale.quantity_sold}</td>
                    <td className="px-4 py-3 font-semibold text-slate-950">{formatMoney(sale.total)}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{sale.payment_type}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sale.status === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(sale.sale_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 text-blue-600 transition hover:bg-blue-50"
                          onClick={() => openReceipt(sale)}
                          title="Print receipt"
                        >
                          <ReceiptIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          onClick={() => removeSale(sale.id)}
                          disabled={status.deletingSaleId === sale.id}
                          title="Remove sale"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="panel p-4">
          <h2 className="mb-1 text-base font-bold text-slate-950">Last 7 Days</h2>
          <p className="mb-4 text-sm text-slate-500">Click a day to show its full sales report.</p>
          <div className="space-y-3">
            {daily.map((day) => (
              <button
                key={day.date}
                type="button"
                className={`grid w-full grid-cols-[220px_1fr_92px] items-center gap-3 rounded-lg p-2 text-left text-sm transition hover:bg-slate-50 ${reportDate === day.date ? "bg-blue-50" : ""}`}
                onClick={() => chooseReportDate(day.date)}
                title="Click to load this day"
              >
                <span className={reportDate === day.date ? "font-semibold text-blue-700" : "text-slate-500"}>{formatDayLabel(day.date)}</span>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${(Number(day.total_revenue || 0) / maxDaily) * 100}%` }} />
                </div>
                <span className="text-right font-semibold text-slate-950">{formatMoney(day.total_revenue)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel p-4">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-950">Top Products</h2>
          </div>
          {topProducts.length === 0 ? (
            <EmptyState title="No product sales yet" description="Top products will appear after sales are recorded." />
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 6).map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {index + 1}. {product.product_name || product.product_id}
                    </p>
                    <p className="text-sm text-slate-500">{product.quantity_sold} sold</p>
                  </div>
                  <p className="font-bold text-blue-700">{formatMoney(product.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {receiptSale ? (
        <Receipt sale={receiptSale} shop={shop} onClose={() => setReceiptSale(null)} />
      ) : null}
    </div>
  );
}
