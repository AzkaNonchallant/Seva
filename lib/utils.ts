/** Formatting and class helpers shared by every screen. */

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

export function formatIDR(amount: number) {
  return idrFormatter.format(amount ?? 0);
}

/** Compact form for KPI tiles where a full rupiah figure would wrap. */
export function formatIDRCompact(amount: number) {
  const value = amount ?? 0;
  if (Math.abs(value) >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  }
  return formatIDR(value);
}

export function formatNumber(value: number) {
  return numberFormatter.format(value ?? 0);
}

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(`${value}T00:00:00`);
}

export function formatDate(value: string | Date) {
  if (!value) return "—";
  return toDate(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateRange(start: string | Date, end: string | Date) {
  if (!start || !end) return "—";
  const from = toDate(start);
  const to = toDate(end);
  const sameMonth =
    from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();

  return sameMonth
    ? `${from.getDate()} – ${to.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`
    : `${formatDate(from)} – ${formatDate(to)}`;
}

export function formatDateTime(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysUntil(value: string | Date) {
  const target = toDate(value).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today.getTime()) / 86_400_000);
}

export function countDays(start: string | Date, end: string | Date) {
  const from = toDate(start).getTime();
  const to = toDate(end).getTime();
  return Math.max(1, Math.round((to - from) / 86_400_000) + 1);
}

export function initials(name: string) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
