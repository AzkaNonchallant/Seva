"use server";

import { revalidatePath } from "next/cache";

import {
  addReimbursementItem,
  createReimbursement,
  deleteReimbursementItem,
  submitReimbursement,
  verifyReimbursement,
} from "@/lib/api/reimbursement";
import { getReimbursement } from "@/lib/api/reimbursement";
import { uploadTravelDocument } from "@/lib/api/travel";
import { ApiError } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth";
import { buildReimbursementPdf } from "@/lib/pdf/reimbursement-pdf";

import type { ActionResult } from "./action-result";
import type { Reimbursement, ReimbursementItem, TravelDocument } from "@/lib/api/types";

/**
 * Server actions for the employee's own reimbursements.
 *
 * §5 makes the header, its items, and the submit transition owner-only while
 * the row is DRAFT; each action re-checks the role and the endpoint enforces the
 * rest.
 */

function revalidateEmployee(reimbursementId?: number) {
  revalidatePath("/employee/dashboard");
  revalidatePath("/employee/reimbursements");
  if (reimbursementId) {
    revalidatePath(`/employee/reimbursements/${reimbursementId}`);
  }
}

export async function saveReimbursementPdfAction(
  _prev: ActionResult<TravelDocument> | null,
  formData: FormData,
): Promise<ActionResult<TravelDocument>> {
  await requireRole(["EMPLOYEE"]);
  const reimbursementId = Number(formData.get("reimbursementId"));

  try {
    const reimbursement = await getReimbursement(reimbursementId);
    if (!reimbursement.travel) {
      return { ok: false, message: "Informasi travel tidak tersedia untuk PDF ini." };
    }

    const bytes = buildReimbursementPdf(reimbursement);
    const fileBytes = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
    const file = new File([fileBytes], `reimbursement-${reimbursement.id}.pdf`, {
      type: "application/pdf",
    });
    const document = await uploadTravelDocument(reimbursement.travel.id, file);

    revalidateEmployee(reimbursementId);
    revalidatePath("/employee/documents");
    return {
      ok: true,
      data: document,
      message: "PDF berhasil dibuat dan disimpan di Documents.",
    };
  } catch (error) {
    return fail(error);
  }
}

function fail(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message, fields: error.fields };
  }
  throw error;
}

export async function createReimbursementAction(
  _prev: ActionResult<Reimbursement> | null,
  formData: FormData,
): Promise<ActionResult<Reimbursement>> {
  await requireRole(["EMPLOYEE"]);
  const travelId = Number(formData.get("travelId"));
  try {
    const reimbursement = await createReimbursement(travelId);
    revalidateEmployee(reimbursement.id);
    return {
      ok: true,
      data: reimbursement,
      message: "Reimbursement dibuat. Tambahkan item pengeluaran sebelum mengajukan.",
    };
  } catch (error) {
    return fail(error);
  }
}

export async function addItemAction(
  _prev: ActionResult<ReimbursementItem> | null,
  formData: FormData,
): Promise<ActionResult<ReimbursementItem>> {
  await requireRole(["EMPLOYEE"]);
  const id = Number(formData.get("reimbursementId"));
  try {
    const item = await addReimbursementItem(id, {
      category: String(formData.get("category") ?? "OTHER") as ReimbursementItem["category"],
      description: String(formData.get("description") ?? "").trim(),
      // The backend validator expects a number for `amount`, so the text
      // field is coerced here rather than sent as a string.
      amount: Number(String(formData.get("amount") ?? "").replace(/\D/g, "")),
      transactionDate: String(formData.get("transactionDate") ?? ""),
    });
    revalidateEmployee(id);
    return { ok: true, data: item, message: "Item ditambahkan." };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteItemAction(
  _prev: ActionResult<{ deleted: number }> | null,
  formData: FormData,
): Promise<ActionResult<{ deleted: number }>> {
  await requireRole(["EMPLOYEE"]);
  const id = Number(formData.get("reimbursementId"));
  const itemId = Number(formData.get("itemId"));
  try {
    const result = await deleteReimbursementItem(itemId);
    revalidateEmployee(id);
    return { ok: true, data: result, message: "Item dihapus." };
  } catch (error) {
    return fail(error);
  }
}

export async function submitReimbursementAction(
  _prev: ActionResult<Reimbursement> | null,
  formData: FormData,
): Promise<ActionResult<Reimbursement>> {
  await requireRole(["EMPLOYEE"]);
  const id = Number(formData.get("reimbursementId"));
  try {
    const reimbursement = await submitReimbursement(id);
    revalidateEmployee(id);
    return {
      ok: true,
      data: reimbursement,
      message: "Reimbursement diajukan dan menunggu verifikasi Finance.",
    };
  } catch (error) {
    return fail(error);
  }
}

export async function verifyReimbursementAction(
  _prev: ActionResult<Reimbursement> | null,
  formData: FormData,
): Promise<ActionResult<Reimbursement>> {
  await requireRole(["FINANCE"]);
  const id = Number(formData.get("reimbursementId"));
  const approvedAmount = Number(formData.get("approvedAmount"));
  const status = String(formData.get("status") ?? "");

  if (!Number.isSafeInteger(id) || id < 1 || !Number.isFinite(approvedAmount) || approvedAmount < 0) {
    return { ok: false, message: "Nominal atau nomor reimbursement tidak valid." };
  }
  if (status !== "APPROVED" && status !== "REJECTED") {
    return { ok: false, message: "Pilih keputusan Setujui atau Tolak." };
  }

  try {
    const reimbursement = await verifyReimbursement(id, {
      approvedAmount,
      status,
    });
    revalidatePath("/finance/dashboard");
    revalidatePath("/finance/reimbursements");
    revalidatePath(`/finance/reimbursements/${id}`);
    revalidatePath("/employee/reimbursements");
    revalidatePath(`/employee/reimbursements/${id}`);
    return {
      ok: true,
      data: reimbursement,
      message: status === "APPROVED" ? "Reimbursement disetujui." : "Reimbursement ditolak.",
    };
  } catch (error) {
    return fail(error);
  }
}
