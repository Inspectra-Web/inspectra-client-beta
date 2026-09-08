import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";
import type { ListingFor, VerificationStatus } from "@/types";

export interface ListingAddress {
  fullAddress: string;
  city: string;
  state: string;
  country: string;
}

/** Zero means "not applicable" (land has no bedrooms), which is how the API stores it. */
export interface ListingFeatures {
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  garage: number;
  kitchen: number;
  floors: number;
  floorArea: number;
  landSize: number;
  yearBuilt: number;
}

export type DocumentStatus = "pending" | "verified" | "flagged";

export interface ListingDocument {
  name: string;
  notes: string;
  fileUrl: string;
  status: DocumentStatus;
  issuedDate?: string;
  size: number;
}

export interface ListingFee {
  name: string;
  amount: number;
  optional: boolean;
}

export interface ListingFees {
  paymentTerms: string;
  refundPolicy: string;
  additional: ListingFee[];
}

export interface RealtorListing {
  id: string;
  /** Stamped by the API, e.g. INS-02D2F42A. Shown to the realtor and searchable. */
  ref: string;
  title: string;
  description: string;
  price: number;
  /** Slugs from the server's vocabulary. Render them through typeLabel(). */
  type: string;
  category: string;
  listingStatus: ListingFor;
  address: ListingAddress;
  features: ListingFeatures;
  amenities: string[];
  images: string[];
  /** An externally hosted tour, beside the one file we host ourselves. */
  videoUrl: string;
  video: string;
  documents: ListingDocument[];
  /** Platform-owned: an edit sends a verified listing back to pending. */
  verification: {
    status: VerificationStatus;
    note: string;
    reviewedAt?: string;
  };
  fees: ListingFees;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export type ListingSort = "recommended" | "newest" | "price-asc" | "price-desc" | "views";

/** "all" is a real value, not an omitted param: it is the filters' resting state. */
export interface ListingQuery {
  q: string;
  status: VerificationStatus | "all";
  sort: ListingSort;
  page: number;
}

/** Counted before the status filter, so choosing a segment cannot zero the others. */
export interface ListingCounts {
  all: number;
  verified: number;
  pending: number;
  disputed: number;
}

export interface ListingPage {
  properties: RealtorListing[];
  counts: ListingCounts;
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ListingPageResponse {
  status: string;
  data: ListingPage;
}

interface ListingResponse {
  status: string;
  message?: string;
  data: { property: RealtorListing };
}

interface DeleteResponse {
  status: string;
  message?: string;
  data: { id: string };
}

export const LISTINGS_KEY = ["listings"];

// Mirrors the default in server/src/validators/property.validator.ts.
export const PAGE_SIZE = 12;

/** A slug as the server stores it becomes the label the page renders. */
export function typeLabel(slug: string): string {
  if (!slug) return "";

  const words = slug.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** The one line under a title in a table row. */
export function listingLocation(listing: RealtorListing): string {
  const { fullAddress, city } = listing.address;

  return [fullAddress, city].filter(Boolean).join(", ");
}

export function useMyListings(query: ListingQuery) {
  return useQuery({
    queryKey: [...LISTINGS_KEY, query],
    queryFn: async () => {
      const res = await api.get<ListingPageResponse>("/properties/me", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useMyListing(id: string) {
  return useQuery({
    queryKey: [...LISTINGS_KEY, id],
    queryFn: async () => {
      const res = await api.get<ListingResponse>(`/properties/me/${id}`);
      return res.data.data.property;
    },
  });
}

/**
 * What the composer sends. Images and documents are not here: files go to their own
 * endpoints once a listing exists, the way an avatar does.
 */
export interface ListingInput {
  title: string;
  description: string;
  price: number;
  type: string;
  category: string;
  listingStatus: ListingFor;
  address: ListingAddress;
  features?: Partial<ListingFeatures>;
  amenities?: string[];
  videoUrl?: string;
  fees?: Partial<ListingFees>;
}

/**
 * `images` and `documents` are keep-lists, not uploads: the URLs still wanted.
 * Anything the server holds and the list omits is deleted, which is how the
 * composer removes a photo. New files go through the upload hooks below.
 */
export type ListingUpdate = Partial<ListingInput> & {
  images?: string[];
  documents?: string[];
};

/** The API writes the message ("It goes back for verification"), so pass it through. */
interface ListingResult {
  property: RealtorListing;
  message?: string;
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ListingInput): Promise<ListingResult> => {
      const res = await api.post<ListingResponse>("/properties", input);
      return { property: res.data.data.property, message: res.data.message };
    },
    onSuccess: ({ property }) => {
      queryClient.setQueryData([...LISTINGS_KEY, property.id], property);
      void queryClient.invalidateQueries({ queryKey: LISTINGS_KEY });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      body: ListingUpdate;
    }): Promise<ListingResult> => {
      const res = await api.patch<ListingResponse>(`/properties/${input.id}`, input.body);
      return { property: res.data.data.property, message: res.data.message };
    },
    onSuccess: ({ property }) => {
      queryClient.setQueryData([...LISTINGS_KEY, property.id], property);
      void queryClient.invalidateQueries({ queryKey: LISTINGS_KEY });
    },
  });
}

// Mirror the caps in server/src/services/upload.service.ts.
export const PHOTO_MAX_MB = 5;
export const DOCUMENT_MAX_MB = 10;
export const PHOTOS_MAX = 20;
export const DOCUMENTS_MAX = 5;

/** Rejects a file before it goes over the wire. Null means it is fine. */
export function photoError(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Upload image files (JPG, PNG or WebP).";
  if (file.size > PHOTO_MAX_MB * 1024 * 1024)
    return `Each photo must be ${PHOTO_MAX_MB}MB or smaller.`;

  return null;
}

export function documentError(file: File): string | null {
  if (!file.type.startsWith("image/") && file.type !== "application/pdf")
    return "Upload a PDF or an image of the document.";
  if (file.size > DOCUMENT_MAX_MB * 1024 * 1024)
    return `The document must be ${DOCUMENT_MAX_MB}MB or smaller.`;

  return null;
}

export function useAddPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; files: File[] }): Promise<ListingResult> => {
      const body = new FormData();
      input.files.forEach((file) => body.append("photos", file));

      const res = await api.post<ListingResponse>(`/properties/${input.id}/photos`, body);
      return { property: res.data.data.property, message: res.data.message };
    },
    onSuccess: ({ property }) => {
      queryClient.setQueryData([...LISTINGS_KEY, property.id], property);
      void queryClient.invalidateQueries({ queryKey: LISTINGS_KEY });
    },
  });
}

export function useAddDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      name: string;
      notes?: string;
      file: File;
    }): Promise<ListingResult> => {
      const body = new FormData();
      body.append("document", input.file);
      body.append("name", input.name);
      if (input.notes) body.append("notes", input.notes);

      const res = await api.post<ListingResponse>(`/properties/${input.id}/documents`, body);
      return { property: res.data.data.property, message: res.data.message };
    },
    onSuccess: ({ property }) => {
      queryClient.setQueryData([...LISTINGS_KEY, property.id], property);
      void queryClient.invalidateQueries({ queryKey: LISTINGS_KEY });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<DeleteResponse>(`/properties/${id}`);
      return { id, message: res.data.message };
    },
    onSuccess: ({ id }) => {
      queryClient.removeQueries({ queryKey: [...LISTINGS_KEY, id] });
      void queryClient.invalidateQueries({ queryKey: LISTINGS_KEY });
    },
  });
}
