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

export function formatIDR(amount: number | string | null | undefined) {
  return idrFormatter.format(toAmount(amount));
}

/**
 * Compact form for KPI tiles where a full rupiah figure would wrap.
 *
 * Every amount arrives from the backend as a decimal string, so the conversion
 * happens here rather than at each call site — a raw string would format as NaN
 * and a `reduce` over them would concatenate.
 */
export function formatIDRCompact(amount: number | string | null | undefined) {
  const value = toAmount(amount);
  if (Math.abs(value) >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  }
  return formatIDR(value);
}

/** Prisma decimals cross the wire as strings; coerce defensively. */
function toAmount(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumber(value: number) {
  return numberFormatter.format(value ?? 0);
}

function toDate(value: string | Date) {
  if (value instanceof Date) return value;

  const raw = String(value ?? "").trim();
  if (!raw) return new Date(Number.NaN);

  // Date inputs use YYYY-MM-DD, while the API may return a full ISO timestamp.
  // Appending T00:00:00 to the latter creates an invalid value such as
  // 2026-10-21T00:00:00.000Z T00:00:00.
  return /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T00:00:00`)
    : new Date(raw);
}

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

export function formatDate(value: string | Date) {
  if (!value) return "—";
  const date = toDate(value);
  if (!isValidDate(date)) return "—";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateRange(start: string | Date, end: string | Date) {
  if (!start || !end) return "—";
  const from = toDate(start);
  const to = toDate(end);
  if (!isValidDate(from) || !isValidDate(to)) return "—";
  const sameMonth =
    from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();

  return sameMonth
    ? `${from.getDate()} – ${to.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`
    : `${formatDate(from)} – ${formatDate(to)}`;
}

export function formatDateTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (!isValidDate(date)) return "—";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysUntil(value: string | Date) {
  const targetDate = toDate(value);
  if (!isValidDate(targetDate)) return 0;
  const target = targetDate.getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today.getTime()) / 86_400_000);
}

export function countDays(start: string | Date, end: string | Date) {
  const fromDate = toDate(start);
  const toDateValue = toDate(end);
  if (!isValidDate(fromDate) || !isValidDate(toDateValue)) return 0;
  const from = fromDate.getTime();
  const to = toDateValue.getTime();
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
