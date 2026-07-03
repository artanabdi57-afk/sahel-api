import React, { useEffect, useState } from "react";
import {
  Search, Plus, ShoppingBag, CreditCard, DollarSign,
  Wallet, Bell, Settings, TrendingUp, BarChart3, Users, Package,
  Printer, X, AlertTriangle, PackageX
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { apiRequest, formatMoney, monthISO, todayISO } from "../lib/api";
import { LoadingState } from "../components/AsyncState";
import { useLanguage } from "../lib/i18n";

const COLORS = ["#1E40AF", "#3B82F6", "#F97316", "#FB923C", "#60A5FA"];

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setValue(Math.round(start));
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return value;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "#fff", border: "1px solid #E2EBFF", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "#0F1F45", boxShadow: "0 4px 16px rgba(30,64,175,0.08)" }}>
        <div style={{ fontWeight: 700 }}>{formatMoney(payload[0].value)}</div>
        <div style={{ color: "#A0B3D6", fontSize: 10, marginTop: 2 }}>{label}</div>
      </div>
    );
  }
  return null;
};

const payChipStyle = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "cash") return { background: "#E6F5EE", color: "#15803D" };
  if (t === "credit") return { background: "#FFF2E8", color: "#C2550A" };
  return { background: "#EEF2FF", color: "#1E40AF" };
};

