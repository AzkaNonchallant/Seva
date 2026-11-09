"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { createUserAction } from "@/app/actions/master-data-actions";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { ROLE_LABEL } from "@/lib/permissions";

import type { Department, Position, Role } from "@/lib/api/types";

const ROLES: Role[] = [
  "EMPLOYEE",
  "MANAGER",
  "DEPARTMENT_HEAD",
  "HRD",
  "FINANCE",
  "ADMIN",
  "TRAVEL_ADMIN",
  "SUPER_ADMIN",
];

const ROLE_DETAILS: Record<Role, { icon: string; description: string }> = {
  SUPER_ADMIN: { icon: "admin_panel_settings", description: "Mengelola pengguna, role, dan seluruh master data." },
  ADMIN: { icon: "support_agent", description: "Mengelola operasional perjalanan dinas dan booking." },
  TRAVEL_ADMIN: { icon: "travel_explore", description: "Mengelola proses booking dan perjalanan dinas." },
  FINANCE: { icon: "account_balance", description: "Mengelola verifikasi, pembayaran, dan reimbursement." },
  MANAGER: { icon: "supervisor_account", description: "Memproses persetujuan perjalanan anggota tim." },
  DEPARTMENT_HEAD: { icon: "corporate_fare", description: "Memproses persetujuan perjalanan tingkat departemen." },
  HRD: { icon: "badge", description: "Memproses persetujuan dari sisi HRD." },
  EMPLOYEE: { icon: "person", description: "Mengajukan perjalanan dan mengelola reimbursement pribadi." },
};

export function CreateUserForm({
  departments,
  positions,
}: {
  departments: Department[];
  positions: Position[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createUserAction, null);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="bg-primary px-lg py-md text-white"
        title={
          <span className="flex items-center gap-2 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                person_add
              </span>
            </span>
            Buat akun baru
          </span>
        }
        description={<span className="text-white/70">Tambahkan pengguna dan tentukan aksesnya sejak awal.</span>}
        action={
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-caption font-medium text-white/80">
            Super Admin
          </span>
        }
      />
      <CardBody className="bg-white px-lg py-lg">
        <form action={formAction} className="flex flex-col gap-xl">
          <section aria-labelledby="basic-info-title" className="space-y-md">
            <div>
              <h3 id="basic-info-title" className="text-body-lg font-semibold text-primary">Informasi dasar</h3>
              <p className="mt-1 text-caption text-tertiary">Isi data pengguna dengan lengkap dan benar.</p>
            </div>
            <div className="grid grid-cols-1 gap-md md:grid-cols-2">
          <Field label="Nama lengkap" htmlFor="new-user-name" required>
            <Input id="new-user-name" name="name" placeholder="Nama pengguna" required />
          </Field>
          <Field label="Email" htmlFor="new-user-email" required>
            <Input id="new-user-email" name="email" type="email" placeholder="nama@perusahaan.id" required />
          </Field>
          <Field label="Password awal" htmlFor="new-user-password" hint="Minimal 8 karakter." required>
            <Input id="new-user-password" name="password" type="password" minLength={8} required />
          </Field>
            </div>
          </section>

          <section aria-labelledby="role-title" className="space-y-md border-t border-outline-variant/20 pt-xl">
            <div>
              <h3 id="role-title" className="text-body-lg font-semibold text-primary">Pilih role</h3>
              <p className="mt-1 text-caption text-tertiary">Tentukan akses pengguna dalam sistem.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {ROLES.map((role) => (
                <label key={role} className="group relative cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    defaultChecked={role === "EMPLOYEE"}
                    className="peer absolute right-3 top-3 h-4 w-4 accent-primary"
                    required
                  />
                  <span className="flex min-h-36 flex-col rounded-lg border border-outline-variant/40 bg-white p-4 transition-colors peer-checked:border-primary peer-checked:bg-primary-fixed/35 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary group-hover:border-primary/50">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-primary peer-checked:bg-primary peer-checked:text-white">
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{ROLE_DETAILS[role].icon}</span>
                    </span>
                    <span className="mt-3 text-label-md font-semibold text-on-surface">{ROLE_LABEL[role]}</span>
                    <span className="mt-1 text-caption leading-relaxed text-tertiary">{ROLE_DETAILS[role].description}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <details className="group border-t border-outline-variant/20 pt-xl">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 text-caption font-semibold text-primary transition-colors hover:bg-primary-fixed [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined transition-transform group-open:rotate-90" style={{ fontSize: 18 }}>
                  chevron_right
                </span>
                Tambahkan struktur organisasi
              </span>
              <span className="font-normal text-tertiary">Opsional</span>
            </summary>
            <div className="mt-md grid grid-cols-1 gap-md rounded-lg bg-surface-container-low p-md sm:grid-cols-2">
              <Field label="Departemen" htmlFor="new-user-department">
                <Select id="new-user-department" name="departmentId" defaultValue="">
                  <option value="">Tanpa departemen</option>
                  {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                </Select>
              </Field>
              <Field label="Jabatan" htmlFor="new-user-position">
                <Select id="new-user-position" name="positionId" defaultValue="">
                  <option value="">Tanpa jabatan</option>
                  {positions.map((position) => <option key={position.id} value={position.id}>{position.name}</option>)}
                </Select>
              </Field>
            </div>
          </details>

          {state && !state.ok ? <p className="text-caption text-error" role="alert">{state.message}</p> : null}
          {state?.ok ? <p className="text-caption text-success" role="status">{state.message}</p> : null}
          <div className="flex justify-end border-t border-outline-variant/20 pt-md">
            <Button type="submit" icon="person_add" disabled={pending} className="min-h-11">
              {pending ? "Membuat..." : "Buat Akun"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
