import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download, FileUp, Plus, Trash2, Upload, X } from "lucide-react";
import * as XLSX from "xlsx";
import { apiRequest } from "../lib/api";
import { EmptyState, ErrorState, LoadingState } from "./AsyncState";

function blankRow(fields) {
  return Object.fromEntries(fields.map((f) => [f.key, f.default ?? ""]));
}

function normalizeHeader(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[^a-z0-9]+/g, " ").trim();
}

function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"' && quoted && next === '"') { cell += '"'; i += 1; continue; }
    if (ch === '"') { quoted = !quoted; continue; }
    if (ch === "," && !quoted) { row.push(cell); cell = ""; continue; }
    if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell); cell = "";
      if (row.some((v) => String(v).trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  row.push(cell);
  if (row.some((v) => String(v).trim() !== "")) rows.push(row);
  if (!rows.length) return [];
  const headers = rows[0].map((h) => String(h).trim());
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""])));
}

async function parseSpreadsheet(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
}

function mapImportedRows(imported, fields) {
  const fieldByHeader = new Map();
  fields.forEach((field) => {
    [field.key, field.label, ...(field.aliases || [])].forEach((name) => fieldByHeader.set(normalizeHeader(name), field));
    (field.options || []).forEach((option) => fieldByHeader.set(normalizeHeader(option.label), field));
  });
  return imported.map((source) => {
    const clean = blankRow(fields);
    Object.entries(source).forEach(([header, rawValue]) => {
      const field = fieldByHeader.get(normalizeHeader(header));
      if (!field) return;
      let value = rawValue;
      if (field.type === "select") {
        const n = normalizeHeader(value);
        const option = (field.options || []).find((item) => normalizeHeader(item.value) === n || normalizeHeader(item.label) === n);
        value = option ? option.value : value;
      }
      clean[field.key] = value;
    });
    return clean;
  });
}

function downloadCsv(filename, rows, fields) {
  const headers = fields.map((f) => f.key);
  const lines = [headers.map(escapeCsv).join(",")];
  rows.forEach((row) => lines.push(headers.map((key) => escapeCsv(row[key])).join(",")));
  const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}

function downloadExcel(filename, rows, fields) {
  const output = rows.length ? rows : [Object.fromEntries(fields.map((field) => [field.label, ""]))];
  const data = output.map((row) => Object.fromEntries(fields.map((field) => [field.label, row[field.key] ?? ""])));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), "Students");
  XLSX.writeFile(workbook, filename);
}

