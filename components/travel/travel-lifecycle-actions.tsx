"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  cancelTravelAction,
  deleteTravelAction,
  submitTravelAction,
} from "@/app/actions/travel-actions";
import { Button } from "@/components/ui/button";

import type { TravelRequest } from "@/lib/api/types";

/**
 * The lifecycle controls for one request, offered strictly per status.
 *
 * §3 allows edit and delete only while DRAFT, submit from DRAFT, and cancel
 * while the trip is still open. The buttons follow that, and each action
 * re-checks on the server, so a stale page cannot push an illegal transition.
 */
export function TravelLifecycleActions({
  travel,
}: {
  travel: TravelRequest;
}) {
  const router = useRouter();
  const [submitState, submitAction, submitting] = useActionState(
    submitTravelAction,
    null,
  );
  const [cancelState, cancelAction, cancelling] = useActionState(
    cancelTravelAction,
    null,
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteTravelAction,
    null,
  );

  useEffect(() => {
    if (submitState?.ok) router.refresh();
  }, [submitState, router]);
  useEffect(() => {
    if (cancelState?.ok) router.refresh();
  }, [cancelState, router]);

  useEffect(() => {
    // A deleted draft has no page left to return to, so leave the list.
    if (deleteState?.ok) router.push("/employee/travel");
  }, [deleteState, router]);

  const isDraft = travel.status === "DRAFT";
  const isOpen = ["DRAFT", "SUBMITTED", "APPROVED"].includes(travel.status);

  if (travel.status === "COMPLETED" || travel.status === "CANCELLED") {
    return (
      <p className="text-caption text-tertiary">
        Pengajuan sudah {travel.status === "COMPLETED" ? "selesai" : "dibatalkan"}
        dan tidak dapat diubah lagi.
      </p>
    );
  }

  const message =
    (submitState && !submitState.ok && submitState.message) ||
    (cancelState && !cancelState.ok && cancelState.message) ||
    (deleteState && !deleteState.ok && deleteState.message);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {isDraft ? (
          <form action={submitAction}>
            <input type="hidden" name="travelId" value={travel.id} />
            <Button
              type="submit"
              icon="send"
              disabled={submitting}
            >
              {submitting ? "Mengirim..." : "Ajukan ke Atasan"}
            </Button>
          </form>
        ) : null}

        {isOpen ? (
          <form action={cancelAction}>
            <input type="hidden" name="travelId" value={travel.id} />
            <Button type="submit" variant="outline" disabled={cancelling}>
              {cancelling ? "Membatalkan..." : "Batalkan Pengajuan"}
            </Button>
          </form>
        ) : null}

        {isDraft ? (
          <form action={deleteAction}>
            <input type="hidden" name="travelId" value={travel.id} />
            <Button
              type="submit"
              variant="danger"
              icon="delete"
              disabled={deleting}
            >
              {deleting ? "Menghapus..." : "Hapus Draft"}
            </Button>
          </form>
        ) : null}
      </div>

      {message ? (
        <p
          className="flex items-center gap-1.5 text-caption text-error"
          role="alert"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            error
          </span>
          {message}
        </p>
      ) : null}
      {submitState?.ok ? (
        <p className="text-caption text-success">{submitState.message}</p>
      ) : null}
      {cancelState?.ok ? (
        <p className="text-caption text-success">{cancelState.message}</p>
      ) : null}
    </div>
  );
}
