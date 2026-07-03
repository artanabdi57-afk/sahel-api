import React, { useEffect, useMemo, useState } from "react";
import { 
  AlertTriangle, Check, CreditCard, Phone, Plus, Search, 
  ChevronDown, ChevronRight, Wallet, History, ArrowUpRight, X, Loader2
} from "lucide-react";
import { apiRequest, formatMoney } from "../lib/api";
import { EmptyState, LoadingState } from "../components/AsyncState";

// --- i18n removed: hardcoded English ---
const t = (key) => ({
  credits: "Customer Credits",
  creditSubtext: "Manage debts and incoming payments",
  giveMoney: "Record Debt",
  totalOwed: "Total Owed",
  overdue: "Overdue",
  searchCustomer: "Search name or phone...",
  open: "Open",
  paid: "Paid",
  noCredits: "No records found",
  remaining: "Remaining",
  debtHistory: "Debt History",
  payThis: "Pay item",
  payment: "Payment",
  totalBalance: "Total Balance Due",
  partialPay: "Partial Payment",
  markPaid: "Mark Fully Paid",
  grandTotal: "Total Outstanding",
  amountToPay: "Amount to Pay",
  cancel: "Cancel",
  confirmPayment: "Confirm Payment",
  processing: "Processing...",
  amountExceeds: "Amount cannot exceed remaining balance",
  amountRequired: "Enter a valid amount",
  customerName: "Customer Name",
  customerPhone: "Phone Number",
  productName: "Item / Reason (optional)",
  amountOwed: "Amount Owed",
  recordDebt: "Record Debt",
  fieldsRequired: "Please fill in all required fields",
})[key] || key;

// --- UTILS ---
const getCustomerKey = (c) => `${c.customer_name}|${c.customer_phone}`.toLowerCase();
const formatDT = (v) => {
  if (!v) return "N/A";
  return new Date(v).toLocaleString("en-GB", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
  });
};
const remainingOf = (item) => Math.max(0, Number(item.amount_owed || 0) - Number(item.total_paid || 0));

