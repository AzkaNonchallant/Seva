import { apiList, apiRequest } from "./api";
import type {
  Department,
  Page,
  Position,
  TravelPolicy,
  User,
} from "./types";

/** GET /api/users/departments */
export function listDepartments() {
  return apiRequest<Department[]>("/api/users/departments");
}

/** GET /api/users/positions */
export function listPositions() {
  return apiRequest<Position[]>("/api/users/positions");
}

/** GET /api/users?role=&departmentId= — paginated. */
export function listUsers(
  params: {
    role?: string;
    departmentId?: number;
    page?: number;
    limit?: number;
  } = {},
) {
  return apiList<User>("/api/users", { query: { ...params } });
}

/** GET /api/users/:id */
export function getUser(id: number) {
  return apiRequest<User>(`/api/users/${id}`);
}

/** PUT /api/users/:id — Super Admin only. */
export function updateUser(
  id: number,
  payload: { name: string; departmentId?: number | null; positionId?: number | null },
) {
  return apiRequest<User>(`/api/users/${id}`, { method: "PUT", body: payload });
}

/** PATCH /api/users/:id/role */
export function assignUserRole(id: number, role: string) {
  return apiRequest<User>(`/api/users/${id}/role`, {
    method: "PATCH",
    body: { role },
  });
}

/** DELETE /api/users/:id — deactivates rather than removes. */
export function deactivateUser(id: number) {
  return apiRequest<User>(`/api/users/${id}`, { method: "DELETE" });
}

/* ── Departments and positions ─────────────────────────────────────────── */

export function createDepartment(name: string) {
  return apiRequest<Department>("/api/users/departments", {
    method: "POST",
    body: { name },
  });
}

export function updateDepartment(id: number, name: string) {
  return apiRequest<Department>(`/api/users/departments/${id}`, {
    method: "PUT",
    body: { name },
  });
}

export function deleteDepartment(id: number) {
  return apiRequest<{ deleted: number }>(`/api/users/departments/${id}`, { method: "DELETE" });
}

export function createPosition(name: string) {
  return apiRequest<Position>("/api/users/positions", {
    method: "POST",
    body: { name },
  });
}

export function updatePosition(id: number, name: string) {
  return apiRequest<Position>(`/api/users/positions/${id}`, {
    method: "PUT",
    body: { name },
  });
}

export function deletePosition(id: number) {
  return apiRequest<{ deleted: number }>(`/api/users/positions/${id}`, { method: "DELETE" });
}

/* ── Travel policy (§3) ────────────────────────────────────────────────── */

/**
 * A policy is three spending limits, not a single cap. The backend's validator
 * rejects a request that omits any of them, so all three are required here too.
 * There is no active flag and no description on the real model.
 */
export interface PolicyInput {
  name: string;
  positionId?: number | null;
  destinationTier: "DOMESTIC" | "INTERNATIONAL";
  hotelLimit: number;
  transportLimit: number;
  allowanceLimit: number;
}

/** POST /api/travel/policies */
export function createPolicy(payload: PolicyInput) {
  return apiRequest<TravelPolicy>("/api/travel/policies", {
    method: "POST",
    body: payload,
  });
}

/** PUT /api/travel/policies/:id */
export function updatePolicy(id: number, payload: PolicyInput) {
  return apiRequest<TravelPolicy>(`/api/travel/policies/${id}`, {
    method: "PUT",
    body: payload,
  });
}

/** DELETE /api/travel/policies/:id */
export function deletePolicy(id: number) {
  return apiRequest<{ deleted: number }>(`/api/travel/policies/${id}`, { method: "DELETE" });
}

export type { Page };