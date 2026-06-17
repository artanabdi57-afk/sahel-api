import React from "react";

function SkeletonLine({ className = "" }) {
  return <div className={`animate-pulse rounded-full bg-slate-200 ${className}`} />;
}

export function LoadingState({ variant = "page" }) {
  if (variant === "dashboard") {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] space-y-5 rounded-[2rem] bg-[#f4f7ff] p-3 sm:p-5">
        <div className="rounded-[1.75rem] bg-white/80 p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SkeletonLine className="h-11 w-full sm:w-96" />
            <div className="flex gap-3">
              <SkeletonLine className="h-11 w-32" />
              <SkeletonLine className="h-11 w-11" />
              <SkeletonLine className="h-11 w-11" />
            </div>
          </div>
        </div>
        <div>
          <SkeletonLine className="h-10 w-48" />
          <SkeletonLine className="mt-3 h-4 w-80 max-w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <SkeletonLine className="h-4 w-28" />
              <SkeletonLine className="mt-5 h-9 w-36" />
              <SkeletonLine className="mt-8 h-4 w-full" />
            </div>
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.9fr]">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <SkeletonLine className="h-5 w-32" />
            <div className="mt-8 flex h-56 items-end gap-3">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex flex-1 items-end">
                  <div className="w-full animate-pulse rounded-t-2xl bg-slate-200" style={{ height: `${35 + index * 8}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <SkeletonLine className="h-5 w-40" />
            <div className="mt-8 grid items-center gap-5 sm:grid-cols-[180px_1fr]">
              <div className="mx-auto h-44 w-44 animate-pulse rounded-full bg-slate-200" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonLine key={index} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "route") {
    return (
      <div className="space-y-4 p-4">
        <SkeletonLine className="h-8 w-56" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="panel p-5">
            <SkeletonLine className="h-5 w-32" />
            <SkeletonLine className="mt-5 h-11 w-full" />
            <SkeletonLine className="mt-3 h-11 w-full" />
            <SkeletonLine className="mt-3 h-11 w-2/3" />
          </div>
          <div className="panel p-5">
            <SkeletonLine className="h-5 w-40" />
            <SkeletonLine className="mt-5 h-28 w-full" />
            <SkeletonLine className="mt-3 h-28 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel space-y-4 p-5">
      <SkeletonLine className="h-5 w-36" />
      <SkeletonLine className="h-11 w-full" />
      <SkeletonLine className="h-11 w-4/5" />
    </div>
  );
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
