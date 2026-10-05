"use server";

import { revalidatePath } from "next/cache";

import {
  cancelTravel,
  createTravel,
  deleteTravel,
  deleteTravelDocument,
  submitTravel,
  updateTravel,
  type CreateTravelInput,
} from "@/lib/api/travel";
import { ApiError } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth";

import type { ActionResult } from "./action-result";
import type { TravelRequest } from "@/lib/api/types";

/**
 * Server actions for the employee's own travel requests.
 *
 * Each re-runs `requireRole(["EMPLOYEE"])`; ownership of the row itself is
 * enforced by the endpoint, which the mock mirrors with the same rule.
 */

function revalidateEmployee(travelId?: number) {
  revalidatePath("/employee/dashboard");
  revalidatePath("/employee/travel");
  if (travelId) {
    revalidatePath(`/employee/travel/${travelId}`);
    revalidatePath(`/employee/documents`);
  }
}

function fail(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message, fields: error.fields };
  }
  throw error;
}

function readDraft(formData: FormData): CreateTravelInput {
  const policyId = Number(formData.get("policyId"));
  const input: CreateTravelInput = {
    destination: String(formData.get("destination") ?? "").trim(),
    purpose: String(formData.get("purpose") ?? "").trim(),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
    // The input is a text field so a non-numeric value reaches the server and
    // comes back as a field error rather than silently becoming NaN.
    estimatedCost: Number(String(formData.get("estimatedCost") ?? "").replace(/\D/g, "")),
  };
  if (Number.isFinite(policyId) && policyId > 0) input.policyId = policyId;
  return input;
}

export async function createTravelAction(
  _prev: ActionResult<TravelRequest> | null,
  formData: FormData,
): Promise<ActionResult<TravelRequest>> {
  await requireRole(["EMPLOYEE"]);
  try {
    const travel = await createTravel(readDraft(formData));
    revalidateEmployee(travel.id);
    return {
      ok: true,
      data: travel,
      message: `Draft #${travel.id} tersimpan. Periksa kembali sebelum mengajukan.`,
    };
  } catch (error) {
    return fail(error);
  }
}

export async function updateTravelAction(
  _prev: ActionResult<TravelRequest> | null,
  formData: FormData,
): Promise<ActionResult<TravelRequest>> {
  await requireRole(["EMPLOYEE"]);
  const travelId = Number(formData.get("travelId"));
  try {
    const travel = await updateTravel(travelId, readDraft(formData));
    revalidateEmployee(travelId);
    return { ok: true, data: travel, message: "Draft diperbarui." };
  } catch (error) {
    return fail(error);
  }
}

export async function submitTravelAction(
  _prev: ActionResult<TravelRequest> | null,
  formData: FormData,
): Promise<ActionResult<TravelRequest>> {
  await requireRole(["EMPLOYEE"]);
  const travelId = Number(formData.get("travelId"));
  try {
    const travel = await submitTravel(travelId);
    revalidateEmployee(travelId);
    return {
      ok: true,
      data: travel,
      message: "Pengajuan dikirim dan menunggu persetujuan atasan.",
    };
  } catch (error) {
    return fail(error);
  }
}

export async function cancelTravelAction(
  _prev: ActionResult<TravelRequest> | null,
  formData: FormData,
): Promise<ActionResult<TravelRequest>> {
  await requireRole(["EMPLOYEE"]);
  const travelId = Number(formData.get("travelId"));
  try {
    const travel = await cancelTravel(travelId);
    revalidateEmployee(travelId);
    return { ok: true, data: travel, message: "Pengajuan dibatalkan." };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTravelAction(
  _prev: ActionResult<{ deleted: number }> | null,
  formData: FormData,
): Promise<ActionResult<{ deleted: number }>> {
  await requireRole(["EMPLOYEE"]);
  const travelId = Number(formData.get("travelId"));
  try {
    const result = await deleteTravel(travelId);
    revalidateEmployee(travelId);
    return { ok: true, data: result, message: "Draft dihapus." };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteDocumentAction(
  _prev: ActionResult<{ deleted: number }> | null,
  formData: FormData,
): Promise<ActionResult<{ deleted: number }>> {
  await requireRole(["EMPLOYEE"]);
  const travelId = Number(formData.get("travelId"));
  const documentId = Number(formData.get("documentId"));
  try {
    const result = await deleteTravelDocument(documentId);
    revalidateEmployee(travelId);
    return { ok: true, data: result, message: "Dokumen dihapus." };
  } catch (error) {
    return fail(error);
  }
}
