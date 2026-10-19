import "server-only";

import { cookies } from "next/headers";

import { ApiError, STATUS_TO_CODE, type ApiErrorCode } from "./errors";
import type { ApiEnvelope, Page, Pagination, User } from "./types";

export { ApiError } from "./errors";
export type { ApiErrorCode } from "./errors";

/**
 * Base URL of the backend. Set in `.env.local`.
 *
 * The origin is used without a trailing `/api` on purpose: every service
 * function already passes a path that begins with `/api`, so appending it here
 * would request `/api/api/travel`.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

/** Cookie holding the JWT. httpOnly, so JS on the client can never read it. */
export const AUTH_COOKIE = "horizon_token";

/**
 * The backend is required. Kept as a predicate because the login screen uses it
 * to decide whether to offer the demo-account shortcuts, and because a missing
 * base URL should fail loudly rather than silently rendering empty screens.
 */
export function usesMockBackend() {
  return !API_BASE_URL;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** A FormData body is sent as-is; anything else is JSON-encoded. */
  body?: unknown;
  /** Set to false for register/login — the only public routes in the spec. */
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const base = API_BASE_URL ?? "";
  const url = new URL(`${base}${path}`, "http://localhost");
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`;
}

/**
 * The interceptor: attaches `Authorization: Bearer <token>` to every
 * authenticated call, then unwraps the `{ success, data }` envelope.
 *
 * Server-only. The token is read from an httpOnly cookie and attached here, so
 * it never reaches the browser bundle.
 */
export type Settled<T> =
  | { ok: true; data: T }
  | { ok: false; error: unknown };

/**
 * Runs a service call and returns a discriminated result instead of throwing.
 *
 * A screen that must render `ErrorState` for one call while still rendering the
 * rest of the page needs both outcomes side by side. `await call().catch((e) =>
 * e)` would work but widens the success branch to `T | unknown` and breaks
 * inference everywhere it is used, so the union is explicit here.
 */
export async function settle<T>(call: Promise<T>): Promise<Settled<T>> {
  try {
    return { ok: true, data: await call };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, query, signal } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  // A FormData body must keep the boundary the runtime generates, so the
  // Content-Type header is only set for JSON payloads.
  const isMultipart = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isMultipart) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = await getToken();
    if (!token) {
      throw new ApiError(
        "UNAUTHORIZED",
        "Sesi berakhir. Silakan masuk kembali.",
        401,
      );
    }
    headers.Authorization = `Bearer ${token}`;
  }

  if (usesMockBackend()) {
    throw new ApiError(
      "NETWORK",
      "NEXT_PUBLIC_API_BASE_URL belum diisi. Isi di .env.local lalu jal ulang dev server.",
      0,
    );
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: isMultipart
        ? (body as FormData)
        : body === undefined
          ? undefined
          : JSON.stringify(body),
      signal,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError(
      "NETWORK",
      "Tidak dapat terhubung ke server. Periksa koneksi Anda.",
      0,
    );
  }

  const payload = await readEnvelope<T>(response);

  if (!payload.success) {
    throw new ApiError(
      STATUS_TO_CODE[response.status] ?? ("UNKNOWN" as ApiErrorCode),
      payload.message || `Permintaan gagal (${response.status}).`,
      response.status,
      // The backend reports validation failures as an `errors` array of
      // `{ path, message }`. Flattening it into the field map the UI already
      // renders is what lets `Field error={...}` show them unchanged.
      (payload.errors ?? []).reduce<Record<string, string>>((fields, error) => {
        fields[error.path] = error.message;
        return fields;
      }, {}),
    );
  }
  return payload.data;
}

/**
 * A paginated list read.
 *
 * The backend nests list rows one level deeper than a single resource —
 * `{ data: { data, pagination } }` for travel, users, notifications and
 * approvals, and `{ data: { items, total, page, limit } }` for reimbursements.
 * Both collapse to `Page<T>` here so no screen has to know which it called.
 */
export async function apiList<T>(
  path: string,
  options: RequestOptions = {},
): Promise<Page<T>> {
  const payload = await apiRequest<unknown>(path, options);

  const bag = (payload ?? {}) as Record<string, unknown>;

  if (Array.isArray(bag.data)) {
    const pagination = (bag.pagination ?? {}) as Partial<Pagination>;
    const limit = pagination.limit ?? (bag.data.length || 1);
    const total = pagination.total ?? bag.data.length;
    return {
      data: bag.data as T[],
      pagination: {
        page: pagination.page ?? 1,
        limit,
        total,
        totalPages: pagination.totalPages ?? Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  if (Array.isArray(bag.items)) {
    const page = Number(bag.page ?? 1);
    const limit = Number(bag.limit ?? bag.items.length) || 1;
    const total = Number(bag.total ?? bag.items.length);
    return {
      data: bag.items as T[],
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  // An unwrapped array, which some endpoints still use.
  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      pagination: {
        page: 1,
        limit: payload.length,
        total: payload.length,
        totalPages: 1,
      },
    };
  }

  return { data: [], pagination: { page: 1, limit: 0, total: 0, totalPages: 0 } };
}

/**
 * The backend rejects a page larger than 100 with a 422 — `Too big: expected
 * number to be <=100`. This is the ceiling every list read has to respect.
 */
const MAX_PAGE_SIZE = 100;

/** Caps the walk so a nonsensical `total` cannot turn it into a long loop. */
const MAX_PAGES = 50;

/**
 * A list read for screens that show every row and do not paginate.
 *
 * A short alias for `apiList(...).then(page => page.data)`, which is what most
 * callers want; the paginated form stays available for the directory and the
 * booking list.
 *
 * This used to ask for `limit: 200` in one request, on the reasoning that a
 * large page beats silently losing rows. The backend caps the page at 100, so
 * the request was rejected outright and every screen built on it — the Employee,
 * Finance and Admin Travel dashboards and most of the Admin Travel area — fell
 * through to its error panel. Fetching the maximum allowed page and then walking
 * the rest is what actually avoids losing rows.
 */
export async function apiRows<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T[]> {
  const requested = Number(options.query?.limit);
  const size =
    Number.isFinite(requested) && requested > 0
      ? Math.min(Math.floor(requested), MAX_PAGE_SIZE)
      : MAX_PAGE_SIZE;

  const first = await apiList<T>(path, {
    ...options,
    query: { ...options.query, limit: size, page: 1 },
  });

  const rows = [...first.data];

  const lastPage = Math.min(first.pagination.totalPages, MAX_PAGES);
  for (let page = 2; page <= lastPage; page += 1) {
    const next = await apiList<T>(path, {
      ...options,
      query: { ...options.query, limit: size, page },
    });
    if (!next.data.length) break;
    rows.push(...next.data);
  }

  return rows;
}

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    // A body that is not JSON means something other than the API answered —
    // a tunnel or gateway error page, or an HTML login screen. Reporting that as
    // an invalid response sends the reader hunting for a data bug, so it is
    // named as the connectivity problem it is.
    throw new ApiError(
      "NETWORK",
      "Server API tidak dapat dihubungi. Periksa koneksi dan ketersediaan backend.",
      response.status || 0,
    );
  }
}

export async function getToken() {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value ?? null;
}

/** The user snapshot `lib/auth.ts` stores beside the token. */
export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const raw = store.get(`${AUTH_COOKIE}_user`)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}
