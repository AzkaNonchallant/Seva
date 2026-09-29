import { Button } from "./button";
import { ApiError, type ApiErrorCode } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const COPY: Record<
  ApiErrorCode,
  { title: string; hint: string; icon: string; tone: string }
> = {
  UNAUTHORIZED: {
    title: "Sesi berakhir",
    hint: "Silakan masuk kembali untuk melanjutkan.",
    icon: "lock",
    tone: "bg-warning-container text-warning",
  },
  FORBIDDEN: {
    title: "Akses ditolak",
    hint: "Role Anda tidak memiliki izin untuk tindakan ini.",
    icon: "block",
    tone: "bg-error-container text-on-error-container",
  },
  NOT_FOUND: {
    title: "Data tidak ditemukan",
    hint: "Data mungkin sudah dihapus atau tautannya keliru.",
    icon: "search_off",
    tone: "bg-surface-container text-outline",
  },
  VALIDATION: {
    title: "Periksa kembali isian Anda",
    hint: "Ada field yang belum sesuai ketentuan.",
    icon: "edit_note",
    tone: "bg-warning-container text-warning",
  },
  NETWORK: {
    title: "Koneksi bermasalah",
    hint: "Periksa koneksi internet Anda lalu coba lagi.",
    icon: "wifi_off",
    tone: "bg-error-container text-on-error-container",
  },
  BAD_REQUEST: {
    title: "Permintaan tidak valid",
    hint: "Data yang dikirim tidak dapat diproses.",
    icon: "report",
    tone: "bg-warning-container text-warning",
  },
  SERVER: {
    title: "Server sedang bermasalah",
    hint: "Coba lagi beberapa saat lagi.",
    icon: "dns",
    tone: "bg-error-container text-on-error-container",
  },
  UNKNOWN: {
    title: "Terjadi kesalahan",
    hint: "Terjadi kesalahan yang tidak terduga.",
    icon: "error",
    tone: "bg-error-container text-on-error-container",
  },
};

/**
 * One error surface for every failure mode. A screen must never render as if
 * it were merely empty when the request actually failed.
 */
export function ErrorState({
  error,
  onRetry,
  compact = false,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}) {
  const code: ApiErrorCode =
    error instanceof ApiError ? error.code : "UNKNOWN";
  const message =
    error instanceof ApiError
      ? error.message
      : "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.";
  const copy = COPY[code];

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-xl text-center",
        compact ? "px-md py-lg" : "px-md py-xl",
        className,
      )}
    >
      <span
        className={cn(
          "mb-3 flex h-12 w-12 items-center justify-center rounded-full",
          copy.tone,
        )}
      >
        <span className="material-symbols-outlined text-[24px]">{copy.icon}</span>
      </span>
      <p className="text-label-md font-semibold text-on-surface">{copy.title}</p>
      <p className="mt-1 max-w-md text-caption text-on-surface-variant">{message}</p>
      {!compact ? (
        <p className="mt-1 text-caption text-outline">{copy.hint}</p>
      ) : null}

      {error instanceof ApiError && Object.keys(error.fields).length > 0 ? (
        <ul className="mt-3 space-y-1 text-left text-caption text-error">
          {Object.entries(error.fields).map(([field, message]) => (
            <li key={field} className="flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                error
              </span>
              {message}
            </li>
          ))}
        </ul>
      ) : null}

      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          icon="refresh"
          className="mt-md"
          onClick={onRetry}
        >
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
