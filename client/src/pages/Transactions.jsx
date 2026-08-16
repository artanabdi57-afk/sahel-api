import React, { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import NewSale from "./NewSale.jsx";
import PurchaseOrders from "./PurchaseOrders.jsx";

/**
 * Unified transaction center.
 * Buy is intentionally the default tab. Buy and Sell remain separate flows
 * so purchase-order creation is never mixed with a customer sale.
 */
export default function Transactions() {
  const [mode, setMode] = useState("buy");

  return (
    <div className="space-y-4">
      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-950">Transactions</h1>
            <p className="mt-1 text-sm text-slate-500">
              Buy stock or sell products. Buy opens by default.
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Transaction type">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "buy"}
              onClick={() => setMode("buy")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                mode === "buy" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ArrowDownToLine className="h-4 w-4" />
              Buy
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "sell"}
              onClick={() => setMode("sell")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                mode === "sell" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ArrowUpFromLine className="h-4 w-4" />
              Sell
            </button>
          </div>
        </div>
      </section>

      {mode === "buy" ? <PurchaseOrders /> : <NewSale />}
    </div>
  );
}
