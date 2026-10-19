"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { decideApprovalAction } from "@/app/actions/approval-actions";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";

import type { Approval } from "@/lib/api/types";

/**
 * Approve/reject controls for the one pending level on a request.
 *
 * Both buttons sit in a single form and differ only by the `decision` value they
 * submit, so the note is typed once and applies whichever way the approver goes.
 * The server action re-checks the role, and refuses a rejection with no reason —
 * the traveller is the one who has to act on the outcome.
 */
export function ApprovalAction({ approval }: { approval: Approval }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(decideApprovalAction, null);

  useEffect(() => {
    // The decision advances the request to its next level, so the page has to be
    // re-read from the server rather than left showing the pre-decision state.
    if (state?.ok) router.refresh();
  }, [state, router]);

  const fieldError = state && !state.ok ? state.fields?.note : undefined;

  return (
    <form action={action} className="flex flex-col gap-md">
      <input type="hidden" name="approvalId" value={approval.id} />

      <Field
        label="Catatan"
        htmlFor="decision-note"
        required={false}
        error={fieldError}
        hint="Wajib diisi bila pengajuan ditolak, agar pengaju tahu apa yang harus diperbaiki."
      >
        <Textarea
          id="decision-note"
          name="note"
          rows={3}
          invalid={Boolean(fieldError)}
          placeholder="Contoh: rincian biaya perlu dilampirkan ulang."
        />
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        {/*
          `size="lg"` (48px) rather than the default 40px: this is the one
          decision control on the screen, and the login submit is the existing
          precedent for a full-height primary action.
        */}
        <Button
          type="submit"
          size="lg"
          name="decision"
          value="APPROVED"
          icon="check_circle"
          disabled={pending}
        >
          {pending ? "Memproses..." : "Setujui"}
        </Button>
        <Button
          type="submit"
          size="lg"
          name="decision"
          value="REJECTED"
          variant="danger"
          icon="cancel"
          disabled={pending}
        >
          Tolak
        </Button>
      </div>

      {state && !state.ok ? (
        <p className="flex items-center gap-1.5 text-caption text-error" role="alert">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            error
          </span>
          {state.message}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-caption text-success" role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
