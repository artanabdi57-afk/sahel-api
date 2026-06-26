import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { Check, Download, Menu, Plus, Search, Upload, X } from "lucide-react";
import { apiRequest, formatMoney } from "../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";

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

const columnAliases = {
  item_id: ["itemid", "productid", "productcode", "sku", "barcode", "code", "id"],
  name: ["name", "product", "productname", "item", "itemname", "description"],
  quantity: ["quantity", "qty", "stock", "currentstock", "onhand", "units"],
  unit: ["unit", "uom", "unitofmeasure", "measure"],
  cost_price: ["costprice", "cost", "buyingprice", "purchaseprice", "wholesaleprice"],
  selling_price: ["sellingprice", "selling", "price", "retailprice", "saleprice"],
  low_stock_threshold: ["lowstockthreshold", "threshold", "lowstock", "reorderlevel", "minimumstock", "minstock"]
};

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function isSimilarName(a, b) {
  const normA = normalizeName(a);
  const normB = normalizeName(b);
  if (!normA || !normB) return false;
  if (normA === normB) return false;
  return normA.includes(normB) || normB.includes(normA);
}

function toNumber(value) {
  const cleaned = String(value || "").replace(/,/g, "").replace(/[^0-9.-]/g, "");
  return Number(cleaned || 0);
}

function findColumnIndex(headers, field) {
  const normalizedHeaders = headers.map(normalizeHeader);
  return normalizedHeaders.findIndex((header) => columnAliases[field].includes(header));
}

function parseInventoryRows(sheetRows) {
  const nonEmptyRows = sheetRows.filter((row) => row.some((cell) => String(cell || "").trim() !== ""));
  const headerRowIndex = nonEmptyRows.findIndex((row) => findColumnIndex(row, "name") !== -1);

  if (headerRowIndex === -1) {
    return nonEmptyRows.map((row) => ({
      item_id: String(row[0] || "").trim(),
      name: String(row[1] || "").trim(),
      quantity: toNumber(row[2]),
      unit: String(row[3] || "piece").trim(),
      cost_price: toNumber(row[4]),
      selling_price: toNumber(row[5]),
      low_stock_threshold: toNumber(row[6])
    }));
  }

  const headers = nonEmptyRows[headerRowIndex];
  const dataRows = nonEmptyRows.slice(headerRowIndex + 1);
  const indexes = {
    item_id: findColumnIndex(headers, "item_id"),
    name: findColumnIndex(headers, "name"),
    quantity: findColumnIndex(headers, "quantity"),
    unit: findColumnIndex(headers, "unit"),
    cost_price: findColumnIndex(headers, "cost_price"),
    selling_price: findColumnIndex(headers, "selling_price"),
    low_stock_threshold: findColumnIndex(headers, "low_stock_threshold")
  };

  return dataRows.map((row) => ({
    item_id: indexes.item_id === -1 ? "" : String(row[indexes.item_id] || "").trim(),
    name: String(row[indexes.name] || "").trim(),
    quantity: indexes.quantity === -1 ? 0 : toNumber(row[indexes.quantity]),
    unit: indexes.unit === -1 ? "piece" : String(row[indexes.unit] || "piece").trim(),
    cost_price: indexes.cost_price === -1 ? 0 : toNumber(row[indexes.cost_price]),
    selling_price: indexes.selling_price === -1 ? 0 : toNumber(row[indexes.selling_price]),
    low_stock_threshold: indexes.low_stock_threshold === -1 ? 0 : toNumber(row[indexes.low_stock_threshold])
  }));
}

function EditableCell({ value, type = "text", onSave, className = "", formatDisplay }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  function commit() {
    setEditing(false);
    const finalValue = type === "number" ? Number(draft) : draft;
    if (finalValue !== value) onSave(finalValue);
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
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
      />
    );
  }

  return (
    <button type="button" onClick={() => setEditing(true)} className={`block w-full rounded px-2 py-1 text-left transition hover:bg-blue-50 ${className}`} title="Click to edit">
      {formatDisplay ? formatDisplay(value) : value}
    </button>
  );
}

