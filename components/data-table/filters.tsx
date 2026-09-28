"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

/** Segmented control that writes its choice to the URL. */
export function FilterTabs<T extends string>({
  options,
  paramName,
  value,
  ariaLabel,
  className = "",
}: {
  options: Array<FilterOption<T>>;
  paramName: string;
  value: T;
  ariaLabel: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function select(next: T) {
    const params = new URLSearchParams(window.location.search);
    if (next === "ALL") params.delete(paramName);
    else params.set(paramName, next);
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `?${query}` : window.location.pathname, {
        scroll: false,
      });
    });
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-1 rounded-lg bg-surface-container-low p-1",
        isPending && "opacity-70",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => select(option.value)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-caption font-semibold transition-colors",
              active
                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            {option.label}
            {option.count !== undefined ? (
              <span>
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-bold",
                  active ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high",
                )}
                
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
