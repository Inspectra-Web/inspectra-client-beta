import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";
import type { ListingFor, VerificationStatus } from "@/types";

/**
 * Inquiries and leads are one record with two views: a seeker's inquiry is the
 * realtor's lead. The endpoints differ only in which end is asking, so the shapes
 * below are shared and the two lists are separate hooks over one seam.
 */

/** Whose turn it is. `new` means the thread is waiting on the realtor, so the
 *  seeker reads it as "awaiting a reply" and the realtor as "needs a reply". */
export type InquiryStatus = "new" | "responded" | "closed";

/** Which side wrote a message. It is what decides the bubble's side, and it is all
 *  the API sends: neither party is handed the other's user id. */
export type MessageAuthor = "seeker" | "realtor";

export interface InquiryMessage {
  id: string;
  author: MessageAuthor;
  body: string;
  createdAt: string;
}

/** The conversation itself, identical for both sides. */
export interface InquiryThread {
  id: string;
  status: InquiryStatus;
  messages: InquiryMessage[];
  lastMessageAt: string;
  createdAt: string;
}

/** The listing a thread is about, as both the list row and the detail carry it. */
export interface InquiryListing {
  id: string;
  /** Every link to the listing is built from this, never the id. */
  slug: string;
  title: string;
  /** The first photo, or "" for a listing with none. */
  image: string;
  city: string;
  fullAddress: string;
  price: number;
  listingStatus: ListingFor;
  /** The listing's verification status, not the thread's. */
  status: VerificationStatus;
}

/** The person at the other end. No email and no phone: the thread is the channel. */
export interface InquiryPerson {
  id: string;
  /** Stored lowercased by the API. Run it through displayName() to render. */
  fullname: string;
  avatar: string;
}

export interface InquiryRealtor extends InquiryPerson {
  certified: boolean;
}

/** The detail page's realtor block: the row's fields plus the business ones. The list
 *  is an aggregation and a row only needs the name, so these arrive on the detail
 *  alone, exactly as ListingRealtorProfile extends ListingRealtor. */
export interface InquiryRealtorProfile extends InquiryRealtor {
  agencyName: string;
  city: string;
}

interface RowBase {
  id: string;
  status: InquiryStatus;
  /** The most recent message, for the one-line preview a row shows. */
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  property: InquiryListing;
}

/** One row of the seeker's own inquiries: who they wrote to. */
export interface InquiryRow extends RowBase {
  realtor: InquiryRealtor;
}

/** One row of the realtor's leads: the buyer who wrote in. */
export interface LeadRow extends RowBase {
  seeker: InquiryPerson;
}

/** Counted before the status filter, so choosing a segment cannot zero the others. */
export interface InquiryCounts {
  all: number;
  new: number;
  responded: number;
  closed: number;
}

export type InquirySort = "newest" | "oldest";

/** "all" is a real value, not an omitted param: it is the filter's resting state. */
export interface InquiryQuery {
  status: InquiryStatus | "all";
  sort: InquirySort;
  page: number;
}

