import React, { useEffect, useMemo, useState } from "react";
import { Plus, ReceiptText, Trash2 } from "lucide-react";
import { apiRequest, formatMoney, monthISO, todayISO } from "../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";

const categories = ["Rent", "Salary", "Electricity", "Transport", "Supplies", "Food", "Other"];

export default function Expenses() {
  const [month, setMonth] = useState(monthISO());
  const [expenses, setExpenses] = useState([]);
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({
    category: "Rent",
    amount: "",
    description: "",
    expense_date: todayISO()
  });
  const [status, setStatus] = useState({ loading: true, saving: false, error: "", success: "" });

  async function loadExpenses(selectedMonth = month) {
    setStatus((current) => ({ ...current, loading: true, error: "" }));

    try {
      const [expensesResponse, reportResponse] = await Promise.all([
        apiRequest(`/expenses?month=${selectedMonth}`),
        apiRequest(`/reports/expenses?month=${selectedMonth}`)
      ]);
      setExpenses(expensesResponse.data || []);
      setReport(reportResponse.data || null);
      setStatus((current) => ({ ...current, loading: false, error: "" }));
    } catch (error) {
      setStatus((current) => ({ ...current, loading: false, error: error.message }));
    }
  }

  useEffect(() => {
    loadExpenses(month);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus((current) => ({ ...current, saving: true, error: "", success: "" }));

    try {
      await apiRequest("/expenses", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount)
        })
      });
      setForm((current) => ({
        ...current,
        amount: "",
        description: "",
        expense_date: todayISO()
      }));
      setStatus((current) => ({ ...current, saving: false, success: "Expense added." }));
      await loadExpenses(month);
    } catch (error) {
      setStatus((current) => ({ ...current, saving: false, error: error.message }));
    }
  }

  async function removeExpense(id) {
    const confirmed = window.confirm("Remove this expense?");
    if (!confirmed) return;

    setStatus((current) => ({ ...current, error: "", success: "" }));

    try {
      await apiRequest(`/expenses/${id}`, { method: "DELETE" });
      await loadExpenses(month);
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    }
  }

  function changeMonth(nextMonth) {
    setMonth(nextMonth);
    loadExpenses(nextMonth);
  }

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  }, [expenses]);

  if (status.loading) return <LoadingState />;

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="panel p-4">
          <h2 className="mb-4 text-base font-bold text-slate-950">Add Expense</h2>
          {status.error ? <ErrorState message={status.error} /> : null}
          {status.success ? <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">{status.success}</div> : null}

          <div className="space-y-3">
            <select className="field" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              className="field"
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
            />
            <input
              className="field"
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <input
              className="field"
              type="date"
              value={form.expense_date}
              onChange={(event) => setForm({ ...form, expense_date: event.target.value })}
            />
          </div>

          <button className="btn-primary mt-4 w-full" disabled={status.saving}>
            <Plus className="h-4 w-4" />
            {status.saving ? "Adding..." : "Add Expense"}
          </button>
        </form>

        <div className="panel p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">Monthly Expenses</h2>
              <p className="text-sm text-slate-500">Track costs that reduce net profit.</p>
            </div>
            <input className="field sm:max-w-xs" type="month" value={month} onChange={(event) => changeMonth(event.target.value)} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-blue-600 p-4 text-white">
              <p className="text-sm text-blue-100">Total expenses</p>
              <p className="mt-2 text-2xl font-bold">{formatMoney(totalExpenses)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Expense records</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{expenses.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="panel overflow-hidden">
          <div className="border-b border-slate-100 p-4">
            <h2 className="text-base font-bold text-slate-950">Expense List</h2>
          </div>

          {expenses.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No expenses yet" description="Add an expense to start tracking monthly costs." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{new Date(expense.expense_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-semibold text-slate-950">{expense.category}</td>
                      <td className="px-4 py-3 text-slate-600">{expense.description || "-"}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-950">{formatMoney(expense.amount)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
                          onClick={() => removeExpense(expense.id)}
                          title="Remove expense"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="panel p-4">
          <div className="mb-4 flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-950">By Category</h2>
          </div>

          {report?.categories?.length ? (
            <div className="space-y-3">
              {report.categories.map((category) => (
                <div key={category.category} className="flex justify-between rounded-lg bg-slate-50 p-3">
                  <span className="font-medium text-slate-800">{category.category}</span>
                  <span className="font-bold text-slate-950">{formatMoney(category.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No categories yet" description="Expense categories will appear here." />
          )}
        </aside>
      </section>
    </div>
  );
}
