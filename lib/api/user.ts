import { apiRequest } from "./api";
import type { Department, Position, User } from "./types";

/** GET /api/users/departments */
export function listDepartments() {
  return apiRequest<Department[]>("/api/users/departments");
}

/** GET /api/users/positions */
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