function EditableUnitCell({ value, onSave }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <select
        autoFocus
        className="w-full rounded border border-blue-400 bg-blue-50/40 px-2 py-1 text-sm outline-none ring-2 ring-blue-100"
        value={value}
        onChange={(e) => { onSave(e.target.value); setEditing(false); }}
        onBlur={() => setEditing(false)}
      >
        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
      </select>
    );
  }

  return (
    <button type="button" onClick={() => setEditing(true)} className="block w-full rounded px-2 py-1 text-left text-xs font-semibold text-slate-500 transition hover:bg-blue-50" title="Click to edit unit">
      {value || "piece"}
    </button>
  );
}

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ loading: true, saving: false, importing: false, error: "", success: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicatePrompt, setDuplicatePrompt] = useState(null);
  const fileInputRef = useRef(null);

  async function loadProducts() {
    const response = await apiRequest("/products");
    setProducts(response.data || []);
  }

  useEffect(() => {
    loadProducts()
      .catch((error) => setStatus((current) => ({ ...current, error: error.message })))
      .finally(() => setStatus((current) => ({ ...current, loading: false })));
  }, []);

  async function createProduct(productData) {
    await apiRequest("/products", { method: "POST", body: JSON.stringify(productData) });
  }

  async function restockExisting(existingProduct, addedQuantity) {
    await apiRequest(`/products/${existingProduct.id}`, {
      method: "PUT",
      body: JSON.stringify({ ...existingProduct, quantity: Number(existingProduct.quantity || 0) + Number(addedQuantity || 0) })
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus((current) => ({ ...current, saving: true, error: "" }));
    try {
      const newName = form.name.trim();
      const exactMatch = products.find((p) => normalizeName(p.name) === normalizeName(newName));
      if (exactMatch) {
        await restockExisting(exactMatch, form.quantity);
        setForm(emptyForm);
        setShowAddForm(false);
        await loadProducts();
        setStatus((current) => ({ ...current, success: `Added ${form.quantity} to existing stock of "${exactMatch.name}".` }));
        return;
      }
      const similarMatch = products.find((p) => isSimilarName(p.name, newName));
      if (similarMatch) {
        setDuplicatePrompt({ similarMatch, draft: { ...form, name: newName } });
        setStatus((current) => ({ ...current, saving: false }));
        return;
      }
      await createProduct({ ...form, name: newName, item_id: form.item_id || undefined, quantity: Number(form.quantity), cost_price: Number(form.cost_price), selling_price: Number(form.selling_price), low_stock_threshold: Number(form.low_stock_threshold) });
      setForm(emptyForm);
      setShowAddForm(false);
      await loadProducts();
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    } finally {
      setStatus((current) => ({ ...current, saving: false }));
    }
  }

  async function resolveDuplicatePrompt(action) {
    const { similarMatch, draft } = duplicatePrompt;
    setDuplicatePrompt(null);
    setStatus((current) => ({ ...current, saving: true, error: "" }));
    try {
      if (action === "merge") {
        await restockExisting(similarMatch, draft.quantity);
        setStatus((current) => ({ ...current, success: `Added ${draft.quantity} to existing stock of "${similarMatch.name}".` }));
      } else {
        await createProduct({ ...draft, item_id: draft.item_id || undefined, quantity: Number(draft.quantity), cost_price: Number(draft.cost_price), selling_price: Number(draft.selling_price), low_stock_threshold: Number(draft.low_stock_threshold) });
        setStatus((current) => ({ ...current, success: `Created "${draft.name}" as a new product.` }));
      }
      setForm(emptyForm);
      setShowAddForm(false);
      await loadProducts();
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    } finally {
      setStatus((current) => ({ ...current, saving: false }));
    }
  }

  async function updateProductField(product, field, value) {
    try {
      await apiRequest(`/products/${product.id}`, { method: "PUT", body: JSON.stringify({ ...product, [field]: value }) });
      await loadProducts();
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    }
  }

  async function exportInventoryToExcel() {
    const XLSX = await import("xlsx");
    const rows = products.map((p) => ({
      "Item ID": p.item_id || "",
      Product: p.name,
      Stock: Number(p.quantity || 0),
      Unit: p.unit || "piece",
      "Cost Price": Number(p.cost_price || 0),
      "Selling Price": Number(p.selling_price || 0),
      "Low Stock Threshold": Number(p.low_stock_threshold || 0),
      "Inventory Value": Number(p.quantity || 0) * Number(p.cost_price || 0)
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [{ wch: 18 }, { wch: 28 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 16 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, `sahel-inventory-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function importInventoryFromExcel(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus((current) => ({ ...current, importing: true, error: "", success: "" }));
    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      const productsToImport = parseInventoryRows(rows).filter((p) => p.name);
      if (productsToImport.length === 0) throw new Error("No products found. Use a first column called Product, Name, Item, or Product Name.");
      let mergedCount = 0;
      let createdCount = 0;
      for (const product of productsToImport) {
        const existing = products.find((ep) => normalizeName(ep.name) === normalizeName(product.name));
        if (existing) { await restockExisting(existing, product.quantity); mergedCount += 1; }
        else { await createProduct(product); createdCount += 1; }
      }
      await loadProducts();
      setStatus((current) => ({ ...current, success: `Imported: ${createdCount} new product${createdCount === 1 ? "" : "s"}, ${mergedCount} restocked.` }));
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    } finally {
      setStatus((current) => ({ ...current, importing: false }));
      event.target.value = "";
    }
  }

  const filteredProducts = products.filter((p) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return [p.name, p.item_id, p.unit, p.quantity, p.cost_price, p.selling_price].join(" ").toLowerCase().includes(query);
  });

  const totalInventoryValue = products.reduce((sum, p) => sum + Number(p.quantity || 0) * Number(p.cost_price || 0), 0);

  return (
    <div className="space-y-4">
      <section className="panel overflow-visible">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div><h2 className="text-base font-bold text-slate-950">Inventory</h2></div>
          <div className="flex items-center gap-2">
            <button className="btn-primary h-11 w-11 rounded-xl px-0" type="button" title="Add product" onClick={() => setShowAddForm((c) => !c)}>
              {showAddForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
            <div className="relative">
              <button className="btn-secondary h-11 w-11 rounded-xl px-0" type="button" title="Inventory tools" onClick={() => setShowToolsMenu((c) => !c)}>
                <Menu className="h-5 w-5" />
              </button>
              {showToolsMenu ? (
                <div className="absolute right-0 top-12 z-30 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700" type="button" onClick={() => { setShowToolsMenu(false); fileInputRef.current?.click(); }}>
                    <Upload className="h-4 w-4" />
                    {status.importing ? "Importing..." : "Import Excel"}
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={() => { setShowToolsMenu(false); exportInventoryToExcel(); }} disabled={products.length === 0}>
                    <Download className="h-4 w-4" />
                    Export Excel
                  </button>
                </div>
              ) : null}
            </div>
            <input ref={fileInputRef} className="hidden" type="file" accept=".xlsx,.xls,.csv" onChange={importInventoryFromExcel} />
          </div>
        </div>

        {showAddForm ? (
          <form onSubmit={handleSubmit} className="border-b border-slate-200 bg-slate-50/70 p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
              <input className="field" placeholder="Item ID / SKU" value={form.item_id} onChange={(e) => setForm({ ...form, item_id: e.target.value })} />
              <input className="field" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="field" type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              <select className="field" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <input className="field" type="number" placeholder="Cost price" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
              <input className="field" type="number" placeholder="Selling price" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} />
              <input className="field" type="number" placeholder="Low stock threshold" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} />
            </div>
            <div className="mt-3 flex justify-end">
              <button className="btn-primary" disabled={status.saving}>
                <Plus className="h-4 w-4" />
                {status.saving ? "Saving..." : "Add product"}
              </button>
            </div>
          </form>
        ) : null}

        {duplicatePrompt ? (
          <div className="border-b border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">"{duplicatePrompt.draft.name}" looks similar to "{duplicatePrompt.similarMatch.name}" ({duplicatePrompt.similarMatch.quantity} in stock).</p>
            <p className="mt-1 text-sm text-amber-700">Is this a restock or a different product?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-primary" onClick={() => resolveDuplicatePrompt("merge")}><Check className="h-4 w-4" />Add to "{duplicatePrompt.similarMatch.name}"</button>
              <button type="button" className="btn-secondary" onClick={() => resolveDuplicatePrompt("create")}><Plus className="h-4 w-4" />Create as new</button>
              <button type="button" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100" onClick={() => setDuplicatePrompt(null)}>Cancel</button>
            </div>
          </div>
        ) : null}

        {status.error ? <p className="px-4 pt-4 text-sm text-red-600">{status.error}</p> : null}
        {status.success ? <p className="px-4 pt-4 text-sm text-green-600">{status.success}</p> : null}

        <div className="border-b border-slate-100 p-4">
          <label className="flex h-11 max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <Search className="h-4 w-4 text-slate-400" />
            <input className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none" placeholder="Search by name, unit, ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm ? <button className="text-slate-400 hover:text-slate-700" type="button" onClick={() => setSearchTerm("")}><X className="h-4 w-4" /></button> : null}
          </label>
        </div>

        {status.loading ? (
          <div className="p-4"><LoadingState /></div>
        ) : products.length === 0 ? (
          <div className="p-4"><EmptyState title="No products yet" description="Add your first product to start tracking stock." /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-4"><EmptyState title="No matching products" description="Try another product name, unit, or price." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="border border-slate-200 px-4 py-3">Item ID</th>
                  <th className="border border-slate-200 px-4 py-3">Product</th>
                  <th className="border border-slate-200 px-4 py-3">Stock</th>
                  <th className="border border-slate-200 px-4 py-3">Unit</th>
                  <th className="border border-slate-200 px-4 py-3">Cost</th>
                  <th className="border border-slate-200 px-4 py-3">Selling</th>
                  <th className="border border-slate-200 px-4 py-3">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, rowIndex) => (
                  <tr key={product.id} className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                    <td className="border border-slate-200 px-2 py-1 font-mono text-xs font-semibold text-slate-500">{product.item_id || "-"}</td>
                    <td className="border border-slate-200 px-2 py-1 font-semibold text-slate-950">
                      <EditableCell value={product.name} onSave={(v) => updateProductField(product, "name", v)} />
                    </td>
                    <td className="border border-slate-200 px-2 py-1">
                      <EditableCell value={product.quantity} type="number" onSave={(v) => updateProductField(product, "quantity", v)} />
                    </td>
                    <td className="border border-slate-200 px-2 py-1">
                      <EditableUnitCell value={product.unit || "piece"} onSave={(v) => updateProductField(product, "unit", v)} />
                    </td>
                    <td className="border border-slate-200 px-2 py-1">
                      <EditableCell value={product.cost_price} type="number" onSave={(v) => updateProductField(product, "cost_price", v)} formatDisplay={formatMoney} />
                    </td>
                    <td className="border border-slate-200 px-2 py-1">
                      <EditableCell value={product.selling_price} type="number" onSave={(v) => updateProductField(product, "selling_price", v)} formatDisplay={formatMoney} />
                    </td>
                    <td className="border border-slate-200 px-2 py-1">
                      <EditableCell value={product.low_stock_threshold} type="number" onSave={(v) => updateProductField(product, "low_stock_threshold", v)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">{products.length} product{products.length === 1 ? "" : "s"} total</p>
              <p className="text-sm font-semibold text-slate-700">Total inventory value: <span className="text-slate-950">{formatMoney(totalInventoryValue)}</span></p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
