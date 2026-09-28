/**
 * Normalised error type shared by the HTTP path (api.ts) and the mock path
 * (mocks/handlers.ts). Lives in its own module so neither has to import the
 * other, which keeps the transport swappable without a circular import.
 */

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "NETWORK"
  | "SERVER"
  | "UNKNOWN";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  /** Field-level messages a backend may attach to a 422. */
  readonly fields: Record<string, string>;

  constructor(
    code: ApiErrorCode,
    message: string,
    status = 500,
    fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }

  get isUnauthorized() {
    return this.code === "UNAUTHORIZED";
  }

  get isForbidden() {
    return this.code === "FORBIDDEN";
  }
}

export const STATUS_TO_CODE: Record<number, ApiErrorCode> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  422: "VALIDATION",
  500: "SERVER",
  502: "SERVER",
  503: "SERVER",
  504: "SERVER",
};

/** Maps any thrown value to a message safe to show a user. */
export function toDisplayError(error: unknown): {
  title: string;
  message: string;
  code: ApiErrorCode;
} {
  if (error instanceof ApiError) {
    return {
      title: TITLES[error.code] ?? TITLES.UNKNOWN,
      message: error.message,
      code: error.code,
    };
  }
  if (error instanceof Error && error.name === "AbortError") {
    return {
      title: TITLES.UNKNOWN,
      message: "Permintaan dibatalkan.",
      code: "UNKNOWN",
    };
  }
  return {
    title: TITLES.UNKNOWN,
    message: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
    code: "UNKNOWN",
  };
}

const TITLES: Record<ApiErrorCode, string> = {
  BAD_REQUEST: "Permintaan tidak valid",
  UNAUTHORIZED: "Sesi berakhir",
  FORBIDDEN: "Akses ditolak",
  NOT_FOUND: "Data tidak ditemukan",
  VALIDATION: "Periksa kembali isian Anda",
  NETWORK: "Koneksi bermasalah",
  SERVER: "Server sedang bermasalah",
  UNKNOWN: "Terjadi kesalahan",
};
