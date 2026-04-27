"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Reusable loading skeleton for dashboard sections. Use the variant that
 * most closely matches the final rendered shape so the page doesn't reflow.
 */
type Variant = "stats" | "table" | "cards" | "list" | "form" | "chart";

export function SectionSkeleton({
  variant = "list",
  rows = 5,
  className,
}: {
  variant?: Variant;
  rows?: number;
  className?: string;
}) {
  if (variant === "stats") {
    return (
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className ?? ""}`}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-black/10 bg-white p-5 space-y-3"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className ?? ""}`}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-black/10 bg-white p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div
        className={`rounded-2xl border border-black/10 bg-white overflow-hidden ${className ?? ""}`}
      >
        <div className="border-b border-black/5 p-4">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="divide-y divide-black/5">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4"
            >
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 flex-1 max-w-[180px]" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className={`space-y-4 max-w-md ${className ?? ""}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div
        className={`rounded-2xl border border-black/10 bg-white p-5 ${className ?? ""}`}
      >
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  // list (default)
  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-4"
        >
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
