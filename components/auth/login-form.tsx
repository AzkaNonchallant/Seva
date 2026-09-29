"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { loginAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

import type { ActionResult } from "@/app/actions/action-result";

/**
 * Demo credentials shown in the mock build only. The real backend is reached
 * by setting NEXT_PUBLIC_API_BASE_URL, at which point this block is hidden.
 */
const DEMO_ACCOUNTS = [
  { label: "Admin Travel", email: "elena.rostova@andrea.co.id", role: "ADMIN" },
  { label: "Super Admin", email: "andra.wijaya@andrea.co.id", role: "SUPER_ADMIN" },
  { label: "Employee", email: "azka.pratama@andrea.co.id", role: "EMPLOYEE" },
];

export function LoginForm({ mockMode }: { mockMode: boolean }) {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ redirectTo: string }> | null,
    FormData
  >(loginAction, null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (state?.ok) window.location.assign(state.data.redirectTo);
  }, [state]);

  return (
    <div className="w-full max-w-md">
      {/* Brand lockup. Hidden from lg up, where the split screen's left panel
          already carries the wordmark, so the brand is never stated twice. */}
      <div className="mb-lg flex items-center gap-3 lg:hidden">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-on-primary">
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
            flight_takeoff
          </span>
        </span>
        <div className="leading-tight">
          <p className="text-headline-md font-bold tracking-tight text-on-surface">
            Horizon Odyssey
          </p>
          <p className="text-caption text-tertiary">Dinas Travel • PT Andrea</p>
        </div>
      </div>

      <h1 className="text-headline-lg-mobile font-semibold tracking-tight text-on-surface">
        Masuk ke akun Anda
      </h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Gunakan email kantor PT Andrea untuk melanjutkan.
      </p>

      {mockMode ? (
        <div className="mt-md rounded-xl border border-outline-variant/30 bg-primary-fixed/30 p-3">
          <p className="flex items-center gap-1.5 text-caption font-semibold text-on-primary-fixed">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              science
            </span>
            Mode demo — backend belum terhubung
          </p>
          <div className="mt-2 space-y-1">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword("andrea2026");
                }}
                className="flex w-full items-center justify-between rounded-lg bg-surface-container-lowest px-3 py-2 text-left transition-colors hover:bg-primary-fixed/50"
              >
                <span className="text-caption text-on-surface">
                  {account.label}
                </span>
                <span className="font-mono text-[11px] text-tertiary">
                  {account.email}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-caption text-tertiary">
            Password semua akun demo:{" "}
            <code className="font-mono text-on-surface">andrea2026</code>
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

        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@andrea.co.id"
          />
        </Field>

        <Field label="Password" htmlFor="password" required>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" size="lg" disabled={pending} icon="login">
          {pending ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className="mt-md text-center text-caption text-tertiary">
        <Link href="/forgot-password" className="transition-colors hover:text-primary">
          Lupa password?
        </Link>
      </p>
    </div>
  );
}
