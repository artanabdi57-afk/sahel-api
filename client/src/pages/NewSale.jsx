import React, { useEffect, useRef, useState } from "react";
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