// --- COMPONENTS ---
function SummaryCard({ label, value, icon: Icon, colorClass }) {
  return (
    <div className="rounded-3xl p-5 border border-slate-200/60 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <div className={`p-2 rounded-xl ${colorClass}`}><Icon size={16} /></div>
      </div>
      <h3 className="text-2xl font-black text-slate-900">{formatMoney(value)}</h3>
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-black text-slate-900 mb-6 pr-8">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// paymentTarget: { customer, mode: 'full' | 'partial', creditId?: string }
// If creditId is present, the payment applies to that single credit line.
// If creditId is absent, the payment applies across the customer's open items,
// oldest first, until the amount (or full balance) is exhausted.
//
// Backend contract (matches the existing working routes):
//   PUT /credits/:id/partial  { amount_paid, payment_method, notes }
//   PUT /credits/:id/paid     { amount_paid, payment_method, notes }
// Use "paid" only when the payment fully clears that specific credit line's
// remaining balance; otherwise use "partial".
function PaymentModal({ paymentTarget, onClose, onSuccess }) {
  const { customer, mode, creditId } = paymentTarget;

  const targetItems = creditId
    ? customer.items.filter(i => i.id === creditId)
    : customer.items;
  const maxRemaining = targetItems.reduce((s, i) => s + remainingOf(i), 0);

  const [amount, setAmount] = useState(mode === "full" ? String(maxRemaining) : "");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      setError(t("amountRequired"));
      return;
    }
    if (value > maxRemaining + 0.01) {
      setError(t("amountExceeds"));
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      let remainingToApply = value;
      const orderedItems = [...targetItems].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      for (const item of orderedItems) {
        if (remainingToApply <= 0) break;
        const itemRemaining = remainingOf(item);
        if (itemRemaining <= 0) continue;
        const portion = Math.min(itemRemaining, remainingToApply);
        const clearsItem = portion >= itemRemaining - 0.01;
        const endpoint = clearsItem ? `/credits/${item.id}/paid` : `/credits/${item.id}/partial`;
        await apiRequest(endpoint, {
          method: "PUT",
          body: JSON.stringify({
            amount_paid: portion,
            payment_method: paymentMethod,
            notes: notes.trim(),
          }),
        });
        remainingToApply -= portion;
      }
      onSuccess();
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title={mode === "full" ? t("markPaid") : t("partialPay")} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{customer.customer_name}</p>
          <p className="text-2xl font-black text-blue-900">{formatMoney(maxRemaining)}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">{t("remaining")}</p>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
            {t("amountToPay")}
          </label>
          <input
            type="number"
            inputMode="decimal"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-lg font-black outline-none focus:ring-2 focus:ring-blue-500"
            value={amount}
            disabled={mode === "full"}
            onChange={e => { setAmount(e.target.value); setError(""); }}
            placeholder="0"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
            Payment Method
          </label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold outline-none focus:ring-2 focus:ring-blue-500"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
            Notes (optional)
          </label>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 min-h-[64px]"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {error && <p className="text-orange-600 text-xs font-bold">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl font-black text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl font-black text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> {t("processing")}</>
            ) : (
              <><Check size={16} /> {t("confirmPayment")}</>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function GiveMoneyModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", notes: "", amount_owed: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.customer_name.trim() || !Number(form.amount_owed)) {
      setError(t("fieldsRequired"));
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await apiRequest("/credits", {
        method: "POST",
        body: JSON.stringify({
          customer_name: form.customer_name.trim(),
          customer_phone: form.customer_phone.trim(),
          amount_owed: Number(form.amount_owed),
          notes: form.notes.trim(),
        }),
      });
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to record debt");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title={t("recordDebt")} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">{t("customerName")}</label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold outline-none focus:ring-2 focus:ring-blue-500"
            value={form.customer_name}
            onChange={update("customer_name")}
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">{t("customerPhone")}</label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold outline-none focus:ring-2 focus:ring-blue-500"
            value={form.customer_phone}
            onChange={update("customer_phone")}
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Notes (optional)</label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold outline-none focus:ring-2 focus:ring-blue-500"
            value={form.notes}
            onChange={update("notes")}
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">{t("amountOwed")}</label>
          <input
            type="number"
            inputMode="decimal"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-lg font-black outline-none focus:ring-2 focus:ring-blue-500"
            value={form.amount_owed}
            onChange={update("amount_owed")}
            placeholder="0"
          />
        </div>
        {error && <p className="text-orange-600 text-xs font-bold">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl font-black text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl font-black text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> {t("processing")}</>
            ) : (
              <><Plus size={16} /> {t("recordDebt")}</>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default function Credits() {
  const [credits, setCredits] = useState([]);
  const [filter, setFilter] = useState("open");
  const [search, setSearch] = useState("");
  const [openCustomer, setOpenCustomer] = useState("");
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [giveMoneyOpen, setGiveMoneyOpen] = useState(false);
  const [status, setStatus] = useState({ loading: true, error: "" });

  const loadCredits = async (f = filter) => {
    setStatus({ loading: true, error: "" });
    try {
      const res = await apiRequest(`/credits?status=${f}`);
      setCredits(res.data || []);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  };

  useEffect(() => { loadCredits(filter); }, [filter]);

  const customers = useMemo(() => {
    const groups = new Map();
    credits.forEach(c => {
      const key = getCustomerKey(c);
      if (!groups.has(key)) {
        groups.set(key, { ...c, key, items: [], total_owed: 0, total_paid: 0, has_overdue: false });
      }
      const g = groups.get(key);
      g.items.push(c);
      g.total_owed += Number(c.amount_owed || 0);
      g.total_paid += Number(c.total_paid || 0);
      if (c.is_overdue) g.has_overdue = true;
    });
    return [...groups.values()]
      .filter(c => c.customer_name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.has_overdue - a.has_overdue);
  }, [credits, search]);

  const grandTotalOwed = customers.reduce((s, c) => s + c.total_owed, 0);

  const handlePaymentSuccess = () => {
    setPaymentTarget(null);
    loadCredits(filter);
  };

  const handleGiveMoneySuccess = () => {
    setGiveMoneyOpen(false);
    loadCredits(filter);
  };

  if (status.loading) return <LoadingState />;

  return (
    <div className="space-y-6 pb-20 font-sans min-h-screen p-4 md:p-8 bg-[#FAF9F6]">

      {/* HEADER */}
      <header className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tight">{t("credits")}</h1>
            <p className="text-slate-500 font-medium text-sm">{t("creditSubtext")}</p>
          </div>
          <button
            onClick={() => setGiveMoneyOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95"
          >
            <Plus size={20} /> {t("giveMoney")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard label={t("totalOwed")} value={grandTotalOwed} icon={Wallet} colorClass="bg-blue-50 text-blue-600" />
          <SummaryCard
            label={t("overdue")}
            value={customers.filter(c => c.has_overdue).reduce((s, c) => s + c.total_owed, 0)}
            icon={AlertTriangle}
            colorClass="bg-orange-50 text-orange-600"
          />
          <div className="md:col-span-2 flex items-center gap-2 bg-white p-2 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("searchCustomer")}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {["open", "overdue", "paid"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === f ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-100"}`}
                >
                  {t(f)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* CUSTOMER LIST */}
      <section className="space-y-4">
        {customers.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-10 text-center border border-slate-100 shadow-sm">
            <EmptyState title={t("noCredits")} />
          </div>
        ) : customers.map(customer => {
          const isOpen = openCustomer === customer.key;
          return (
            <div
              key={customer.key}
              className={`bg-white border rounded-[2rem] overflow-hidden transition-all ${customer.has_overdue ? "border-orange-200 shadow-orange-100/20 shadow-xl" : "border-slate-100 shadow-sm hover:shadow-md"}`}
            >
              <button
                onClick={() => setOpenCustomer(isOpen ? "" : customer.key)}
                className="w-full flex flex-col md:flex-row md:items-center justify-between p-6 text-left gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${customer.has_overdue ? "bg-orange-500 text-white" : "bg-blue-100 text-blue-700"}`}>
                    {customer.customer_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{customer.customer_name}</h3>
                      {customer.has_overdue && (
                        <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
                          {t("overdue")}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs font-bold flex items-center gap-1 mt-0.5">
                      <Phone size={12} /> {customer.customer_phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">{t("remaining")}</p>
                    <p className="text-xl font-black text-blue-700">{formatMoney(customer.total_owed)}</p>
                  </div>
                  {isOpen ? <ChevronDown className="text-slate-300" /> : <ChevronRight className="text-slate-300" />}
                </div>
              </button>

              {isOpen && (
                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-3">
                      <h4 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                        <History size={14} /> {t("debtHistory")}
                      </h4>
                      {customer.items.map((item, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex justify-between items-center">
                          <div>
                            <p className="font-black text-slate-800 text-sm">{item.product_name || "Direct Loan"}</p>
                            <p className="text-[10px] font-bold text-slate-400">{formatDT(item.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-900">{formatMoney(remainingOf(item))}</p>
                            {remainingOf(item) > 0 && (
                              <button
                                onClick={() => setPaymentTarget({ customer, mode: "partial", creditId: item.id })}
                                className="text-[10px] font-black text-orange-500 hover:text-orange-700 uppercase mt-1"
                              >
                                {t("payThis")}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-900 text-white rounded-[2rem] p-6 shadow-xl shadow-blue-200">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-blue-200">{t("payment")}</h4>
                        <ArrowUpRight size={16} className="text-blue-300" />
                      </div>
                      <div className="mb-8">
                        <p className="text-3xl font-black mb-1">{formatMoney(customer.total_owed)}</p>
                        <p className="text-[10px] font-bold text-blue-300 uppercase">{t("totalBalance")}</p>
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={() => setPaymentTarget({ customer, mode: "partial" })}
                          className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl font-black text-sm transition-all border border-white/10"
                        >
                          {t("partialPay")}
                        </button>
                        <button
                          onClick={() => setPaymentTarget({ customer, mode: "full" })}
                          className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded-xl font-black text-sm shadow-lg transition-all"
                        >
                          <Check size={16} className="inline mr-2" /> {t("markPaid")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* BOTTOM BAR */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-blue-900 text-white p-4 rounded-[2rem] shadow-2xl flex justify-between items-center z-40 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl"><CreditCard size={18} /></div>
          <span className="text-xs font-black uppercase tracking-widest">{t("grandTotal")}</span>
        </div>
        <span className="text-2xl font-black">{formatMoney(grandTotalOwed)}</span>
      </div>

      {/* MODALS */}
      {paymentTarget && (
        <PaymentModal
          paymentTarget={paymentTarget}
          onClose={() => setPaymentTarget(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
      {giveMoneyOpen && (
        <GiveMoneyModal
          onClose={() => setGiveMoneyOpen(false)}
          onSuccess={handleGiveMoneySuccess}
        />
      )}

    </div>
  );
}
