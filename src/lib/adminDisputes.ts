import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";
import type { InspectionListing, InspectionRecord } from "./inspections";

/**
 * Paid viewings whose two sides disagree. The money is frozen until an admin decides;
 * the decision is carried out on the server by the same release and refund paths the
 * sweep uses, so this seam only reads disputes and records rulings.
 */

export type DisputeState = "open" | "decided";
export type DisputeOutcome = "release" | "refund" | "split";

export interface DisputeParty {
  id: string;
  /** Stored lowercased by the API. Run it through displayName() to render. */
  fullname: string;
  email: string;
  avatar: string;
}

export interface DisputeRow {
  id: string;
  slot: string;
  state: DisputeState;
  property: { id: string; title: string; ref: string };
  seeker: DisputeParty;
  realtor: DisputeParty;
  /** Naira: the realtor's fee, and what the seeker paid (fee + service charge). */
  fee: number;
  total: number;
  reason: string;
  openedAt: string;
  outcome?: DisputeOutcome;
  decidedAt?: string;
}

/** Counted before the state filter, so choosing one cannot zero the other. */
export interface DisputeCounts {
  all: number;
  open: number;
  decided: number;
}

export interface DisputeDirectory {
  disputes: DisputeRow[];
  counts: DisputeCounts;
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DisputeQuery {
  q: string;
  state: DisputeState | "all";
  page: number;
}

export interface DisputeDetail {
  inspection: InspectionRecord;
  property: InspectionListing;
  seeker: DisputeParty;
  realtor: DisputeParty;
  payment: { reference: string; channel: string; paidAt?: string } | null;
}

export interface DecisionInput {
  id: string;
  outcome: DisputeOutcome;
  note: string;
  /** Naira of the fee the realtor keeps on a split; the rest is refunded. */
  realtorShare?: number;
}

export const ADMIN_DISPUTES_KEY = ["admin", "disputes"];

/** Open first: that is the queue. The sidebar pill reads this same query. */
export const DISPUTES_QUERY: DisputeQuery = { q: "", state: "open", page: 1 };

// Mirrors the default in server/src/validators/admin.validator.ts.
export const PAGE_SIZE = 20;

export function useAdminDisputes(query: DisputeQuery) {
  return useQuery({
    queryKey: [...ADMIN_DISPUTES_KEY, query],
    queryFn: async () => {
      const res = await api.get<{ data: DisputeDirectory }>("/admin/disputes", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdminDispute(id: string) {
  return useQuery({
    queryKey: [...ADMIN_DISPUTES_KEY, "detail", id],
    queryFn: async () => {
      const res = await api.get<{ data: DisputeDetail }>(`/admin/disputes/${id}`);
      return res.data.data;
    },
  });
}

export function useDecideDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: DecisionInput) => {
      const res = await api.patch<{ message?: string; data: DisputeDetail }>(
        `/admin/disputes/${id}`,
        body,
      );
      return res.data;
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData([...ADMIN_DISPUTES_KEY, "detail", data.inspection.id], data);
      void queryClient.invalidateQueries({ queryKey: ADMIN_DISPUTES_KEY });
    },
  });
}
