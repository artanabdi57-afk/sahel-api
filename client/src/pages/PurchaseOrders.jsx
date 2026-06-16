import React from "react";
import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import { apiRequest } from "../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ product_name: "", quantity_ordered: "", expected_cost: "", expected_arrival: "" });
  const [status, setStatus] = useState({ loading: true, saving: false, error: "" });

  async function loadOrders() {
    const response = await apiRequest("/orders");
    setOrders(response.data || []);
  }

  useEffect(() => {
    loadOrders()
      .catch((error) => setStatus((current) => ({ ...current, error: error.message })))
      .finally(() => setStatus((current) => ({ ...current, loading: false })));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus((current) => ({ ...current, saving: true, error: "" }));
    try {
      await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          quantity_ordered: Number(form.quantity_ordered),
          expected_cost: Number(form.expected_cost)
        })
      });
      setForm({ product_name: "", quantity_ordered: "", expected_cost: "", expected_arrival: "" });
      await loadOrders();
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    } finally {
      setStatus((current) => ({ ...current, saving: false }));
    }
  }

  if (status.loading) return <LoadingState />;

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <form onSubmit={handleSubmit} className="panel p-4">
        <h2 className="mb-4 text-base font-bold text-slate-950">New Purchase Order</h2>
        <div className="space-y-3">
          <input className="field" placeholder="Product name" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
          <input className="field" type="number" placeholder="Quantity ordered" value={form.quantity_ordered} onChange={(e) => setForm({ ...form, quantity_ordered: e.target.value })} />
          <input className="field" type="number" placeholder="Expected cost" value={form.expected_cost} onChange={(e) => setForm({ ...form, expected_cost: e.target.value })} />
          <input className="field" type="date" value={form.expected_arrival} onChange={(e) => setForm({ ...form, expected_arrival: e.target.value })} />
          <button className="btn-primary w-full" disabled={status.saving}>
            <PackageCheck className="h-4 w-4" />
            {status.saving ? "Creating..." : "Create order"}
          </button>
        </div>
        {status.error ? <p className="mt-3 text-sm text-red-600">{status.error}</p> : null}
      </form>

      <section className="panel p-4">
        <h2 className="mb-4 text-base font-bold text-slate-950">Orders</h2>
        {status.error ? <ErrorState message={status.error} /> : null}
        {orders.length === 0 ? (
          <EmptyState title="No purchase orders" description="Create an order when you need to restock." />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{order.product_name}</p>
                    <p className="text-sm text-slate-500">Ordered: {order.quantity_ordered}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
