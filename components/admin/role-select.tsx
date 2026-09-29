"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { assignRoleAction } from "@/app/actions/master-data-actions";
import { Select } from "@/components/ui/field";

import type { ActionResult } from "@/app/actions/action-result";
import type { Role, User } from "@/lib/api/types";

/** §8 role vocabulary, matching the spec's own names. */
const ROLES: Array<{ value: Role; label: string }> = [
  { value: "EMPLOYEE", label: "Employee" },
  { value: "MANAGER", label: "Manager" },
  { value: "DEPARTMENT_HEAD", label: "Department Head" },
  { value: "HRD", label: "HRD" },
  { value: "FINANCE", label: "Finance" },
  { value: "ADMIN", label: "Admin Travel" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const EMPTY: ActionResult<User> | null = null;

/**
 * Role assignment for one user, backed by PATCH /api/users/:id/role.
 *
 * The select stays disabled on failure and the server's message is shown
 * inline, so a rejected change (the spec's own guard, or the mock's
 * self-demotion check) never looks like it succeeded.
 */
export function RoleSelect({
  user,
  selfId,
}: {
  user: User;
  /** The signed-in Super Admin, who cannot change their own role. */
  selfId: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(assignRoleAction, EMPTY);
  const isSelf = user.id === selfId;

  /*
   * The select is uncontrolled so React does not fight the native dropdown, but
   * that means a rejected save would leave the chosen role on screen and the row
   * would claim a role the account does not hold. Keying on the outcome remounts
   * the select after every attempt: a success is followed by `router.refresh()`
   * with the server's value, and a rejection snaps back to `user.role`.
   */
  const attemptKey = state ? (state.ok ? "ok" : `err:${state.message}`) : "idle";

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    /*
     * The `sr-only` label in the select is absolutely positioned, so this form
     * is made the containing block (`relative`). Without that the label
     * resolves against a further ancestor and can extend the row's scroll
     * width, which a table cell then reports as clipped text.
     */
    <form action={formAction} className="relative flex flex-col items-end gap-1">
      <input type="hidden" name="userId" value={user.id} />
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`role-${user.id}`}>
          Role untuk {user.name}
        </label>
        <Select
          key={attemptKey}
          id={`role-${user.id}`}
          name="role"
          defaultValue={user.role}
          disabled={pending || isSelf}
          className="h-9 w-40 shrink-0 text-caption"
        >
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </Select>
        <button
          type="submit"
          disabled={pending || isSelf}
          className="h-9 rounded-lg px-3 text-caption font-semibold text-primary transition-colors hover:bg-primary-fixed/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
      {isSelf ? (
        <p className="text-caption text-tertiary">Ini akun Anda sendiri.</p>
      ) : null}
      {state && !state.ok ? (
        <p className="flex items-center gap-1 text-caption text-error" role="alert">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            error
          </span>
          {state.message}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-caption text-success">{state.message}</p>
      ) : null}
    </form>
  );
}
