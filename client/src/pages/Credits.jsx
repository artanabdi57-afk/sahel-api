import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, ChevronDown, ChevronRight, CreditCard, Phone, Plus, Search, X } from "lucide-react";
import { apiRequest, formatMoney } from "../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";

function getCustomerKey(credit) {
  return `${credit.customer_name || "Unknown customer"}|${credit.customer_phone || "N/A"}`.toLowerCase();
}

function formatDateTime(value) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatShortDate(value) {
  if (!value) return "Unknown date";
  return new Date(value).toLocaleString("en", { month: "long", day: "numeric" });
}

function paymentLabel(method) {
  return method === "bank" ? "Bank Transfer" : "Cash";
}

function buildCustomers(credits, search) {
  const groups = new Map();

  credits.forEach((credit) => {
    const key = getCustomerKey(credit);
    const existing = groups.get(key) || {
      key,
      customer_name: credit.customer_name || "Unknown customer",
      customer_phone: credit.customer_phone || "N/A",
      credits: [],
      items: [],
      payments: [],
      total_amount_owed: 0,
      total_original_amount: 0,
      total_paid: 0,
      latest_date: credit.created_at,
      paid_on: null,
      status: "unpaid",
      has_overdue: false,
      max_days_outstanding: 0
    };

    const creditPayments = credit.payments || [];
    const itemAmount = (credit.items || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

    existing.credits.push(credit);
    existing.payments.push(...creditPayments.map((payment) => ({ ...payment, credit })));
    existing.total_amount_owed += Number(credit.amount_owed || 0);
    existing.total_original_amount += itemAmount;
    existing.total_paid += Number(credit.total_paid || 0);

    if (credit.is_overdue) existing.has_overdue = true;
    if (Number(credit.days_outstanding || 0) > existing.max_days_outstanding) {
      existing.max_days_outstanding = Number(credit.days_outstanding || 0);
    }

    (credit.items || []).forEach((item) => {
      existing.items.push({
        credit_id: credit.id,
        credit_status: credit.status,
        product_name: item.product_name || "Unknown product",
        quantity: Number(item.quantity || 1),
        amount: Number(item.amount || 0),
        remaining: Number(credit.amount_owed || 0),
        date: credit.created_at,
        paid_on: credit.paid_on,
        payments: creditPayments,
        is_overdue: credit.is_overdue,
        days_outstanding: credit.days_outstanding
      });
    });

    if (credit.created_at && (!existing.latest_date || new Date(credit.created_at) > new Date(existing.latest_date))) {
      existing.latest_date = credit.created_at;
    }

    if (credit.paid_on && (!existing.paid_on || new Date(credit.paid_on) > new Date(existing.paid_on))) {
      existing.paid_on = credit.paid_on;
    }

    groups.set(key, existing);
  });

  const query = search.trim().toLowerCase();
  return [...groups.values()]
    .map((customer) => {
      const allPaid = customer.credits.length > 0 && customer.credits.every((credit) => credit.status === "paid");
      const hasPartial = customer.credits.some((credit) => credit.status === "partial");
      return {
        ...customer,
        payments: customer.payments.sort((a, b) => new Date(a.payment_date || 0) - new Date(b.payment_date || 0)),
        status: allPaid ? "paid" : hasPartial ? "partial" : "unpaid"
      };
    })
    .filter((customer) => {
      if (!query) return true;
      return customer.customer_name.toLowerCase().includes(query) || customer.customer_phone.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      // Overdue customers float to the top
      if (a.has_overdue && !b.has_overdue) return -1;
      if (!a.has_overdue && b.has_overdue) return 1;
      return a.customer_name.localeCompare(b.customer_name);
    });
}

function OverdueBadge({ days }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-black uppercase text-rose-700">
      <AlertTriangle className="h-3.5 w-3.5" />
      Overdue - {days}d
    </span>
  );
}

function PaymentTimeline({ payments, remaining, compact = false }) {
  if (!payments.length) {
    return <p className="text-sm font-medium text-slate-400">No payments recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {payments.map((payment) => (
        <div key={payment.id} className={compact ? "text-sm text-slate-600" : "rounded-lg bg-slate-50 p-3 text-sm"}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold text-slate-950">
              {compact ? formatShortDate(payment.payment_date) : formatDateTime(payment.payment_date)}
            </p>
            <p className="font-black text-green-700">paid {formatMoney(payment.amount_paid)}</p>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {paymentLabel(payment.payment_method)}
            {payment.notes ? ` - ${payment.notes}` : ""}
          </p>
        </div>
      ))}
      {typeof remaining === "number" ? (
        <p className="pt-1 text-sm font-black text-blue-700">Remaining: {formatMoney(remaining)}</p>
      ) : null}
    </div>
  );
}

