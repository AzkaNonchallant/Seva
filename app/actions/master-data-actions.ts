"use server";

import { revalidatePath } from "next/cache";

import {
  assignUserRole,
  createDepartment,
  createPolicy,
  createPosition,
  deactivateUser,
  deleteDepartment,
  deletePolicy,
  deletePosition,
  updateDepartment,
  updatePolicy,
  updatePosition,
  updateUser,
} from "@/lib/api/user";
import { ApiError } from "@/lib/api/errors";
import { requireSuperAdmin } from "@/lib/auth";

import type { ActionResult } from "./action-result";
import type { Department, Position, TravelPolicy, User } from "@/lib/api/types";

/**
 * Server actions for the Super Admin master-data screens.
 *
 * Each one re-runs `requireSuperAdmin()` on the server. The disabled buttons in
 * the UI are a convenience; this gate is the enforcement point, and it matches
 * the role check the backend applies to the same endpoints.
 */

function revalidateSuperAdmin() {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/users");
  revalidatePath("/admin/departments");
  revalidatePath("/admin/positions");
  revalidatePath("/admin/travel-policy");
}

function fail(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message, fields: error.fields };
  }
  throw error;
}

export async function assignRoleAction(
  _prev: ActionResult<User> | null,
  formData: FormData,
): Promise<ActionResult<User>> {
  await requireSuperAdmin();
  const userId = Number(formData.get("userId"));
  const role = String(formData.get("role") ?? "");
  try {
    const user = await assignUserRole(userId, role);
    revalidateSuperAdmin();
    return { ok: true, data: user, message: `Role diubah menjadi ${role}.` };
  } catch (error) {
    return fail(error);
  }
}

export async function updateUserAction(
  _prev: ActionResult<User> | null,
  formData: FormData,
): Promise<ActionResult<User>> {
  await requireSuperAdmin();
  const userId = Number(formData.get("userId"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { ok: false, message: "Nama pengguna tidak boleh kosong.", fields: { name: "Wajib diisi." } };
  }

  const payload: { name: string; departmentId?: number; positionId?: number } = { name };
  const departmentId = Number(formData.get("departmentId"));
  const positionId = Number(formData.get("positionId"));
  if (Number.isFinite(departmentId) && departmentId > 0) payload.departmentId = departmentId;
  if (Number.isFinite(positionId) && positionId > 0) payload.positionId = positionId;

  try {
    const user = await updateUser(userId, payload);
    revalidateSuperAdmin();
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true, data: user, message: "Data pengguna diperbarui." };
  } catch (error) {
    return fail(error);
  }
}

export async function deactivateUserAction(
  _prev: ActionResult<User> | null,
  formData: FormData,
): Promise<ActionResult<User>> {
  await requireSuperAdmin();
  try {
    const user = await deactivateUser(Number(formData.get("userId")));
    revalidateSuperAdmin();
    return { ok: true, data: user, message: "Pengguna dinonaktifkan." };
  } catch (error) {
    return fail(error);
  }
}

/* ── Departments and positions share one shape, so one pair of actions ─── */

/* ── Departments and positions share one shape, so one pair of actions ─── */

/** Omitting `id` creates; supplying it renames. */
function masterDataId(formData: FormData) {
  const raw = formData.get("id");
  const id = Number(raw);
  return raw !== null && raw !== "" && Number.isFinite(id) ? id : null;
}

function nameOf(formData: FormData) {
  return String(formData.get("name") ?? "").trim();
}

export async function saveDepartmentAction(
  _prev: ActionResult<Department> | null,
  formData: FormData,
): Promise<ActionResult<Department>> {
  await requireSuperAdmin();
  const id = masterDataId(formData);
  const name = nameOf(formData);
  try {
    const department = id
      ? await updateDepartment(id, name)
      : await createDepartment(name);
    revalidateSuperAdmin();
    return {
      ok: true,
      data: department,
      message: id ? "Departemen diperbarui." : "Departemen ditambahkan.",
    };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteDepartmentAction(
  _prev: ActionResult<{ deleted: number }> | null,
  formData: FormData,
): Promise<ActionResult<{ deleted: number }>> {
  await requireSuperAdmin();
  try {
    const result = await deleteDepartment(masterDataId(formData) ?? 0);
    revalidateSuperAdmin();
    return { ok: true, data: result, message: "Departemen dihapus." };
  } catch (error) {
    return fail(error);
  }
}

export async function savePositionAction(
  _prev: ActionResult<Position> | null,
  formData: FormData,
): Promise<ActionResult<Position>> {
  await requireSuperAdmin();
  const id = masterDataId(formData);
  const name = nameOf(formData);
  try {
    const position = id ? await updatePosition(id, name) : await createPosition(name);
    revalidateSuperAdmin();
    return {
      ok: true,
      data: position,
      message: id ? "Jabatan diperbarui." : "Jabatan ditambahkan.",
    };
  } catch (error) {
    return fail(error);
  }
}

export async function deletePositionAction(
  _prev: ActionResult<{ deleted: number }> | null,
  formData: FormData,
): Promise<ActionResult<{ deleted: number }>> {
  await requireSuperAdmin();
  try {
    const result = await deletePosition(masterDataId(formData) ?? 0);
    revalidateSuperAdmin();
    return { ok: true, data: result, message: "Jabatan dihapus." };
  } catch (error) {
    return fail(error);
  }
}

/* ── Travel policy (§3) ───────────────────────────────────────────────── */

/**
 * The form sends 0 for "applies to every position" and "uncapped", which is how
 * the spec models both fields (`positionId: null`, `maxEstimatedCost: null`).
 */
function policyPayload(formData: FormData) {
  const positionId = Number(formData.get("positionId")) || null;
  const cap = Number(formData.get("maxEstimatedCost")) || 0;
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
    positionId,
    destinationTier: String(formData.get("destinationTier") ?? "ANY") || "ANY",
    maxEstimatedCost: cap > 0 ? cap : null,
    requiresDocuments: formData.get("requiresDocuments") === "true",
    isActive: formData.get("isActive") !== "false",
  };
}

export async function savePolicyAction(
  _prev: ActionResult<TravelPolicy> | null,
  formData: FormData,
): Promise<ActionResult<TravelPolicy>> {
  await requireSuperAdmin();
  const id = masterDataId(formData);
  const payload = policyPayload(formData);

  if (!payload.name) {
    return {
      ok: false,
      message: "Nama kebijakan tidak boleh kosong.",
      fields: { name: "Wajib diisi." },
    };
  }

  try {
    const policy = id
      ? await updatePolicy(id, payload)
      : await createPolicy(payload);
    revalidateSuperAdmin();
    return {
      ok: true,
      data: policy,
      message: id ? "Kebijakan diperbarui." : "Kebijakan ditambahkan.",
    };
  } catch (error) {
    return fail(error);
  }
}

export async function deletePolicyAction(
  _prev: ActionResult<{ deleted: number }> | null,
  formData: FormData,
): Promise<ActionResult<{ deleted: number }>> {
  await requireSuperAdmin();
  try {
    const result = await deletePolicy(masterDataId(formData) ?? 0);
    revalidateSuperAdmin();
    return { ok: true, data: result, message: "Kebijakan dihapus." };
  } catch (error) {
    return fail(error);
  }
}