export default function EntityCrud({
  apiPath,
  title,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Add your first record to get started.",
  fields,
  columns,
  deletable = true,
  transformSubmit,
  extraColumnActions,
  entityLabel = "records",
  bulkDefaults = {},
  bulkHeaderContent = null,
  bulkApiPath = null,
  transformBulkSubmit = null,
}) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(() => blankRow(fields));
  const [bulkRows, setBulkRows] = useState(() => Array.from({ length: 3 }, () => ({ ...blankRow(fields), ...bulkDefaults })));
  const [bulkOpen, setBulkOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef(null);
  const [status, setStatus] = useState({ loading: true, saving: false, error: "", success: "" });

  async function load() {
    setStatus((s) => ({ ...s, loading: true, error: "" }));
    try {
      const response = await apiRequest(apiPath);
      setRows(response.data || []);
      setStatus((s) => ({ ...s, loading: false }));
    } catch (error) {
      setStatus((s) => ({ ...s, loading: false, error: error.message }));
    }
  }
  useEffect(() => { load(); }, [apiPath]);
  function set(key, value) { setForm((f) => ({ ...f, [key]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus((s) => ({ ...s, saving: true, error: "", success: "" }));
    try {
      const body = transformSubmit ? transformSubmit(form) : form;
      await apiRequest(apiPath, { method: "POST", body: JSON.stringify(body) });
      setForm(blankRow(fields));
      setStatus((s) => ({ ...s, saving: false, success: "Saved successfully." }));
      await load();
    } catch (error) {
      setStatus((s) => ({ ...s, saving: false, error: error.message }));
    }
  }

  function updateBulkRow(index, key, value) {
    setBulkRows((current) => current.map((row, i) => i === index ? { ...row, [key]: value } : row));
  }
  function addBulkRow() { setBulkRows((current) => [...current, { ...blankRow(fields), ...bulkDefaults }]); }
  function removeBulkRow(index) { setBulkRows((current) => current.length <= 1 ? current : current.filter((_, i) => i !== index)); }

  async function saveBulk(records) {
    const usable = records.map((row) => ({ ...bulkDefaults, ...row })).filter((row) => Object.values(row).some((value) => String(value ?? "").trim() !== ""));
    if (!usable.length) {
      setStatus((s) => ({ ...s, error: `Add at least one ${entityLabel.slice(0, -1) || "record"}.` }));
      return;
    }
    setBulkSaving(true);
    setBulkProgress({ done: 0, total: usable.length });
    setStatus((s) => ({ ...s, error: "", success: "" }));

    try {
      if (bulkApiPath) {
        const body = transformBulkSubmit
          ? transformBulkSubmit(usable)
          : { students: usable.map((row) => transformSubmit ? transformSubmit(row) : row) };
        const response = await apiRequest(bulkApiPath, { method: "POST", body: JSON.stringify(body) });
        const saved = Number(response?.saved ?? 0);
        const failed = Number(response?.failed ?? (usable.length - saved));
        const details = (response?.results || []).filter((r) => !r.success).slice(0, 3).map((r) => `Row ${r.row}: ${r.error}`).join(" | ");
        setBulkProgress({ done: usable.length, total: usable.length });
        if (failed > 0) {
          setStatus((s) => ({ ...s, error: `${failed} ${entityLabel} could not be saved.${details ? ` ${details}` : ""}`, success: `${saved} ${entityLabel} saved successfully.` }));
          setBulkSaving(false);
          return;
        }
        setStatus((s) => ({ ...s, error: "", success: `${saved} ${entityLabel} saved successfully.` }));
      } else {
        let saved = 0, failed = 0;
        const errors = [];
        for (let i = 0; i < usable.length; i += 1) {
          try {
            const body = transformSubmit ? transformSubmit(usable[i]) : usable[i];
            await apiRequest(apiPath, { method: "POST", body: JSON.stringify(body) });
            saved += 1;
          } catch (error) { failed += 1; errors.push(`Row ${i + 1}: ${error.message}`); }
          setBulkProgress({ done: i + 1, total: usable.length });
        }
        if (failed) setStatus((s) => ({ ...s, error: `${failed} ${entityLabel} could not be saved. ${errors.slice(0, 3).join(" | ")}`, success: `${saved} ${entityLabel} saved successfully.` }));
        else setStatus((s) => ({ ...s, error: "", success: `${saved} ${entityLabel} saved successfully.` }));
      }
      setBulkOpen(false);
      setBulkRows(Array.from({ length: 3 }, () => ({ ...blankRow(fields), ...bulkDefaults })));
      await load();
    } catch (error) {
      setStatus((s) => ({ ...s, error: `Import failed: ${error.message}` }));
    } finally {
      setBulkSaving(false);
    }
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!["csv", "xlsx", "xls"].includes(extension)) throw new Error("Use a CSV, XLSX, or XLS file.");
      const imported = extension === "csv" ? parseCsv(await file.text()) : await parseSpreadsheet(file);
      if (!imported.length) throw new Error("The file is empty or has no data rows.");
      const normalized = mapImportedRows(imported, fields);
      setBulkRows(normalized);
      setBulkOpen(true);
      setStatus((s) => ({ ...s, error: "", success: `${normalized.length} rows loaded from ${file.name}. Review the data, choose the destination class, then save all.` }));
    } catch (error) {
      setStatus((s) => ({ ...s, error: `Could not read ${file.name}. ${error.message}` }));
    } finally { setImporting(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this record?")) return;
    try { await apiRequest(`${apiPath}/${id}`, { method: "DELETE" }); await load(); }
    catch (error) { setStatus((s) => ({ ...s, error: error.message })); }
  }

  const visibleCount = rows.length;
  const activeCount = useMemo(() => rows.filter((r) => !r.status || r.status === "active").length, [rows]);
  if (status.loading) return <LoadingState />;

  return (
    <div className="space-y-5 motion-card">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-indigo-50 p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Sahel workspace</p><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{title.replace(/^Add\s+/i, "")}</h2><p className="mt-1 text-sm text-slate-500">Manage your {entityLabel} quickly, individually or in bulk.</p></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => downloadCsv(`${entityLabel.replace(/\s+/g, "-")}.csv`, rows, fields)} disabled={!rows.length}><Download className="h-4 w-4" /> Export CSV</button>
            <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()} disabled={importing}><FileUp className="h-4 w-4" /> {importing ? "Reading…" : "Import Excel / CSV"}</button>
            <button type="button" className="btn-secondary" onClick={() => downloadExcel(`${entityLabel.replace(/\s+/g, "-")}-template.xlsx`, [], fields)} disabled={importing}><Download className="h-4 w-4" /> Excel template</button>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="hidden" onChange={handleImport} />
            <button type="button" className="btn-primary" onClick={() => setBulkOpen(true)}><Upload className="h-4 w-4" /> Add multiple</button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md"><div className="rounded-xl border border-white bg-white/80 p-3 shadow-sm"><p className="text-xs font-semibold text-slate-500">Total</p><p className="mt-1 text-xl font-black text-slate-950">{visibleCount}</p></div><div className="rounded-xl border border-white bg-white/80 p-3 shadow-sm"><p className="text-xs font-semibold text-slate-500">Active</p><p className="mt-1 text-xl font-black text-blue-600">{activeCount}</p></div></div>
      </div>
      {status.error ? <ErrorState message={status.error} /> : null}
      {status.success ? <div className="motion-card rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{status.success}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit} className="panel h-fit p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Quick add</p><h3 className="mt-1 text-lg font-black text-slate-950">{title}</h3></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">1 at a time</span></div>
          <div className="space-y-3">{fields.map((f) => f.type === "select" ? <select key={f.key} className="field" value={form[f.key]} required={f.required} onChange={(e) => set(f.key, e.target.value)}><option value="">{f.label}</option>{(f.options || []).map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select> : <input key={f.key} className="field" type={f.type || "text"} step={f.type === "number" ? "0.01" : undefined} min={f.type === "number" ? "0" : undefined} placeholder={f.label} value={form[f.key]} required={f.required} onChange={(e) => set(f.key, e.target.value)} />)}</div>
          <button className="btn-primary mt-4 w-full" disabled={status.saving}><Plus className="h-4 w-4" />{status.saving ? "Saving…" : "Add"}</button>
          <button type="button" className="mt-2 w-full rounded-xl border border-dashed border-blue-200 bg-blue-50/60 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100" onClick={() => setBulkOpen(true)}>Need to register many? Add multiple →</button>
        </form>
        <div className="panel min-h-[360px] overflow-hidden transition duration-300 hover:shadow-md">
          {rows.length === 0 ? <div className="flex min-h-[360px] items-center justify-center p-8"><EmptyState title={emptyTitle} description={emptyDescription} /></div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50/90 text-xs uppercase text-slate-500"><tr>{columns.map((c) => <th key={c.key} className={`px-4 py-3 font-bold ${c.align === "right" ? "text-right" : ""}`}>{c.label}</th>)}{(deletable || extraColumnActions) && <th className="px-4 py-3 text-right font-bold">Action</th>}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, index) => <tr key={row.id} className="motion-card transition hover:bg-blue-50/50" style={{ animationDelay: `${Math.min(index, 10) * 35}ms` }}>{columns.map((c) => <td key={c.key} className={`px-4 py-3 ${c.align === "right" ? "text-right" : ""}`}>{c.render ? c.render(row) : (row[c.key] ?? "-")}</td>)}{(deletable || extraColumnActions) && <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-2">{extraColumnActions ? extraColumnActions(row, load) : null}{deletable && <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50" onClick={() => handleDelete(row.id)} title="Remove"><Trash2 className="h-4 w-4" /></button>}</div></td>}</tr>)}</tbody></table></div>}
        </div>
      </div>

      {bulkOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && !bulkSaving && setBulkOpen(false)}>
        <div className="motion-pop max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 p-5"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Bulk registration</p><h3 className="text-xl font-black text-slate-950">Import and organize {entityLabel}</h3><p className="mt-1 text-sm text-slate-500">Upload Excel/CSV, review the organized rows, assign classes, then save them all.</p></div><button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => !bulkSaving && setBulkOpen(false)}><X className="h-5 w-5" /></button></div>
          {bulkHeaderContent ? <div className="border-b border-slate-100 bg-blue-50/60 p-5">{bulkHeaderContent}</div> : null}
          <div className="max-h-[58vh] overflow-auto p-5"><div className="min-w-[900px]"><div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(fields.length, 4)}, minmax(180px, 1fr)) 48px` }}>{bulkRows.map((row, index) => <React.Fragment key={index}>{fields.map((f) => f.type === "select" ? <select key={f.key} className="field" value={row[f.key]} onChange={(e) => updateBulkRow(index, f.key, e.target.value)}><option value="">{f.label}</option>{(f.options || []).map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select> : <input key={f.key} className="field" type={f.type || "text"} step={f.type === "number" ? "0.01" : undefined} min={f.type === "number" ? "0" : undefined} placeholder={f.label} value={row[f.key]} onChange={(e) => updateBulkRow(index, f.key, e.target.value)} />)}<button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50" onClick={() => removeBulkRow(index)}><X className="h-4 w-4" /></button></React.Fragment>)}</div></div></div>
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2"><button type="button" className="btn-secondary" onClick={addBulkRow} disabled={bulkSaving}><Plus className="h-4 w-4" /> Add row</button><button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()} disabled={bulkSaving}><FileUp className="h-4 w-4" /> Import Excel / CSV</button><button type="button" className="btn-secondary" onClick={() => downloadExcel(`${entityLabel.replace(/\s+/g, "-")}-template.xlsx`, [], fields)} disabled={bulkSaving}><Download className="h-4 w-4" /> Excel template</button></div><button type="button" className="btn-primary sm:min-w-48" onClick={() => saveBulk(bulkRows)} disabled={bulkSaving}>{bulkSaving ? `Saving ${bulkProgress.done}/${bulkProgress.total}…` : `Save all ${bulkRows.filter((r) => Object.values({ ...bulkDefaults, ...r }).some((v) => String(v).trim())).length} rows`}</button></div>
        </div>
      </div>}
    </div>
  );
}
