import type { Role } from "./api/types";

/**
 * Role → landing route. Each role has its own path segment, so `/dashboard`
 * under `travel-admin/` and under `admin/` are distinct routes rather than
 * competing for one URL.
 */
export const ROLE_HOME: Record<Role, string> = {
  EMPLOYEE: "/employee/dashboard",
  MANAGER: "/approver/dashboard",
  DEPARTMENT_HEAD: "/approver/dashboard",
  HRD: "/approver/dashboard",
  FINANCE: "/finance/dashboard",
  ADMIN: "/travel-admin/dashboard",
  SUPER_ADMIN: "/admin/dashboard",
};

export const ROLE_LABEL: Record<Role, string> = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  DEPARTMENT_HEAD: "Department Head",
  HRD: "HRD",
  FINANCE: "Finance",
  ADMIN: "Admin Travel",
  SUPER_ADMIN: "Super Admin",
};

/**
 * API_SPEC lists "Admin Travel" as the actor for the booking sub-resource
 * while the role column says `ADMIN`. One role, two labels — the UI label
 * never becomes a separate backend role.
 */
export function canManageBooking(role: Role) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canViewReports(role: Role) {
  return role === "FINANCE" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canManageMasterData(role: Role) {
  return role === "SUPER_ADMIN";
}
