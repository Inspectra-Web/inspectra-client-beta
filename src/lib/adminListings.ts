import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api } from "./api";
import type { AuthStatus } from "./auth";
import type { RealtorListing } from "./properties";
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
  realtorId?: string;
  /** Stored lowercased by the API. Run it through displayName() to render. */
  realtorName: string;
  createdAt: string;
}

/** "all" is a real value, not an omitted param: it is the filters' resting state. */
export interface AdminListingQuery {
  q: string;
  status: VerificationStatus | "all";
  city: string;
  page: number;
}

export interface AdminListingPage {
  listings: AdminListing[];
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
