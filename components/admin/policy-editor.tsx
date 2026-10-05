"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { savePolicyAction } from "@/app/actions/master-data-actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

import type { ActionResult } from "@/app/actions/action-result";
import type { Position, TravelPolicy } from "@/lib/api/types";
import { toNumber } from "@/lib/api/types";

/**
 * Create or edit one travel policy.
 *
 * A policy is three spending limits in the backend's model — hotel, transport
 * and allowance — rather than the single cap plus document/active flags the
 * older spec described. All three are required: the server's validator rejects
 * a request that omits any of them.
 */
export function PolicyEditor({
  policy,
  positions,
  onCancel,
}: {
  policy: TravelPolicy | null;
  positions: Position[];
  /** Shown only when editing, to leave the form without a page reload. */
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(savePolicyAction, null);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-md">
      {policy ? <input type="hidden" name="id" value={policy.id} /> : null}

      <Field
        label="Nama kebijakan"
        htmlFor="policy-name"
        required
        error={state && !state.ok ? state.fields?.name : undefined}
      >
        <Input
          id="policy-name"
          name="name"
          defaultValue={policy?.name ?? ""}
          placeholder="Contoh: Kepala Dinas - Domestik"
          invalid={!!state && !state.ok}
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field
          label="Berlaku untuk jabatan"
          htmlFor="policy-position"
          hint="Kosongkan bila berlaku untuk semua jabatan."
        >
          <Select
            id="policy-position"
            name="positionId"
            defaultValue={policy?.positionId ?? 0}
          >
            <option value={0}>Semua jabatan</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tingkat tujuan" htmlFor="policy-tier" required>
          <Select
            id="policy-tier"
            name="destinationTier"
            defaultValue={policy?.destinationTier ?? "DOMESTIC"}
          >
            <option value="DOMESTIC">Domestik</option>
            <option value="INTERNATIONAL">Internasional</option>
          </Select>
        </Field>

        <Field
          label="Batas hotel"
          htmlFor="policy-hotel"
          required
          hint="Nilai maksimum biaya penginapan."
          error={state && !state.ok ? state.fields?.hotelLimit : undefined}
        >
          <Input
            id="policy-hotel"
            name="hotelLimit"
            type="number"
            min={0}
            step={100_000}
            defaultValue={policy ? toNumber(policy.hotelLimit) : 0}
            required
          />
        </Field>

        <Field
          label="Batas transportasi"
          htmlFor="policy-transport"
          required
          hint="Nilai maksimum tiket dan transportasi."
          error={state && !state.ok ? state.fields?.transportLimit : undefined}
        >
          <Input
            id="policy-transport"
            name="transportLimit"
            type="number"
            min={0}
            step={100_000}
            defaultValue={policy ? toNumber(policy.transportLimit) : 0}
            required
          />
        </Field>

        <Field
          label="Batas uang saku"
          htmlFor="policy-allowance"
          required
          hint="Nilai maksimum uang saku harian."
          error={state && !state.ok ? state.fields?.allowanceLimit : undefined}
        >
          <Input
            id="policy-allowance"
            name="allowanceLimit"
            type="number"
            min={0}
            step={50_000}
            defaultValue={policy ? toNumber(policy.allowanceLimit) : 0}
            required
          />
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

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Batal
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending
            ? "Menyimpan..."
            : policy
              ? "Simpan Perubahan"
              : "Tambah Kebijakan"}
        </Button>
      </div>
    </form>
  );
}