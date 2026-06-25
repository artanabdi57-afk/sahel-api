function ProductSearch({ products, value, onSelect }) {
  const [query, setQuery] = useState("");

  const selected = products.find((p) => String(p.id) === String(value));

  const filtered = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    : products;

  function handleClear() {
    onSelect("");
    setQuery("");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="field pl-10"
          placeholder="Search product..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-400">No products found</p>
        ) : (
          filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition ${String(p.id) === String(value) ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}
              onClick={() => onSelect(String(p.id) === String(value) ? "" : p.id)}
            >
              <span className="text-sm font-medium">{p.name}</span>
              <span className="text-xs text-slate-400">{p.quantity} {p.unit || "pcs"}</span>
            </button>
          ))
        )}
      </div>
      {selected ? (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
          <span className="text-sm font-semibold text-blue-700">Selected: {selected.name}</span>
          <button type="button" onClick={handleClear} className="text-blue-400 hover:text-blue-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
