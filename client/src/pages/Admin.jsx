import { useState, useMemo, useEffect, useCallback } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: "u1", fullName: "Amina Hassan", businessName: "Hassan General Store", email: "amina@hassanstore.so", phone: "+252612345678", country: "Somalia", registeredAt: "2025-11-03T08:12:00Z", lastLogin: "2026-06-26T14:30:00Z", plan: "pro", planExpiry: "2026-12-03", status: "active", emailVerified: true, phoneVerified: true, revenue: 184200, sales: 312 },
  { id: "u2", fullName: "Omar Abdi", businessName: "Abdi Electronics", email: "omar@abdielectronics.so", phone: "+252615678901", country: "Somalia", registeredAt: "2025-12-15T11:00:00Z", lastLogin: "2026-06-25T09:15:00Z", plan: "free", planExpiry: null, status: "active", emailVerified: true, phoneVerified: false, revenue: 52000, sales: 88 },
  { id: "u3", fullName: "Hodan Mohamud", businessName: "Hodan Fashion", email: "hodan@hodanfashion.so", phone: "+252618234567", country: "Somalia", registeredAt: "2026-01-08T16:45:00Z", lastLogin: "2026-05-10T08:00:00Z", plan: "pro", planExpiry: "2026-07-08", status: "suspended", emailVerified: true, phoneVerified: true, revenue: 97800, sales: 201 },
  { id: "u4", fullName: "Abdirahman Warsame", businessName: "Warsame Wholesale", email: "abdi@warsame.ke", phone: "+254701234567", country: "Kenya", registeredAt: "2026-02-20T09:30:00Z", lastLogin: "2026-06-24T16:00:00Z", plan: "pro", planExpiry: "2027-02-20", status: "active", emailVerified: true, phoneVerified: true, revenue: 342100, sales: 547 },
  { id: "u5", fullName: "Faadumo Shire", businessName: "Shire Pharmacy", email: "faadumo@shirepharmacy.so", phone: "+252619876543", country: "Somalia", registeredAt: "2026-03-01T12:00:00Z", lastLogin: "2026-06-20T11:30:00Z", plan: "free", planExpiry: null, status: "active", emailVerified: false, phoneVerified: false, revenue: 28900, sales: 65 },
  { id: "u6", fullName: "Abdullahi Nur", businessName: "Nur Supermarket", email: "abdullahi@nusupermarket.et", phone: "+251911234567", country: "Ethiopia", registeredAt: "2026-04-14T07:00:00Z", lastLogin: "2026-06-27T08:45:00Z", plan: "pro", planExpiry: "2026-10-14", status: "active", emailVerified: true, phoneVerified: true, revenue: 218500, sales: 389 },
  { id: "u7", fullName: "Sahra Jama", businessName: "Jama Grocery", email: "sahra@jamagrocery.so", phone: "+252614321098", country: "Somalia", registeredAt: "2026-05-05T15:20:00Z", lastLogin: "2026-06-15T13:00:00Z", plan: "free", planExpiry: null, status: "active", emailVerified: true, phoneVerified: true, revenue: 15600, sales: 43 },
  { id: "u8", fullName: "Mahad Ibrahim", businessName: "Ibrahim Textiles", email: "mahad@ibrahimtextiles.so", phone: "+252617654321", country: "Somalia", registeredAt: "2026-06-01T10:00:00Z", lastLogin: "2026-06-26T17:00:00Z", plan: "free", planExpiry: null, status: "active", emailVerified: true, phoneVerified: false, revenue: 8200, sales: 19 },
];

const MOCK_AUDIT_LOGS = [
  { id: "a1", ts: "2026-06-27T08:12:00Z", admin: "Super Admin", action: "Granted Pro Plan", target: "Amina Hassan", ip: "41.223.10.5" },
  { id: "a2", ts: "2026-06-26T17:30:00Z", admin: "Super Admin", action: "Suspended account", target: "Hodan Mohamud", ip: "41.223.10.5" },
  { id: "a3", ts: "2026-06-26T14:10:00Z", admin: "Super Admin", action: "Reset password", target: "Omar Abdi", ip: "41.223.10.5" },
  { id: "a4", ts: "2026-06-25T09:45:00Z", admin: "Support Admin", action: "Closed ticket #14", target: "Faadumo Shire", ip: "197.155.6.22" },
  { id: "a5", ts: "2026-06-24T16:00:00Z", admin: "Super Admin", action: "Extended subscription 30d", target: "Abdirahman Warsame", ip: "41.223.10.5" },
];

