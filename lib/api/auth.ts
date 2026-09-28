import { apiRequest } from "./api";
import type { AuthPayload, User } from "./types";

/** POST /api/auth/login — public route, no Authorization header. */
export function login(email: string, password: string) {
  return apiRequest<AuthPayload>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
}

/** GET /api/auth/me */
export function me() {
  return apiRequest<User>("/api/auth/me");
}
