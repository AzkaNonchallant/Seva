import { apiRequest } from "./api";
import type { TravelDocument, TravelPolicy, TravelRequest } from "./types";

type ListParams = {
  status?: string;
  search?: string;
  departmentId?: number;
};

/** GET /api/travel — Admin/Approver see every request. */
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
