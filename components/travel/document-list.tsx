"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { deleteDocumentAction } from "@/app/actions/travel-actions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import type { TravelDocument } from "@/lib/api/types";

/**
 * Documents attached to one request — GET /api/travel/:id/documents with
 * DELETE /api/travel/documents/:docId for the owner.
 *
 * Deletion is offered on a DRAFT or SUBMITTED request only: once a trip is
 * approved or completed, its attachments are the evidence the approvers and
 * Finance rely on.
 */
export function DocumentList({
  travelId,
  documents,
  canDelete,
}: {
  travelId: number;
  documents: TravelDocument[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(deleteDocumentAction, null);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <div className="flex flex-col gap-3">
      {documents.length ? (
        <ul className="flex flex-col divide-y divide-outline-variant/15">
          {documents.map((document) => (
            <li key={document.id} className="flex items-center gap-3 py-2.5">
              <span
                className="material-symbols-outlined shrink-0 text-primary"
                style={{ fontSize: 20 }}
              >
                description
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-md text-on-surface">
                  {document.fileName}
                </span>
                <span className="block truncate font-mono text-caption text-tertiary">
                  {document.filePath}
                </span>
              </span>
              {canDelete ? (
                <form action={formAction}>
                  <input type="hidden" name="travelId" value={travelId} />
                  <input type="hidden" name="documentId" value={document.id} />
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    icon="delete"
                    disabled={pending}
                  >
                    {pending ? "..." : "Hapus"}
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="folder_open"
          title="Belum ada dokumen"
          description="Lampiran pendukung belum diunggah pada pengajuan ini."
        />
      )}

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
    </div>
  );
}
