import { apiRequest } from "./api";
import type { AuthPayload, User } from "./types";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  departmentId?: number;
  positionId?: number;
}

/** POST /api/auth/register — the spec's only other public route. */
export function register(payload: RegisterInput) {
  return apiRequest<AuthPayload>("/api/auth/register", {
    method: "POST",
    auth: false,
    body: payload,
  });
}

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
