import type { User } from "@/lib/api/types";

/**
 * Display helpers for a user row.
 *
 * The backend nests the related records as `Department` / `Position` objects
 * instead of denormalised name strings, so every screen that showed
 * `departmentName` reads through here instead.
 */
export function departmentName(user: Pick<User, "Department" | "departmentId"> | null | undefined) {
  return user?.Department?.name ?? (user?.departmentId ? `#${user.departmentId}` : "—");
}

export function positionName(user: Pick<User, "Position" | "positionId"> | null | undefined) {
  return user?.Position?.name ?? (user?.positionId ? `#${user.positionId}` : "—");
}

/** The person who raised a travel request, whether nested or looked up. */
export function ownerName(
  user?: { id: number; name: string } | null,
): string {
  return user?.name ?? "—";
}

export function initials(name: string) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}