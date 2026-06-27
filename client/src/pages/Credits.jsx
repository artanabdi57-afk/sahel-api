import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Check, CheckCircle2, ChevronDown, ChevronRight,
  CreditCard, Phone, Plus, Search, X
} from "lucide-react";
import { apiRequest, formatMoney } from "../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";
import { useLanguage } from "../lib/LanguageContext";

// ── Helpers ────────────────────────────────────────────────────────────────────
function getCustomerKey(credit) {
  return `${credit.customer_name || "Unknown customer"}|${credit.customer_phone || "N/A"}`.toLowerCase();
}
function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}
function formatShortDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en", { month: "short", day: "numeric" });
}
function paymentLabel(method, t) {
  return method === "bank" ? t.bankTransfer : t.cash;
}

function buildCustomers(credits, search) {
  const groups = new Map();
  credits.forEach((credit) => {
    const key = getCustomerKey(credit);
    const existing = groups.get(key) || {
      key,
      customer_name: credit.customer_name || "Unknown customer",
      customer_phone: credit.customer_phone || "N/A",
      credits: [], items: [], payments: [],
      total_amount_owed: 0, total_original_amount: 0, total_paid: 0,
      latest_date: credit.created_at, paid_on: null, status: "unpaid",
      has_overdue: false, max_days_outstanding: 0
    };
    const creditPayments = credit.payments || [];
    const itemAmount = (credit.items || []).reduce((s, i) => s + Number(i.amount || 0), 0);
    existing.credits.push(credit);
    existing.payments.push(...creditPayments.map((p) => ({ ...p, credit })));
    existing.total_amount_owed += Number(credit.amount_owed || 0);
    existing.total_original_amount += itemAmount;
    existing.total_paid += Number(credit.total_paid || 0);
    if (credit.is_overdue) existing.has_overdue = true;
    if (Number(credit.days_outstanding || 0) > existing.max_days_outstanding)
      existing.max_days_outstanding = Number(credit.days_outstanding || 0);
    (credit.items || []).forEach((item) => {
      existing.items.push({
        credit_id: credit.id, credit_status: credit.status,
        product_name: item.product_name || "Unknown product",
        quantity: Number(item.quantity || 1), amount: Number(item.amount || 0),
        remaining: Number(credit.amount_owed || 0), date: credit.created_at,
        paid_on: credit.paid_on, payments: creditPayments,
        is_overdue: credit.is_overdue, days_outstanding: credit.days_outstanding
      });
    });
    if (credit.created_at && (!existing.latest_date || new Date(credit.created_at) > new Date(existing.latest_date)))
      existing.latest_date = credit.created_at;
    if (credit.paid_on && (!existing.paid_on || new Date(credit.paid_on) > new Date(existing.paid_on)))
      existing.paid_on = credit.paid_on;
    groups.set(key, existing);
  });
  const query = search.trim().toLowerCase();
  return [...groups.values()]
    .map((c) => {
      const allPaid = c.credits.length > 0 && c.credits.every((cr) => cr.status === "paid");
      const hasPartial = c.credits.some((cr) => cr.status === "partial");
      return { ...c, payments: c.payments.sort((a, b) => new Date(a.payment_date || 0) - new Date(b.payment_date || 0)), status: allPaid ? "paid" : hasPartial ? "partial" : "unpaid" };
    })
    .filter((c) => !query || c.customer_name.toLowerCase().includes(query) || c.customer_phone.toLowerCase().includes(query))
    .sort((a, b) => { if (a.has_overdue && !b.has_overdue) return -1; if (!a.has_overdue && b.has_overdue) return 1; return a.customer_name.localeCompare(b.customer_name); });
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const card = { background: "#fff", border: "1px solid #E2EBFF", borderRadius: 16, overflow: "hidden" };
const cardOverdue = { ...card, border: "1px solid #FECACA" };
const labelSm = { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#6B87C4" };
const inputStyle = { width: "100%", background: "#F7F9FF", border: "1px solid #E2EBFF", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", color: "#0F1F45", outline: "none", boxSizing: "border-box" };
const orangeBtn = { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: "#F97316", color: "#fff", border: "none" };
const outlineBtn = { ...orangeBtn, background: "#fff", color: "#1E40AF", border: "1.5px solid #D6E0FF" };
const blueBtn = { ...orangeBtn, background: "#1E40AF" };

// ── Sub-components ──────────────────────────────────────────────────────────────
function StatusBadge({ status, t }) {
  const styles = {
    paid: { background: "#ECFDF5", color: "#065F46" },
    partial: { background: "#FFFBEB", color: "#92400E" },
    unpaid: { background: "#FEF2F2", color: "#991B1B" },
  };
  const labels = { paid: t.paid, partial: "Partial", unpaid: t.open };
  const s = styles[status] || styles.unpaid;
  return <span style={{ ...s, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", padding: "3px 10px", borderRadius: 20 }}>{labels[status]}</span>;
}

function OverdueBadge({ days, t }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FEF2F2", color: "#B91C1C", fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 20 }}>
      <AlertTriangle style={{ width: 11, height: 11 }} />
      {t.overdueLabel} {days}d
    </span>
  );
}

function PaymentTimeline({ payments, remaining, t }) {
  if (!payments.length) return <p style={{ fontSize: 13, color: "#A0B3D6" }}>{t.noPayments}</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {payments.map((p) => (
        <div key={p.id} style={{ background: "#F7F9FF", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0F1F45" }}>{formatShortDate(p.payment_date)}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#15803D" }}>+{formatMoney(p.amount_paid)}</span>
          </div>
          <p style={{ fontSize: 11, color: "#6B87C4", marginTop: 2 }}>{paymentLabel(p.payment_method, t)}{p.notes ? ` · ${p.notes}` : ""}</p>
        </div>
      ))}
      {typeof remaining === "number" && (
        <div style={{ background: "#EEF2FF", borderRadius: 10, padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>{t.remaining}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1E40AF" }}>{formatMoney(remaining)}</span>
        </div>
      )}
    </div>
  );
}

function PaymentModal({ paymentTarget, onClose, onSaved, t }) {
  if (!paymentTarget?.customer) return null;
  const customer = paymentTarget.customer;
  const mode = paymentTarget.mode || "partial";
  const targetCreditId = paymentTarget.creditId || null;
  const targetCredits = targetCreditId
    ? customer.credits.filter((c) => c.id === targetCreditId)
    : customer.credits.filter((c) => c.status !== "paid");
  const amountDue = targetCredits.reduce((s, c) => s + Number(c.amount_owed || 0), 0);
  const payments = targetCreditId ? customer.payments.filter((p) => p.credit_id === targetCreditId) : customer.payments;

  const [form, setForm] = useState({ amount_paid: mode === "full" ? String(amountDue) : "", payment_method: "cash", notes: "" });
  const [status, setStatus] = useState({ saving: false, error: "", success: "" });

  async function savePayment(e) {
    e.preventDefault();
    let remaining = Number(form.amount_paid);
    if (!remaining || remaining <= 0) { setStatus({ saving: false, error: t.enterPaymentError, success: "" }); return; }
    setStatus({ saving: true, error: "", success: "" });
    try {
      const ordered = [...targetCredits].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      let lastDate = new Date().toISOString();
      for (const c of ordered) {
        if (remaining <= 0) break;
        const owed = Number(c.amount_owed || 0);
        const amount = Math.min(remaining, owed);
        if (amount <= 0) continue;
        const endpoint = amount >= owed ? `/credits/${c.id}/paid` : `/credits/${c.id}/partial`;
        const res = await apiRequest(endpoint, { method: "PUT", body: JSON.stringify({ amount_paid: amount, payment_method: form.payment_method, notes: form.notes }) });
        lastDate = res.data?.payment?.payment_date || lastDate;
        remaining -= amount;
      }
      setStatus({ saving: false, error: "", success: `✓ ${t.savePayment}` });
      await onSaved();
      setTimeout(onClose, 800);
    } catch (err) { setStatus({ saving: false, error: err.message, success: "" }); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,31,69,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(15,31,69,0.18)" }}>
        {/* Modal header */}
        <div style={{ background: "#1E40AF", borderRadius: "20px 20px 0 0", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{mode === "full" ? t.markAsPaid : t.partialPayment}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{customer.customer_name}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Amount due */}
          <div style={{ background: "#FFF7ED", border: "1px solid #FDCBA4", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#C2550A" }}>{t.amountDue}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#F97316" }}>{formatMoney(amountDue)}</span>
          </div>

          {/* Payment history */}
          {payments.length > 0 && (
            <div>
              <p style={{ ...labelSm, marginBottom: 8 }}>{t.paymentTimeline}</p>
              <PaymentTimeline payments={payments} t={t} />
            </div>
          )}

          {/* Form */}
          <form onSubmit={savePayment} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ ...labelSm, display: "block", marginBottom: 6 }}>{t.amountPaidNow}</label>
              <input style={inputStyle} type="number" min="0.01" step="0.01" value={form.amount_paid} onChange={(e) => setForm({ ...form, amount_paid: e.target.value })} required />
            </div>
            <div>
              <label style={{ ...labelSm, display: "block", marginBottom: 6 }}>{t.paymentMethod}</label>
              <select style={inputStyle} value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                <option value="cash">{t.cash}</option>
                <option value="bank">{t.bankTransfer}</option>
              </select>
            </div>
            <div>
              <label style={{ ...labelSm, display: "block", marginBottom: 6 }}>{t.notesOptional}</label>
              <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            {status.error && <p style={{ background: "#FEF2F2", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#B91C1C", fontWeight: 500 }}>{status.error}</p>}
            {status.success && <p style={{ background: "#ECFDF5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#065F46", fontWeight: 500 }}>{status.success}</p>}
            <button style={{ ...orangeBtn, justifyContent: "center", padding: "12px 0", width: "100%", fontSize: 14 }} disabled={status.saving}>
              <Check style={{ width: 16, height: 16 }} />
              {status.saving ? t.saving : t.savePayment}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function GiveMoneyModal({ open, onClose, onSaved, t }) {
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", amount_owed: "", notes: "" });
  const [status, setStatus] = useState({ saving: false, error: "", success: "" });

  useEffect(() => {
    if (open) { setForm({ customer_name: "", customer_phone: "", amount_owed: "", notes: "" }); setStatus({ saving: false, error: "", success: "" }); }
  }, [open]);

  if (!open) return null;

  async function saveDebt(e) {
    e.preventDefault();
    if (!form.customer_name.trim()) { setStatus({ saving: false, error: t.enterNameError, success: "" }); return; }
    const amount = Number(form.amount_owed);
    if (!amount || amount <= 0) { setStatus({ saving: false, error: t.enterAmountError, success: "" }); return; }
    setStatus({ saving: true, error: "", success: "" });
    try {
      await apiRequest("/credits", { method: "POST", body: JSON.stringify({ customer_name: form.customer_name.trim(), customer_phone: form.customer_phone.trim(), amount_owed: amount, notes: form.notes.trim() }) });
      setStatus({ saving: false, error: "", success: t.debtRecorded });
      await onSaved();
      setTimeout(onClose, 700);
    } catch (err) { setStatus({ saving: false, error: err.message, success: "" }); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,31,69,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(15,31,69,0.18)" }}>
        <div style={{ background: "#1E40AF", borderRadius: "20px 20px 0 0", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{t.recordMoneyGiven}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{t.recordMoneyGivenSub}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <form onSubmit={saveDebt} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { key: "customer_name", label: t.personName, type: "text", placeholder: "Ahmed Ali" },
            { key: "customer_phone", label: `${t.customerPhone} (${t.notesOptional})`, type: "text", placeholder: "615738632" },
            { key: "amount_owed", label: t.amountGiven, type: "number", placeholder: "0.00" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label style={{ ...labelSm, display: "block", marginBottom: 6 }}>{label}</label>
              <input style={inputStyle} type={type} placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <div>
            <label style={{ ...labelSm, display: "block", marginBottom: 6 }}>{t.notesOptional}</label>
            <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {status.error && <p style={{ background: "#FEF2F2", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#B91C1C" }}>{status.error}</p>}
          {status.success && <p style={{ background: "#ECFDF5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#065F46" }}>{status.success}</p>}
          <button style={{ ...orangeBtn, justifyContent: "center", padding: "12px 0", width: "100%", fontSize: 14 }} disabled={status.saving}>
            <Plus style={{ width: 16, height: 16 }} />
            {status.saving ? t.saving : t.recordDebt}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Credits Page ──────────────────────────────────────────────────────────
export default function Credits() {
  const { t, dir } = useLanguage();
  const [credits, setCredits] = useState([]);
  const [filter, setFilter] = useState("open");
  const [search, setSearch] = useState("");
  const [openCustomer, setOpenCustomer] = useState("");
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [giveMoneyOpen, setGiveMoneyOpen] = useState(false);
  const [status, setStatus] = useState({ loading: true, error: "" });

  async function loadCredits(nextFilter = filter) {
    setStatus({ loading: true, error: "" });
    try {
      const res = await apiRequest(`/credits?status=${nextFilter}`);
      setCredits(res.data || []);
      setStatus({ loading: false, error: "" });
    } catch (err) { setStatus({ loading: false, error: err.message }); }
  }

  useEffect(() => { loadCredits(filter); }, [filter]);

  const customers = useMemo(() => buildCustomers(credits, search), [credits, search]);
  const totalAmountOwed = customers.reduce((s, c) => s + c.total_amount_owed, 0);
  const overdueCustomers = customers.filter((c) => c.has_overdue);
  const overdueTotal = overdueCustomers.reduce((s, c) => s + c.total_amount_owed, 0);

  if (status.loading) return <LoadingState />;

  const FILTERS = [["open", t.open], ["overdue", t.overdue], ["paid", t.paid], ["all", t.all]];

  return (
    <div dir={dir} style={{ background: "#F0F4FF", minHeight: "100vh", fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif", padding: "16px" }}>

      {/* ── Page header ── */}
      <div style={{ background: "#1E40AF", borderRadius: 16, padding: "16px 18px", marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>{t.creditsTitle}</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{t.creditsSubtitle}</p>
        </div>
        <button onClick={() => setGiveMoneyOpen(true)} style={{ ...orangeBtn, background: "#F97316", fontSize: 12, padding: "8px 14px" }}>
          <Plus style={{ width: 14, height: 14 }} /> {t.giveMoney}
        </button>
      </div>

      {/* ── Search + filters ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#A0B3D6", pointerEvents: "none" }} />
          <input style={{ ...inputStyle, paddingLeft: 36, background: "#fff" }} placeholder={t.searchCustomer} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", background: "#fff", border: "1px solid #E2EBFF", borderRadius: 10, padding: 3, gap: 2 }}>
          {FILTERS.map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: "none",
              background: filter === val ? "#1E40AF" : "transparent",
              color: filter === val ? "#fff" : "#6B87C4",
              transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── Overdue alert ── */}
      {overdueCustomers.length > 0 && filter !== "overdue" && (
        <button onClick={() => setFilter("overdue")} style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", cursor: "pointer", marginBottom: 14, fontFamily: "inherit" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle style={{ width: 16, height: 16, color: "#B91C1C", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#B91C1C" }}>
              {overdueCustomers.length} {overdueCustomers.length === 1 ? t.overdueAlertOne : t.overdueAlert}
            </span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#B91C1C" }}>{formatMoney(overdueTotal)} →</span>
        </button>
      )}

      {status.error && <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "12px 16px", color: "#B91C1C", fontSize: 13, marginBottom: 14 }}>{status.error}</div>}

      {/* ── Customer cards ── */}
      {customers.length === 0 ? (
        <div style={{ ...card, padding: 32, textAlign: "center" }}>
          <p style={{ color: "#A0B3D6", fontSize: 14 }}>{filter === "paid" ? t.noPaidCredits : filter === "overdue" ? t.noOverdue : t.noCredits}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {customers.map((customer) => {
            const isOpen = openCustomer === customer.key;
            const fullyPaid = customer.status === "paid";

            return (
              <div key={customer.key} style={customer.has_overdue ? cardOverdue : card}>
                {/* Customer row */}
                <button type="button" onClick={() => setOpenCustomer(isOpen ? "" : customer.key)}
                  style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", gap: 12, textAlign: "left" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                    {/* Avatar */}
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: fullyPaid ? "#ECFDF5" : customer.has_overdue ? "#FEF2F2" : "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: fullyPaid ? "#15803D" : customer.has_overdue ? "#B91C1C" : "#1E40AF" }}>
                        {customer.customer_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1F45" }}>{customer.customer_name}</span>
                        {fullyPaid
                          ? <span style={{ background: "#ECFDF5", color: "#15803D", fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 20 }}>✓ {t.fullyPaid}</span>
                          : customer.has_overdue
                          ? <OverdueBadge days={customer.max_days_outstanding} t={t} />
                          : <StatusBadge status={customer.status} t={t} />
                        }
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B87C4" }}>
                        <Phone style={{ width: 11, height: 11 }} />
                        {customer.customer_phone}
                      </div>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: "#A0B3D6", fontWeight: 600 }}>{t.remaining}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: fullyPaid ? "#15803D" : "#F97316" }}>{formatMoney(customer.total_amount_owed)}</div>
                    </div>
                    <div style={{ color: "#A0B3D6" }}>
                      {isOpen ? <ChevronDown style={{ width: 16, height: 16 }} /> : <ChevronRight style={{ width: 16, height: 16 }} />}
                    </div>
                  </div>
                </button>

                {/* Summary strip */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid #F0F4FF" }}>
                  {[
                    { label: t.original, val: customer.total_original_amount, color: "#6B87C4", bg: "#F7F9FF" },
                    { label: t.paid, val: customer.total_paid, color: "#15803D", bg: "#F0FDF4" },
                    { label: t.remaining, val: customer.total_amount_owed, color: "#F97316", bg: "#FFF7ED" },
                  ].map(({ label, val, color, bg }) => (
                    <div key={label} style={{ background: bg, padding: "8px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#A0B3D6", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color }}>{formatMoney(val)}</div>
                    </div>
                  ))}
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid #F0F4FF", padding: 16, background: "#FAFBFF" }}>
                    <div style={{ display: "grid", gap: 16 }}>

                      {/* Items */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {customer.items.map((item) => (
                          <div key={item.credit_id} style={{ background: "#fff", border: "1px solid #E2EBFF", borderRadius: 12, padding: "12px 14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                              <div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginBottom: 4 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0F1F45" }}>{item.product_name}</span>
                                  {item.is_overdue && <OverdueBadge days={item.days_outstanding} t={t} />}
                                </div>
                                <p style={{ fontSize: 11, color: "#6B87C4" }}>× {item.quantity} · {formatShortDate(item.date)}</p>
                                {item.credit_status === "paid" && <p style={{ fontSize: 11, color: "#15803D", fontWeight: 600, marginTop: 3 }}>✓ {t.paidOn}: {formatShortDate(item.paid_on)}</p>}
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1F45" }}>{formatMoney(item.amount)}</div>
                                <div style={{ fontSize: 11, color: "#F97316", fontWeight: 600 }}>{t.remaining} {formatMoney(item.remaining)}</div>
                              </div>
                            </div>
                            {item.credit_status !== "paid" && (
                              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                                <button style={{ ...outlineBtn, fontSize: 12, padding: "7px 14px" }} onClick={() => setPaymentTarget({ customer, mode: "partial", creditId: item.credit_id })}>
                                  {t.partialPayment}
                                </button>
                                <button style={{ ...orangeBtn, fontSize: 12, padding: "7px 14px" }} onClick={() => setPaymentTarget({ customer, mode: "full", creditId: item.credit_id })}>
                                  <Check style={{ width: 13, height: 13 }} /> {t.markAsPaid}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Payment timeline + actions */}
                      <div style={{ background: "#fff", border: "1px solid #E2EBFF", borderRadius: 12, padding: "14px 16px" }}>
                        <p style={{ ...labelSm, marginBottom: 10 }}>{t.paymentTimeline}</p>
                        <PaymentTimeline payments={customer.payments} remaining={fullyPaid ? 0 : customer.total_amount_owed} t={t} />
                        {!fullyPaid && (
                          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                            <button style={{ ...outlineBtn, fontSize: 12, padding: "8px 16px" }} onClick={() => setPaymentTarget({ customer, mode: "partial" })}>
                              {t.partialPayment}
                            </button>
                            <button style={{ ...orangeBtn, fontSize: 12, padding: "8px 16px" }} onClick={() => setPaymentTarget({ customer, mode: "full" })}>
                              <Check style={{ width: 13, height: 13 }} /> {t.markCustomerPaid}
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Total footer */}
          <div style={{ background: "#1E40AF", borderRadius: 14, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{filter === "paid" ? t.paidCreditsHistory : t.remainingCreditTotal}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{formatMoney(totalAmountOwed)}</span>
          </div>
        </div>
      )}

      <PaymentModal paymentTarget={paymentTarget} onClose={() => setPaymentTarget(null)} onSaved={() => loadCredits(filter)} t={t} />
      <GiveMoneyModal open={giveMoneyOpen} onClose={() => setGiveMoneyOpen(false)} onSaved={() => loadCredits(filter)} t={t} />
    </div>
  );
}
