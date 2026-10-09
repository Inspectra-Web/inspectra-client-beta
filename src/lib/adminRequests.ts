import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api } from "./api";
import type { ContactMeans } from "./profile";
import type {
  RequestCategory,
  RequestCity,
  RequestIntent,
  RequestTimeline,
} from "./requests";

/**
 * The seeker waitlist from the console: a list to reach people from, and the demand
 * figures a realtor is pitched with. Both read GET /admin/requests*.
 */

/** Live is active and unexpired. Mirrors RequestState in server/src/validators/admin.validator.ts. */
export type AdminRequestState = "live" | "expired" | "closed";

export interface AdminRequestRow {
  id: string;
  /** "REQ-B253A7": the reference the seeker's confirmation email carries. */
  ref: string;
  intent: RequestIntent;
  category: RequestCategory;
  type?: string;
  city: RequestCity;
  areas: string[];
  budgetMin?: number;
  budgetMax: number;
  bedrooms?: number;
  timeline: RequestTimeline;
  notes: string;
  state: AdminRequestState;
  expiresAt: string;
  createdAt: string;
  seeker: {
    id: string;
    /** Stored lowercased by the API. Run it through displayName() to render. */
    fullname: string;
    email: string;
    phone: string;
    whatsapp: string;
    contactMeans: ContactMeans | "";
    avatar: string;
    /** Email verified. An unverified seeker is listed but left out of the demand figures. */
    verified: boolean;
  };
}

/** Counted before the filters, so choosing one never zeroes the others. */
export interface AdminRequestCounts {
  states: Partial<Record<AdminRequestState, number>>;
  cities: Partial<Record<RequestCity, number>>;
  intents: Partial<Record<RequestIntent, number>>;
}

export interface AdminRequestPage {
  requests: AdminRequestRow[];
  counts: AdminRequestCounts;
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminRequestQuery {
  q: string;
  state: AdminRequestState | "all";
  city: RequestCity | "all";
  intent: RequestIntent | "all";
  page: number;
}

/** One city, intent and kind of property. Budgets are the stated maximum and share
 *  the intent's period: a year, a night, or a total. */
export interface DemandSegment {
  city: RequestCity;
  intent: RequestIntent;
  /** The property type, or the category when the seeker said "any type". */
  kind: string;
  count: number;
  budgetMedian: number;
  budgetLow: number;
  budgetHigh: number;
}

/** Live requests from verified, active seekers only: the number that is true today. */
export interface RequestDemand {
  requests: number;
  seekers: number;
  cities: Partial<Record<RequestCity, number>>;
  intents: Partial<Record<RequestIntent, number>>;
  timelines: Partial<Record<RequestTimeline, number>>;
  segments: DemandSegment[];
  areas: { city: RequestCity; name: string; count: number }[];
}

interface PageResponse {
  status: string;
  data: AdminRequestPage;
}

interface DemandResponse {
  status: string;
  data: RequestDemand;
}

export const ADMIN_REQUESTS_KEY = ["admin", "requests"];

/** The list opens on live requests: the demand someone could act on today. */
export const REQUESTS_QUERY: AdminRequestQuery = {
  q: "",
  state: "live",
  city: "all",
  intent: "all",
  page: 1,
};

// Mirrors the default in server/src/validators/admin.validator.ts.
export const PAGE_SIZE = 20;

export function useAdminRequests(query: AdminRequestQuery) {
  return useQuery({
    queryKey: [...ADMIN_REQUESTS_KEY, query],
    queryFn: async () => {
      const res = await api.get<PageResponse>("/admin/requests", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useRequestDemand() {
  return useQuery({
    queryKey: [...ADMIN_REQUESTS_KEY, "demand"],
    queryFn: async () => {
      const res = await api.get<DemandResponse>("/admin/requests/demand");
      return res.data.data;
    },
  });
}
