"use server";

import { redirect } from "next/navigation";

import { login as loginRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { createSession, destroySession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/permissions";

import type { ActionResult } from "./action-result";
import type { AuthPayload } from "@/lib/api/types";

/** POST /api/auth/login, then store the JWT in an httpOnly cookie. */
export async function loginAction(
  _prev: ActionResult<{ redirectTo: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ redirectTo: string }>> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Email dan password wajib diisi." };
  }

  let payload: AuthPayload;
  try {
    payload = await loginRequest(email, password);
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }

  await createSession(payload.user, payload.token);
  return { ok: true, data: { redirectTo: ROLE_HOME[payload.user.role] ?? "/travel-admin/dashboard" } };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
