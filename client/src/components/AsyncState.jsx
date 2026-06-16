import React from "react";

export function LoadingState() {
  return <div className="panel p-5 text-sm text-slate-500">Loading...</div>;
}

export function ErrorState({ message }) {
  return <div className="panel border-red-200 bg-red-50 p-5 text-sm text-red-700">{message}</div>;
}

export function EmptyState({ title, description }) {
  return (
    <div className="panel p-6 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
