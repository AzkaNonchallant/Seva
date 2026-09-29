import { apiRequest } from "./api";
import type {
  Department,
  Position,
  TravelPolicy,
  User,
} from "./types";

/** GET /api/users/departments — every logged-in role. */
export function listDepartments() {
  return apiRequest<Department[]>("/api/users/departments");
}

/** GET /api/users/positions — every logged-in role. */
export function listPositions() {
  return apiRequest<Position[]>("/api/users/positions");
}

/** GET /api/users?role=&departmentId= */
export function listUsers(params: { role?: string; departmentId?: number } = {}) {
  return apiRequest<User[]>("/api/users", { query: { ...params } });
}

/** GET /api/users/:id */
export function getUser(id: number) {
  return apiRequest<User>(`/api/users/${id}`);
}

/** PUT /api/users/:id — name, department and position. Super Admin only. */
export function updateUser(
  id: number,
  payload: { name: string; departmentId?: number; positionId?: number },
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

/** DELETE /api/users/:id — deactivates rather than removing. */
export function deactivateUser(id: number) {
  return apiRequest<User>(`/api/users/${id}`, { method: "DELETE" });
}

/** POST /api/users/departments */
export function createDepartment(name: string) {
  return apiRequest<Department>("/api/users/departments", {
    method: "POST",
    body: { name },
  });
}

/** PUT /api/users/departments/:id */
export function updateDepartment(id: number, name: string) {
  return apiRequest<Department>(`/api/users/departments/${id}`, {
    method: "PUT",
    body: { name },
  });
}

/** DELETE /api/users/departments/:id */
export function deleteDepartment(id: number) {
  return apiRequest<{ deleted: number }>(`/api/users/departments/${id}`, {
    method: "DELETE",
  });
}

/** POST /api/users/positions */
export function createPosition(name: string) {
  return apiRequest<Position>("/api/users/positions", {
    method: "POST",
    body: { name },
  });
}

/** PUT /api/users/positions/:id */
export function updatePosition(id: number, name: string) {
  return apiRequest<Position>(`/api/users/positions/${id}`, {
    method: "PUT",
    body: { name },
  });
}

/** DELETE /api/users/positions/:id */
export function deletePosition(id: number) {
  return apiRequest<{ deleted: number }>(`/api/users/positions/${id}`, {
    method: "DELETE",
  });
}

/* ── Travel policy (§3) — the same super-admin-only write set ─────────── */

export interface PolicyInput {
  name: string;
  description?: string;
  positionId?: number | null;
  destinationTier?: string;
  maxEstimatedCost?: number | null;
  requiresDocuments?: boolean;
  isActive?: boolean;
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
  return apiRequest<{ deleted: number }>(`/api/travel/policies/${id}`, {
    method: "DELETE",
  });
}
