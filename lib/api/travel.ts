import { apiList, apiRequest, apiRows, ApiError } from "./api";
import type { TravelDocument, TravelPolicy, TravelRequest } from "./types";

type ListParams = {
  status?: string;
  search?: string;
  departmentId?: number;
  page?: number;
  limit?: number;
};

/**
 * GET /api/travel — an Employee receives only their own rows, an admin-level
 * role receives all of them. The backend scopes that itself.
 */
export function listTravels(params: ListParams = {}) {
  return apiRows<TravelRequest>("/api/travel", { query: { ...params } });
}

/** Paginated variant, for the directory-style screens. */
export function listTravelsPage(params: ListParams = {}) {
  return apiList<TravelRequest>("/api/travel", { query: { ...params } });
}

/** GET /api/travel/:id — includes approvals, documents and bookings. */
export function getTravel(id: number) {
  return apiRequest<TravelRequest>(`/api/travel/${id}`);
}

/** GET /api/travel/:id/documents */
export function getTravelDocuments(id: number) {
  return apiRequest<TravelDocument[]>(`/api/travel/${id}/documents`);
}

/** DELETE /api/travel/documents/:docId — the document id is unique on its own. */
export function deleteTravelDocument(documentId: number) {
  return apiRequest<{ deleted: number }>(`/api/travel/documents/${documentId}`, {
    method: "DELETE",
  });
}

/** GET /api/travel/policies */
export function listPolicies() {
  return apiRequest<TravelPolicy[]>("/api/travel/policies");
}

/**
 * GET /api/travel/policies/applicable
 *
 * Both parameters are required by the backend — it answers 422 without them —
 * so they are not optional here either.
 */
export function listApplicablePolicies(positionId: number, destinationTier?: string) {
  return apiRequest<TravelPolicy[]>("/api/travel/policies/applicable", {
    query: { positionId, destinationTier },
  });
}

/* ── Employee-owned mutations ──────────────────────────────────────────── */

/** Body of POST /api/travel, as the backend's validator expects it. */
export interface CreateTravelInput {
  destination: string;
  purpose: string;
  /** ISO date, `YYYY-MM-DD`. */
  startDate: string;
  endDate: string;
  estimatedCost: number;
  policyId?: number | null;
}

/**
 * Client-side checks for the two rules the backend states outright, so the user
 * gets field-level feedback without a round trip. The server remains the
 * authority and its `errors` array overrides anything returned here.
 */
export function validateTravelDraft(payload: Partial<CreateTravelInput>) {
  const fields: Record<string, string> = {};
  if (!payload.destination?.trim()) fields.destination = "Tujuan wajib diisi.";
  if (!payload.purpose?.trim()) fields.purpose = "Tujuan dana wajib diisi.";
  if (!payload.startDate) fields.startDate = "Tanggal mulai wajib diisi.";
  if (!payload.endDate) fields.endDate = "Tanggal selesai wajib diisi.";
  if (!payload.estimatedCost || payload.estimatedCost <= 0) {
    fields.estimatedCost = "Perkiraan biaya harus lebih dari 0.";
  }
  if (payload.startDate && payload.endDate && payload.endDate < payload.startDate) {
    fields.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
  }
  return fields;
}

/** POST /api/travel — creates a DRAFT. */
export function createTravel(payload: CreateTravelInput) {
  const fields = validateTravelDraft(payload);
  if (Object.keys(fields).length) {
    throw new ApiError("VALIDATION", "Data pengajuan belum lengkap.", 422, fields);
  }
  return apiRequest<TravelRequest>("/api/travel", { method: "POST", body: payload });
}

/** PATCH /api/travel/:id — owner, while still DRAFT. */
export function updateTravel(id: number, payload: Partial<CreateTravelInput>) {
  return apiRequest<TravelRequest>(`/api/travel/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

/** DELETE /api/travel/:id — owner, while still DRAFT. */
export function deleteTravel(id: number) {
  return apiRequest<{ deleted: number }>(`/api/travel/${id}`, { method: "DELETE" });
}

/** POST /api/travel/:id/submit — DRAFT → SUBMITTED. */
export function submitTravel(id: number) {
  return apiRequest<TravelRequest>(`/api/travel/${id}/submit`, { method: "POST" });
}

/** POST /api/travel/:id/cancel */
export function cancelTravel(id: number) {
  return apiRequest<TravelRequest>(`/api/travel/${id}/cancel`, { method: "POST" });
}

/** POST /api/travel/:id/documents — multipart upload. */
export function uploadTravelDocument(travelId: number, file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<TravelDocument>(`/api/travel/${travelId}/documents`, {
    method: "POST",
    body: form,
  });
}