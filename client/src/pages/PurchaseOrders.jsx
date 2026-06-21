import React, { useEffect, useState } from "react";
import { Check, PackageCheck, Plus, Trash2, X } from "lucide-react";
import { apiRequest, formatMoney } from "../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-blue-50 text-blue-700",
    partial: "bg-amber-50 text-amber-700",
    received: "bg-green-50 text-green-700",
    cancelled: "bg-slate-100 text-slate-500"
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function ReceiveModal({ order, onClose, onConfirm }) {
  const remaining = Number(order.quantity_ordered) - Number(order.quantity_received || 0);
  const [quantityReceived, setQuantityReceived] = useState(remaining);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!quantityReceived || Number(quantityReceived) <= 0) {
      setError("Enter a quantity greater than 0.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onConfirm(Number(quantityReceived));
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 className="text-base font-bold text-slate-950">Receive stock</h3>
        <p className="mt-1 text-sm text-slate-500">{order.product_name}</p>
        <p className="text-xs text-slate-400">
          Ordered {order.quantity_ordered}, already received {order.quantity_received || 0}
        </p>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Quantity received now</span>
          <input
            autoFocus
            type="number"
            className="field"
            value={quantityReceived}
            onChange={(e) => setQuantityReceived(e.target.value)}
          />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <div className="mt-4 flex gap-2">
          <button type="button" className="btn-secondary flex-1 justify-center" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn-primary flex-1 justify-center" onClick={handleConfirm} disabled={saving}>
            <Check className="h-4 w-4" />
            {saving ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [itemDraft, setItemDraft] = useState({
    product_name: "",
    quantity_ordered: "",
    expected_cost: ""
  });
  const [expectedArrival, setExpectedArrival] = useState("");
  const [cart, setCart] = useState([]);

  const [status, setStatus] = useState({ loading: true, saving: false, error: "", success: "" });
  const [receivingOrder, setReceivingOrder] = useState(null);

  async function loadOrders() {
    const response = await apiRequest("/orders");
    setOrders(response.data || []);
  }

  async function loadProducts() {
    const response = await apiRequest("/products");
    setProducts(response.data || []);
  }

  useEffect(() => {
    Promise.all([loadOrders(), loadProducts()])
      .catch((error) => setStatus((current) => ({ ...current, error: error.message })))
      .finally(() => setStatus((current) => ({ ...current, loading: false })));
  }, []);

  function addItemToCart() {
    if (!itemDraft.product_name.trim() || !itemDraft.quantity_ordered) return;

    setCart((current) => [
      ...current,
      {
        cartId: `${itemDraft.product_name}-${Date.now()}`,
        product_name: itemDraft.product_name.trim(),
        quantity_ordered: Number(itemDraft.quantity_ordered),
        expected_cost: Number(itemDraft.expected_cost) || 0
      }
    ]);

    setItemDraft({ product_name: "", quantity_ordered: "", expected_cost: "" });
  }

  function removeCartItem(cartId) {
    setCart((current) => current.filter((item) => item.cartId !== cartId));
  }

  async function handleSubmitOrders() {
    if (cart.length === 0) return;

    if (!expectedArrival) {
      setStatus((current) => ({ ...current, error: "Expected arrival date is required." }));
      return;
    }

    setStatus((current) => ({ ...current, saving: true, error: "", success: "" }));

    try {
      for (const item of cart) {
        const matchedProduct = products.find(
          (product) => product.name.trim().toLowerCase() === item.product_name.toLowerCase()
        );

        await apiRequest("/orders", {
          method: "POST",
          body: JSON.stringify({
            product_id: matchedProduct?.id || undefined,
            item_id: matchedProduct?.item_id || undefined,
            product_name: item.product_name,
            quantity_ordered: item.quantity_ordered,
            expected_cost: item.expected_cost,
            expected_arrival: expectedArrival
          })
        });
      }

      setStatus((current) => ({ ...current, success: `${cart.length} order${cart.length === 1 ? "" : "s"} created.` }));
      setCart([]);
      setExpectedArrival("");
      await loadOrders();
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    } finally {
      setStatus((current) => ({ ...current, saving: false }));
    }
  }

  async function cancelOrder(order) {
    const confirmed = window.confirm(`Cancel the order for "${order.product_name}"?`);
    if (!confirmed) return;

    try {
      await apiRequest(`/orders/${order.id}/cancel`, { method: "PUT" });
      await loadOrders();
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    }
  }

  async function confirmReceive(quantityReceived) {
    await apiRequest(`/orders/${receivingOrder.id}/receive`, {
      method: "PUT",
      body: JSON.stringify({ quantity_received: quantityReceived })
    });
    setReceivingOrder(null);
    await Promise.all([loadOrders(), loadProducts()]);
  }

  if (status.loading) return <LoadingState />;

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="panel p-4">
        <h2 className="mb-4 text-base font-bold text-slate-950">New Purchase Order</h2>

        <div className="space-y-3">
          <input
            className="field"
            list="known-products"
            placeholder="Product name (existing or new)"
            value={itemDraft.product_name}
            onChange={(e) => setItemDraft({ ...itemDraft, product_name: e.target.value })}
          />
          <datalist id="known-products">
            {products.map((product) => (
              <option key={product.id} value={product.name} />
            ))}
          </datalist>
          <input
            className="field"
            type="number"
            placeholder="Quantity ordered"
            value={itemDraft.quantity_ordered}
            onChange={(e) => setItemDraft({ ...itemDraft, quantity_ordered: e.target.value })}
          />
          <input
            className="field"
            type="number"
            placeholder="Expected cost (per unit)"
            value={itemDraft.expected_cost}
            onChange={(e) => setItemDraft({ ...itemDraft, expected_cost: e.target.value })}
          />
          <button type="button" className="btn-secondary w-full justify-center" onClick={addItemToCart}>
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        {cart.length > 0 ? (
          <div className="mt-4 space-y-2 rounded-lg border border-slate-200 p-3">
            {cart.map((item) => (
              <div key={item.cartId} className="flex items-center justify-between gap-2 text-sm">
                <div>
                  <p className="font-semibold text-slate-800">{item.product_name}</p>
                  <p className="text-xs text-slate-500">
                    {item.quantity_ordered} units {item.expected_cost ? `@ ${formatMoney(item.expected_cost)}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeCartItem(item.cartId)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Expected arrival (required, applies to all items above)</label>
          <input className="field" type="date" value={expectedArrival} onChange={(e) => setExpectedArrival(e.target.value)} />
        </div>

        <button
          type="button"
          className="btn-primary mt-4 w-full justify-center"
          onClick={handleSubmitOrders}
          disabled={status.saving || cart.length === 0}
        >
          <PackageCheck className="h-4 w-4" />
          {status.saving ? "Creating..." : `Create ${cart.length || ""} Order${cart.length === 1 ? "" : "s"}`}
        </button>

        {status.error ? <p className="mt-3 text-sm text-red-600">{status.error}</p> : null}
        {status.success ? <p className="mt-3 text-sm text-green-600">{status.success}</p> : null}
      </div>

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
                    <p className="text-sm text-slate-500">
                      Ordered: {order.quantity_ordered}
                      {order.quantity_received ? ` · Received: ${order.quantity_received}` : ""}
                    </p>
                    {order.expected_arrival ? (
                      <p className="text-xs text-slate-400">Expected: {order.expected_arrival}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={order.status} />
                    {order.status === "pending" || order.status === "partial" ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-green-100 text-green-600 hover:bg-green-50"
                          onClick={() => setReceivingOrder(order)}
                          title="Receive stock"
                        >
                          <PackageCheck className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
                          onClick={() => cancelOrder(order)}
                          title="Cancel order"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {receivingOrder ? (
        <ReceiveModal order={receivingOrder} onClose={() => setReceivingOrder(null)} onConfirm={confirmReceive} />
      ) : null}
    </div>
  );
}
