import React from "react";
import { Printer, Download, X } from "lucide-react";

function formatMoney(value) {
  const number = Number(value) || 0;
  return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (isNaN(date)) return isoDate;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function Receipt({ sale, shop, onClose }) {
  const {
    productName,
    quantity_sold,
    selling_price,
    payment_type,
    customer_name,
    customer_phone,
    sale_date,
    receipt_no
  } = sale;

  const total = Number(quantity_sold) * Number(selling_price);

  async function handleDownloadPdf() {
    const node = document.getElementById("receipt-print-area");
    if (!node) return;

    const html2pdf = (await import("html2pdf.js")).default;

    html2pdf()
      .set({
        margin: 0,
        filename: `Sahel-Receipt-${receipt_no || Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: [80, 150], orientation: "portrait" }
      })
      .from(node)
      .save();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:static print:bg-transparent print:p-0">
      <div className="relative w-full max-w-sm rounded-xl bg-white shadow-xl print:max-w-none print:shadow-none print:rounded-none">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 print:hidden"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div id="receipt-print-area" className="px-6 py-6 font-mono text-sm text-slate-900">
          <div className="mb-4 flex flex-col items-center text-center">
            {shop?.logo ? (
              <img src={shop.logo} alt="Shop logo" className="mb-2 h-12 w-12 rounded-lg object-cover" />
            ) : (
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-lg font-black text-white">
                S
              </div>
            )}
            <p className="text-base font-bold">{shop?.shop_name || "Sahel Shop"}</p>
            {shop?.address ? <p className="text-xs text-slate-500">{shop.address}</p> : null}
            {shop?.phone ? <p className="text-xs text-slate-500">{shop.phone}</p> : null}
          </div>

          <div className="mb-3 border-t border-dashed border-slate-300 pt-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Date</span>
              <span>{formatDate(sale_date)}</span>
            </div>
            {receipt_no ? (
              <div className="flex justify-between">
                <span>Receipt #</span>
                <span>{receipt_no}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span>Payment</span>
              <span className="capitalize">{payment_type}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 py-3">
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="max-w-[40%] truncate">{productName}</span>
              <span>{quantity_sold}</span>
              <span>{formatMoney(selling_price)}</span>
              <span className="font-semibold">{formatMoney(total)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 pt-3">
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>${formatMoney(total)}</span>
            </div>
          </div>

          {(customer_name && customer_name !== "Walk-in") || (customer_phone && customer_phone !== "N/A") ? (
            <div className="mt-3 border-t border-dashed border-slate-300 pt-3 text-xs text-slate-600">
              {customer_name && customer_name !== "Walk-in" ? <p>Customer: {customer_name}</p> : null}
              {customer_phone && customer_phone !== "N/A" ? <p>Phone: {customer_phone}</p> : null}
            </div>
          ) : null}

          <p className="mt-5 text-center text-xs text-slate-400">Thank you for your business</p>
        </div>

        <div className="flex gap-2 border-t border-slate-200 px-6 py-4 print:hidden">
          <button onClick={handlePrint} className="btn-secondary flex-1 justify-center">
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button onClick={handleDownloadPdf} className="btn-primary flex-1 justify-center">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
