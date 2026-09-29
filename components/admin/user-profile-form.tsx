"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  deactivateUserAction,
  updateUserAction,
} from "@/app/actions/master-data-actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

import type { Department, Position, User } from "@/lib/api/types";

/**
 * Edits one account through PUT /api/users/:id — name, department, position.
 *
 * Role is deliberately absent: §2 gives it its own endpoint (PATCH
 * /api/users/:id/role) and `RoleSelect` on the directory owns that, so the two
 * mutations cannot drift apart.
 */
export function UserProfileForm({
  user,
  departments,
  positions,
  selfId,
}: {
  user: User;
  departments: Department[];
  positions: Position[];
  selfId: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateUserAction, null);
  const isSelf = user.id === selfId;

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-md">
      <input type="hidden" name="userId" value={user.id} />

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field
          label="Nama lengkap"
          htmlFor="user-name"
          required
          error={state && !state.ok ? state.fields?.name : undefined}
          hint={isSelf ? "Ini akun yang sedang Anda gunakan." : undefined}
        >
          <Input
            id="user-name"
            name="name"
            defaultValue={user.name}
            invalid={!!state && !state.ok}
            required
          />
        </Field>

        <Field label="Email" htmlFor="user-email" hint="Email tidak dapat diubah dari sini.">
          <Input id="user-email" defaultValue={user.email} disabled readOnly />
        </Field>

        <Field label="Departemen" htmlFor="user-department">
          <Select
            id="user-department"
            name="departmentId"
            defaultValue={user.departmentId ?? ""}
          >
            <option value="">Tanpa departemen</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Jabatan" htmlFor="user-position">
          <Select
            id="user-position"
            name="positionId"
            defaultValue={user.positionId ?? ""}
          >
            <option value="">Tanpa jabatan</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {state && !state.ok ? (
        <p
          className="flex items-center gap-1.5 text-caption text-error"
          role="alert"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            error
          </span>
          {state.message}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-caption text-success">{state.message}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}

/**
 * DELETE /api/users/:id, which the spec describes as "Nonaktifkan user" — the
 * account survives so historic travel keeps a valid owner. A Super Admin
 * cannot deactivate their own account, so the control is not offered here.
 */
export function DeactivateUserButton({ user }: { user: User }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(deactivateUserAction, null);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  if (user.isActive === false) {
    return (
      <p className="text-caption text-tertiary">
        Akun ini sudah nonaktif. Riwayat pengajuannya tetap tersimpan.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="userId" value={user.id} />
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
        <Button type="submit" variant="danger" icon="person_off" disabled={pending}>
          {pending ? "Menonaktifkan..." : "Nonaktifkan Akun"}
        </Button>
        <p className="text-caption text-tertiary">
          Menghapus hak akses tanpa menghapus riwayat pengajuan.
        </p>
      </div>
      {state && !state.ok ? (
        <p
          className="flex items-center gap-1.5 text-caption text-error"
          role="alert"
        >
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
