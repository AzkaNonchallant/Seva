import { apiRequest, ApiError } from "./api";
import type { TravelDocument, TravelPolicy, TravelRequest } from "./types";

type ListParams = {
  status?: string;
  search?: string;
  departmentId?: number;
};

/** GET /api/travel — Employee sees only their own; other roles see all. */
export function listTravels(params: ListParams = {}) {
  return apiRequest<TravelRequest[]>("/api/travel", {
    query: { ...params },
  });
}

/** GET /api/travel/:id — includes the approval timeline. */
export function getTravel(id: number) {
  return apiRequest<TravelRequest>(`/api/travel/${id}`);
}

/** GET /api/travel/:id/documents */
export function getTravelDocuments(id: number) {
  return apiRequest<TravelDocument[]>(`/api/travel/${id}/documents`);
}

/** DELETE /api/travel/documents/:docId */
export function deleteTravelDocument(id: number, documentId: number) {
  return apiRequest<{ deleted: number }>(`/api/travel/documents/${documentId}`, {
    method: "DELETE",
    query: { travelId: id },
  });
}

/** GET /api/travel/policies — available to every logged-in role. */
export function listPolicies() {
  return apiRequest<TravelPolicy[]>("/api/travel/policies");
}

/** GET /api/travel/policies/applicable — used by the employee request form. */
export function listApplicablePolicies(positionId?: number, destinationTier?: string) {
  return apiRequest<TravelPolicy[]>("/api/travel/policies/applicable", {
    query: { positionId, destinationTier },
  });
}

/* ── Employee-owned mutations (§3) ────────────────────────────────────── */

/** Body of POST /api/travel, field names taken verbatim from the spec. */
export interface CreateTravelInput {
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  policyId?: number;
}

function requireText(
  payload: Partial<CreateTravelInput>,
): Record<string, string> {
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

/**
 * Validation mirrors the two rules the spec states outright — end date cannot
 * precede start date, and cost must be positive — and runs before the request
 * so the user gets field-level feedback without a round trip. The backend
 * remains the authority; `ApiError.fields` from the response overrides these.
 */
export function validateTravelDraft(payload: Partial<CreateTravelInput>) {
  return requireText(payload);
}

/** POST /api/travel — creates a DRAFT. */
export function createTravel(payload: CreateTravelInput) {
  const fields = validateTravelDraft(payload);
  if (Object.keys(fields).length) {
    throw new ApiError("VALIDATION", "Data pengajuan belum lengkap.", 422, fields);
  }
  return apiRequest<TravelRequest>("/api/travel", {
    method: "POST",
    body: payload,
  });
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
  return apiRequest<{ deleted: number }>(`/api/travel/${id}`, {
    method: "DELETE",
  });
}

/** POST /api/travel/:id/submit — DRAFT → SUBMITTED, generating approval rows. */
export function submitTravel(id: number) {
  return apiRequest<TravelRequest>(`/api/travel/${id}/submit`, { method: "POST" });
}

/** POST /api/travel/:id/cancel — owner may cancel their own request. */
export function cancelTravel(id: number) {
  return apiRequest<TravelRequest>(`/api/travel/${id}/cancel`, { method: "POST" });
}

/**
 * POST /api/travel/:id/documents — multipart upload of a supporting file.
 * Kept server-side so the httpOnly token never has to reach the browser.
 */
export function uploadTravelDocument(travelId: number, file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<TravelDocument>(`/api/travel/${travelId}/documents`, {
    method: "POST",
    body: form,
  });
}
