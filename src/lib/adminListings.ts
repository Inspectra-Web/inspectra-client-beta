import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";
import type { AuthStatus } from "./auth";
import type { DocumentStatus, ListingCounts, RealtorListing } from "./properties";
import type { ListingFor, VerificationStatus } from "@/types";

/** A listings row as the admin console renders it: the property, plus its realtor. */
export interface AdminListing {
  id: string;
  ref: string;
  title: string;
  price: number;
  listingStatus: ListingFor;
  /** The verification axis the badge renders. */
  status: VerificationStatus;
  city: string;
  fullAddress: string;
  /** The cover photo, or "" for a listing with none yet. */
  image: string;
  /** How much of the dossier is cleared: the queue's core signal. */
  docs: number;
  docsVerified: number;
  realtorId?: string;
  /** Stored lowercased by the API. Run it through displayName() to render. */
  realtorName: string;
  createdAt: string;
}

/**
 * "all" is a real value, not an omitted param: it is the filters' resting state. "open"
 * is the review queue's own sentinel, meaning everything still undecided.
 */
export interface AdminListingQuery {
  q: string;
  status: VerificationStatus | "all" | "open";
  city: string;
  /** The review queue works oldest-first; every other surface reads newest-first. */
  sort: "newest" | "oldest";
  page: number;
}

export interface AdminListingPage {
  listings: AdminListing[];
  /** Computed without the status clause, so picking a segment cannot zero the others. */
  counts: ListingCounts;
  /** Every city with a listing, so the filter is built from real data. */
  cities: string[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ListingsResponse {
  status: string;
  data: AdminListingPage;
}

export const ADMIN_LISTINGS_KEY = ["admin", "listings"];

// Mirrors the default in server/src/validators/admin.validator.ts.
export const PAGE_SIZE = 20;

/**
 * The queue's resting query. Shared with the sidebar's pending pill so the two read one
 * cache entry rather than firing a request each.
 */
export const QUEUE_QUERY: AdminListingQuery = {
  q: "",
  status: "open",
  city: "all",
  sort: "oldest",
  page: 1,
};

/** Who listed it. Small on purpose: the console links through for the rest. */
export interface ListingRealtor {
  id: string;
  fullname: string;
  email: string;
  avatar: string;
  status: AuthStatus;
  agencyName: string;
  city: string;
  certified: boolean;
  identityVerified: boolean;
}

/**
 * The listing is the same payload the realtor's own detail page reads: both come
 * from `detailedProperty` on the server, so the two views cannot drift.
 */
export interface AdminListingDetail {
  listing: RealtorListing;
  /** Null for a listing whose account has since been removed. */
  realtor: ListingRealtor | null;
}

interface ListingDetailResponse {
  status: string;
  data: AdminListingDetail;
}

export function useAdminListing(id: string) {
  return useQuery({
    queryKey: [...ADMIN_LISTINGS_KEY, id],
    queryFn: async () => {
      const res = await api.get<ListingDetailResponse>(`/admin/listings/${id}`);
      return res.data.data;
    },
  });
}

export function useAdminListings(query: AdminListingQuery) {
  return useQuery({
    queryKey: [...ADMIN_LISTINGS_KEY, query],
    queryFn: async () => {
      const res = await api.get<ListingsResponse>("/admin/listings", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

/** One document's verdict. `reason` is required by the API whenever the state is flagged. */
export interface DocumentDecision {
  id: string;
  status: DocumentStatus;
  reason: string;
}

export interface ReviewInput {
  id: string;
  status: VerificationStatus;
  note: string;
  documents: DocumentDecision[];
}

interface ReviewResponse {
  status: string;
  message?: string;
  data: { property: RealtorListing };
}

/**
 * The whole review in one write: the document verdicts and the listing's own. The API
 * refuses to verify a listing whose documents are not all verified, so the page's
 * disabled state and the server's rule say the same thing.
 */
export function useReviewListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: ReviewInput) => {
      const res = await api.patch<ReviewResponse>(`/admin/listings/${id}/verification`, body);
      return res.data;
    },
    onSuccess: ({ data }, { id }) => {
      // The detail cache holds { listing, realtor }, so patch the half that changed.
      queryClient.setQueryData<AdminListingDetail>([...ADMIN_LISTINGS_KEY, id], (prev) =>
        prev ? { ...prev, listing: data.property } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: ADMIN_LISTINGS_KEY });
    },
  });
}
