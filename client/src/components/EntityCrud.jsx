import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { apiRequest } from "../lib/api";
import { EmptyState, ErrorState, LoadingState } from "./AsyncState";

/**
 * Generic "add a row / list rows / delete a row" panel used across the Gym
 * and School verticals so each entity page (members, teachers, classes,
 * students…) doesn't need to hand-roll the same list+form boilerplate.
 *
 * props:
 *  - apiPath:     e.g. "/gym/members"
 *  - title:       heading for the add-form panel
 *  - emptyTitle / emptyDescription
 *  - fields:      [{ key, label, type: "text"|"tel"|"number"|"date"|"select", options?, required? }]
 *  - columns:     [{ key, label, align?, render?: (row) => node }]
 *  - deletable:   allow row delete (default true)
 *  - transformSubmit: (formValues) => body to POST (optional)
 *  - extraColumnActions: (row, reload) => node — extra per-row buttons
 */
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
}) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.default ?? ""]))
  );
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
      setForm(Object.fromEntries(fields.map((f) => [f.key, f.default ?? ""])));
      setStatus((s) => ({ ...s, saving: false, success: "Saved." }));
      await load();
    } catch (error) {
      setStatus((s) => ({ ...s, saving: false, error: error.message }));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this record?")) return;
    try {
      await apiRequest(`${apiPath}/${id}`, { method: "DELETE" });
      await load();
    } catch (error) {
      setStatus((s) => ({ ...s, error: error.message }));
    }
  }

  if (status.loading) return <LoadingState />;

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <form onSubmit={handleSubmit} className="panel h-fit p-4">
        <h2 className="mb-4 text-base font-bold text-slate-950">{title}</h2>
        {status.error ? <ErrorState message={status.error} /> : null}
        {status.success ? (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">{status.success}</div>
        ) : null}

        <div className="space-y-3">
          {fields.map((f) =>
            f.type === "select" ? (
              <select
                key={f.key}
                className="field"
                value={form[f.key]}
                required={f.required}
                onChange={(e) => set(f.key, e.target.value)}
              >
                <option value="">{f.label}</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                key={f.key}
                className="field"
                type={f.type || "text"}
                step={f.type === "number" ? "0.01" : undefined}
                min={f.type === "number" ? "0" : undefined}
                placeholder={f.label}
                value={form[f.key]}
                required={f.required}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )
          )}
        </div>

        <button className="btn-primary mt-4 w-full" disabled={status.saving}>
          <Plus className="h-4 w-4" />
          {status.saving ? "Saving…" : "Add"}
        </button>
      </form>

      <div className="panel overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-4">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className={`px-4 py-3 font-semibold ${c.align === "right" ? "text-right" : ""}`}>{c.label}</th>
                  ))}
                  {(deletable || extraColumnActions) && <th className="px-4 py-3 text-right font-semibold">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    {columns.map((c) => (
                      <td key={c.key} className={`px-4 py-3 ${c.align === "right" ? "text-right" : ""}`}>
                        {c.render ? c.render(row) : (row[c.key] ?? "-")}
                      </td>
                    ))}
                    {(deletable || extraColumnActions) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {extraColumnActions ? extraColumnActions(row, load) : null}
                          {deletable && (
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
                              onClick={() => handleDelete(row.id)}
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