// Sales rows from the API may use different field names for the date
// depending on what the backend serializer returns. Check the common ones.
function saleDateString(sale) {
  const raw = sale.created_at || sale.sale_date || sale.date || sale.createdAt;
  if (!raw) return null;
  try {
    return new Date(raw).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, data: null });

  // Today's Sales print modal
  const [salesModal, setSalesModal] = useState({ open: false, loading: false, rows: [], error: "" });

  // Notification dropdown
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifState, setNotifState] = useState({ loading: false, overdueCredits: [], loaded: false, error: "" });

  useEffect(() => {
    async function load() {
      try {
        const [daily, profit, top, recent, credits, products] = await Promise.all([
          apiRequest("/reports/daily").then(r => r.data),
          apiRequest(`/reports/profit?month=${monthISO()}`).then(r => r.data),
          apiRequest(`/reports/top-products?from=${monthISO()}-01&to=${todayISO()}`).then(r => r.data),
          apiRequest("/sales?limit=5").then(r => r.data),
          apiRequest("/credits/summary").then(r => r.data),
          apiRequest("/products").then(r => r.data),
        ]);
        setState({ loading: false, data: { daily, profit, top, recent, credits, products } });
      } catch (e) {
        console.error(e);
        setState({ loading: false, data: null });
      }
    }
    load();
  }, []);

  async function openTodaySales() {
    setSalesModal({ open: true, loading: true, rows: [], error: "" });
    try {
      // Reuse the same /sales endpoint already used for Recent Sales, just pull
      // more rows and filter to today's date on the client.
      const res = await apiRequest("/sales?limit=500");
      const all = res.data || [];
      const today = todayISO();
      const todaysRows = all.filter(s => {
        const d = saleDateString(s);
        return d ? d === today : true; // if no date field found, don't silently drop everything
      });
      setSalesModal({ open: true, loading: false, rows: todaysRows, error: "" });
    } catch (err) {
      setSalesModal({ open: true, loading: false, rows: [], error: err.message || "Could not load today's sales" });
    }
  }

  async function toggleNotifications() {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening && !notifState.loaded) {
      setNotifState(s => ({ ...s, loading: true }));
      try {
        const res = await apiRequest("/credits?status=overdue");
        setNotifState({ loading: false, overdueCredits: res.data || [], loaded: true, error: "" });
      } catch (err) {
        setNotifState({ loading: false, overdueCredits: [], loaded: true, error: err.message || "Could not load overdue credits" });
      }
    }
  }

  if (state.loading) return <LoadingState />;
  if (!state.data) return <div style={{ padding: 40, color: "#6B87C4", textAlign: "center" }}>Could not load dashboard.</div>;

  const { daily, profit, top, recent, credits, products } = state.data;
  const lowStock = products.filter(p => Number(p.quantity) <= Number(p.low_stock_threshold));
  const todayRevenue = daily[daily.length - 1]?.total_revenue || 0;
  const monthRevenue = profit?.revenue || 0;
  const totalCredits = credits?.total_amount_owed || 0;
  const netProfit = profit?.net_profit || 0;
  const margin = monthRevenue > 0 ? Math.round((netProfit / monthRevenue) * 100) : 0;
  const topTotal = (top || []).reduce((a, b) => a + b.revenue, 0);
  const notifCount = lowStock.length + (notifState.loaded ? notifState.overdueCredits.length : 0);

  const iconBtn = {
    background: "#fff", border: "1px solid #D6E0FF", borderRadius: 10,
    width: 36, height: 36, display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", color: "#2B5CE6", flexShrink: 0
  };

  const chartCard = (extra = {}) => ({
    background: "#fff", border: "1px solid #E2EBFF", borderRadius: 14, padding: 18, ...extra
  });

  const Badge = ({ label, orange }) => (
    <span style={{ fontSize: 10, fontWeight: 600, background: orange ? "#FFF2E8" : "#EEF2FF", color: orange ? "#C2550A" : "#2B5CE6", padding: "3px 9px", borderRadius: 20 }}>
      {label}
    </span>
  );

  const ChartHeader = ({ title, badge, orange }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#0F1F45" }}>{title}</span>
      <Badge label={badge} orange={orange} />
    </div>
  );

  const barChartEl = (height) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={daily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#EEF2FF" />
        <XAxis dataKey="date" hide />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F7F9FF" }} />
        <Bar dataKey="total_revenue" fill="#1E40AF" radius={[6, 6, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );

  const areaChartEl = (height) => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={daily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F97316" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#EEF2FF" />
        <XAxis dataKey="date" hide />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="total_revenue" stroke="#F97316" strokeWidth={2} fill="url(#profitGrad)" dot={{ r: 3, fill: "#F97316", strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );

  const donutEl = (size) => (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={top?.slice(0, 5)} dataKey="revenue" nameKey="product_name" innerRadius={size * 0.35} outerRadius={size * 0.48} paddingAngle={6}>
            {top?.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
          </Pie>
          <Tooltip formatter={(v) => formatMoney(v)} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <span style={{ fontSize: size > 150 ? 16 : 13, fontWeight: 700, color: "#0F1F45" }}>${(topTotal / 1000).toFixed(1)}k</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#F97316", textTransform: "uppercase" }}>Top Sales</span>
      </div>
    </div>
  );

  const legendEl = top?.slice(0, 5).map((item, i) => (
    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6B87C4", marginBottom: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i], flexShrink: 0 }} />
      {item.product_name}
    </div>
  ));

  const salesTableEl = (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#FAFBFF" }}>
          {["Product", "Amount", "Payment"].map((h, i) => (
            <th key={h} style={{ fontSize: 9, fontWeight: 700, color: "#A0B3D6", textTransform: "uppercase", letterSpacing: "0.8px", padding: "10px 14px", textAlign: i === 2 ? "right" : "left" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {recent?.map((s) => (
          <tr key={s.id} style={{ borderTop: "1px solid #F0F4FF" }}
            onMouseEnter={e => e.currentTarget.style.background = "#F7F9FF"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          >
            <td style={{ padding: "11px 14px", fontSize: 12, color: "#0F1F45", fontWeight: 500 }}>{s.product_name}</td>
            <td style={{ padding: "11px 14px", fontSize: 12, color: "#1E40AF", fontWeight: 700 }}>{formatMoney(s.total)}</td>
            <td style={{ padding: "11px 14px", textAlign: "right" }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, ...payChipStyle(s.payment_type) }}>
                {s.payment_type}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const actions = [
    { label: t("quickNewSale") || "New Sale", path: "/sale", bg: "#1E40AF", color: "#fff", border: "none" },
    { label: t("addProduct") || "Add Product", path: "/inventory", bg: "#fff", color: "#1E40AF", border: "1.5px solid #D6E0FF" },
    { label: t("viewReports") || "View Reports", path: "/reports", bg: "#F97316", color: "#fff", border: "none" },
    { label: "Customers", path: "/credits", bg: "#fff", color: "#1E40AF", border: "1.5px solid #D6E0FF" },
  ];

  const todaySalesTotal = salesModal.rows.reduce((s, r) => s + Number(r.total || 0), 0);

  return (
    <div style={{ background: "#F0F4FF", minHeight: "100vh", fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>

      <style>{`
        .dash-inner { padding: 18px; }
        .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 12px; }
        .dash-search { position: relative; flex: 1; max-width: 300px; }
        .dash-search input { width: 100%; background: #fff; border: 1px solid #D6E0FF; border-radius: 10px; padding: 9px 14px 9px 36px; font-size: 12px; font-family: inherit; color: #1a2340; outline: none; box-sizing: border-box; }
        .dash-search .s-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #6B87C4; }

        /* Desktop: 4-col cards */
        .cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .bottom-row { display: grid; grid-template-columns: 1fr 2fr; gap: 12px; }
        .actions-row { display: flex; gap: 8px; margin-bottom: 20px; }
        .actions-row button { flex: 1; }

        /* Mobile */
        @media (max-width: 640px) {
          .dash-inner { padding: 14px; }
          .dash-header { margin-bottom: 14px; }
          .dash-search { max-width: none; }
          .btn-settings { display: none; }

          /* Actions: 2x2 grid */
          .actions-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

          /* Cards: Today Sales full width, then 2x2 grid for the rest */
          .cards-grid { grid-template-columns: 1fr 1fr; }
          .card-today-sales { grid-column: 1 / -1; }

          /* Charts: stacked */
          .charts-row { grid-template-columns: 1fr; gap: 10px; margin-bottom: 10px; }

          /* Bottom: stacked */
          .bottom-row { grid-template-columns: 1fr; gap: 10px; }
          .donut-side { flex-direction: row !important; align-items: center; gap: 16px; }
          .donut-side-inner { width: 140px !important; height: 140px !important; }
        }

        /* Print: only show the printable sales sheet */
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="dash-inner">

        {/* Header */}
        <div className="dash-header">
          <div className="dash-search">
            <Search size={14} className="s-icon" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6B87C4" }} />
            <input placeholder={t("searchPlaceholder") || "Search products, sales…"} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="btn-settings" onClick={() => navigate("/settings")} style={iconBtn}>
              <Settings size={16} />
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={toggleNotifications} style={iconBtn}><Bell size={16} /></button>
              {notifCount > 0 && <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, background: "#F97316", borderRadius: "50%", border: "1.5px solid #fff" }} />}

              {notifOpen && (
                <>
                  <div onClick={() => setNotifOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 90 }} />
                  <div style={{ position: "absolute", top: 44, right: 0, width: 300, maxHeight: 380, overflowY: "auto", background: "#fff", border: "1px solid #E2EBFF", borderRadius: 14, boxShadow: "0 12px 32px rgba(15,31,69,0.14)", zIndex: 100 }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #F0F4FF", fontSize: 12, fontWeight: 700, color: "#0F1F45" }}>
                      Notifications
                    </div>

                    {lowStock.length === 0 && notifState.loaded && notifState.overdueCredits.length === 0 && (
                      <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "#A0B3D6" }}>You're all caught up.</div>
                    )}

                    {lowStock.length > 0 && (
                      <div>
                        <div style={{ padding: "10px 16px 4px", fontSize: 10, fontWeight: 700, color: "#A0B3D6", textTransform: "uppercase" }}>Low / Out of Stock</div>
                        {lowStock.map(p => (
                          <div key={p.id} onClick={() => { setNotifOpen(false); navigate("/inventory"); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", cursor: "pointer" }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#FFF2E8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <PackageX size={14} color="#C2550A" />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#0F1F45", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                              <div style={{ fontSize: 10, color: "#C2550A" }}>{Number(p.quantity)} left</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {notifState.loading && (
                      <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: "#A0B3D6" }}>Loading overdue customers…</div>
                    )}

                    {!notifState.loading && notifState.overdueCredits.length > 0 && (
                      <div>
                        <div style={{ padding: "10px 16px 4px", fontSize: 10, fontWeight: 700, color: "#A0B3D6", textTransform: "uppercase" }}>Overdue Customers</div>
                        {notifState.overdueCredits.map(c => (
                          <div key={c.id} onClick={() => { setNotifOpen(false); navigate("/credits"); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 16px", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <AlertTriangle size={14} color="#B91C1C" />
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#0F1F45", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.customer_name}</div>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#B91C1C", flexShrink: 0 }}>{formatMoney(c.amount_owed)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div onClick={() => navigate("/profile")} style={{ width: 36, height: 36, background: "#1E40AF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              SA
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: 14 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F1F45", margin: 0 }}>Good morning 👋</h1>
          <p style={{ fontSize: 12, color: "#6B87C4", marginTop: 3 }}>Here's your shop overview for today</p>
        </div>

        {/* Quick Actions */}
        <div className="actions-row">
          {actions.map(btn => (
            <button key={btn.path} onClick={() => navigate(btn.path)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: btn.bg, color: btn.color, border: btn.border }}>
              <Plus size={12} /> {btn.label}
            </button>
          ))}
        </div>

        {/* Cards — single unified grid, responsive */}
        <div className="cards-grid" style={{ marginBottom: 20 }}>
          {/* Today's Sales — spans full width on mobile, click to view + print */}
          <div className="card-today-sales" style={{ background: "#1E40AF", borderRadius: 14, padding: 16, cursor: "pointer" }}
            onClick={openTodaySales}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,64,175,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.65)" }}>
                {t("todaySales") || "Today's Sales"}
              </span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShoppingBag size={16} color="#fff" />
              </div>
            </div>
            <AnimatedValue value={todayRevenue} style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.8px", marginBottom: 3 }} />
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginBottom: 10 }}>Tap to view &amp; print</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: "rgba(255,255,255,0.18)", color: "#fff" }}>
              <TrendingUp size={11} /> +12% vs yesterday
            </div>
          </div>

          {/* Monthly Revenue */}
          <DesktopCard title={t("totalRevenue") || "Monthly Revenue"} value={monthRevenue} sub="Gross income" icon={DollarSign} chip="↑ +8% vs last month" />

          {/* Credits */}
          <DesktopCard title={t("credits") || "Outstanding Credits"} value={totalCredits} sub="Pending collection" icon={CreditCard} chip="⚠ 3 overdue" chipWarn orange />

          {/* Net Profit */}
          <DesktopCard title={t("netProfit") || "Net Profit"} value={netProfit} sub="Actual earnings" icon={Wallet} chip={`Margin ${margin}%`} greenIcon />
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          <div style={chartCard()}>
            <ChartHeader title={`${t("totalRevenue") || "Revenue"} Performance`} badge="This month" />
            <div style={{ position: "relative", width: "100%", height: 180 }}>{barChartEl(180)}</div>
          </div>
          <div style={chartCard()}>
            <ChartHeader title={`${t("netProfit") || "Profit"} Trend`} badge="30-day view" orange />
            <div style={{ position: "relative", width: "100%", height: 180 }}>{areaChartEl(180)}</div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="bottom-row">
          {/* Donut */}
          <div style={chartCard()}>
            <ChartHeader title="Top Products" badge="by revenue" />
            <div className="donut-side" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="donut-side-inner" style={{ width: "100%", height: 160 }}>{donutEl(160)}</div>
              <div style={{ marginTop: 12, width: "100%" }}>{legendEl}</div>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: "#fff", border: "1px solid #E2EBFF", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 14px", borderBottom: "1px solid #F0F4FF" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0F1F45" }}>{t("recentSales") || "Recent Sales"}</span>
              <button onClick={() => navigate("/reports")} style={{ fontSize: 10, fontWeight: 600, color: "#F97316", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                Full report →
              </button>
            </div>
            {salesTableEl}
          </div>
        </div>

      </div>

      {/* Today's Sales modal / printable sheet */}
      {salesModal.open && (
        <div className="no-print" style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,31,69,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(15,31,69,0.18)" }}>
            <div style={{ background: "#1E40AF", borderRadius: "20px 20px 0 0", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>Today's Sales</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{todayISO()}</p>
              </div>
              <button onClick={() => setSalesModal({ open: false, loading: false, rows: [], error: "" })} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <X size={16} />
              </button>
            </div>

            <div className="print-area" style={{ padding: 20 }}>
              {salesModal.loading && <div style={{ textAlign: "center", padding: 30, color: "#A0B3D6", fontSize: 13 }}>Loading…</div>}
              {salesModal.error && <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "12px 16px", color: "#B91C1C", fontSize: 13 }}>{salesModal.error}</div>}

              {!salesModal.loading && !salesModal.error && (
                salesModal.rows.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 30, color: "#A0B3D6", fontSize: 13 }}>No sales recorded today yet.</div>
                ) : (
                  <>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                      <thead>
                        <tr style={{ background: "#FAFBFF" }}>
                          {["#", "Product", "Amount", "Payment"].map((h, i) => (
                            <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#A0B3D6", textTransform: "uppercase", letterSpacing: "0.6px", padding: "9px 10px", textAlign: i >= 2 ? "right" : "left", borderBottom: "1px solid #F0F4FF" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {salesModal.rows.map((s, idx) => (
                          <tr key={s.id || idx} style={{ borderBottom: "1px solid #F0F4FF" }}>
                            <td style={{ padding: "9px 10px", fontSize: 12, color: "#A0B3D6" }}>{idx + 1}</td>
                            <td style={{ padding: "9px 10px", fontSize: 12, color: "#0F1F45", fontWeight: 500 }}>{s.product_name}</td>
                            <td style={{ padding: "9px 10px", fontSize: 12, color: "#1E40AF", fontWeight: 700, textAlign: "right" }}>{formatMoney(s.total)}</td>
                            <td style={{ padding: "9px 10px", textAlign: "right" }}>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, ...payChipStyle(s.payment_type) }}>{s.payment_type}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#EEF2FF", borderRadius: 10, padding: "12px 16px" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>Total ({salesModal.rows.length} sales)</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#1E40AF" }}>{formatMoney(todaySalesTotal)}</span>
                    </div>
                  </>
                )
              )}
            </div>

            {!salesModal.loading && !salesModal.error && salesModal.rows.length > 0 && (
              <div className="no-print" style={{ padding: "0 20px 20px" }}>
                <button
                  onClick={() => window.print()}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: "#F97316", color: "#fff", border: "none" }}
                >
                  <Printer size={16} /> Print
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper sub-components ──────────────────────────────────────────────────────

function AnimatedValue({ value, style }) {
  const animated = useCountUp(value);
  return <div style={style}>${animated.toLocaleString()}</div>;
}

function DesktopCard({ title, value, sub, icon: Icon, chip, chipWarn, orange, greenIcon }) {
  const animated = useCountUp(value);
  return (
    <div style={{ background: "#fff", border: `1px solid ${orange ? "#FDCBA4" : "#E2EBFF"}`, borderRadius: 14, padding: 16, cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,64,175,0.09)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: orange ? "#C2550A" : "#6B87C4" }}>{title}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: greenIcon ? "#EDFCF2" : orange ? "#FFF2E8" : "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} color={greenIcon ? "#15803D" : orange ? "#F97316" : "#1E40AF"} />
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#0F1F45", letterSpacing: "-0.8px", marginBottom: 3 }}>${animated.toLocaleString()}</div>
      <div style={{ fontSize: 10, color: "#A0B3D6", fontWeight: 500, marginBottom: 10 }}>{sub}</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: chipWarn ? "#FFF2E8" : "#E6F5EE", color: chipWarn ? "#C2550A" : "#15803D" }}>
        {chip}
      </div>
    </div>
  );
}
