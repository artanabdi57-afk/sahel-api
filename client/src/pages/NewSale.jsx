import React from "react";
import { useEffect, useState } from "react";
import { Phone, ShoppingCart, UserRound } from "lucide-react";
import { apiRequest, todayISO } from "../lib/api";
import { ErrorState, LoadingState } from "../components/AsyncState";

export default function NewSale() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    product_id: "",
    quantity_sold: "1",
    selling_price: "",
    payment_type: "cash",
    customer_name: "",
    customer_phone: "",
    sale_date: todayISO()
  });
  const [status, setStatus] = useState({ loading: true, saving: false, error: "", success: "" });

  useEffect(() => {
    Promise.all([apiRequest("/products"), apiRequest("/sales/customers")])
      .then(([productsResponse, customersResponse]) => {
        setProducts(productsResponse.data || []);
        setCustomers(customersResponse.data || []);
      })
      .catch((error) => setStatus((current) => ({ ...current, error: error.message })))
      .finally(() => setStatus((current) => ({ ...current, loading: false })));
  }, []);

  function chooseProduct(productId) {
    const product = products.find((item) => String(item.id) === String(productId));
    setForm((current) => ({
      ...current,
      product_id: productId,
      selling_price: product?.selling_price || current.selling_price
    }));
  }

  function choosePaymentType(paymentType) {
    setForm((current) => ({
      ...current,
      payment_type: paymentType,
      customer_name: paymentType === "credit" && current.customer_name === "Walk-in" ? "" : current.customer_name,
      customer_phone: paymentType === "credit" && current.customer_phone === "N/A" ? "" : current.customer_phone
    }));
  }

  function normalizePhone(value) {
    return value.replace(/\D/g, "").slice(0, 9);
  }

  function isValidPhone(value) {
    return /^(61|62|68)\d{7}$/.test(value);
  }

  function changePhone(value) {
    const customer_phone = normalizePhone(value);
    const knownCustomer = customers.find((customer) => customer.customer_phone === customer_phone);

    setForm((current) => ({
      ...current,
      customer_phone,
      customer_name: knownCustomer ? knownCustomer.customer_name : current.customer_name
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus((current) => ({ ...current, saving: true, error: "", success: "" }));

    try {
      if (form.payment_type === "credit" && (!form.customer_name.trim() || !form.customer_phone.trim())) {
        throw new Error("Customer name and phone number are required for credit sales.");
      }

      if (form.customer_phone.trim() && !isValidPhone(form.customer_phone.trim())) {
        throw new Error("Phone must be 9 digits and start with 61, 62, or 68.");
      }

      await apiRequest("/sales", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          customer_name: form.customer_name.trim() || "Walk-in",
          customer_phone: form.customer_phone.trim() || "N/A",
          quantity_sold: Number(form.quantity_sold),
          selling_price: Number(form.selling_price)
        })
      });
      setStatus((current) => ({ ...current, success: "Sale recorded." }));
      setForm((current) => ({
        ...current,
        product_id: "",
        quantity_sold: "1",
        selling_price: "",
        payment_type: "cash",
        customer_name: "",
        customer_phone: "",
        sale_date: todayISO()
      }));
      apiRequest("/sales/customers")
        .then((response) => setCustomers(response.data || []))
        .catch(() => {});
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    } finally {
      setStatus((current) => ({ ...current, saving: false }));
    }
  }

  if (status.loading) return <LoadingState />;

  const matchedCustomer = customers.find((customer) => customer.customer_phone === form.customer_phone);
  const showPhoneError = form.customer_phone.length > 0 && form.customer_phone.length === 9 && !isValidPhone(form.customer_phone);

  return (
    <div>
      <form onSubmit={handleSubmit} className="panel p-4">
        <h2 className="mb-4 text-base font-bold text-slate-950">Record Sale</h2>
        {status.error ? <ErrorState message={status.error} /> : null}
        {status.success ? <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">{status.success}</div> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <select className="field sm:col-span-2" value={form.product_id} onChange={(e) => chooseProduct(e.target.value)}>
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.quantity} in stock
              </option>
            ))}
          </select>
          <input className="field" type="number" min="1" placeholder="Quantity sold" value={form.quantity_sold} onChange={(e) => setForm({ ...form, quantity_sold: e.target.value })} />
          <input className="field" type="number" placeholder="Selling price" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} />
          <select className="field" value={form.payment_type} onChange={(e) => choosePaymentType(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="credit">Credit</option>
          </select>
          <input className="field" type="date" value={form.sale_date} onChange={(e) => setForm({ ...form, sale_date: e.target.value })} />
          <label className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="field pl-10"
              placeholder={form.payment_type === "credit" ? "Customer name - required" : "Customer name - optional"}
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            />
          </label>
          <label className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="field pl-10"
              inputMode="numeric"
              maxLength="9"
              list="known-customers"
              placeholder={form.payment_type === "credit" ? "Customer phone - required" : "Customer phone - optional"}
              value={form.customer_phone}
              onChange={(e) => changePhone(e.target.value)}
            />
            <datalist id="known-customers">
              {customers.map((customer) => (
                <option key={customer.customer_phone} value={customer.customer_phone}>
                  {customer.customer_name}
                </option>
              ))}
            </datalist>
          </label>
        </div>
        {matchedCustomer ? (
          <p className="mt-2 text-sm font-medium text-green-700">
            Matched customer: {matchedCustomer.customer_name}
          </p>
        ) : null}
        {showPhoneError ? (
          <p className="mt-2 text-sm font-medium text-red-600">
            Phone must be 9 digits and start with 61, 62, or 68. Example: 617581012.
          </p>
        ) : null}
        <button className="btn-primary mt-4 w-full sm:w-auto" disabled={status.saving || !form.product_id}>
          <ShoppingCart className="h-4 w-4" />
          {status.saving ? "Recording..." : "Record sale"}
        </button>
      </form>
    </div>
  );
}
