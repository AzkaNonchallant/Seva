"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/**
 * Search that drives the URL rather than component state, so the filtering
 * happens in the server component and the result stays shareable.
 */
export function SearchBar({
  placeholder = "Cari...",
  paramName = "q",
  defaultValue = "",
  className = "",
}: {
  placeholder?: string;
  paramName?: string;
  defaultValue?: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  // Back/forward navigation changes `defaultValue` without touching this
  // component. React's documented way to resync is during render — the
  // previous prop is tracked so the reset happens once, not on every keystroke.
  const [lastDefault, setLastDefault] = useState(defaultValue);
  if (defaultValue !== lastDefault) {
    setLastDefault(defaultValue);
    setValue(defaultValue);
  }

  function commit(next: string) {
    setValue(next);
    const params = new URLSearchParams(window.location.search);
    if (next.trim()) params.set(paramName, next.trim());
    else params.delete(paramName);
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `?${query}` : window.location.pathname, {
        scroll: false,
      });
    });
  }

  return (
    <div className={`relative ${className}`}>
      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: 18 }}>
        search
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => commit(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full pl-9 pr-9 text-label-md text-on-surface placeholder:text-outline"
      />
      {value ? (
        <button
          type="button"
          onClick={() => commit("")}
          aria-label="Bersihkan pencarian"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-outline transition-colors hover:text-on-surface"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            close
          </span>
        </button>
      ) : null}
      {isPending ? (
        <span
          className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-primary"
          style={{ fontSize: 14 }}
          aria-hidden
        >
          progress_activity
        </span>
      ) : null}
    </div>
  );
}
