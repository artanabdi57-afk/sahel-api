import React, { useEffect, useState } from "react";
import { Check, PackageCheck, Plus, Trash2, X } from "lucide-react";
import { apiRequest, formatMoney } from "../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";

const STATUS_OPTIONS = ["pending", "ordered", "received", "cancelled"];

// One editable cell, same pattern as Inventory.jsx
function EditableCell({ value, type = "text", onSave, formatDisplay }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function commit() {
    setEditing(false);
    const finalValue = type === "number" ? Number(draft) : draft;
    if (finalValue !== value) {
      onSave(finalValue);
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        type={type}
        className="w-full rounded border border-blue-400 bg-blue-50/40 px-2 py-1 text-sm outline-none ring-2 ring-blue-100"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="block w-full rounded px-2 py-1 text-left transition hover:bg-blue-50"
      title="Click to edit"
    >
      {formatDisplay ? formatDisplay(value) : value}
    </button>
  );
}

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // Item currently being configured before adding to the cart
  const [itemDraft, setItemDraft] = useState({
    product_name: "",
    quantity_ordered: "",
    expected_cost: ""
  });
  const [expectedArrival, setExpectedArrival] = useState("");

  // Cart of items waiting to be submitted as orders
  const [cart, setCart] = useState([]);

  const [status, setStatus] = useState({ loading: true, saving: false, error: "", success: "" });

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

    setStatus((current) => ({ ...current, saving: true, error: "", success: "" }));

    try {
      for (const item of cart) {
        await apiRequest("/orders", {
          method: "POST",
          body: JSON.stringify({
            product_name: item.product_name,
            quantity_ordered: item.quantity_ordered,
            expected_cost: item.expected_cost,
            expected_arrival: expectedArrival || undefined
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

  async function updateOrderField(order, field, value) {
    try {
      await apiRequest(`/orders/${order.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...order, [field]: value })
      });
      await loadOrders();
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    }
  }

  async function cancelOrder(order) {
    const confirmed = window.confirm(`Cancel the order for "${order.product_name}"?`);
    if (!confirmed) return;

    try {
      await apiRequest(`/orders/${order.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...order, status: "cancelled" })
      });
      await loadOrders();
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    }
  }

  async function deleteOrder(order) {
    const confirmed = window.confirm(`Permanently delete the order for "${order.product_name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await apiRequest(`/orders/${order.id}`, { method: "DELETE" });
      await loadOrders();
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    }
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
          <label className="mb-1 block text-xs font-semibold text-slate-500">Expected arrival (applies to all items above)</label>
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
                  <div className="flex-1">
                    <div className="font-semibold text-slate-950">
                      <EditableCell value={order.product_name} onSave={(value) => updateOrderField(order, "product_name", value)} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        Qty:
                        <EditableCell
                          value={order.quantity_ordered}
                          type="number"
                          onSave={(value) => updateOrderField(order, "quantity_ordered", value)}
                        />
                      </span>
                      <span className="flex items-center gap-1">
                        Cost:
                        <EditableCell
                          value={order.expected_cost}
                          type="number"
                          onSave={(value) => updateOrderField(order, "expected_cost", value)}
                          formatDisplay={formatMoney}
                        />
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <select
                      className="rounded-full border-0 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 outline-none"
                      value={order.status}
                      onChange={(e) => updateOrderField(order, "status", e.target.value)}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-1">
                      {order.status !== "cancelled" ? (
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-100 text-amber-600 hover:bg-amber-50"
                          onClick={() => cancelOrder(order)}
                          title="Cancel order"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
                        onClick={() => deleteOrder(order)}
                        title="Delete order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
