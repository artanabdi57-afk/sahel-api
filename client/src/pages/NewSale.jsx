import React, { useEffect, useRef, useState } from "react";
import { Phone, Plus, Search, ShoppingCart, Trash2, UserRound, X, ChevronDown } from "lucide-react";
import { apiRequest, todayISO } from "../lib/api";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { getCurrentShop } from "../lib/auth";
import Receipt from "../components/Receipt.jsx";

// ── Translations ───────────────────────────────────────────────────────────────
const LANGS = {
  en: {
    dir: "ltr",
    title: "New Sale",
    searchProduct: "Search product...",
    qty: "Qty",
    price: "Price",
    addToCart: "Add to cart",
    noItems: "No items added yet. Search a product above.",
    product: "Product",
    total: "Total",
    cartTotal: "Cart total",
    payment: "Payment",
    cash: "Cash",
    credit: "Credit",
    date: "Date",
    customerName: "Customer name",
    customerNameRequired: "Customer name — required",
    customerNameOptional: "Customer name — optional",
    customerPhone: "Phone number",
    customerPhoneRequired: "Phone — required",
    customerPhoneOptional: "Phone — optional",
    matched: "Matched",
    phoneError: "Phone must be 9 digits starting with 61, 62, or 68.",
    completeSale: "Complete Sale",
    completing: "Recording...",
    item: "item",
    items: "items",
    viewReceipt: "View Receipt",
    noProducts: "No products found",
    customerInfo: "Customer Info",
  },
  so: {
    dir: "ltr",
    title: "Iibinta Cusub",
    searchProduct: "Raadi alaab...",
    qty: "Tirada",
    price: "Qiimaha",
    addToCart: "Ku dar dambiilka",
    noItems: "Wax aan la darin. Raadi alaab korka.",
    product: "Alaabta",
    total: "Wadarta",
    cartTotal: "Wadarta dambiilka",
    payment: "Lacag bixinta",
    cash: "Sida",
    credit: "Amaah",
    date: "Taariikhda",
    customerName: "Magaca macmiilka",
    customerNameRequired: "Magaca macmiilka — waajib",
    customerNameOptional: "Magaca macmiilka — ikhtiyaari",
    customerPhone: "Lambarka telefoonka",
    customerPhoneRequired: "Telefoon — waajib",
    customerPhoneOptional: "Telefoon — ikhtiyaari",
    matched: "La garanwaayay",
    phoneError: "Telefoonku waa inuu ahaa 9 lambar oo ku bilaabma 61, 62, ama 68.",
    completeSale: "Dhamee Iibinta",
    completing: "Waxaa la duubayaa...",
    item: "shay",
    items: "shay",
    viewReceipt: "Arag Rasiidhka",
    noProducts: "Alaab lama helin",
    customerInfo: "Macluumaadka Macmiilka",
  },
  ar: {
    dir: "rtl",
    title: "بيع جديد",
    searchProduct: "ابحث عن منتج...",
    qty: "الكمية",
    price: "السعر",
    addToCart: "أضف إلى السلة",
    noItems: "لم تتم إضافة أي عناصر. ابحث عن منتج أعلاه.",
    product: "المنتج",
    total: "المجموع",
    cartTotal: "إجمالي السلة",
    payment: "طريقة الدفع",
    cash: "نقدي",
    credit: "آجل",
    date: "التاريخ",
    customerName: "اسم العميل",
    customerNameRequired: "اسم العميل — مطلوب",
    customerNameOptional: "اسم العميل — اختياري",
    customerPhone: "رقم الهاتف",
    customerPhoneRequired: "الهاتف — مطلوب",
    customerPhoneOptional: "الهاتف — اختياري",
    matched: "تم التعرف على",
    phoneError: "يجب أن يتكون الهاتف من 9 أرقام ويبدأ بـ 61 أو 62 أو 68.",
    completeSale: "إتمام البيع",
    completing: "جارٍ التسجيل...",
    item: "عنصر",
    items: "عناصر",
    viewReceipt: "عرض الإيصال",
    noProducts: "لا توجد منتجات",
    customerInfo: "بيانات العميل",
  },
};

