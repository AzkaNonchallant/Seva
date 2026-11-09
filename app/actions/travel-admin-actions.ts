"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/app/actions/action-result";
import { ApiError } from "@/lib/api/errors";
import type { TravelRequest } from "@/lib/api/types";
import { completeTravel } from "@/lib/api/travel";
import { requireBookingManager } from "@/lib/auth";

export async function completeTravelAction(
  _prev: ActionResult<TravelRequest> | null,
  formData: FormData,
): Promise<ActionResult<TravelRequest>> {
  await requireBookingManager();
  const travelId = Number(formData.get("travelId"));
  if (!Number.isSafeInteger(travelId) || travelId < 1) {
    return { ok: false, message: "Nomor travel tidak valid." };
  }

  try {
    const travel = await completeTravel(travelId);
    revalidatePath("/travel-admin/requests");
    revalidatePath(`/travel-admin/requests/${travelId}`);
    revalidatePath("/employee/travel");
    revalidatePath("/employee/reimbursements");
    return { ok: true, data: travel, message: "Travel berhasil ditandai selesai." };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    throw error;
  }
}
