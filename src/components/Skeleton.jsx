import React from 'react';

/**
 * Base Primitive Skeleton Block
 */
export function Skeleton({ className = '', rounded = 'rounded-md', ...props }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700/70 ${rounded} ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Skeleton for Summary KPI/Stat Metric Cards (e.g., Admin Dashboard)
 */
export function StatCardSkeleton({ count = 4, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-surface border border-divider rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for Cards with Icons, Title, Description, and Badges (e.g., Careers, Subject Catalog)
 */
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-surface border border-divider rounded-xl p-5 shadow-xs flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center gap-3 mb-3.5">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
        <Skeleton className="h-3 w-full mb-1.5" />
        <Skeleton className="h-3 w-4/5 mb-4" />
      </div>
      <div className="pt-3 border-t border-divider flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Skeleton Grid of Cards
 */
export function CardGridSkeleton({ count = 6, columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', className = '' }) {
  return (
    <div className={`grid ${columns} gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * Skeleton for Data Tables (e.g., Students list, Recommendation Histories, Log tables)
 */
export function TableSkeleton({ rows = 5, cols = 5, hasHeader = true, className = '' }) {
  return (
    <div className={`w-full overflow-hidden border border-divider rounded-xl bg-surface shadow-xs ${className}`}>
      {hasHeader && (
        <div className="px-5 py-4 border-b border-divider flex items-center justify-between bg-subsurface">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      )}
      <div className="divide-y divide-divider">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-5 py-3.5 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className={`h-4 ${
                  cIdx === 0 ? 'w-28' : cIdx === 1 ? 'w-40 flex-1' : cIdx === 2 ? 'w-24' : 'w-16'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Question Form / Survey Steps (e.g., RIASEC Quiz)
 */
export function QuestionSkeleton({ className = '' }) {
  return (
    <div className={`w-full bg-surface border border-divider rounded-2xl p-6 sm:p-8 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-divider">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-44" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-4/5 mb-3" />
      <Skeleton className="h-4 w-3/5 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-16 rounded-xl" />
        ))}
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-divider">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Profile & Detailed Analysis Charts (e.g., RIASEC Result, SAW Detail)
 */
export function DetailViewSkeleton({ className = '' }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-surface border border-divider rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-divider">
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="p-4 border border-divider rounded-xl bg-subsurface space-y-2 text-center">
              <Skeleton className="h-3 w-16 mx-auto" />
              <Skeleton className="h-7 w-10 mx-auto" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-divider rounded-xl p-6 shadow-xs space-y-3">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <div className="bg-surface border border-divider rounded-xl p-6 shadow-xs space-y-3">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
