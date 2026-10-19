"use server";

import { revalidatePath } from "next/cache";

import { decideApproval } from "@/lib/api/approval";
import { ApiError } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth";
import { APPROVER_ROLES } from "@/lib/permissions";

import type { ActionResult } from "./action-result";
import type { Approval } from "@/lib/api/types";

/**
 * Records one approver's decision on a travel request.
 *
 * The segment layout already gates these routes, but a server action is
 * reachable on its own, so the role check is repeated here rather than trusted
 * to the page that happened to render the form.
 *
 * A rejection must carry a reason. The backend accepts an empty note, but the
 * traveller is the one who has to act on the decision, so a silent rejection is
 * refused before the request is made. This is a UI rule, not a spec rule.
 */
export async function decideApprovalAction(
  _previous: ActionResult<Approval> | null,
  formData: FormData,
): Promise<ActionResult<Approval>> {
  await requireRole(APPROVER_ROLES);

  const approvalId = Number(formData.get("approvalId"));
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!Number.isFinite(approvalId) || approvalId <= 0) {
    return { ok: false, message: "Persetujuan tidak dikenali." };
  }

  if (decision !== "APPROVED" && decision !== "REJECTED") {
    return { ok: false, message: "Pilih salah satu keputusan terlebih dahulu." };
  }

  if (decision === "REJECTED" && !note) {
    return {
      ok: false,
      message: "Alasan penolakan wajib diisi.",
      fields: { note: "Sertakan alasan agar pengaju tahu apa yang harus diperbaiki." },
    };
  }

  try {
    const approval = await decideApproval(approvalId, decision, note || undefined);

    revalidatePath("/approver/dashboard");
    revalidatePath("/approver/approvals");
    revalidatePath(`/approver/approvals/${approval.travelId}`);

    return {
      ok: true,
      data: approval,
      message:
        decision === "APPROVED" ? "Pengajuan disetujui." : "Pengajuan ditolak.",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message, fields: error.fields };
    }
    throw error;
  }
}
