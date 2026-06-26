import React, { useEffect, useState, useRef } from "react";
import {
  Search, Plus, BarChart3, ShoppingBag, CreditCard, DollarSign,
  Wallet, Bell, Settings, TrendingUp, AlertCircle, Package, Users
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

// Animated count-up hook
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

function MetricCard({ title, value, sub, icon: Icon, chip, chipStyle, featured, orange }) {
  const animated = useCountUp(value);
  return (
    <div
      style={{
        background: featured ? "#1E40AF" : "#fff",
        border: `1px solid ${orange ? "#FDCBA4" : featured ? "#1E40AF" : "#E2EBFF"}`,
        borderRadius: 14,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,64,175,0.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: featured ? "rgba(255,255,255,0.65)" : orange ? "#C2550A" : "#6B87C4" }}>
          {title}
        </span>
        <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: featured ? "rgba(255,255,255,0.18)" : orange ? "#FFF2E8" : "#EEF2FF", flexShrink: 0 }}>
          <Icon size={16} color={featured ? "#fff" : orange ? "#F97316" : "#1E40AF"} />
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: featured ? "#fff" : "#0F1F45", letterSpacing: "-0.8px", marginBottom: 3 }}>
        ${animated.toLocaleString()}
      </div>
      <div style={{ fontSize: 10, color: featured ? "rgba(255,255,255,0.55)" : "#A0B3D6", fontWeight: 500, marginBottom: 10 }}>
        {sub}
      </div>
      {chip && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
          ...(chipStyle === "white" ? { background: "rgba(255,255,255,0.18)", color: "#fff" }
            : chipStyle === "warn" ? { background: "#FFF2E8", color: "#C2550A" }
            : { background: "#E6F5EE", color: "#15803D" }),
          width: "fit-content"
        }}>
          {chip}
        </div>
      )}
    </div>
  );
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

  if (state.loading) return <LoadingState />;
  if (!state.data) return <div style={{ padding: 40, color: "#6B87C4", textAlign: "center" }}>Could not load dashboard data.</div>;

  const { daily, profit, top, recent, credits, products } = state.data;
  const lowStock = products.filter(p => Number(p.quantity) <= Number(p.low_stock_threshold));
  const todayRevenue = daily[daily.length - 1]?.total_revenue || 0;
  const monthRevenue = profit?.revenue || 0;
  const totalCredits = credits?.total_amount_owed || 0;
  const netProfit = profit?.net_profit || 0;
  const margin = monthRevenue > 0 ? Math.round((netProfit / monthRevenue) * 100) : 0;
  const topTotal = (top || []).reduce((a, b) => a + b.revenue, 0);

  const payChipStyle = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "cash") return { background: "#E6F5EE", color: "#15803D" };
    if (t === "credit") return { background: "#FFF2E8", color: "#C2550A" };
    return { background: "#EEF2FF", color: "#1E40AF" };
  };

  return (
    <div style={{ background: "#F0F4FF", minHeight: "100vh", padding: "18px", fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6B87C4" }} />
          <input
            style={{ width: "100%", background: "#fff", border: "1px solid #D6E0FF", borderRadius: 10, padding: "9px 14px 9px 36px", fontSize: 12, fontFamily: "inherit", color: "#1a2340", outline: "none" }}
            placeholder={t("searchPlaceholder") || "Search products, sales…"}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => navigate("/settings")} style={{ background: "#fff", border: "1px solid #D6E0FF", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#2B5CE6" }}>
            <Settings size={16} />
          </button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: "#fff", border: "1px solid #D6E0FF", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#2B5CE6" }}>
              <Bell size={16} />
            </button>
            {lowStock.length > 0 && (
              <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, background: "#F97316", borderRadius: "50%", border: "1.5px solid #fff" }} />
            )}
          </div>
          <div onClick={() => navigate("/profile")} style={{ width: 36, height: 36, background: "#1E40AF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            SA
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F1F45", margin: 0 }}>Good morning 👋</h1>
        <p style={{ fontSize: 12, color: "#6B87C4", marginTop: 3 }}>Here's your shop overview for today</p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { label: t("quickNewSale") || "New Sale", path: "/sale", style: { background: "#1E40AF", color: "#fff", border: "none" } },
          { label: t("addProduct") || "Add Product", path: "/inventory", style: { background: "#fff", color: "#1E40AF", border: "1.5px solid #D6E0FF" } },
          { label: t("viewReports") || "View Reports", path: "/reports", style: { background: "#F97316", color: "#fff", border: "none" } },
          { label: "Customers", path: "/credits", style: { background: "#fff", color: "#1E40AF", border: "1.5px solid #D6E0FF" } },
        ].map(btn => (
          <button
            key={btn.path}
            onClick={() => navigate(btn.path)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s", ...btn.style }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <Plus size={12} /> {btn.label}
          </button>
        ))}
      </div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <MetricCard title={t("todaySales") || "Today's Sales"} value={todayRevenue} sub="Live volume" icon={ShoppingBag} chip="↑ +12% vs yesterday" chipStyle="white" featured />
        <MetricCard title={t("totalRevenue") || "Monthly Revenue"} value={monthRevenue} sub="Gross income" icon={DollarSign} chip="↑ +8% vs last month" chipStyle="green" />
        <MetricCard title={t("credits") || "Outstanding Credits"} value={totalCredits} sub="Pending collection" icon={CreditCard} chip="⚠ 3 overdue" chipStyle="warn" orange />
        <MetricCard title={t("netProfit") || "Net Profit"} value={netProfit} sub="Actual earnings" icon={Wallet} chip={`Margin ${margin}%`} chipStyle="green" />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #E2EBFF", borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0F1F45" }}>{t("totalRevenue") || "Revenue"} Performance</span>
            <span style={{ fontSize: 10, fontWeight: 600, background: "#EEF2FF", color: "#2B5CE6", padding: "3px 9px", borderRadius: 20 }}>This month</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={daily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#EEF2FF" />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F7F9FF" }} />
              <Bar dataKey="total_revenue" fill="#1E40AF" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", border: "1px solid #E2EBFF", borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0F1F45" }}>{t("netProfit") || "Profit"} Trend</span>
            <span style={{ fontSize: 10, fontWeight: 600, background: "#FFF2E8", color: "#C2550A", padding: "3px 9px", borderRadius: 20 }}>30-day view</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
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
        </div>
      </div>

      {/* Bottom Row: Donut + Table */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>

        {/* Donut */}
        <div style={{ background: "#fff", border: "1px solid #E2EBFF", borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0F1F45" }}>Top Products</span>
            <span style={{ fontSize: 10, fontWeight: 600, background: "#EEF2FF", color: "#2B5CE6", padding: "3px 9px", borderRadius: 20 }}>by revenue</span>
          </div>
          <div style={{ position: "relative" }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={top?.slice(0, 5)} dataKey="revenue" nameKey="product_name" innerRadius={55} outerRadius={75} paddingAngle={6}>
                  {top?.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#0F1F45" }}>${(topTotal / 1000).toFixed(1)}k</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#F97316", textTransform: "uppercase", letterSpacing: "0.5px" }}>Top Sales</span>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            {COLORS.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6B87C4", marginBottom: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
                {top?.[i]?.product_name || "—"}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales Table */}
        <div style={{ background: "#fff", border: "1px solid #E2EBFF", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px", borderBottom: "1px solid #F0F4FF" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0F1F45" }}>{t("recentSales") || "Recent Sales"}</span>
            <button onClick={() => navigate("/reports")} style={{ fontSize: 10, fontWeight: 600, color: "#F97316", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Full report →
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFBFF" }}>
                <th style={{ fontSize: 9, fontWeight: 700, color: "#A0B3D6", textTransform: "uppercase", letterSpacing: "0.8px", padding: "10px 18px", textAlign: "left" }}>Product</th>
                <th style={{ fontSize: 9, fontWeight: 700, color: "#A0B3D6", textTransform: "uppercase", letterSpacing: "0.8px", padding: "10px 18px", textAlign: "left" }}>Amount</th>
                <th style={{ fontSize: 9, fontWeight: 700, color: "#A0B3D6", textTransform: "uppercase", letterSpacing: "0.8px", padding: "10px 18px", textAlign: "right" }}>Payment</th>
              </tr>
            </thead>
            <tbody>
              {recent?.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #F0F4FF" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F7F9FF"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}
                >
                  <td style={{ padding: "12px 18px", fontSize: 12, color: "#0F1F45", fontWeight: 500 }}>{s.product_name}</td>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: "#1E40AF", fontWeight: 700 }}>{formatMoney(s.total)}</td>
                  <td style={{ padding: "12px 18px", textAlign: "right" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, ...payChipStyle(s.payment_type) }}>
                      {s.payment_type}
                    </span>
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
