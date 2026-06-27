import React, { useEffect, useMemo, useState } from "react";
import { 
  AlertTriangle, Check, CreditCard, Phone, Plus, Search, 
  ChevronDown, ChevronRight, Wallet, History, ArrowUpRight 
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
})[key] || key;

// --- UTILS ---
const getCustomerKey = (c) => `${c.customer_name}|${c.customer_phone}`.toLowerCase();
const formatDT = (v) => {
  if (!v) return "N/A";
  return new Date(v).toLocaleString("en-GB", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
  });
};

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
                            <p className="font-black text-slate-900">{formatMoney(item.amount_owed)}</p>
                            <button
                              onClick={() => setPaymentTarget({ customer, mode: "full", creditId: item.id })}
                              className="text-[10px] font-black text-orange-500 hover:text-orange-700 uppercase mt-1"
                            >
                              {t("payThis")}
                            </button>
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

    </div>
  );
}
