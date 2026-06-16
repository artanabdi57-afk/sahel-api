import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { Download, Menu, Plus, Search, Upload, X } from "lucide-react";
import { apiRequest, formatMoney } from "../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";

const emptyForm = {
  item_id: "",
  name: "",
  quantity: "",
  cost_price: "",
  selling_price: "",
  low_stock_threshold: ""
};

const columnAliases = {
  item_id: ["itemid", "productid", "productcode", "sku", "barcode", "code", "id"],
  name: ["name", "product", "productname", "item", "itemname", "description"],
  quantity: ["quantity", "qty", "stock", "currentstock", "onhand", "units"],
  cost_price: ["costprice", "cost", "buyingprice", "purchaseprice", "wholesaleprice"],
  selling_price: ["sellingprice", "selling", "price", "retailprice", "saleprice"],
  low_stock_threshold: ["lowstockthreshold", "threshold", "lowstock", "reorderlevel", "minimumstock", "minstock"]
};

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toNumber(value) {
  const cleaned = String(value || "")
    .replace(/,/g, "")
    .replace(/[^0-9.-]/g, "");

  return Number(cleaned || 0);
}

function findColumnIndex(headers, field) {
  const normalizedHeaders = headers.map(normalizeHeader);
  return normalizedHeaders.findIndex((header) => columnAliases[field].includes(header));
}

