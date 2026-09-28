import { cn } from "@/lib/utils";

/** Level 3 elevation: deeper shadow to pull focus over the page. */
export function EmptyState({
  icon = "search_off",
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-md py-xl text-center", className)}>
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-outline">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </span>
      <p className="text-label-md font-semibold text-on-surface">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-caption text-on-surface-variant">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-md">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-md py-xl"
      role="status"
      aria-live="polite"
    >
      <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: 32 }}>
        progress_activity
      </span>
      <p className="mt-3 text-caption text-on-surface-variant">{label}</p>
    </div>
  );
}

/** Skeleton rows for list screens, so the layout does not jump on load. */
export function SkeletonRows({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-sm p-md", className)} aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-xl bg-surface-container"
          style={{ animationDelay: `${index * 80}ms` }}
        />
      ))}
    </div>
  );
}
