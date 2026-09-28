"use server";

import { revalidatePath } from "next/cache";

import { createBooking, updateBookingStatus } from "@/lib/api/booking";
import { ApiError } from "@/lib/api/errors";
import { requireBookingManager } from "@/lib/auth";

import type { ActionResult } from "@/app/actions/action-result";
import type { Booking, BookingStatus, CreateBookingInput } from "@/lib/api/types";

/**
 * Server actions for the Admin Travel booking workflow. Each one re-runs the
 * role gate on the server — the UI's disabled buttons are a convenience, not
 * the enforcement point.
 */

function requeue(travelId: number) {
  revalidatePath("/travel-admin/dashboard");
  revalidatePath("/travel-admin/bookings/queue");
  revalidatePath("/travel-admin/bookings");
  revalidatePath("/travel-admin/departures");
  revalidatePath(`/travel-admin/bookings/${travelId}`);
  revalidatePath(`/travel-admin/requests/${travelId}`);
}

export async function submitBookingAction(
  travelId: number,
  payload: CreateBookingInput,
): Promise<ActionResult<Booking>> {
  await requireBookingManager();
  try {
    const booking = await createBooking(travelId, payload);
    requeue(travelId);
    return { ok: true, data: booking };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message, fields: error.fields };
    }
    throw error;
  }
}

export async function updateBookingStatusAction(
  bookingId: number,
  travelId: number,
  status: BookingStatus,
): Promise<ActionResult<Booking>> {
  await requireBookingManager();
  try {
    const booking = await updateBookingStatus(bookingId, status);
    requeue(travelId);
    return { ok: true, data: booking };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message, fields: error.fields };
    }
    throw error;
  }
}