function parseInventoryRows(sheetRows) {
  const nonEmptyRows = sheetRows.filter((row) => row.some((cell) => String(cell || "").trim() !== ""));
  const headerRowIndex = nonEmptyRows.findIndex((row) => {
    return findColumnIndex(row, "name") !== -1;
  });

  if (headerRowIndex === -1) {
    return nonEmptyRows.map((row) => ({
      item_id: String(row[0] || "").trim(),
      name: String(row[1] || "").trim(),
      quantity: toNumber(row[2]),
      cost_price: toNumber(row[3]),
      selling_price: toNumber(row[4]),
      low_stock_threshold: toNumber(row[5])
    }));
  }

  const headers = nonEmptyRows[headerRowIndex];
  const dataRows = nonEmptyRows.slice(headerRowIndex + 1);
  const indexes = {
    item_id: findColumnIndex(headers, "item_id"),
    name: findColumnIndex(headers, "name"),
    quantity: findColumnIndex(headers, "quantity"),
    cost_price: findColumnIndex(headers, "cost_price"),
    selling_price: findColumnIndex(headers, "selling_price"),
    low_stock_threshold: findColumnIndex(headers, "low_stock_threshold")
  };

  return dataRows.map((row) => ({
    item_id: indexes.item_id === -1 ? "" : String(row[indexes.item_id] || "").trim(),
    name: String(row[indexes.name] || "").trim(),
    quantity: indexes.quantity === -1 ? 0 : toNumber(row[indexes.quantity]),
    cost_price: indexes.cost_price === -1 ? 0 : toNumber(row[indexes.cost_price]),
    selling_price: indexes.selling_price === -1 ? 0 : toNumber(row[indexes.selling_price]),
    low_stock_threshold: indexes.low_stock_threshold === -1 ? 0 : toNumber(row[indexes.low_stock_threshold])
  }));
}

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ loading: true, saving: false, importing: false, error: "", success: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus((current) => ({ ...current, saving: true, error: "" }));

    try {
      await apiRequest("/products", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          item_id: form.item_id || undefined,
          quantity: Number(form.quantity),
          cost_price: Number(form.cost_price),
          selling_price: Number(form.selling_price),
          low_stock_threshold: Number(form.low_stock_threshold)
        })
      });
      setForm(emptyForm);
      setShowAddForm(false);
      await loadProducts();
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    } finally {
      setStatus((current) => ({ ...current, saving: false }));
    }
  }

  async function exportInventoryToExcel() {
    const XLSX = await import("xlsx");
    const rows = products.map((product) => ({
      "Item ID": product.item_id || "",
      Product: product.name,
      Stock: Number(product.quantity || 0),
      "Cost Price": Number(product.cost_price || 0),
      "Selling Price": Number(product.selling_price || 0),
      "Low Stock Threshold": Number(product.low_stock_threshold || 0),
      "Inventory Value": Number(product.quantity || 0) * Number(product.cost_price || 0)
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 28 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 22 },
      { wch: 16 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, `sahel-inventory-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function importInventoryFromExcel(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setStatus((current) => ({ ...current, importing: true, error: "", success: "" }));

    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      const productsToImport = parseInventoryRows(rows).filter((product) => product.name);

      if (productsToImport.length === 0) {
        throw new Error("No products found. Use a first column called Product, Name, Item, or Product Name.");
      }

      for (const product of productsToImport) {
        await apiRequest("/products", {
          method: "POST",
          body: JSON.stringify(product)
        });
      }

      await loadProducts();
      setStatus((current) => ({
        ...current,
        success: `Imported ${productsToImport.length} product${productsToImport.length === 1 ? "" : "s"}.`
      }));
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    } finally {
      setStatus((current) => ({ ...current, importing: false }));
      event.target.value = "";
    }
  }

  const filteredProducts = products.filter((product) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      product.name,
      product.item_id,
      product.quantity,
      product.cost_price,
      product.selling_price,
      product.low_stock_threshold
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <div className="space-y-4">
      <section className="panel overflow-visible">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">Inventory</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn-primary h-11 w-11 rounded-xl px-0"
              type="button"
              title="Add product"
              onClick={() => setShowAddForm((current) => !current)}
            >
              {showAddForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>

            <div className="relative">
              <button
                className="btn-secondary h-11 w-11 rounded-xl px-0"
                type="button"
                title="Inventory tools"
                onClick={() => setShowToolsMenu((current) => !current)}
              >
                <Menu className="h-5 w-5" />
              </button>

              {showToolsMenu ? (
                <div className="absolute right-0 top-12 z-30 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
                  <button
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    type="button"
                    onClick={() => {
                      setShowToolsMenu(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    {status.importing ? "Importing..." : "Import Excel"}
                  </button>
                  <button
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={() => {
                      setShowToolsMenu(false);
                      exportInventoryToExcel();
                    }}
                    disabled={products.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Export Excel
                  </button>
                </div>
              ) : null}
            </div>

            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={importInventoryFromExcel}
            />
          </div>
        </div>

        {showAddForm ? (
          <form onSubmit={handleSubmit} className="border-b border-slate-200 bg-slate-50/70 p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              <input className="field" placeholder="Item ID / SKU" value={form.item_id} onChange={(e) => setForm({ ...form, item_id: e.target.value })} />
              <input className="field" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="field" type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
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

        {status.error ? <p className="px-4 pt-4 text-sm text-red-600">{status.error}</p> : null}
        {status.success ? <p className="px-4 pt-4 text-sm text-green-600">{status.success}</p> : null}

        <div className="border-b border-slate-100 p-4">
          <label className="flex h-11 max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
              placeholder="Search inventory"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm ? (
              <button className="text-slate-400 hover:text-slate-700" type="button" onClick={() => setSearchTerm("")}>
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>
        </div>

        {status.loading ? (
          <div className="p-4">
            <LoadingState />
          </div>
        ) : products.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No products yet" description="Add your first product to start tracking stock." />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No matching products" description="Try another product name, stock quantity, or price." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Item ID</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Selling</th>
                  <th className="px-4 py-3">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-500">{product.item_id || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-slate-950">{product.name}</td>
                    <td className="px-4 py-3">{product.quantity}</td>
                    <td className="px-4 py-3">{formatMoney(product.cost_price)}</td>
                    <td className="px-4 py-3">{formatMoney(product.selling_price)}</td>
                    <td className="px-4 py-3">{product.low_stock_threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
