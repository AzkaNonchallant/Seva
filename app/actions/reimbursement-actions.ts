"use server";

import { revalidatePath } from "next/cache";

import {
  addReimbursementItem,
  createReimbursement,
  deleteReimbursementItem,
  submitReimbursement,
} from "@/lib/api/reimbursement";
import { ApiError } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth";

import type { ActionResult } from "./action-result";
import type { Reimbursement, ReimbursementItem } from "@/lib/api/types";

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
    const result = await deleteReimbursementItem(id, itemId);
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