interface PageMeta {
  counts: InquiryCounts;
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface InquiryListPage extends PageMeta {
  inquiries: InquiryRow[];
}

export interface LeadListPage extends PageMeta {
  leads: LeadRow[];
}

/** The seeker's detail: the thread, the listing, and the realtor they wrote to. */
export interface InquiryDetail {
  inquiry: InquiryThread;
  property: InquiryListing;
  realtor: InquiryRealtorProfile;
}

/** The realtor's detail: the same thread, seen from the other end. */
export interface LeadDetail {
  inquiry: InquiryThread;
  property: InquiryListing;
  seeker: InquiryPerson;
}

interface InquiryListResponse {
  status: string;
  data: InquiryListPage;
}

interface LeadListResponse {
  status: string;
  data: LeadListPage;
}

interface InquiryDetailResponse {
  status: string;
  data: InquiryDetail;
}

interface LeadDetailResponse {
  status: string;
  data: LeadDetail;
}

interface ThreadResponse {
  status: string;
  message?: string;
  data: { inquiry: InquiryThread };
}

export const INQUIRIES_KEY = ["inquiries"];
export const LEADS_KEY = ["leads"];

// Mirrors the default in server/src/validators/inquiry.validator.ts.
export const PAGE_SIZE = 12;

/**
 * The resting query both lists open on. The sidebar count pills read the same one, so
 * a pill and its page share a single cache entry instead of firing a request each,
 * the way QUEUE_QUERY works for the verification queue.
 */
export const EMPTY_QUERY: InquiryQuery = { status: "all", sort: "newest", page: 1 };

/* ------------------------------------------------------------------ *
 * The seeker's side.
 * ------------------------------------------------------------------ */

export function useMyInquiries(query: InquiryQuery) {
  return useQuery({
    queryKey: [...INQUIRIES_KEY, query],
    queryFn: async () => {
      const res = await api.get<InquiryListResponse>("/inquiries/me", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useMyInquiry(id: string) {
  return useQuery({
    queryKey: [...INQUIRIES_KEY, id],
    queryFn: async () => {
      const res = await api.get<InquiryDetailResponse>(`/inquiries/me/${id}`);
      return res.data.data;
    },
  });
}

/** The API writes the sentence ("Your inquiry is with the realtor"), so pass it through. */
interface ThreadResult {
  inquiry: InquiryThread;
  message?: string;
}

export function useCreateInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      property: string;
      message: string;
    }): Promise<ThreadResult> => {
      const res = await api.post<ThreadResponse>("/inquiries", input);
      return { inquiry: res.data.data.inquiry, message: res.data.message };
    },
    // No setQueryData here: the detail cache holds the listing and the realtor beside
    // the thread, and a create answers with the thread alone.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INQUIRIES_KEY });
    },
  });
}

/* ------------------------------------------------------------------ *
 * The realtor's side. The same records, labelled leads in their console.
 * ------------------------------------------------------------------ */

export function useLeads(query: InquiryQuery) {
  return useQuery({
    queryKey: [...LEADS_KEY, query],
    queryFn: async () => {
      const res = await api.get<LeadListResponse>("/inquiries/leads", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: [...LEADS_KEY, id],
    queryFn: async () => {
      const res = await api.get<LeadDetailResponse>(`/inquiries/leads/${id}`);
      return res.data.data;
    },
  });
}

/** "open" is a sentinel, not a stored status: the API recomputes whose turn it was. */
export type LeadStatusAction = "closed" | "open";

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      status: LeadStatusAction;
    }): Promise<ThreadResult> => {
      const res = await api.patch<ThreadResponse>(
        `/inquiries/leads/${input.id}/status`,
        { status: input.status },
      );
      return { inquiry: res.data.data.inquiry, message: res.data.message };
    },
    onSuccess: ({ inquiry }) => {
      queryClient.setQueryData<LeadDetail>([...LEADS_KEY, inquiry.id], (prev) =>
        prev ? { ...prev, inquiry } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: LEADS_KEY });
    },
  });
}

/* ------------------------------------------------------------------ *
 * Both sides. One endpoint takes the reply whoever sends it, so the two hooks
 * share the request and differ only in which console's cache they refresh.
 * ------------------------------------------------------------------ */

const sendMessage = async (input: {
  id: string;
  message: string;
}): Promise<ThreadResult> => {
  const res = await api.post<ThreadResponse>(`/inquiries/${input.id}/messages`, {
    message: input.message,
  });

  return { inquiry: res.data.data.inquiry, message: res.data.message };
};

export function useSendInquiryMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: ({ inquiry }) => {
      // The detail cache holds { inquiry, property, realtor }, so patch the half
      // that changed rather than dropping the listing and the person with it.
      queryClient.setQueryData<InquiryDetail>([...INQUIRIES_KEY, inquiry.id], (prev) =>
        prev ? { ...prev, inquiry } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: INQUIRIES_KEY });
    },
  });
}

export function useSendLeadMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: ({ inquiry }) => {
      queryClient.setQueryData<LeadDetail>([...LEADS_KEY, inquiry.id], (prev) =>
        prev ? { ...prev, inquiry } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: LEADS_KEY });
    },
  });
}
