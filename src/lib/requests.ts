import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";
import type { ContactMeans } from "./profile";

/**
 * Property requests: the seeker waitlist. Nothing is listed yet, so a request is a
 * standing brief: what, where, for how much and by when. It lives 90 days unless the
 * seeker renews it, and "expired" is worked out by the API, never stored.
 */

export type RequestIntent = "rent" | "sale" | "lease" | "shortlet";
export type RequestCity = "lagos" | "port-harcourt" | "abuja";
export type RequestTimeline = "now" | "3-months" | "6-months" | "exploring";
export type RequestStatus = "active" | "closed";
export type RequestCategory =
  | "residential"
  | "commercial"
  | "industrial"
  | "land"
  | "agricultural"
  | "hospitality"
  | "mixed-use"
  | "institutional"
  | "recreational"
  | "other";

/** What the API takes for a request, and what an edit sends whole. */
export interface RequestBody {
  intent: RequestIntent;
  category: RequestCategory;
  type?: string;
  city: RequestCity;
  areas: string[];
  /** Naira. Per year for rent and lease, per night for a shortlet, the total for a sale. */
  budgetMin?: number;
  budgetMax: number;
  bedrooms?: number;
  timeline: RequestTimeline;
  notes: string;
}

export interface PropertyRequest extends RequestBody {
  id: string;
  status: RequestStatus;
  expired: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface JoinBody {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  contactMeans: ContactMeans;
  request: RequestBody;
  consent: true;
}

interface RequestResponse {
  status: string;
  message?: string;
  data: { request: PropertyRequest };
}

export const REQUESTS_KEY = ["requests"];

/** Mirrors ACTIVE_REQUESTS_MAX in server/src/models/request.model.ts. */
export const ACTIVE_REQUESTS_MAX = 3;

/** Signed out: the account and the first request in one submit. No session follows,
 *  because the address has to be verified before the account can sign in. */
export function useJoinWaitlist() {
  return useMutation({
    mutationFn: async (body: JoinBody) => {
      const res = await api.post<RequestResponse>("/requests/join", body);
      return res.data.data.request;
    },
  });
}

/** Where a request stands. Closed wins over expired: someone who found a place is done. */
export type RequestState = "active" | "expired" | "closed";

export const requestState = (r: PropertyRequest): RequestState =>
  r.status === "closed" ? "closed" : r.expired ? "expired" : "active";

interface RequestListResponse {
  status: string;
  data: { requests: PropertyRequest[] };
}

/**
 * The seeker's whole history, newest first. Unpaged: three live at most plus whatever
 * they have closed. The sidebar pill, the overview tile and the page share this entry.
 */
export function useMyRequests(enabled = true) {
  return useQuery({
    enabled,
    queryKey: REQUESTS_KEY,
    queryFn: async () => {
      const res = await api.get<RequestListResponse>("/requests/me");
      return res.data.data.requests;
    },
  });
}

export function useMyRequest(id: string) {
  return useQuery({
    queryKey: [...REQUESTS_KEY, id],
    queryFn: async () => {
      const res = await api.get<RequestResponse>(`/requests/me/${id}`);
      return res.data.data.request;
    },
  });
}

/** Every write answers with the request, so the detail is set and the list refetched. */
function useRequestWrite<V>(write: (vars: V) => Promise<PropertyRequest>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: write,
    onSuccess: (request) => {
      queryClient.setQueryData([...REQUESTS_KEY, request.id], request);
      void queryClient.invalidateQueries({ queryKey: REQUESTS_KEY, exact: true });
    },
  });
}

export function useUpdateRequest() {
  return useRequestWrite(async ({ id, body }: { id: string; body: RequestBody }) => {
    const res = await api.patch<RequestResponse>(`/requests/me/${id}`, body);
    return res.data.data.request;
  });
}

export function useRenewRequest() {
  return useRequestWrite(async (id: string) => {
    const res = await api.post<RequestResponse>(`/requests/me/${id}/renew`);
    return res.data.data.request;
  });
}

export function useCloseRequest() {
  return useRequestWrite(async (id: string) => {
    const res = await api.patch<RequestResponse>(`/requests/me/${id}/close`);
    return res.data.data.request;
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RequestBody) => {
      const res = await api.post<RequestResponse>("/requests", { request, consent: true });
      return res.data.data.request;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
    },
  });
}
