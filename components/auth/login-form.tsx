"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { loginAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

import type { ActionResult } from "@/app/actions/action-result";

/**
 * Seeded accounts from the backend's seed script, surfaced so the app can be
 * opened in any role without typing. Shown only when no API base URL is
 * configured, since that is the one case where there is no other way in. The
 * passwords are the backend's shared default.
 */
const DEMO_ACCOUNTS = [
  { label: "Super Admin", email: "super.admin@dinas.go.id" },
  { label: "Admin", email: "admin@dinas.go.id" },
  { label: "Admin Perjalanan Dinas", email: "travel.admin@dinas.go.id" },
  { label: "Kepala Bagian", email: "kepala.bagian@sdm.dinas.go.id" },
  { label: "Manajer", email: "manajer@sdm.dinas.go.id" },
  { label: "Finance", email: "finance@dinas.go.id" },
  { label: "HRD", email: "hrd@dinas.go.id" },
  { label: "Employee", email: "pegawai@sdm.dinas.go.id" },
];

const DEMO_PASSWORD = "Password123!";

export function LoginForm({ mockMode }: { mockMode: boolean }) {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ redirectTo: string }> | null,
    FormData
  >(loginAction, null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (state?.ok) window.location.assign(state.data.redirectTo);
  }, [state]);

  return (
    <div className="w-full">
      <h1 className="text-headline-lg-mobile font-semibold tracking-tight text-on-surface">
        Selamat datang kembali
      </h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Masuk dengan email kantor PT Andrea untuk membuka dashboard Anda.
      </p>

      {/* Account shortcuts. Rendered when no backend is configured, because
          that is exactly the case where there is no other way in. */}
      {mockMode ? (
        <div className="mt-md rounded-xl border border-outline-variant/30 bg-primary-fixed/30 p-3">
          <p className="flex items-center gap-1.5 text-caption font-semibold text-on-primary-fixed">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              cloud_off
            </span>
            API backend belum dikonfigurasi, daftar akun di bawah
          </p>
          <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(DEMO_PASSWORD);
                  setRevealed(false);
                }}
                className="flex min-h-11 flex-col items-start justify-center rounded-lg bg-surface-container-lowest px-3 py-2 text-left transition-colors hover:bg-primary-fixed/50"
              >
                <span className="text-caption font-semibold text-on-surface">
                  {account.label}
                </span>
                <span className="truncate font-mono text-[11px] text-tertiary">
                  {account.email}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-caption text-tertiary">
            Password semua akun:{" "}
            <code className="font-mono text-on-surface">{DEMO_PASSWORD}</code>
          </p>
        </div>
      ) : null}

      <form action={formAction} className="mt-md flex flex-col gap-md">
        {state && !state.ok ? (
          <p
            role="alert"
            className="rounded-lg bg-error-container px-3 py-2 text-caption font-medium text-on-error-container"
          >
            {state.message}
          </p>
        ) : null}

        <Field label="Alamat email" htmlFor="email" required>
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-outline"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                mail
              </span>
            </span>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@andrea.co.id"
              className="h-11 pl-11"
            />
          </div>
        </Field>

        {/* The password label row is only 20px tall, so the recovery link is
            padded out to a 44px target and pulled back by the same amount. The
            hit area grows without moving anything around it. */}
        <Field
          label="Kata sandi"
          htmlFor="password"
          required
          trailing={
            <Link
              href="/forgot-password"
              className="-my-3.5 flex items-center py-3.5 text-caption font-medium text-primary transition-colors hover:text-primary-container"
            >
              Lupa kata sandi?
            </Link>
          }
        >
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-outline"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                lock
              </span>
            </span>
            <Input
              id="password"
              name="password"
              type={revealed ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Kata sandi Anda"
              className="h-11 pl-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setRevealed((current) => !current)}
              aria-pressed={revealed}
              aria-label={
                revealed ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                {revealed ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </Field>

        <Button type="submit" size="lg" disabled={pending} icon="login">
          {pending ? "Memproses..." : "Masuk ke akun"}
        </Button>
      </form>

      <p className="mt-lg text-caption leading-relaxed text-tertiary">
        Akun dibuat oleh Super Admin. Hubungi admin bila email Anda belum
        terdaftar.
      </p>
    </div>
  );
}
