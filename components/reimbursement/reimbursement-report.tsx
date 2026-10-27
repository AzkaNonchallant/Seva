"use client";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ReimbursementStatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatIDR } from "@/lib/utils";

import type { Reimbursement } from "@/lib/api/types";
import { saveReimbursementPdfAction } from "@/app/actions/reimbursement-actions";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_LABEL: Record<string, string> = {
  HOTEL: "Hotel",
  TRANSPORT: "Transportasi",
  MEAL: "Konsumsi",
  ALLOWANCE: "Uang Saku",
  OTHER: "Lainnya",
};

/** Printable reimbursement summary. Browser print can save this report as PDF. */
export function ReimbursementReport({
  reimbursement,
  canSaveToDocuments = false,
}: {
  reimbursement: Reimbursement;
  canSaveToDocuments?: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveReimbursementPdfAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
      window.print();
    }
  }, [state, router]);
  const travel = reimbursement.travel;
  const employee = travel?.user;
  const items = reimbursement.items ?? [];

  return (
    <Card>
      <CardHeader
        title="Ringkasan PDF Reimbursement"
        description="Identitas karyawan, informasi perjalanan, dan detail pembayaran."
        action={
          canSaveToDocuments ? (
            <form action={action}>
              <input type="hidden" name="reimbursementId" value={reimbursement.id} />
              <Button type="submit" icon="picture_as_pdf" disabled={pending}>
                {pending ? "Membuat PDF..." : "Buat, Simpan, dan Cetak PDF"}
              </Button>
            </form>
          ) : (
            <Button type="button" icon="picture_as_pdf" onClick={() => window.print()}>
              Cetak PDF
            </Button>
          )
        }
      />
      <CardBody>
        <article className="space-y-5 text-sm text-on-surface" aria-label="Ringkasan reimbursement">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Nama karyawan" value={employee?.name ?? "Tidak tersedia"} />
            <Info label="Email" value={employee?.email ?? "Tidak tersedia"} />
            <Info label="Nomor reimbursement" value={`#${reimbursement.id}`} />
            <Info label="Status" value={reimbursement.status} badge />
          </div>

          <div className="border-t border-outline-variant/20 pt-4">
            <h3 className="font-semibold">Informasi perjalanan dinas</h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info label="Tujuan" value={travel?.destination ?? `Travel #${reimbursement.travelId}`} />
              <Info label="Keperluan" value={travel?.purpose ?? "Tidak tersedia"} />
              <Info
                label="Periode"
                value={
                  travel?.startDate && travel.endDate
                    ? `${formatDate(travel.startDate)} sampai ${formatDate(travel.endDate)}`
                    : "Tidak tersedia"
                }
              />
              <Info label="Estimasi biaya" value={formatIDR(travel?.estimatedCost)} />
            </div>
          </div>

          <div className="border-t border-outline-variant/20 pt-4">
            <h3 className="font-semibold">Detail pembayaran</h3>
            <div className="mt-3 space-y-2">
              {items.length ? items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 border-b border-outline-variant/10 pb-2">
                  <span>
                    {item.description}
                    <span className="block text-xs text-tertiary">
                      {CATEGORY_LABEL[item.category] ?? item.category} • {formatDate(item.transactionDate)}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold">{formatIDR(item.amount)}</span>
                </div>
              )) : <p className="text-tertiary">Belum ada detail pengeluaran.</p>}
              <Info label="Total pengajuan" value={formatIDR(reimbursement.totalAmount)} />
              <Info label="Uang muka" value={formatIDR(reimbursement.advanceAmount)} />
              <Info label="Disetujui Finance" value={formatIDR(reimbursement.approvedAmount)} />
              <Info label="Selisih" value={formatIDR(reimbursement.differenceAmount)} />
              <Info label="Referensi jurnal" value={reimbursement.externalJournalRef ?? "Belum tersedia"} />
            </div>
          </div>
        </article>
      </CardBody>
      {state && !state.ok ? <p className="px-md pb-md text-caption text-error" role="alert">{state.message}</p> : null}
      {state?.ok ? <p className="px-md pb-md text-caption text-success" role="status">{state.message}</p> : null}
    </Card>
  );
}

function Info({ label, value, badge = false }: { label: string; value: string; badge?: boolean }) {
  return (
    <div>
      <p className="text-xs text-tertiary">{label}</p>
      {badge ? <ReimbursementStatusBadge status={value as Reimbursement["status"]} /> : <p className="mt-0.5 font-medium">{value}</p>}
    </div>
  );
}
