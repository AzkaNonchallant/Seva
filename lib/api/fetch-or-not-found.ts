import "server-only";

import { notFound } from "next/navigation";

import { ApiError } from "./errors";

/**
 * Runs a service call and converts a `NOT_FOUND` API error into the nearest
 * `not-found.tsx` boundary.
 *
 * Detail pages address resources by id, so a stale link should land on a real
 * 404 page rather than the generic error screen. Every other failure —
 * network, 500, forbidden — is rethrown so `error.tsx` still handles it.
 */
export async function fetchOrNotFound<T>(call: Promise<T>): Promise<T> {
  try {
    return await call;
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}
