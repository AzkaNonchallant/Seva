import "server-only";

import { cookies } from "next/headers";

import { ApiError, STATUS_TO_CODE, type ApiErrorCode } from "./errors";
import type { ApiEnvelope, User } from "./types";

export { ApiError } from "./errors";
export type { ApiErrorCode } from "./errors";

/**
 * Base URL of the real backend. Unset in this repository, which keeps the
 * mock transport active. Set NEXT_PUBLIC_API_BASE_URL (e.g. http://localhost:3001)
 * and the same service functions start hitting the real API — no call site changes.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

/** Cookie holding the JWT. httpOnly, so JS on the client can never read it. */
export const AUTH_COOKIE = "horizon_token";

export function usesMockBackend() {
  return !API_BASE_URL;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, query, signal } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

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
    const { handleMockRequest } = await import("@/lib/mocks/handlers");
    return handleMockRequest<T>({
      method,
      path: buildUrl(path, query),
      body,
      hasAuth: auth,
    });
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
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
    );
  }
  return payload.data;
}

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    return { success: false, message: "Respons server tidak valid." };
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