const MOCK_TICKETS = [
  { id: "t1", from: "Omar Abdi", email: "omar@abdielectronics.so", subject: "Sales report not loading", body: "The sales report page gives a blank screen after selecting last month.", status: "open", createdAt: "2026-06-26T10:00:00Z" },
  { id: "t2", from: "Faadumo Shire", email: "faadumo@shirepharmacy.so", subject: "Can't add new product", body: "When I click 'Add Product' nothing happens on mobile.", status: "open", createdAt: "2026-06-25T14:30:00Z" },
  { id: "t3", from: "Sahra Jama", email: "sahra@jamagrocery.so", subject: "Invoice printing issue", body: "Printed invoices have a formatting problem on the right margin.", status: "resolved", createdAt: "2026-06-20T08:00:00Z" },
];

const PLAN_DURATIONS = ["7 days", "1 month", "3 months", "6 months", "12 months", "Custom"];
const COUNTRIES = ["All", "Somalia", "Kenya", "Ethiopia", "Uganda", "Tanzania"];
const ADMIN_ROLES = { superadmin: "Super Admin", support: "Support Admin", sales: "Sales Admin", finance: "Finance Admin", readonly: "Read-Only Admin" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return new Intl.NumberFormat().format(Math.round(n)); }
function fmtMoney(n) { return "$" + new Intl.NumberFormat().format(Math.round(n)); }
function timeAgo(iso) {
  const d = new Date(iso), now = new Date();
  const s = Math.floor((now - d) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}
function fmtDate(iso) { return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"; }
function daysUntil(iso) { if (!iso) return null; const d = Math.ceil((new Date(iso) - new Date()) / 86400000); return d; }

// ─── UI Primitives ────────────────────────────────────────────────────────────
function Badge({ children, color = "gray" }) {
  const map = {
    green: { bg: "#eaf3de", color: "#3b6d11", border: "#c0dd97" },
    red: { bg: "#fcebeb", color: "#a32d2d", border: "#f7c1c1" },
    blue: { bg: "#e6f1fb", color: "#185fa5", border: "#b5d4f4" },
    amber: { bg: "#faeeda", color: "#854f0b", border: "#fac775" },
    purple: { bg: "#eeedfe", color: "#3c3489", border: "#cecbf6" },
    gray: { bg: "var(--surface-1)", color: "var(--text-secondary)", border: "var(--border)" },
  };
  const c = map[color] || map.gray;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.bg, color: c.color, border: `0.5px solid ${c.border}`, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "secondary", size = "md", disabled, danger, style }) {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: "var(--radius)", fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer", border: "0.5px solid", transition: "background 0.12s, opacity 0.12s", opacity: disabled ? 0.5 : 1, fontSize: size === "sm" ? 12 : 13, padding: size === "sm" ? "4px 10px" : "7px 14px", ...style };
  const styles = {
    primary: { background: "var(--fill-accent)", color: "var(--on-accent)", borderColor: "var(--fill-accent)" },
    secondary: { background: "var(--surface-2)", color: "var(--text-primary)", borderColor: "var(--border-strong)" },
    ghost: { background: "transparent", color: "var(--text-secondary)", borderColor: "transparent" },
    danger: { background: "#fcebeb", color: "#a32d2d", borderColor: "#f7c1c1" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...(danger ? styles.danger : styles[variant]) }}>{children}</button>;
}

function Modal({ title, children, onClose, width = 520 }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "85vh", overflowY: "auto", padding: 24 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 500, color: "var(--text-primary)" }}>{title}</h2>
          <Btn variant="ghost" size="sm" onClick={onClose}><i className="ti ti-x" aria-hidden="true" style={{ fontSize: 16 }} /></Btn>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  const c = type === "success" ? "#3b6d11" : "#a32d2d";
  const bg = type === "success" ? "#eaf3de" : "#fcebeb";
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 2000, background: bg, color: c, border: `0.5px solid ${type === "success" ? "#c0dd97" : "#f7c1c1"}`, borderRadius: 12, padding: "12px 20px", fontWeight: 500, fontSize: 13, maxWidth: 340, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
      <i className={`ti ti-${type === "success" ? "check" : "alert-circle"}`} aria-hidden="true" style={{ marginRight: 8 }} />
      {msg}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color = "blue", highlight }) {
  const colors = {
    blue: { bg: "#e6f1fb", ic: "#185fa5" },
    green: { bg: "#eaf3de", ic: "#3b6d11" },
    amber: { bg: "#faeeda", ic: "#854f0b" },
    red: { bg: "#fcebeb", ic: "#a32d2d" },
    purple: { bg: "#eeedfe", ic: "#3c3489" },
    gray: { bg: "var(--surface-1)", ic: "var(--text-secondary)" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div style={{ background: highlight ? c.ic : "var(--surface-2)", border: `0.5px solid ${highlight ? "transparent" : "var(--border)"}`, borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: highlight ? "rgba(255,255,255,0.75)" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: highlight ? "rgba(255,255,255,0.18)" : c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className={`ti ti-${icon}`} aria-hidden="true" style={{ fontSize: 16, color: highlight ? "#fff" : c.ic }} />
        </div>
      </div>
      <p style={{ margin: "10px 0 2px", fontSize: 26, fontWeight: 500, color: highlight ? "#fff" : "var(--text-primary)", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: 12, color: highlight ? "rgba(255,255,255,0.65)" : "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [step, setStep] = useState("login"); // login | 2fa
  const [form, setForm] = useState({ user: "", pass: "", otp: "" });
  const [err, setErr] = useState("");
  const [role, setRole] = useState("superadmin");

  function handleLogin(e) {
    e.preventDefault();
    if (form.user === "admin" && form.pass === "Admin@Sahel2026") {
      setStep("2fa");
      setErr("");
    } else {
      setErr("Invalid credentials.");
    }
  }
  function handle2FA(e) {
    e.preventDefault();
    if (form.otp === "123456") {
      onAuth({ name: "Abdikadir", role });
    } else {
      setErr("Invalid 2FA code. (Use 123456 for demo)");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-0)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: "#185fa5", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <i className="ti ti-shield-lock" style={{ fontSize: 26, color: "#fff" }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 4px" }}>Sahel super admin</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>Restricted access — authorized personnel only</p>
        </div>

        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 16, padding: 28 }}>
          {step === "login" ? (
            <form onSubmit={handleLogin}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Username</label>
              <input value={form.user} onChange={e => setForm({ ...form, user: e.target.value })} placeholder="admin" required style={{ width: "100%", marginBottom: 14, boxSizing: "border-box" }} />
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Password</label>
              <input type="password" value={form.pass} onChange={e => setForm({ ...form, pass: e.target.value })} placeholder="••••••••" required style={{ width: "100%", marginBottom: 14, boxSizing: "border-box" }} />
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Sign in as</label>
              <select value={role} onChange={e => setRole(e.target.value)} style={{ width: "100%", marginBottom: 20, boxSizing: "border-box" }}>
                {Object.entries(ADMIN_ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {err && <p style={{ color: "#a32d2d", fontSize: 13, margin: "0 0 12px", background: "#fcebeb", padding: "8px 12px", borderRadius: 8 }}>{err}</p>}
              <button type="submit" style={{ width: "100%", background: "#185fa5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                <i className="ti ti-lock" aria-hidden="true" style={{ marginRight: 8 }} />Continue
              </button>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, textAlign: "center" }}>Demo: admin / Admin@Sahel2026</p>
            </form>
          ) : (
            <form onSubmit={handle2FA}>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 20px" }}>Enter the 6-digit code from your authenticator app.</p>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Two-factor code</label>
              <input value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })} placeholder="000000" maxLength={6} required style={{ width: "100%", marginBottom: 14, letterSpacing: "0.3em", textAlign: "center", fontSize: 20, boxSizing: "border-box" }} />
              {err && <p style={{ color: "#a32d2d", fontSize: 13, margin: "0 0 12px", background: "#fcebeb", padding: "8px 12px", borderRadius: 8 }}>{err}</p>}
              <button type="submit" style={{ width: "100%", background: "#185fa5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                <i className="ti ti-shield-check" aria-hidden="true" style={{ marginRight: 8 }} />Verify and sign in
              </button>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, textAlign: "center" }}>Demo code: 123456</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardView({ users }) {
  const total = users.length;
  const active = users.filter(u => u.status === "active").length;
  const suspended = users.filter(u => u.status === "suspended").length;
  const pro = users.filter(u => u.plan === "pro").length;
  const free = users.filter(u => u.plan === "free").length;
  const today = new Date().toDateString();
  const newToday = users.filter(u => new Date(u.registeredAt).toDateString() === today).length;
  const thisWeek = users.filter(u => (new Date() - new Date(u.registeredAt)) < 7 * 86400000).length;
  const thisMonth = users.filter(u => new Date(u.registeredAt).getMonth() === new Date().getMonth()).length;
  const mrr = users.filter(u => u.plan === "pro").length * 29;
  const expiringSoon = users.filter(u => { const d = daysUntil(u.planExpiry); return d !== null && d <= 30 && d >= 0; });

  const bars = [120, 145, 98, 167, 201, 188, 234].map((v, i) => ({ label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], v }));
  const maxBar = Math.max(...bars.map(b => b.v));

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>Overview</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard icon="building-store" label="Total users" value={fmt(total)} color="blue" highlight />
        <StatCard icon="user-check" label="Active" value={fmt(active)} sub="accounts" color="green" />
        <StatCard icon="user-off" label="Suspended" value={fmt(suspended)} color="red" />
        <StatCard icon="star" label="Pro users" value={fmt(pro)} sub="paid plans" color="purple" />
        <StatCard icon="users" label="Free users" value={fmt(free)} color="gray" />
        <StatCard icon="currency-dollar" label="MRR" value={fmtMoney(mrr)} sub="est. monthly" color="green" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>New registrations</h3>
          <div style={{ display: "flex", gap: 16 }}>
            {[["Today", newToday], ["This week", thisWeek], ["This month", thisMonth]].map(([l, v]) => (
              <div key={l} style={{ flex: 1, textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 500, color: "var(--text-primary)" }}>{v}</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-muted)" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>Plan distribution</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 60 }}>
            <div style={{ flex: pro, background: "#185fa5", borderRadius: "4px 4px 0 0", minWidth: 20 }} title={`Pro: ${pro}`} />
            <div style={{ flex: free, background: "var(--border-strong)", borderRadius: "4px 4px 0 0", minWidth: 20 }} title={`Free: ${free}`} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: "#185fa5" }} /><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Pro {Math.round(pro / total * 100)}%</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: "var(--border-strong)" }} /><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Free {Math.round(free / total * 100)}%</span></div>
          </div>
        </div>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>System health</h3>
          {[["API", "Operational", "green"], ["Database", "Operational", "green"], ["Auth service", "Operational", "green"], ["Storage", "Degraded", "amber"]].map(([s, st, c]) => (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{s}</span>
              <Badge color={c}>{st}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>Activity this week</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {bars.map(b => (
              <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", background: "#185fa5", borderRadius: "3px 3px 0 0", height: Math.round(b.v / maxBar * 64) }} />
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>Expiring subscriptions (30d)</h3>
          {expiringSoon.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No subscriptions expiring soon.</p>
          ) : expiringSoon.map(u => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{u.fullName}</p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{u.businessName}</p>
              </div>
              <Badge color={daysUntil(u.planExpiry) <= 7 ? "red" : "amber"}>{daysUntil(u.planExpiry)}d left</Badge>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>Recent audit log</h3>
          {MOCK_AUDIT_LOGS.slice(0, 4).map(l => (
            <div key={l.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "0.5px solid var(--border)" }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)" }}>{l.action} <span style={{ color: "var(--text-accent)" }}>{l.target}</span></p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-muted)" }}>{l.admin} · {timeAgo(l.ts)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── User Table ───────────────────────────────────────────────────────────────
function UserRow({ user, onAction, canEdit }) {
  const days = daysUntil(user.planExpiry);
  return (
    <tr style={{ borderBottom: "0.5px solid var(--border)" }}>
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#e6f1fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#185fa5", flexShrink: 0 }}>
            {user.fullName.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{user.fullName}</p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{user.businessName}</p>
          </div>
        </div>
      </td>
      <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-secondary)" }}>{user.email}</td>
      <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-secondary)" }}>{user.phone}</td>
      <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-secondary)" }}>{user.country}</td>
      <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(user.registeredAt)}</td>
      <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-muted)" }}>{timeAgo(user.lastLogin)}</td>
      <td style={{ padding: "10px 12px" }}>
        <Badge color={user.plan === "pro" ? "blue" : "gray"}>{user.plan === "pro" ? "Pro" : "Free"}</Badge>
        {days !== null && days <= 30 && <span style={{ display: "block", fontSize: 10, color: days <= 7 ? "#a32d2d" : "#854f0b", marginTop: 2 }}>{days}d left</span>}
      </td>
      <td style={{ padding: "10px 12px" }}>
        <Badge color={user.status === "active" ? "green" : "red"}>{user.status}</Badge>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Btn size="sm" onClick={() => onAction("view", user)}><i className="ti ti-eye" aria-hidden="true" style={{ fontSize: 12 }} />View</Btn>
          {canEdit && <>
            <Btn size="sm" onClick={() => onAction("plan", user)}><i className="ti ti-star" aria-hidden="true" style={{ fontSize: 12 }} />Plan</Btn>
            <Btn size="sm" danger onClick={() => onAction(user.status === "active" ? "suspend" : "unsuspend", user)}>
              <i className={`ti ti-${user.status === "active" ? "user-off" : "user-check"}`} aria-hidden="true" style={{ fontSize: 12 }} />
              {user.status === "active" ? "Suspend" : "Unsuspend"}
            </Btn>
          </>}
        </div>
      </td>
    </tr>
  );
}

function UsersView({ users, setUsers, addLog, toast, role }) {
  const canEdit = role !== "readonly";
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ plan: "all", status: "all", country: "All" });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { type, user }
  const [planForm, setPlanForm] = useState({ plan: "pro", duration: "1 month", custom: "" });
  const PER_PAGE = 5;

  const filtered = useMemo(() => {
    let r = users;
    if (search) { const q = search.toLowerCase(); r = r.filter(u => u.fullName.toLowerCase().includes(q) || u.businessName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q)); }
    if (filter.plan !== "all") r = r.filter(u => u.plan === filter.plan);
    if (filter.status !== "all") r = r.filter(u => u.status === filter.status);
    if (filter.country !== "All") r = r.filter(u => u.country === filter.country);
    return r;
  }, [users, search, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function doAction(type, user) {
    if (type === "view" || type === "plan") { setModal({ type, user }); return; }
    if (type === "suspend" || type === "unsuspend") {
      if (!window.confirm(`${type === "suspend" ? "Suspend" : "Unsuspend"} ${user.fullName}?`)) return;
      const ns = type === "suspend" ? "suspended" : "active";
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: ns } : u));
      addLog({ action: `${type === "suspend" ? "Suspended" : "Unsuspended"} account`, target: user.fullName });
      toast(`${user.fullName} ${ns}.`);
    }
    if (type === "delete") {
      if (!window.confirm(`Soft-delete ${user.fullName}? They will lose access.`)) return;
      setUsers(prev => prev.filter(u => u.id !== user.id));
      addLog({ action: "Soft-deleted account", target: user.fullName });
      toast(`${user.fullName} removed.`);
      setModal(null);
    }
    if (type === "permdelete") {
      const confirmed = window.prompt(`Type DELETE to permanently remove ${user.fullName} and all data:`);
      if (confirmed !== "DELETE") return;
      setUsers(prev => prev.filter(u => u.id !== user.id));
      addLog({ action: "Permanently deleted account", target: user.fullName });
      toast(`${user.fullName} permanently deleted.`, "error");
      setModal(null);
    }
    if (type === "resetpw") {
      addLog({ action: "Reset password", target: user.fullName });
      toast(`Password reset link sent to ${user.email}.`);
      setModal(null);
    }
    if (type === "forcelogout") {
      addLog({ action: "Force-logged out all sessions", target: user.fullName });
      toast(`All sessions for ${user.fullName} terminated.`);
    }
    if (type === "verifyemail") {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, emailVerified: true } : u));
      addLog({ action: "Verified email", target: user.fullName });
      toast("Email verified.");
    }
    if (type === "verifyphone") {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, phoneVerified: true } : u));
      addLog({ action: "Verified phone", target: user.fullName });
      toast("Phone verified.");
    }
  }

  function applyPlan() {
    const { user } = modal;
    let expiry = null;
    if (planForm.plan === "pro") {
      const d = new Date();
      const map = { "7 days": 7, "1 month": 30, "3 months": 90, "6 months": 180, "12 months": 365 };
      const days = planForm.duration === "Custom" ? parseInt(planForm.custom) : map[planForm.duration];
      d.setDate(d.getDate() + (days || 30));
      expiry = d.toISOString().split("T")[0];
    }
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, plan: planForm.plan, planExpiry: expiry } : u));
    addLog({ action: `Assigned ${planForm.plan} plan (${planForm.duration})`, target: user.fullName });
    toast(`Plan updated for ${user.fullName}.`);
    setModal(null);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>User management</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email, phone…" style={{ width: 220 }} />
          <select value={filter.plan} onChange={e => { setFilter({ ...filter, plan: e.target.value }); setPage(1); }}>
            <option value="all">All plans</option><option value="free">Free</option><option value="pro">Pro</option>
          </select>
          <select value={filter.status} onChange={e => { setFilter({ ...filter, status: e.target.value }); setPage(1); }}>
            <option value="all">All status</option><option value="active">Active</option><option value="suspended">Suspended</option>
          </select>
          <select value={filter.country} onChange={e => { setFilter({ ...filter, country: e.target.value }); setPage(1); }}>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ background: "var(--surface-1)" }}>
              {["User", "Email", "Phone", "Country", "Registered", "Last login", "Plan", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "0.5px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>No users match your filters.</td></tr>
            ) : paged.map(u => <UserRow key={u.id} user={u} onAction={doAction} canEdit={canEdit} />)}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>{filtered.length} user{filtered.length !== 1 ? "s" : ""}</p>
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{ width: 30, height: 30, borderRadius: 6, border: `0.5px solid ${page === i + 1 ? "#185fa5" : "var(--border)"}`, background: page === i + 1 ? "#185fa5" : "var(--surface-2)", color: page === i + 1 ? "#fff" : "var(--text-primary)", fontSize: 12, cursor: "pointer" }}>{i + 1}</button>
          ))}
        </div>
      </div>

      {modal?.type === "view" && (
        <Modal title={modal.user.fullName} onClose={() => setModal(null)} width={600}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              ["Business", modal.user.businessName], ["Email", modal.user.email],
              ["Phone", modal.user.phone], ["Country", modal.user.country],
              ["Registered", fmtDate(modal.user.registeredAt)], ["Last login", timeAgo(modal.user.lastLogin)],
              ["Plan", modal.user.plan], ["Expiry", fmtDate(modal.user.planExpiry)],
              ["Status", modal.user.status], ["Revenue", fmtMoney(modal.user.revenue)],
              ["Sales", fmt(modal.user.sales)], ["Email verified", modal.user.emailVerified ? "Yes" : "No"],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "var(--surface-1)", borderRadius: 8, padding: "10px 14px" }}>
                <p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>{k}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{String(v)}</p>
              </div>
            ))}
          </div>
          {canEdit && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn size="sm" onClick={() => doAction("resetpw", modal.user)}><i className="ti ti-key" style={{ fontSize: 12 }} aria-hidden />Reset password</Btn>
              <Btn size="sm" onClick={() => doAction("forcelogout", modal.user)}><i className="ti ti-logout" style={{ fontSize: 12 }} aria-hidden />Force logout</Btn>
              {!modal.user.emailVerified && <Btn size="sm" onClick={() => doAction("verifyemail", modal.user)}><i className="ti ti-mail-check" style={{ fontSize: 12 }} aria-hidden />Verify email</Btn>}
              {!modal.user.phoneVerified && <Btn size="sm" onClick={() => doAction("verifyphone", modal.user)}><i className="ti ti-device-mobile-check" style={{ fontSize: 12 }} aria-hidden />Verify phone</Btn>}
              <Btn size="sm" danger onClick={() => doAction("delete", modal.user)}><i className="ti ti-trash" style={{ fontSize: 12 }} aria-hidden />Soft delete</Btn>
              <Btn size="sm" danger onClick={() => doAction("permdelete", modal.user)}><i className="ti ti-trash-x" style={{ fontSize: 12 }} aria-hidden />Permanent delete</Btn>
            </div>
          )}
        </Modal>
      )}

      {modal?.type === "plan" && (
        <Modal title={`Manage plan — ${modal.user.fullName}`} onClose={() => setModal(null)}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Assign plan</label>
            <select value={planForm.plan} onChange={e => setPlanForm({ ...planForm, plan: e.target.value })} style={{ width: "100%" }}>
              <option value="free">Free</option><option value="pro">Pro</option>
            </select>
          </div>
          {planForm.plan === "pro" && <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Duration</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PLAN_DURATIONS.map(d => (
                  <button key={d} onClick={() => setPlanForm({ ...planForm, duration: d })} style={{ padding: "6px 14px", borderRadius: 8, border: `0.5px solid ${planForm.duration === d ? "#185fa5" : "var(--border)"}`, background: planForm.duration === d ? "#185fa5" : "var(--surface-2)", color: planForm.duration === d ? "#fff" : "var(--text-primary)", fontSize: 12, cursor: "pointer" }}>{d}</button>
                ))}
              </div>
            </div>
            {planForm.duration === "Custom" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Custom days</label>
                <input type="number" value={planForm.custom} onChange={e => setPlanForm({ ...planForm, custom: e.target.value })} placeholder="e.g. 45" style={{ width: "100%", boxSizing: "border-box" }} />
              </div>
            )}
          </>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={applyPlan}>Apply plan</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function AnalyticsView({ users }) {
  const totalRevenue = users.reduce((s, u) => s + u.revenue, 0);
  const totalSales = users.reduce((s, u) => s + u.sales, 0);
  const proCount = users.filter(u => u.plan === "pro").length;
  const convRate = users.length ? Math.round(proCount / users.length * 100) : 0;
  const churn = 3.2;
  const dau = 4;

  const countryData = useMemo(() => {
    const map = {};
    users.forEach(u => { map[u.country] = (map[u.country] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [users]);

  const maxCountry = Math.max(...countryData.map(([, v]) => v));

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>Analytics</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard icon="currency-dollar" label="Total revenue" value={fmtMoney(totalRevenue)} color="green" />
        <StatCard icon="shopping-cart" label="Total sales" value={fmt(totalSales)} color="blue" />
        <StatCard icon="building-store" label="Businesses" value={fmt(users.length)} color="purple" />
        <StatCard icon="users" label="Daily active" value={fmt(dau)} sub="est." color="blue" />
        <StatCard icon="percentage" label="Conversion" value={convRate + "%"} sub="free → pro" color="green" />
        <StatCard icon="chart-line-down" label="Churn rate" value={churn + "%"} sub="monthly est." color="amber" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>Users by country</h3>
          {countryData.map(([c, v]) => (
            <div key={c} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{c}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{v}</span>
              </div>
              <div style={{ height: 6, background: "var(--surface-1)", borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${Math.round(v / maxCountry * 100)}%`, background: "#185fa5", borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>Revenue by user (top 5)</h3>
          {[...users].sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((u, i) => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#e6f1fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, color: "#185fa5" }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{u.businessName}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-accent)" }}>{fmtMoney(u.revenue)}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>User growth (simulated)</h3>
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => {
            const v = [1, 2, 3, 5, 6, 8][i];
            return (
              <div key={m} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", width: 28 }}>{m}</span>
                <div style={{ flex: 1, height: 8, background: "var(--surface-1)", borderRadius: 4 }}>
                  <div style={{ height: "100%", width: `${Math.round(v / 8 * 100)}%`, background: "#185fa5", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", width: 16, textAlign: "right" }}>{v}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
function NotificationsView({ users, addLog, toast }) {
  const [form, setForm] = useState({ type: "all", title: "", message: "", selectedUsers: [] });
  const [sent, setSent] = useState([]);

  function sendNotification() {
    if (!form.title || !form.message) { toast("Title and message required.", "error"); return; }
    const targets = form.type === "all" ? `All ${users.length} users` : form.type === "selected" ? form.selectedUsers.join(", ") : form.type;
    const entry = { id: Date.now(), ts: new Date().toISOString(), type: form.type, title: form.title, message: form.message, targets };
    setSent(p => [entry, ...p]);
    addLog({ action: `Sent notification: "${form.title}"`, target: targets });
    toast("Notification sent.");
    setForm({ type: "all", title: "", message: "", selectedUsers: [] });
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>Notifications</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>Send notification</h3>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Audience</label>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: "100%", marginBottom: 14 }}>
            <option value="all">All users</option>
            <option value="pro">Pro users only</option>
            <option value="free">Free users only</option>
            <option value="maintenance">Maintenance notice</option>
            <option value="upgrade">Upgrade reminder</option>
          </select>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Title</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Notification title" style={{ width: "100%", marginBottom: 14, boxSizing: "border-box" }} />
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Message</label>
          <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Your message…" rows={4} style={{ width: "100%", marginBottom: 16, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", fontSize: 13, border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 10px", background: "var(--surface-2)", color: "var(--text-primary)" }} />
          <Btn variant="primary" onClick={sendNotification}><i className="ti ti-send" aria-hidden style={{ fontSize: 14 }} />Send notification</Btn>
        </div>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>Sent history</h3>
          {sent.length === 0 ? <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No notifications sent yet.</p> : sent.map(n => (
            <div key={n.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "0.5px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{n.title}</p>
                <Badge color="blue">{n.type}</Badge>
              </div>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text-secondary)" }}>{n.message}</p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(n.ts)} · {n.targets}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Support ──────────────────────────────────────────────────────────────────
function SupportView({ addLog, toast, role }) {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");

  function sendReply(ticket) {
    if (!reply.trim()) return;
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: "in-progress" } : t));
    addLog({ action: `Replied to ticket #${ticket.id}`, target: ticket.from });
    toast("Reply sent.");
    setReply("");
  }

  function closeTicket(ticket) {
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: "resolved" } : t));
    addLog({ action: "Closed support ticket", target: ticket.from });
    toast("Ticket resolved.");
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>Support tickets</h2>
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1.5fr" : "1fr", gap: 16 }}>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {tickets.map(t => (
            <div key={t.id} onClick={() => setSelected(t)} style={{ padding: "14px 16px", borderBottom: "0.5px solid var(--border)", cursor: "pointer", background: selected?.id === t.id ? "var(--bg-accent)" : "transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{t.subject}</p>
                <Badge color={t.status === "resolved" ? "green" : t.status === "in-progress" ? "amber" : "blue"}>{t.status}</Badge>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>{t.from} · {timeAgo(t.createdAt)}</p>
            </div>
          ))}
        </div>
        {selected && (
          <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>{selected.subject}</h3>
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>{selected.from} · {selected.email}</p>
              </div>
              <Btn size="sm" onClick={() => setSelected(null)}><i className="ti ti-x" aria-hidden style={{ fontSize: 12 }} /></Btn>
            </div>
            <div style={{ background: "var(--surface-1)", borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6 }}>{selected.body}</div>
            {role !== "readonly" && selected.status !== "resolved" && <>
              <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply…" rows={3} style={{ width: "100%", marginBottom: 12, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", fontSize: 13, border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 10px", background: "var(--surface-2)", color: "var(--text-primary)" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="primary" onClick={() => sendReply(selected)}><i className="ti ti-send" aria-hidden style={{ fontSize: 13 }} />Send reply</Btn>
                <Btn onClick={() => closeTicket(selected)}><i className="ti ti-check" aria-hidden style={{ fontSize: 13 }} />Mark resolved</Btn>
              </div>
            </>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
function AuditView({ logs }) {
  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>Audit log</h2>
      <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr style={{ background: "var(--surface-1)" }}>
              {["Timestamp", "Admin", "Action", "Target", "IP"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "0.5px solid var(--border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={l.id || i} style={{ borderBottom: "0.5px solid var(--border)" }}>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtDate(l.ts)} {new Date(l.ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{l.admin}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-primary)" }}>{l.action}</td>
                <td style={{ padding: "10px 14px" }}><Badge color="blue">{l.target}</Badge></td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p style={{ padding: 24, textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>No audit entries yet.</p>}
      </div>
    </div>
  );
}

// ─── Settings / Roles ─────────────────────────────────────────────────────────
function SettingsView({ admin, toast }) {
  const perms = {
    superadmin: ["Full access", "User management", "Subscription management", "Analytics", "Notifications", "Support", "Audit logs", "Settings"],
    support: ["User view", "Support tickets", "Notifications (read)"],
    sales: ["User view", "Subscription management", "Analytics"],
    finance: ["Analytics", "Subscription view"],
    readonly: ["Dashboard view", "Analytics view"],
  };
  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>Roles & permissions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {Object.entries(ADMIN_ROLES).map(([k, v]) => (
          <div key={k} style={{ background: "var(--surface-2)", border: `0.5px solid ${k === admin.role ? "var(--border-accent)" : "var(--border)"}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{v}</p>
              {k === admin.role && <Badge color="blue">Your role</Badge>}
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {(perms[k] || []).map(p => (
                <li key={p} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
                  <i className="ti ti-check" aria-hidden="true" style={{ fontSize: 13, color: "#3b6d11" }} />{p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>Security settings</h3>
        {[
          ["Two-factor authentication", "Enabled", "green"],
          ["Session timeout", "30 minutes", "gray"],
          ["Rate limiting", "100 req/min", "gray"],
          ["CSRF protection", "Active", "green"],
          ["XSS protection", "Active", "green"],
          ["IP logging", "Enabled", "green"],
        ].map(([k, v, c]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "0.5px solid var(--border)" }}>
            <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{k}</span>
            <Badge color={c}>{v}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: "layout-dashboard", label: "Dashboard" },
  { id: "users", icon: "users", label: "Users" },
  { id: "analytics", icon: "chart-bar", label: "Analytics" },
  { id: "notifications", icon: "bell", label: "Notifications" },
  { id: "support", icon: "headset", label: "Support" },
  { id: "audit", icon: "file-description", label: "Audit log" },
  { id: "settings", icon: "settings", label: "Settings" },
];

export default function SahelSuperAdmin() {
  const [admin, setAdmin] = useState(null);
  const [view, setView] = useState("dashboard");
  const [users, setUsers] = useState(MOCK_USERS);
  const [logs, setLogs] = useState(MOCK_AUDIT_LOGS);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  const addLog = useCallback((entry) => {
    setLogs(prev => [{
      id: "a" + Date.now(),
      ts: new Date().toISOString(),
      admin: admin?.name || "Admin",
      ip: "41.223.10.5",
      ...entry
    }, ...prev]);
  }, [admin]);

  if (!admin) return <AuthScreen onAuth={setAdmin} />;

  const isSuperAdmin = admin.role === "superadmin";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-0)", fontFamily: "var(--font-sans)" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, background: "var(--surface-2)", borderRight: "0.5px solid var(--border)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: "0.5px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#185fa5", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-shield-check" style={{ fontSize: 18, color: "#fff" }} aria-hidden="true" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>Sahel Admin</p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{ADMIN_ROLES[admin.role]}</p>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: view === n.id ? "var(--bg-accent)" : "transparent", color: view === n.id ? "var(--text-accent)" : "var(--text-secondary)", fontSize: 13, fontWeight: view === n.id ? 500 : 400, cursor: "pointer", marginBottom: 2, textAlign: "left", transition: "background 0.1s" }}
            >
              <i className={`ti ti-${n.icon}`} aria-hidden="true" style={{ fontSize: 17, flexShrink: 0 }} />
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: 12, borderTop: "0.5px solid var(--border)" }}>
          <div style={{ background: "var(--surface-1)", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{admin.name}</p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Session active</p>
          </div>
          <button onClick={() => setAdmin(null)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}>
            <i className="ti ti-logout" aria-hidden="true" style={{ fontSize: 15 }} />Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, padding: 24, overflowX: "hidden" }}>
        {view === "dashboard" && <DashboardView users={users} />}
        {view === "users" && <UsersView users={users} setUsers={setUsers} addLog={addLog} toast={showToast} role={admin.role} />}
        {view === "analytics" && <AnalyticsView users={users} />}
        {view === "notifications" && <NotificationsView users={users} addLog={addLog} toast={showToast} />}
        {view === "support" && <SupportView addLog={addLog} toast={showToast} role={admin.role} />}
        {view === "audit" && <AuditView logs={logs} />}
        {view === "settings" && <SettingsView admin={admin} toast={showToast} />}
      </main>

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
