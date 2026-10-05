import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE, getSessionUser, getToken } from "@/lib/api/api";
import { canManageBooking, ROLE_HOME } from "@/lib/permissions";

import type { Role, User } from "./api/types";

/** A mock JWT is opaque to the app; the user snapshot is stored beside it. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export async function createSession(user: User, token: string) {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";

  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  store.set(`${AUTH_COOKIE}_user`, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
  store.delete(`${AUTH_COOKIE}_user`);
}

export async function getSession() {
  const [user, token] = await Promise.all([getSessionUser(), getToken()]);
  return user && token ? user : null;
}

export async function requireSession(): Promise<User> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

/**
 * Gate for the Admin Travel area.
 *
 * The backend authorises booking for both `ADMIN` and `TRAVEL_ADMIN`, so both
 * are admitted. SUPER_ADMIN is not: §8 grants it visibility of all data, not the
 * booking workflow, and the backend agrees — a SUPER_ADMIN token gets 403 on
 * `/api/travel/bookings/pending`.
 */
export async function requireBookingManager(): Promise<User> {
  const user = await requireSession();
  if (!canManageBooking(user.role)) redirect(ROLE_HOME[user.role] ?? "/login");
  return user;
}

/**
 * Gate for a role segment's layout. A signed-in user holding a role outside
 * the allowlist is sent to their own landing route instead of a screen they
 * are not cleared for, so a session is never enough on its own.
 */
export async function requireRole(allowed: Role[]): Promise<User> {
  const user = await requireSession();
  if (!allowed.includes(user.role)) redirect(ROLE_HOME[user.role] ?? "/login");
  return user;
}

/**
 * Gate for the Super Admin segment. API_SPEC section 8 gives SUPER_ADMIN all
 * master data, and section 2 restricts every master-data mutation to that role,
 * so the whole area is closed to everyone else — including ADMIN, whose area
 * is /travel-admin.
 */
export async function requireSuperAdmin(): Promise<User> {
  return requireRole(["SUPER_ADMIN"]);
}
