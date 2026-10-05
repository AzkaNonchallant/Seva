import type { Booking, Role } from "./api/types";

/**
 * Role → landing route.
 *
 * `TRAVEL_ADMIN` is a real backend role that API_SPEC §8 does not list, and it
 * is behaviourally identical to `ADMIN` for booking: both can call the booking
 * endpoints, and the backend authorises neither against `/api/users`. They
 * therefore share one area.
 */
export const ROLE_HOME: Record<Role, string> = {
  EMPLOYEE: "/employee/dashboard",
  MANAGER: "/approver/dashboard",
  DEPARTMENT_HEAD: "/approver/dashboard",
  HRD: "/approver/dashboard",
  FINANCE: "/finance/dashboard",
  ADMIN: "/travel-admin/dashboard",
  TRAVEL_ADMIN: "/travel-admin/dashboard",
  SUPER_ADMIN: "/admin/dashboard",
};

export const ROLE_LABEL: Record<Role, string> = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  DEPARTMENT_HEAD: "Kepala Bagian",
  HRD: "HRD",
  FINANCE: "Finance",
  ADMIN: "Admin",
  TRAVEL_ADMIN: "Admin Perjalanan Dinas",
  SUPER_ADMIN: "Super Admin",
};

/** The roles that appear in the approver chain. */
export const APPROVER_ROLES: Role[] = ["MANAGER", "DEPARTMENT_HEAD", "HRD"];

/**
 * Booking is Admin Travel's area, and the backend grants it to both admin
 * roles. §8 also gives SUPER_ADMIN visibility of all data, but not the booking
 * workflow, so it is not included here.
 */
export function canManageBooking(role: Role) {
  return role === "ADMIN" || role === "TRAVEL_ADMIN";
}

export function canViewReports(role: Role) {
  return role === "FINANCE" || role === "ADMIN";
}

export function canManageMasterData(role: Role) {
  return role === "SUPER_ADMIN";
}

export type { Booking };