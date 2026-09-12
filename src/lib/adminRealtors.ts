import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api } from "./api";
import type { AuthStatus } from "./auth";

/** A realtor row: the account, plus the agency and the two trust flags. */
export interface AdminRealtor {
  id: string;
  /** Stored lowercased by the API. Run it through displayName() to render. */
  fullname: string;
  email: string;
  status: AuthStatus;
  avatar: string;
  city: string;
  agencyName: string;
  /** Profile.certified: the paid, exam-based enablement programme. */
  certified: boolean;
  /** Identity.verified: NIN or BVN face-matched against the person. */
  identityVerified: boolean;
  createdAt: string;
}

/** Counted before the status, certified and identity filters, so choosing a segment
 *  cannot zero the others. The two trust axes are separate on purpose: `certified` is
 *  the paid exam, `identityVerified` is the NIN or BVN face match. */
export interface RealtorCounts {
  all: number;
  certified: number;
  identityVerified: number;
  active: number;
  suspended: number;
  pending: number;
}

export interface RealtorDirectory {
  realtors: AdminRealtor[];
  counts: RealtorCounts;
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface RealtorQuery {
  q: string;
  certified: "all" | "yes" | "no";
  identity: "all" | "verified" | "unverified";
  status: AuthStatus | "all";
  page: number;
}

interface RealtorResponse {
  status: string;
  data: RealtorDirectory;
}

export const ADMIN_REALTORS_KEY = ["admin", "realtors"];

/** The resting query the directory opens on, read by the Overview too. React Query
 *  hashes keys structurally, so an inline literal of the same shape already shared the
 *  entry: the constant is what stops the two drifting apart later. */
export const REALTORS_QUERY: RealtorQuery = {
  q: "",
  certified: "all",
  identity: "all",
  status: "all",
  page: 1,
};

// Mirrors the default in server/src/validators/admin.validator.ts.
export const PAGE_SIZE = 20;

export function useAdminRealtors(query: RealtorQuery) {
  return useQuery({
    queryKey: [...ADMIN_REALTORS_KEY, query],
    queryFn: async () => {
      const res = await api.get<RealtorResponse>("/admin/realtors", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}