// ── Product Search ─────────────────────────────────────────────────────────────
function ProductSearch({ products, value, onSelect, t }) {
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

  function handleSelect(product) { onSelect(product.id); setQuery(""); setOpen(false); }
  function handleClear() { onSelect(""); setQuery(""); setOpen(false); }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#A0B3D6", width: 15, height: 15, pointerEvents: "none" }} />
        <input
          style={inputStyle}
          placeholder={t.searchProduct}
          value={selected ? selected.name : query}
          onFocus={() => { setOpen(true); if (selected) setQuery(""); }}
          onChange={(e) => { setQuery(e.target.value); onSelect(""); setOpen(true); }}
        />
        {(selected || query) && (
          <button type="button" onClick={handleClear} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#A0B3D6", display: "flex" }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>
      {open && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 50, marginTop: 4, maxHeight: 220, overflowY: "auto", borderRadius: 12, border: "1px solid #E2EBFF", background: "#fff", boxShadow: "0 18px 45px rgba(15,23,42,0.13)" }}>
          {filtered.length === 0
            ? <p style={{ padding: "12px 16px", fontSize: 13, color: "#A0B3D6" }}>{t.noProducts}</p>
            : filtered.map((p) => (
              <button key={p.id} type="button"
                style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", textAlign: "left", background: String(p.id) === String(value) ? "#FFF2E8" : "transparent", border: "none", cursor: "pointer", transition: "background 0.15s", fontFamily: "inherit" }}
                onMouseEnter={e => e.currentTarget.style.background = String(p.id) === String(value) ? "#FFF2E8" : "#F7F9FF"}
                onMouseLeave={e => e.currentTarget.style.background = String(p.id) === String(value) ? "#FFF2E8" : "transparent"}
                onClick={() => handleSelect(p)}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: "#0F1F45" }}>{p.name}</span>
                <span style={{ fontSize: 11, color: "#A0B3D6" }}>{p.quantity} {p.unit || "pcs"}</span>
              </button>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", background: "#fff", border: "1px solid #E2EBFF", borderRadius: 10,
  padding: "10px 14px 10px 38px", fontSize: 13, fontFamily: "inherit",
  color: "#0F1F45", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s",
};
const inputStylePlain = {
  ...inputStyle, paddingLeft: 14,
};
const labelStyle = { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#6B87C4", marginBottom: 5, display: "block" };
const sectionCard = { background: "#fff", border: "1px solid #E2EBFF", borderRadius: 14, padding: 16, marginBottom: 12 };
const orangeBtn = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px",
  borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
  fontFamily: "inherit", background: "#F97316", color: "#fff", border: "none",
  transition: "opacity 0.15s",
};
const outlineBtn = {
  ...orangeBtn, background: "#fff", color: "#F97316", border: "1.5px solid #FDCBA4",
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function NewSale() {
  const [lang, setLang] = useState("en");
  const t = LANGS[lang];
  const dir = t.dir;

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
      .then(([pr, cr]) => { setProducts(pr.data || []); setCustomers(cr.data || []); })
      .catch((e) => setStatus((s) => ({ ...s, error: e.message })))
      .finally(() => setStatus((s) => ({ ...s, loading: false })));
  }, []);

  function chooseDraftProduct(productId) {
    const product = products.find((p) => String(p.id) === String(productId));
    setItemDraft((d) => ({ ...d, product_id: productId, selling_price: product?.selling_price || d.selling_price }));
  }

  function choosePaymentType(type) {
    setCheckout((c) => ({
      ...c, payment_type: type,
      customer_name: type === "credit" && c.customer_name === "Walk-in" ? "" : c.customer_name,
      customer_phone: type === "credit" && c.customer_phone === "N/A" ? "" : c.customer_phone,
    }));
  }

  function normalizePhone(v) { return v.replace(/\D/g, "").slice(0, 9); }
  function isValidPhone(v) { return /^(61|62|68)\d{7}$/.test(v); }

  function changePhone(v) {
    const customer_phone = normalizePhone(v);
    const known = customers.find((c) => c.customer_phone === customer_phone);
    setCheckout((c) => ({ ...c, customer_phone, customer_name: known ? known.customer_name : c.customer_name }));
  }

  function addItemToCart() {
    if (!itemDraft.product_id || !itemDraft.quantity_sold || !itemDraft.selling_price) return;
    const product = products.find((p) => String(p.id) === String(itemDraft.product_id));
    setCart((c) => [...c, {
      cartId: `${itemDraft.product_id}-${Date.now()}`,
      product_id: itemDraft.product_id,
      productName: product?.name || "Item",
      unit: product?.unit || "pcs",
      quantity_sold: Number(itemDraft.quantity_sold),
      selling_price: Number(itemDraft.selling_price),
    }]);
    setItemDraft({ product_id: "", quantity_sold: "1", selling_price: "" });
  }

  function removeCartItem(cartId) { setCart((c) => c.filter((i) => i.cartId !== cartId)); }

  const cartTotal = cart.reduce((sum, i) => sum + i.quantity_sold * i.selling_price, 0);

  async function handleCompleteSale() {
    if (cart.length === 0) return;
    setStatus((s) => ({ ...s, saving: true, error: "", success: "" }));
    try {
      if (checkout.payment_type === "credit" && (!checkout.customer_name.trim() || !checkout.customer_phone.trim())) {
        throw new Error(t.customerNameRequired + " & " + t.customerPhoneRequired);
      }
      if (checkout.customer_phone.trim() && !isValidPhone(checkout.customer_phone.trim())) {
        throw new Error(t.phoneError);
      }
      const shared = {
        payment_type: checkout.payment_type,
        customer_name: checkout.customer_name.trim() || "Walk-in",
        customer_phone: checkout.customer_phone.trim() || "N/A",
        sale_date: checkout.sale_date,
      };
      const savedItems = [];
      for (const item of cart) {
        const res = await apiRequest("/sales", { method: "POST", body: JSON.stringify({ product_id: item.product_id, quantity_sold: item.quantity_sold, selling_price: item.selling_price, ...shared }) });
        savedItems.push({ productName: item.productName, quantity_sold: item.quantity_sold, selling_price: item.selling_price, receipt_no: res?.data?.id || res?.id || null });
      }
      setStatus((s) => ({ ...s, success: `${cart.length} ${cart.length === 1 ? t.item : t.items}` }));
      setCompletedSale({ items: savedItems, ...shared, receipt_no: savedItems[0]?.receipt_no || null });
      setCart([]);
      setCheckout({ payment_type: "cash", customer_name: "", customer_phone: "", sale_date: todayISO() });
      apiRequest("/sales/customers").then((r) => setCustomers(r.data || [])).catch(() => {});
    } catch (e) {
      setStatus((s) => ({ ...s, error: e.message }));
    } finally {
      setStatus((s) => ({ ...s, saving: false }));
    }
  }

  if (status.loading) return <LoadingState />;

  const matchedCustomer = customers.find((c) => c.customer_phone === checkout.customer_phone);
  const showPhoneError = checkout.customer_phone.length === 9 && !isValidPhone(checkout.customer_phone);
  const canAdd = itemDraft.product_id && itemDraft.quantity_sold && itemDraft.selling_price;

  return (
    <div dir={dir} style={{ background: "#F0F4FF", minHeight: "100vh", fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif", paddingBottom: 90 }}>

      {/* ── Header ── */}
      <div style={{ background: "#1E40AF", padding: "16px 18px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>{t.title}</h1>

        {/* Language switcher */}
        <div style={{ display: "flex", gap: 6 }}>
          {Object.keys(LANGS).map((l) => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              background: lang === l ? "#F97316" : "rgba(255,255,255,0.15)",
              color: "#fff", border: "none", transition: "background 0.15s",
            }}>
              {l === "en" ? "EN" : l === "so" ? "SO" : "ع"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>

        {/* Errors / Success */}
        {status.error && (
          <div style={{ marginBottom: 12, borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", padding: "10px 14px", fontSize: 13, color: "#B91C1C", fontWeight: 500 }}>
            {status.error}
          </div>
        )}
        {status.success && (
          <div style={{ marginBottom: 12, borderRadius: 10, background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "10px 14px", fontSize: 13, color: "#065F46", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>✓ {status.success}</span>
            {completedSale && (
              <button onClick={() => setCompletedSale({ ...completedSale })} style={{ ...orangeBtn, padding: "5px 12px", fontSize: 11 }}>
                {t.viewReceipt}
              </button>
            )}
          </div>
        )}

        {/* ── Product picker ── */}
        <div style={sectionCard}>
          <label style={labelStyle}>{t.searchProduct.replace("...", "")}</label>
          <ProductSearch products={products} value={itemDraft.product_id} onSelect={chooseDraftProduct} t={t} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <div>
              <label style={labelStyle}>{t.qty}</label>
              <input style={inputStylePlain} type="number" min="1" placeholder="1"
                value={itemDraft.quantity_sold}
                onChange={(e) => setItemDraft({ ...itemDraft, quantity_sold: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>{t.price}</label>
              <input style={inputStylePlain} type="number" placeholder="0.00"
                value={itemDraft.selling_price}
                onChange={(e) => setItemDraft({ ...itemDraft, selling_price: e.target.value })} />
            </div>
          </div>

          {/* Add to cart — left-aligned, not full width */}
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={addItemToCart} disabled={!canAdd}
              style={{ ...orangeBtn, opacity: canAdd ? 1 : 0.45 }}>
              <Plus style={{ width: 14, height: 14 }} />
              {t.addToCart}
            </button>
          </div>
        </div>

        {/* ── Cart ── */}
        <div style={sectionCard}>
          <label style={labelStyle}>{t.cartTotal}</label>

          {cart.length === 0 ? (
            <p style={{ fontSize: 13, color: "#A0B3D6", margin: 0 }}>{t.noItems}</p>
          ) : (
            <>
              <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #E2EBFF" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F7F9FF" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", color: "#A0B3D6" }}>{t.product}</th>
                      <th style={{ padding: "8px 8px", textAlign: "center", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", color: "#A0B3D6" }}>{t.qty}</th>
                      <th style={{ padding: "8px 8px", textAlign: "right", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", color: "#A0B3D6" }}>{t.total}</th>
                      <th style={{ width: 36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.cartId} style={{ borderTop: "1px solid #F0F4FF" }}>
                        <td style={{ padding: "10px 12px", color: "#0F1F45", fontWeight: 500 }}>
                          {item.productName}
                          <span style={{ fontSize: 10, color: "#A0B3D6", marginLeft: 4 }}>{item.unit}</span>
                        </td>
                        <td style={{ padding: "10px 8px", textAlign: "center", color: "#6B87C4" }}>{item.quantity_sold}</td>
                        <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: "#0F1F45" }}>${(item.quantity_sold * item.selling_price).toFixed(2)}</td>
                        <td style={{ padding: "10px 6px", textAlign: "center" }}>
                          <button type="button" onClick={() => removeCartItem(item.cartId)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#F97316", display: "inline-flex", padding: 4, borderRadius: 6 }}>
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cart total strip */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, padding: "10px 12px", background: "#FFF7ED", borderRadius: 10, border: "1px solid #FDCBA4" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#C2550A" }}>{t.cartTotal}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#F97316", letterSpacing: "-0.5px" }}>${cartTotal.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* ── Payment + Customer ── */}
        <div style={sectionCard}>
          <label style={labelStyle}>{t.payment}</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {["cash", "credit"].map((type) => (
              <button key={type} type="button" onClick={() => choosePaymentType(type)}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  background: checkout.payment_type === type ? "#F97316" : "#fff",
                  color: checkout.payment_type === type ? "#fff" : "#6B87C4",
                  border: checkout.payment_type === type ? "none" : "1px solid #E2EBFF",
                }}>
                {type === "cash" ? t.cash : t.credit}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>{t.date}</label>
            <input style={inputStylePlain} type="date" value={checkout.sale_date}
              onChange={(e) => setCheckout({ ...checkout, sale_date: e.target.value })} />
          </div>

          <label style={{ ...labelStyle, marginBottom: 10 }}>{t.customerInfo}</label>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <UserRound style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#A0B3D6", width: 15, height: 15, pointerEvents: "none" }} />
              <input style={inputStyle}
                placeholder={checkout.payment_type === "credit" ? t.customerNameRequired : t.customerNameOptional}
                value={checkout.customer_name}
                onChange={(e) => setCheckout({ ...checkout, customer_name: e.target.value })} />
            </div>
            <div style={{ position: "relative" }}>
              <Phone style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#A0B3D6", width: 15, height: 15, pointerEvents: "none" }} />
              <input style={inputStyle} inputMode="numeric" maxLength="9" list="known-customers"
                placeholder={checkout.payment_type === "credit" ? t.customerPhoneRequired : t.customerPhoneOptional}
                value={checkout.customer_phone}
                onChange={(e) => changePhone(e.target.value)} />
              <datalist id="known-customers">
                {customers.map((c) => <option key={c.customer_phone} value={c.customer_phone}>{c.customer_name}</option>)}
              </datalist>
            </div>
          </div>

          {matchedCustomer && (
            <p style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: "#15803D" }}>✓ {t.matched}: {matchedCustomer.customer_name}</p>
          )}
          {showPhoneError && (
            <p style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: "#B91C1C" }}>{t.phoneError}</p>
          )}
        </div>
      </div>

      {/* ── Sticky Complete Sale button ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(240,244,255,0.95)", backdropFilter: "blur(10px)",
        borderTop: "1px solid #E2EBFF", padding: "12px 16px",
      }}>
        <button type="button" onClick={handleCompleteSale} disabled={status.saving || cart.length === 0}
          style={{
            ...orangeBtn, width: "100%", justifyContent: "center", padding: "13px 0",
            fontSize: 14, borderRadius: 12,
            opacity: (status.saving || cart.length === 0) ? 0.45 : 1,
            boxShadow: cart.length > 0 ? "0 6px 20px rgba(249,115,22,0.35)" : "none",
          }}>
          <ShoppingCart style={{ width: 16, height: 16 }} />
          {status.saving
            ? t.completing
            : `${t.completeSale}${cart.length > 0 ? ` (${cart.length} ${cart.length === 1 ? t.item : t.items})` : ""}`
          }
        </button>
      </div>

      {completedSale && <Receipt sale={completedSale} shop={shop} onClose={() => setCompletedSale(null)} />}
    </div>
  );
}