function PaymentModal({ paymentTarget, onClose, onSaved }) {
  if (!paymentTarget || !paymentTarget.customer) return null;

  const customer = paymentTarget.customer;
  const mode = paymentTarget?.mode || "partial";
  const targetCreditId = paymentTarget?.creditId || null;
  const targetCredits = targetCreditId
    ? (customer.credits || []).filter((credit) => credit.id === targetCreditId)
    : (customer.credits || []).filter((credit) => credit.status !== "paid");
  const amountDue = targetCredits.reduce((sum, credit) => sum + Number(credit.amount_owed || 0), 0);
  const payments = targetCreditId
    ? (customer.payments || []).filter((payment) => payment.credit_id === targetCreditId)
    : (customer.payments || []);

  const [form, setForm] = useState({
    amount_paid: mode === "full" ? String(amountDue) : "",
    payment_method: "cash",
    notes: ""
  });
  const [status, setStatus] = useState({ saving: false, error: "", success: "" });

  async function savePayment(event) {
    event.preventDefault();
    let remainingPayment = Number(form.amount_paid);

    if (!remainingPayment || remainingPayment <= 0) {
      setStatus({ saving: false, error: "Enter a payment amount greater than 0.", success: "" });
      return;
    }

    setStatus({ saving: true, error: "", success: "" });

    try {
      let lastPaymentDate = new Date().toISOString();
      const orderedCredits = [...targetCredits].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

      for (const credit of orderedCredits) {
        if (remainingPayment <= 0) break;
        const owed = Number(credit.amount_owed || 0);
        const amountForCredit = Math.min(remainingPayment, owed);
        if (amountForCredit <= 0) continue;

        const endpoint = amountForCredit >= owed ? `/credits/${credit.id}/paid` : `/credits/${credit.id}/partial`;
        const response = await apiRequest(endpoint, {
          method: "PUT",
          body: JSON.stringify({
            amount_paid: amountForCredit,
            payment_method: form.payment_method,
            notes: form.notes
          })
        });

        lastPaymentDate = response.data?.payment?.payment_date || lastPaymentDate;
        remainingPayment -= amountForCredit;
      }

      setStatus({
        saving: false,
        error: "",
        success: `Payment recorded on ${formatDateTime(lastPaymentDate)}`
      });
      await onSaved();
      setTimeout(onClose, 900);
    } catch (error) {
      setStatus({ saving: false, error: error.message, success: "" });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="text-xl font-black text-slate-950">
              {mode === "full" ? "Mark as Paid" : "Partial Payment"}
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">{customer.customer_name}</p>
          </div>
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={savePayment} className="space-y-5 p-5">
          <section>
            <p className="mb-2 text-sm font-black text-slate-950">Payment history</p>
            <PaymentTimeline payments={payments} remaining={amountDue} />
          </section>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-bold text-slate-600">Amount due</p>
            <p className="mt-1 text-2xl font-black text-blue-700">{formatMoney(amountDue)}</p>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Amount being paid now</span>
            <input
              className="field mt-2"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount_paid}
              onChange={(event) => setForm({ ...form, amount_paid: event.target.value })}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Payment method</span>
            <select
              className="field mt-2"
              value={form.payment_method}
              onChange={(event) => setForm({ ...form, payment_method: event.target.value })}
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Notes optional</span>
            <textarea
              className="field mt-2 min-h-[90px]"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Example: paid by bank transfer receipt"
            />
          </label>

          {status.error ? <p className="rounded-lg bg-rose-50 p-3 text-sm font-bold text-rose-700">{status.error}</p> : null}
          {status.success ? <p className="rounded-lg bg-green-50 p-3 text-sm font-bold text-green-700">{status.success}</p> : null}

          <button className="btn-primary w-full" disabled={status.saving}>
            <Check className="h-4 w-4" />
            {status.saving ? "Saving..." : "Save payment"}
          </button>
        </form>
      </div>
    </div>
  );
}

function GiveMoneyModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", amount_owed: "", notes: "" });
  const [status, setStatus] = useState({ saving: false, error: "", success: "" });

  useEffect(() => {
    if (open) {
      setForm({ customer_name: "", customer_phone: "", amount_owed: "", notes: "" });
      setStatus({ saving: false, error: "", success: "" });
    }
  }, [open]);

  if (!open) return null;

  async function saveDebt(event) {
    event.preventDefault();

    if (!form.customer_name.trim()) {
      setStatus({ saving: false, error: "Enter the person's name.", success: "" });
      return;
    }
    const amount = Number(form.amount_owed);
    if (!amount || amount <= 0) {
      setStatus({ saving: false, error: "Enter an amount greater than 0.", success: "" });
      return;
    }

    setStatus({ saving: true, error: "", success: "" });

    try {
      await apiRequest("/credits", {
        method: "POST",
        body: JSON.stringify({
          customer_name: form.customer_name.trim(),
          customer_phone: form.customer_phone.trim(),
          amount_owed: amount,
          notes: form.notes.trim()
        })
      });

      setStatus({ saving: false, error: "", success: "Debt recorded successfully." });
      await onSaved();
      setTimeout(onClose, 700);
    } catch (error) {
      setStatus({ saving: false, error: error.message, success: "" });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="text-xl font-black text-slate-950">Record Money Given</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">Track cash you gave someone that they owe back</p>
          </div>
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={saveDebt} className="space-y-5 p-5">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Person's name</span>
            <input
              className="field mt-2"
              type="text"
              value={form.customer_name}
              onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
              placeholder="Example: Ahmed Ali"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Phone number optional</span>
            <input
              className="field mt-2"
              type="text"
              value={form.customer_phone}
              onChange={(event) => setForm({ ...form, customer_phone: event.target.value })}
              placeholder="Example: 615738632"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Amount given</span>
            <input
              className="field mt-2"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount_owed}
              onChange={(event) => setForm({ ...form, amount_owed: event.target.value })}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Notes optional</span>
            <textarea
              className="field mt-2 min-h-[90px]"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Example: lent for school fees, will repay end of month"
            />
          </label>

          {status.error ? <p className="rounded-lg bg-rose-50 p-3 text-sm font-bold text-rose-700">{status.error}</p> : null}
          {status.success ? <p className="rounded-lg bg-green-50 p-3 text-sm font-bold text-green-700">{status.success}</p> : null}

          <button className="btn-primary w-full" disabled={status.saving}>
            <Plus className="h-4 w-4" />
            {status.saving ? "Saving..." : "Record debt"}
          </button>
        </form>
      </div>
    </div>
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

  async function loadCredits(nextFilter = filter) {
    setStatus({ loading: true, error: "" });

    try {
      const response = await apiRequest(`/credits?status=${nextFilter}`);
      setCredits(response.data || []);
      setStatus({ loading: false, error: "" });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  useEffect(() => {
    loadCredits(filter);
  }, [filter]);

  const customers = useMemo(() => buildCustomers(credits, search), [credits, search]);
  const totalAmountOwed = customers.reduce((sum, customer) => sum + customer.total_amount_owed, 0);
  const overdueCustomers = customers.filter((customer) => customer.has_overdue);
  const overdueTotal = overdueCustomers.reduce((sum, customer) => sum + customer.total_amount_owed, 0);

  function openPaymentModal(customer, mode, creditId = null) {
    setPaymentTarget({ customer, mode, creditId });
  }

  if (status.loading) return <LoadingState />;

  return (
    <div className="space-y-5">
      <section className="panel p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Customer Credits</h2>
              <p className="text-sm font-medium text-slate-500">Track debt, payments, and paid history.</p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center xl:max-w-4xl">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="field pl-10"
                placeholder="Search customer name or phone"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <div className="flex rounded-xl border border-slate-200 bg-white p-1">
              {[
                ["open", "Open"],
                ["overdue", "Overdue"],
                ["paid", "Paid"],
                ["all", "All"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={`rounded-lg px-4 py-2 text-sm font-black transition ${
                    filter === value ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="btn-primary whitespace-nowrap" onClick={() => setGiveMoneyOpen(true)}>
              <Plus className="h-4 w-4" />
              Give Money
            </button>
          </div>
        </div>
      </section>

      {overdueCustomers.length > 0 && filter !== "overdue" ? (
        <button
          className="panel flex w-full items-center justify-between gap-3 border-rose-200 bg-rose-50 p-4 text-left transition hover:bg-rose-100"
          onClick={() => setFilter("overdue")}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <p className="text-sm font-black text-rose-700">
              {overdueCustomers.length} {overdueCustomers.length === 1 ? "customer has" : "customers have"} debts overdue 30+ days
            </p>
          </div>
          <p className="text-sm font-black text-rose-700">{formatMoney(overdueTotal)} -&gt;</p>
        </button>
      ) : null}

      {status.error ? <ErrorState message={status.error} /> : null}

      {customers.length === 0 ? (
        <div className="panel p-4">
          <EmptyState
            title={filter === "paid" ? "No paid credits yet" : filter === "overdue" ? "No overdue debts" : "No credits found"}
            description={
              filter === "paid"
                ? "Fully paid credit history will appear here."
                : filter === "overdue"
                ? "Debts older than 30 days will show up here."
                : "Credit customers will appear here."
            }
          />
        </div>
      ) : (
        <section className="grid gap-4">
          {customers.map((customer) => {
            const isOpen = openCustomer === customer.key;
            const fullyPaid = customer.status === "paid";

            return (
              <article
                key={customer.key}
                className={`panel overflow-hidden ${customer.has_overdue ? "border-rose-200" : ""}`}
              >
                <button
                  type="button"
                  className="flex w-full flex-col gap-4 p-5 text-left transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                  onClick={() => setOpenCustomer(isOpen ? "" : customer.key)}
                >
                  <div className="flex items-start gap-3">
                    {isOpen ? <ChevronDown className="mt-1 h-5 w-5 text-slate-400" /> : <ChevronRight className="mt-1 h-5 w-5 text-slate-400" />}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-slate-950">{customer.customer_name}</h3>
                        {fullyPaid ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            FULLY PAID
                          </span>
                        ) : customer.has_overdue ? (
                          <OverdueBadge days={customer.max_days_outstanding} />
                        ) : (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase text-amber-700">{customer.status}</span>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-500">
                        <Phone className="h-4 w-4" />
                        {customer.customer_phone}
                      </p>
                      {fullyPaid ? <p className="mt-2 text-sm font-bold text-green-700">Paid On: {formatDateTime(customer.paid_on)}</p> : null}
                    </div>
                  </div>

                  <div className="grid gap-2 text-left sm:grid-cols-3 lg:min-w-[420px]">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-500">Original</p>
                      <p className="font-black text-slate-950">{formatMoney(customer.total_original_amount)}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3">
                      <p className="text-xs font-bold text-green-600">Paid</p>
                      <p className="font-black text-green-700">{formatMoney(customer.total_paid)}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-xs font-bold text-blue-600">Remaining</p>
                      <p className="font-black text-blue-700">{formatMoney(customer.total_amount_owed)}</p>
                    </div>
                  </div>
                </button>

                {isOpen ? (
                  <div className="border-t border-slate-100 bg-white p-5">
                    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
                      <div className="space-y-3">
                        {customer.items.map((item) => (
                          <div key={item.credit_id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-black text-slate-950">{item.product_name}</p>
                                  {item.is_overdue ? <OverdueBadge days={item.days_outstanding} /> : null}
                                </div>
                                <p className="mt-1 text-sm font-semibold text-slate-500">
                                  Qty {item.quantity} - {formatDateTime(item.date)}
                                </p>
                                {item.credit_status === "paid" ? (
                                  <p className="mt-2 text-sm font-bold text-green-700">Paid On: {formatDateTime(item.paid_on)}</p>
                                ) : null}
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="font-black text-slate-950">{formatMoney(item.amount)}</p>
                                <p className="text-sm font-semibold text-blue-700">Remaining {formatMoney(item.remaining)}</p>
                              </div>
                            </div>
                            {item.credit_status !== "paid" ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button className="btn-secondary" onClick={() => openPaymentModal(customer, "partial", item.credit_id)}>
                                  Partial Payment
                                </button>
                                <button className="btn-primary" onClick={() => openPaymentModal(customer, "full", item.credit_id)}>
                                  <Check className="h-4 w-4" />
                                  Mark as Paid
                                </button>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      <aside className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                        <p className="text-sm font-black text-slate-950">Payment timeline</p>
                        <div className="mt-3">
                          <PaymentTimeline payments={customer.payments} remaining={fullyPaid ? 0 : customer.total_amount_owed} compact />
                        </div>
                        {!fullyPaid ? (
                          <div className="mt-4 flex flex-col gap-2">
                            <button className="btn-secondary" onClick={() => openPaymentModal(customer, "partial")}>
                              Partial Payment
                            </button>
                            <button className="btn-primary" onClick={() => openPaymentModal(customer, "full")}>
                              <Check className="h-4 w-4" />
                              Mark Customer Paid
                            </button>
                          </div>
                        ) : null}
                      </aside>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}

          <div className="panel flex flex-col gap-2 bg-blue-600 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
            <p className="font-black">{filter === "paid" ? "Paid credits history total" : "Remaining credit total"}</p>
            <p className="text-2xl font-black">{formatMoney(totalAmountOwed)}</p>
          </div>
        </section>
      )}

      <PaymentModal
        paymentTarget={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onSaved={() => loadCredits(filter)}
      />

      <GiveMoneyModal
        open={giveMoneyOpen}
        onClose={() => setGiveMoneyOpen(false)}
        onSaved={() => loadCredits(filter)}
      />
    </div>
  );
}
