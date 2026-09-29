"use server";

import { revalidatePath } from "next/cache";

import { markAllAsRead, markAsRead } from "@/lib/api/notification";
import { ApiError } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth";

import type { ActionResult } from "./action-result";

export async function markNotificationReadAction(
  id: number,
): Promise<ActionResult<{ id: number }>> {
  await requireSession();
  try {
    await markAsRead(id);
    revalidatePath("/travel-admin/notifications");
    revalidatePath("/travel-admin/dashboard");
    return { ok: true, data: { id } };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
}

export async function markAllNotificationsReadAction(): Promise<
  ActionResult<{ updated: number }>
> {
  await requireSession();
  try {
    const result = await markAllAsRead();
    revalidatePath("/travel-admin/notifications");
    revalidatePath("/travel-admin/dashboard");
    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
}
