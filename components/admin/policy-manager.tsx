"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PolicyEditor } from "@/components/admin/policy-editor";
import { deletePolicyAction } from "@/app/actions/master-data-actions";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatIDR } from "@/lib/utils";

import type { Position, TravelPolicy } from "@/lib/api/types";

/**
 * Policy catalogue with an inline editor.
 *
 * The list and the create form share one column: picking a policy loads it into
 * the same editor, which keeps the "add" and "edit" paths on the same fields
 * instead of maintaining two forms.
 */
export function PolicyManager({
  policies,
  positions,
}: {
  policies: TravelPolicy[];
  positions: Position[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<TravelPolicy | null>(null);
  const [deleteState, deleteFormAction, deleting] = useActionState(
    deletePolicyAction,
    null,
  );

  // The deleted row disappears on refresh, so the editor only needs closing and
  // `editing` is state the action itself never sets.
  useEffect(() => {
    if (deleteState?.ok) router.refresh();
  }, [deleteState, router]);

  return (
    <div className="grid grid-cols-1 items-start gap-md xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <CardHeader
          title="Katalog Kebijakan"
          description="Kebijakan berlaku untuk form pengajuan employee lewat GET /api/travel/policies/applicable, yang menyaring menurut jabatan dan tingkat tujuan."
          action={
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setEditing(null)}
            >
              {editing ? "Tutup" : "Tambah baru"}
            </Button>
          }
        />
        <CardBody>
          {editing || !policies.length ? (
            <div className="mb-md rounded-xl border border-outline-variant/20 bg-surface-container-low p-md">
              <PolicyEditor
                policy={editing}
                positions={positions}
                onCancel={editing ? () => setEditing(null) : undefined}
              />
            </div>
          ) : null}

          {policies.length ? (
            <ul className="flex flex-col divide-y divide-outline-variant/15">
              {policies.map((policy) => (
                <li
                  key={policy.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-3"
                >
                  {/* `basis-0` on the text column and `shrink-0` on the
                      action column: policy names are long, and letting the
                      buttons win the shrink collapsed the label. */}
                  <div className="min-w-0 flex-1 basis-0">
                    <p className="truncate text-label-md font-semibold text-on-surface">
                      {policy.name}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-caption text-tertiary">
                      <span>{policy.destinationTier}</span>
                      <span aria-hidden>•</span>
                      <span className="truncate">
                        {policy.positionId
                          ? (positions.find((p) => p.id === policy.positionId)?.name ??
                            `Jabatan #${policy.positionId}`)
                          : "Semua jabatan"}
                      </span>
                    </p>
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-caption">
                      <span>
                        Hotel{" "}
                        <strong className="font-semibold text-on-surface">
                          {formatIDR(policy.hotelLimit)}
                        </strong>
                      </span>
                      <span>
                        Transportasi{" "}
                        <strong className="font-semibold text-on-surface">
                          {formatIDR(policy.transportLimit)}
                        </strong>
                      </span>
                      <span>
                        Uang saku{" "}
                        <strong className="font-semibold text-on-surface">
                          {formatIDR(policy.allowanceLimit)}
                        </strong>
                      </span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      icon="edit"
                      onClick={() => setEditing(policy)}
                    >
                      Ubah
                    </Button>
                    <form action={deleteFormAction}>
                      <input type="hidden" name="id" value={policy.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="danger"
                        icon="delete"
                        disabled={deleting}
                      >
                        {deleting ? "..." : "Hapus"}
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="policy"
              title="Belum ada kebijakan"
              description="Tambahkan kebijakan pertama agar employee memiliki acuan saat mengajukan travel."
            />
          )}

          {deleteState && !deleteState.ok ? (
            <p
              className="mt-md flex items-center gap-1.5 text-caption text-error"
              role="alert"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                error
              </span>
              {deleteState.message}
            </p>
          ) : null}
        </CardBody>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader
          title="Aturan Pemakaian"
          description="Bagaimana ketiga batas tersebut memengaruhi pengajuan."
        />
        <CardBody className="flex flex-col gap-3 text-caption text-on-surface-variant">
          <Rule
            title="Jabatan"
            body="Policy tanpa jabatan berlaku untuk semua orang. Policy berjenjang hanya muncul kepada pemohon dengan jabatan yang cocok."
          />
          <Rule
            title="Tingkat tujuan"
            body="Backend hanya menerima dua tingkat: Domestik dan Internasional. Pemberitahuan pada form memunculkan daftar yang sudah disaring keduanya."
          />
          <Rule
            title="Tiga batas terpisah"
            body="Hotel, transportasi, dan uang saku punya plafon masing-masing, bukan satu pagu gabungan. Backend menolak pengajuan yang melampaui batas yang relevan."
          />
          <Rule
            title="Nominal sebagai angka"
            body="Semua batas dikirim sebagai angka, bukan string, karena validator server menerimanya sebagai number."
          />
        </CardBody>
      </Card>
    </div>
  );
}

function Rule({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-semibold text-on-surface">{title}</p>
      <p className="mt-0.5 leading-relaxed">{body}</p>
    </div>
  );
}