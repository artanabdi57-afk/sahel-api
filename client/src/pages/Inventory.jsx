import React, { useRef, useEffect, useState } from "react";
import { 
  Check, Download, Menu, Plus, Search, Upload, X, 
  Package, AlertTriangle, Filter, MoreHorizontal, ArrowUpDown
} from "lucide-react";
import { apiRequest, formatMoney } from "../lib/api";
import { EmptyState, LoadingState } from "../components/AsyncState";
import { useLanguage } from "../lib/i18n";

const UNITS = ["piece", "kg", "g", "litre", "ml", "box", "dozen"];

const emptyForm = {
  item_id: "",
  name: "",
  quantity: "",
  unit: "piece",
  cost_price: "",
  selling_price: "",
  low_stock_threshold: ""
};

// --- MODERN UI COMPONENTS ---

function EditableCell({ value, type = "text", onSave, isNumber = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(isNumber ? Number(draft) : draft);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type={type}
        className="w-full bg-white border-2 border-blue-500 rounded-lg px-2 py-1 text-sm outline-none shadow-sm"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
      />
    );
  }

  return (
    <div onClick={() => setEditing(true)} className="cursor-pointer hover:bg-blue-50/50 p-2 rounded-lg transition-colors overflow-hidden truncate">
      {isNumber && typeof value === 'number' ? value.toLocaleString() : value || "-"}
    </div>
  );
}

export default function Inventory() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ loading: true, saving: false, error: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);

  const loadProducts = async () => {
    const response = await apiRequest("/products");
    setProducts(response.data || []);
  };

  useEffect(() => {
    loadProducts().finally(() => setStatus(s => ({ ...s, loading: false })));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(s => ({ ...s, saving: true, error: "" }));
    
    try {
      // FIX: Explicitly sending the unit from the form state
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        cost_price: Number(form.cost_price),
        selling_price: Number(form.selling_price),
        low_stock_threshold: Number(form.low_stock_threshold || 0),
        unit: form.unit // Ensure the unit (litre/kg) is locked in
      };

      await apiRequest("/products", { method: "POST", body: JSON.stringify(payload) });
      setForm(emptyForm);
      setShowAddForm(false);
      await loadProducts();
    } catch (err) {
      setStatus(s => ({ ...s, error: err.message }));
    } finally {
      setStatus(s => ({ ...s, saving: false }));
    }
  };

  const updateField = async (product, field, value) => {
    try {
      await apiRequest(`/products/${product.id}`, { 
        method: "PUT", 
        body: JSON.stringify({ ...product, [field]: value }) 
      });
      await loadProducts();
    } catch (err) { console.error(err); }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.item_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status.loading) return <LoadingState />;

  return (
    <div className={`space-y-6 pb-20 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t("inventory") || "Inventory"}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {t("manageStock") || "Manage and track your shop products"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {showAddForm ? <X size={20}/> : <Plus size={20}/>}
            {t("addProduct") || "Add Product"}
          </button>
        </div>
      </div>

      {/* ADD FORM - PROFESSIONAL CARD */}
      {showAddForm && (
        <div className="bg-white border border-blue-100 rounded-[2rem] p-6 shadow-xl animate-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{t("productName") || "Product Name"}</label>
              <input required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Cooking Oil" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{t("unit") || "Unit"}</label>
              <select className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{t("quantity") || "Quantity"}</label>
              <input type="number" required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{t("costPrice") || "Cost Price"}</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})} placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{t("sellingPrice") || "Selling Price"}</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={form.selling_price} onChange={e => setForm({...form, selling_price: e.target.value})} placeholder="0.00" />
            </div>
            <div className="md:col-span-2 lg:col-span-1 flex items-end">
              <button disabled={status.saving} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black shadow-md hover:bg-blue-700 disabled:bg-slate-300">
                {status.saving ? "..." : t("saveProduct") || "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input 
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm transition-all"
          placeholder={t("searchPlaceholder") || "Search by name or ID..."}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* INVENTORY TABLE - MODERN DESIGN */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t("product") || "Product"}</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t("stock") || "Stock"}</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t("unit") || "Unit"}</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t("selling") || "Selling"}</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">{t("action") || "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(product => {
                const isLow = Number(product.quantity) <= Number(product.low_stock_threshold);
                return (
                  <tr key={product.id} className={`group hover:bg-blue-50/30 transition-colors ${isLow ? 'bg-red-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLow ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          <Package size={20} />
                        </div>
                        <div>
                          <EditableCell value={product.name} onSave={v => updateField(product, "name", v)} />
                          <p className="text-[10px] font-bold text-slate-400 px-2 uppercase">{product.item_id || "No ID"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                          <EditableCell value={product.quantity} isNumber onSave={v => updateField(product, "quantity", v)} />
                        </span>
                        {isLow && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className="bg-transparent border-none text-xs font-bold text-slate-500 cursor-pointer outline-none"
                        value={product.unit}
                        onChange={e => updateField(product, "unit", e.target.value)}
                      >
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-blue-600">
                        <EditableCell value={product.selling_price} isNumber onSave={v => updateField(product, "selling_price", v)} />
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FOOTER STATS */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-xs font-bold text-slate-400">
            {products.length} {t("totalProducts") || "Products Total"}
          </p>
          <p className="text-sm font-black text-slate-900">
            {t("totalValue") || "Total Value"}: <span className="text-blue-600">{formatMoney(products.reduce((a, b) => a + (b.quantity * b.cost_price), 0))}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
