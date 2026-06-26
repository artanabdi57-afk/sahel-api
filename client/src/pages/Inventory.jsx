import React, { useRef, useEffect, useState } from "react";
import { 
  Check, Download, Menu, Plus, Search, Upload, X, 
  Package, AlertTriangle, FileSpreadsheet, Settings2
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

// Translations Dictionary
const labels = {
  en: { inv: "Inventory", add: "Add Product", search: "Search products...", stock: "Stock", unit: "Unit", price: "Price", total: "Total Value", import: "Import Excel", export: "Export Excel" },
  so: { inv: "Alaabta", add: "Ku dar Alaab", search: "Raadi alaab...", stock: "Khadka", unit: "Cabirka", price: "Qiimaha", total: "Qiimaha Guud", import: "Soo geli Excel", export: "Saar Excel" },
  ar: { inv: "المخزون", add: "إضافة منتج", search: "بحث عن منتج...", stock: "الكمية", unit: "الوحدة", price: "السعر", total: "القيمة الإجمالية", import: "استيراد اكسل", export: "تصدير اكسل" }
};

export default function Inventory() {
  const { language } = useLanguage(); // "en", "so", or "ar"
  const t = labels[language] || labels.en;
  const isRTL = language === 'ar';

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ loading: true, saving: false, importing: false, error: "", success: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);

  const loadProducts = async () => {
    const response = await apiRequest("/products");
    setProducts(response.data || []);
  };

  useEffect(() => {
    loadProducts().finally(() => setStatus(s => ({ ...s, loading: false })));
  }, []);

  // --- EXCEL LOGIC ---
  const exportToExcel = async () => {
    const XLSX = await import("xlsx");
    const data = products.map(p => ({
      "Product Name": p.name,
      "Quantity": p.quantity,
      "Unit": p.unit, // Liter/Kg now included
      "Cost": p.cost_price,
      "Selling": p.selling_price
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `Sahel_Inventory_${new Date().toLocaleDateString()}.xlsx`);
  };

  const importExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus(s => ({ ...s, importing: true }));
    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      
      for (const row of rows) {
        const payload = {
          name: row["Product Name"] || row["Name"],
          quantity: Number(row["Quantity"] || 0),
          unit: (row["Unit"] || "piece").toLowerCase(), // FIXED: Capturing Liter/Kg from Excel
          cost_price: Number(row["Cost"] || 0),
          selling_price: Number(row["Selling"] || 0),
        };
        await apiRequest("/products", { method: "POST", body: JSON.stringify(payload) });
      }
      await loadProducts();
      setStatus(s => ({ ...s, success: "Import Successful!" }));
    } catch (err) { setStatus(s => ({ ...s, error: "Import Failed" })); }
    finally { setStatus(s => ({ ...s, importing: false })); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(s => ({ ...s, saving: true }));
    try {
      // FIXED: Liter/Kg unit is explicitly sent
      await apiRequest("/products", { method: "POST", body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
        cost_price: Number(form.cost_price),
        selling_price: Number(form.selling_price),
        unit: form.unit 
      })});
      setForm(emptyForm);
      setShowAddForm(false);
      await loadProducts();
    } catch (err) { setStatus(s => ({ ...s, error: err.message })); }
    finally { setStatus(s => ({ ...s, saving: false })); }
  };

  const updateProduct = async (p, field, val) => {
    await apiRequest(`/products/${p.id}`, { method: "PUT", body: JSON.stringify({ ...p, [field]: val }) });
    await loadProducts();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (status.loading) return <LoadingState />;

  return (
    <div className={`space-y-6 pb-10 min-h-screen p-4 md:p-8 bg-[#FAF9F6]`} dir={isRTL ? "rtl" : "ltr"}>
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-blue-900 tracking-tight">{t.inv}</h1>
          <p className="text-slate-500 font-bold text-sm">Sahel Business Management</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Excel Tools Menu */}
          <div className="relative">
            <button onClick={() => setShowTools(!showTools)} className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-2xl shadow-lg transition-all">
              <FileSpreadsheet size={24} />
            </button>
            {showTools && (
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2`}>
                <button onClick={() => {fileInputRef.current.click(); setShowTools(false)}} className="flex w-full items-center gap-3 p-3 hover:bg-blue-50 rounded-xl text-sm font-bold text-slate-700">
                  <Upload size={16} /> {t.import}
                </button>
                <button onClick={() => {exportToExcel(); setShowTools(false)}} className="flex w-full items-center gap-3 p-3 hover:bg-blue-50 rounded-xl text-sm font-bold text-slate-700">
                  <Download size={16} /> {t.export}
                </button>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={importExcel} />

          <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-200">
            {showAddForm ? <X size={20}/> : <Plus size={20}/>} {t.add}
          </button>
        </div>
      </div>

      {/* 2. ADD FORM */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-blue-100 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-blue-400 mb-2 block tracking-widest">Product Name</label>
              <input required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-blue-400 mb-2 block tracking-widest">Quantity</label>
              <input type="number" required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-blue-400 mb-2 block tracking-widest">Unit</label>
              <select className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button disabled={status.saving} className="bg-blue-700 text-white px-12 py-4 rounded-2xl font-black hover:bg-blue-800 shadow-lg disabled:bg-slate-300">
                {status.saving ? "Saving..." : "Lock in Stock"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3. SEARCH */}
      <div className="relative">
        <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-300`} size={20} />
        <input 
          className={`w-full bg-white border-2 border-blue-50 rounded-2xl py-5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} shadow-sm outline-none focus:border-blue-500 font-bold text-blue-900`}
          placeholder={t.search}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 4. TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">{t.inv}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">{t.stock}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">{t.unit}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">{t.price}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {filtered.map(p => {
                const isLow = Number(p.quantity) <= Number(p.low_stock_threshold);
                return (
                  <tr key={p.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLow ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-700'}`}>
                          <Package size={20} />
                        </div>
                        <span className="font-black text-blue-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-700">
                      <div className="flex items-center gap-2">
                        {p.quantity}
                        {isLow && <AlertTriangle size={14} className="text-orange-500 animate-bounce" />}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        className="bg-slate-100 border-none rounded-lg px-3 py-1 text-xs font-black text-blue-700 cursor-pointer"
                        value={p.unit}
                        onChange={e => updateProduct(p, "unit", e.target.value)}
                      >
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="px-8 py-6 font-black text-blue-700">{formatMoney(p.selling_price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Total Value Bar */}
        <div className="bg-blue-50 p-6 flex justify-between items-center border-t-2 border-blue-100">
           <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{products.length} Products</span>
           <span className="text-lg font-black text-blue-900">{t.total}: <span className="text-orange-500">{formatMoney(products.reduce((a,b)=>a+(b.quantity*b.cost_price),0))}</span></span>
        </div>
      </div>
    </div>
  );
}
