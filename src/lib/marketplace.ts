import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api } from "./api";
import type {
  DocumentStatus,
  ListingAddress,
  ListingCounts,
  ListingFeatures,
  ListingFees,
  ListingSort,
} from "./properties";
import { displayName } from "./format";
import type { CardListing, ListingFor, VerificationStatus } from "@/types";

/**
 * The public marketplace seam. The realtor's own listings live in ./properties and
 * the console's in ./adminListings; this is what a visitor with no account sees, so
 * it carries no reviewer notes and no document files.
 */

/** The realtor as a listing shows them: a named person, never a contact card. */
export interface ListingRealtor {
  id: string;
  /** Stored lowercased by the API. Run it through displayName() to render. */
  fullname: string;
  avatar: string;
  certified: boolean;
}

/** One browse card. The server flattens it, so there is no nested address here. */
export interface PublicListing {
  id: string;
  ref: string;
  /** The public handle. Every link to a listing is built from this, never the id. */
  slug: string;
  title: string;
  price: number;
  /** A slug from the server's vocabulary. Render it through typeLabel(). */
  type: string;
  listingStatus: ListingFor;
  status: VerificationStatus;
  city: string;
  fullAddress: string;
  /** The first photo, or "" for a listing with none. */
  image: string;
  /** Zero means "not applicable", never "unknown": land has no bedrooms. */
  beds: number;
  baths: number;
  floorArea: number;
  landSize: number;
  hasVideo: boolean;
  realtor: ListingRealtor;
  createdAt: string;
}

/** A document as the public may see it: that a check exists, and where it stands. */
export interface PublicListingDocument {
  name: string;
  status: DocumentStatus;
}

/** One listing in full. No reviewer note, and no file to open. */
export interface PublicListingDetail {
  id: string;
  ref: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  type: string;
  category: string;
  listingStatus: ListingFor;
  address: ListingAddress;
  features: ListingFeatures;
  amenities: string[];
  images: string[];
  videoUrl: string;
  video: string;
  documents: PublicListingDocument[];
  status: VerificationStatus;
  verifiedOn?: string;
  fees: ListingFees;
  views: number;
  createdAt: string;
}

/** The detail page's realtor block: the card's four fields plus the business ones. */
export interface ListingRealtorProfile extends ListingRealtor {
  agencyName: string;
  city: string;
  /** NIN or BVN face-matched against the person. */
  identityVerified: boolean;
}

/** "all" is a real value, not an omitted param: it is the filters' resting state. */
export interface MarketplaceQuery {
  q: string;
  status: VerificationStatus | "all";
  city: string;
  type: string;
  listingStatus: ListingFor | "all";
  /** Whose listings. Omitted on the browse; set on a realtor's public profile. */
  realtor?: string;
  /** Specific listings, which is how the saved shortlist reads its cards. */
  ids?: string[];
  /** A minimum, not an exact count: the filter reads "3+ beds". 0 is "any". */
  beds: number;
  minPrice?: number;
  maxPrice?: number;
  sort: ListingSort;
  page: number;
}

export interface MarketplacePage {
  listings: PublicListing[];
  counts: ListingCounts;
  /** Every city and type present, so the filters are built from real data. */
  cities: string[];
  types: string[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface MarketplacePageResponse {
  status: string;
  data: MarketplacePage;
}

interface MarketplaceListingResponse {
  status: string;
  data: { listing: PublicListingDetail; realtor: ListingRealtorProfile };
}

export const MARKETPLACE_KEY = ["marketplace"];

// Mirrors the default in server/src/validators/property.validator.ts.
export const PAGE_SIZE = 12;

export const EMPTY_QUERY: MarketplaceQuery = {
  q: "",
  status: "all",
  city: "all",
  type: "all",
  listingStatus: "all",
  beds: 0,
  sort: "recommended",
  page: 1,
};

/**
 * The browse grid. `limit` is a parameter so the landing strip can ask for six.
 *
 * `enabled` exists for the saved shortlist: axios drops an empty array, so asking with
 * `ids: []` would send no filter at all and come back with the whole marketplace.
 */
export function usePublicListings(
  query: MarketplaceQuery,
  limit = PAGE_SIZE,
  enabled = true,
) {
  return useQuery({
    queryKey: [...MARKETPLACE_KEY, query, limit],
    queryFn: async () => {
      const res = await api.get<MarketplacePageResponse>("/properties", {
        params: { ...query, limit },
      });
      return res.data.data;
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicListing(slug: string) {
  return useQuery({
    queryKey: [...MARKETPLACE_KEY, slug],
    queryFn: async () => {
      const res = await api.get<MarketplaceListingResponse>(`/properties/${slug}`);
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** The one line under a title: street, then city. */
export function listingAddress(listing: {
  fullAddress: string;
  city: string;
}): string {
  return [listing.fullAddress, listing.city].filter(Boolean).join(", ");
}

/** A real listing, in the shape PropertyCard renders. */
export function toCardListing(listing: PublicListing): CardListing {
  return {
    id: listing.id,
    href: `/listings/${listing.slug}`,
    title: listing.title,
    image: listing.image,
    location: listingAddress(listing),
    price: listing.price,
    listingFor: listing.listingStatus,
    status: listing.status,
    beds: listing.beds,
    baths: listing.baths,
    // Land has no floor area, so its size is the plot.
    areaSqm: listing.floorArea || listing.landSize,
    hasVideo: listing.hasVideo,
    realtor: {
      name: displayName(listing.realtor.fullname),
      avatar: listing.realtor.avatar,
      certified: listing.realtor.certified,
    },
  };
}
