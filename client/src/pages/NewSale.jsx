import React, { useEffect, useRef, useState } from "react";
import { Phone, Plus, Search, ShoppingCart, Trash2, UserRound, X } from "lucide-react";
import { apiRequest, todayISO } from "../lib/api";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";
import Receipt from "../components/Receipt.jsx";

function ProductSearch({ products, value, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = products.find((p) => String(p.id) === String(value));
  const filtered = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    : products;

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(product) {
    onSelect(product.id);
    setQuery("");
    setOpen(false);
  }

  function handleClear() {
    onSelect("");
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="field pl-10 pr-10"
          placeholder="Search product..."
          value={selected ? selected.name : query}
          onFocus={() => { setOpen(true); if (selected) setQuery(""); }}
          onChange={(e) => { setQuery(e.target.value); onSelect(""); setOpen(true); }}
        />
        {(selected || query) ? (
          <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">No products found</p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition ${String(p.id) === String(value) ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}
                onClick={() => handleSelect(p)}
              >
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-xs text-slate-400">{p.quantity} {p.unit || "pcs"}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function NewSale() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [checkout, setCheckout] = useState({ payment_type: "cash", customer_name: "", customer_phone: "", sale_date: todayISO() });
  const [itemDraft, setItemDraft] = useState({ product_id: "", quantity_sold: "1", selling_price: "" });
  const [cart, setCart] = useState([]);
  const [status, setStatus] = useState({ loading: true, saving: false, error: "", success: "" });
  const [completedSale, setCompletedSale] = useState(null);
  const shop = getCurrentShop();

  useEffect(() => {
    Promise.all([apiRequest("/products"), apiRequest("/sales/customers")])
      .then(([productsResponse, customersResponse]) => {
        setProducts(productsResponse.data || []);
        setCustomers(customersResponse.data || []);
      })
      .catch((error) => setStatus((current) => ({ ...current, error: error.message })))
      .finally(() => setStatus((current) => ({ ...current, loading: false })));
  }, []);

  function chooseDraftProduct(productId) {
    const product = products.find((item) => String(item.id) === String(productId));
    setItemDraft((current) => ({ ...current, product_id: productId, selling_price: product?.selling_price || current.selling_price }));
  }

  function choosePaymentType(paymentType) {
    setCheckout((current) => ({
      ...current,
      payment_type: paymentType,
      customer_name: paymentType === "credit" && current.customer_name === "Walk-in" ? "" : current.customer_name,
      customer_phone: paymentType === "credit" && current.customer_phone === "N/A" ? "" : current.customer_phone
    }));
  }

  function normalizePhone(value) { return value.replace(/\D/g, "").slice(0, 9); }
  function isValidPhone(value) { return /^(61|62|68)\d{7}$/.test(value); }

  function changePhone(value) {
    const customer_phone = normalizePhone(value);
    const knownCustomer = customers.find((c) => c.customer_phone === customer_phone);
    setCheckout((current) => ({ ...current, customer_phone, customer_name: knownCustomer ? knownCustomer.customer_name : current.customer_name }));
  }

  function addItemToCart() {
    if (!itemDraft.product_id || !itemDraft.quantity_sold || !itemDraft.selling_price) return;
    const product = products.find((item) => String(item.id) === String(itemDraft.product_id));
    setCart((current) => [...current, {
      cartId: `${itemDraft.product_id}-${Date.now()}`,
      product_id: itemDraft.product_id,
      productName: product?.name || "Item",
      unit: product?.unit || "pcs",
      quantity_sold: Number(itemDraft.quantity_sold),
      selling_price: Number(itemDraft.selling_price)
    }]);
    setItemDraft({ product_id: "", quantity_sold: "1", selling_price: "" });
  }

  function removeCartItem(cartId) { setCart((current) => current.filter((item) => item.cartId !== cartId)); }

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity_sold * item.selling_price, 0);

  async function handleCompleteSale() {
    if (cart.length === 0) return;
    setStatus((current) => ({ ...current, saving: true, error: "", success: "" }));
    try {
      if (checkout.payment_type === "credit" && (!checkout.customer_name.trim() || !checkout.customer_phone.trim())) {
        throw new Error("Customer name and phone number are required for credit sales.");
      }
      if (checkout.customer_phone.trim() && !isValidPhone(checkout.customer_phone.trim())) {
        throw new Error("Phone must be 9 digits and start with 61, 62, or 68.");
      }
      const sharedFields = {
        payment_type: checkout.payment_type,
        customer_name: checkout.customer_name.trim() || "Walk-in",
        customer_phone: checkout.customer_phone.trim() || "N/A",
        sale_date: checkout.sale_date
      };
      const savedItems = [];
      for (const item of cart) {
        const response = await apiRequest("/sales", {
          method: "POST",
          body: JSON.stringify({ product_id: item.product_id, quantity_sold: item.quantity_sold, selling_price: item.selling_price, ...sharedFields })
        });
        savedItems.push({ productName: item.productName, quantity_sold: item.quantity_sold, selling_price: item.selling_price, receipt_no: response?.data?.id || response?.id || null });
      }
      setStatus((current) => ({ ...current, success: `${cart.length} item(s) recorded.` }));
      setCompletedSale({ items: savedItems, payment_type: sharedFields.payment_type, customer_name: sharedFields.customer_name, customer_phone: sharedFields.customer_phone, sale_date: sharedFields.sale_date, receipt_no: savedItems[0]?.receipt_no || null });
      setCart([]);
      setCheckout({ payment_type: "cash", customer_name: "", customer_phone: "", sale_date: todayISO() });
      apiRequest("/sales/customers").then((r) => setCustomers(r.data || [])).catch(() => {});
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    } finally {
      setStatus((current) => ({ ...current, saving: false }));
    }
  }

  if (status.loading) return <LoadingState />;

  const matchedCustomer = customers.find((c) => c.customer_phone === checkout.customer_phone);
  const showPhoneError = checkout.customer_phone.length === 9 && !isValidPhone(checkout.customer_phone);

  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <h2 className="mb-4 text-base font-bold text-slate-950">Record Sale</h2>
        {status.error ? <ErrorState message={status.error} /> : null}
        {status.success ? (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
            <span>{status.success}</span>
            {completedSale ? (
              <button type="button" onClick={() => setCompletedSale({ ...completedSale })} className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
                View Receipt
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <ProductSearch products={products} value={itemDraft.product_id} onSelect={chooseDraftProduct} />
          <div className="grid grid-cols-2 gap-2">
            <input className="field" type="number" min="1" placeholder="Qty" value={itemDraft.quantity_sold} onChange={(e) => setItemDraft({ ...itemDraft, quantity_sold: e.target.value })} />
            <input className="field" type="number" placeholder="Price" value={itemDraft.selling_price} onChange={(e) => setItemDraft({ ...itemDraft, selling_price: e.target.value })} />
          </div>
          <button type="button" className="btn-primary w-full justify-center" onClick={addItemToCart} disabled={!itemDraft.product_id}>
            <Plus className="h-4 w-4" />
            Add to cart
          </button>
        </div>

        {cart.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Product</th>
                  <th className="px-3 py-2 font-semibold">Qty</th>
                  <th className="px-3 py-2 font-semibold">Price</th>
                  <th className="px-3 py-2 font-semibold">Total</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <tr key={item.cartId}>
                    <td className="px-3 py-2 font-medium text-slate-800">{item.productName} <span className="text-xs text-slate-400">{item.unit}</span></td>
                    <td className="px-3 py-2 text-slate-600">{item.quantity_sold}</td>
                    <td className="px-3 py-2 text-slate-600">{item.selling_price}</td>
                    <td className="px-3 py-2 font-semibold text-slate-950">{(item.quantity_sold * item.selling_price).toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => removeCartItem(item.cartId)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
              <span className="text-sm font-semibold text-slate-600">Cart total</span>
              <span className="text-base font-bold text-slate-950">{cartTotal.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">No items added yet. Search for a product above.</p>
        )}

        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <select className="field" value={checkout.payment_type} onChange={(e) => choosePaymentType(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="credit">Credit</option>
          </select>
          <input className="field" type="date" value={checkout.sale_date} onChange={(e) => setCheckout({ ...checkout, sale_date: e.target.value })} />
          <label className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="field pl-10" placeholder={checkout.payment_type === "credit" ? "Customer name - required" : "Customer name - optional"} value={checkout.customer_name} onChange={(e) => setCheckout({ ...checkout, customer_name: e.target.value })} />
          </label>
          <label className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="field pl-10" inputMode="numeric" maxLength="9" list="known-customers" placeholder={checkout.payment_type === "credit" ? "Customer phone - required" : "Customer phone - optional"} value={checkout.customer_phone} onChange={(e) => changePhone(e.target.value)} />
            <datalist id="known-customers">
              {customers.map((c) => <option key={c.customer_phone} value={c.customer_phone}>{c.customer_name}</option>)}
            </datalist>
          </label>
        </div>
        {matchedCustomer ? <p className="mt-2 text-sm font-medium text-green-700">Matched: {matchedCustomer.customer_name}</p> : null}
        {showPhoneError ? <p className="mt-2 text-sm font-medium text-red-600">Phone must be 9 digits starting with 61, 62, or 68.</p> : null}

        <button type="button" className="btn-primary mt-4 w-full" onClick={handleCompleteSale} disabled={status.saving || cart.length === 0}>
          <ShoppingCart className="h-4 w-4" />
          {status.saving ? "Recording..." : `Complete Sale (${cart.length} item${cart.length === 1 ? "" : "s"})`}
        </button>
      </div>

      {completedSale ? <Receipt sale={completedSale} shop={shop} onClose={() => setCompletedSale(null)} /> : null}
    </div>
  );
}
