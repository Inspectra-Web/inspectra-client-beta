import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import dayjs from "dayjs";

import { api } from "./api";
import type { ListingFor, VerificationStatus } from "@/types";

/**
 * A booked viewing is one record with two views: the buyer's appointment is the
 * realtor's diary entry. The endpoints differ only in which end is asking, so the
 * shapes below are shared and the two lists are separate hooks over one seam, the
 * way inquiries and leads are.
 */

/** `requested` is waiting on the realtor, so it is what their console counts: the
 *  work, not the total. The three terminal states are kept apart because they mean
 *  different things to a buyer, and the page says which one happened. */
export type InspectionStatus =
  | "requested"
  | "confirmed"
  | "completed"
  | "declined"
  | "cancelled";

/** Which side of a booking someone is. Sent only to say who called a viewing off:
 *  it is all the page needs, and neither party is handed the other's user id. */
export type Party = "seeker" | "realtor";

/** The booking itself, identical for both sides. */
export interface InspectionRecord {
  id: string;
  /** The whole appointment in one ISO timestamp: date and time are never split. */
  slot: string;
  /** The buyer's line when booking. */
  note: string;
  status: InspectionStatus;
  /** The realtor's line back: why they declined, or a note about getting in when
   *  they confirmed. One field, because it is always the same thing: their reply. */
  response: string;
  cancelledBy?: Party;
  decidedAt?: string;
  createdAt: string;
}

/** The listing a viewing is on. Mirrors `listingCard` in the server's property model,
 *  which is the one definition both this seam and inquiries are shaped from. */
export interface InspectionListing {
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
  /** The listing's verification status, not the booking's. */
  status: VerificationStatus;
}

/** The person at the other end. Mirrors the server's `personCard`: a named human,
 *  never a contact card. */
export interface InspectionPerson {
  id: string;
  /** Stored lowercased by the API. Run it through displayName() to render. */
  fullname: string;
  avatar: string;
}

export interface InspectionRealtor extends InspectionPerson {
  certified: boolean;
}

/** The detail page's realtor block: the row's fields plus the business ones, which
 *  arrive on the detail alone because a row only needs the name. */
export interface InspectionRealtorProfile extends InspectionRealtor {
  agencyName: string;
  city: string;
}

interface RowBase {
  id: string;
  slot: string;
  status: InspectionStatus;
  createdAt: string;
  property: InspectionListing;
}

/** One row of the buyer's own viewings: the realtor showing it. */
export interface InspectionRow extends RowBase {
  realtor: InspectionRealtor;
}

/** One row of the realtor's diary: the buyer who booked. */
export interface DiaryRow extends RowBase {
  seeker: InspectionPerson;
}

/** Counted before the tab filter, so choosing a tab cannot zero the one beside it. */
export interface InspectionCounts {
  all: number;
  upcoming: number;
  past: number;
  requested: number;
  confirmed: number;
  completed: number;
  declined: number;
  cancelled: number;
}

/** The two tabs. Upcoming is live-and-still-ahead; past is everything else, so the
 *  pair covers every booking with no third state to forget. */
export type InspectionWindow = "all" | "upcoming" | "past";

export type InspectionSort = "soonest" | "latest";

export interface InspectionQuery {
  window: InspectionWindow;
  sort: InspectionSort;
  page: number;
}

interface PageMeta {
  counts: InspectionCounts;
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface InspectionListPage extends PageMeta {
  inspections: InspectionRow[];
}

export interface DiaryListPage extends PageMeta {
  inspections: DiaryRow[];
}

/** The buyer's detail: the booking, the listing, and the realtor showing it. */
export interface InspectionDetail {
  inspection: InspectionRecord;
  property: InspectionListing;
  realtor: InspectionRealtorProfile;
}

/** The realtor's detail: the same booking, seen from the other end. */
export interface DiaryDetail {
  inspection: InspectionRecord;
  property: InspectionListing;
  seeker: InspectionPerson;
}

interface InspectionListResponse {
  status: string;
  data: InspectionListPage;
}

interface DiaryListResponse {
  status: string;
  data: DiaryListPage;
}

interface InspectionDetailResponse {
  status: string;
  data: InspectionDetail;
}

interface DiaryDetailResponse {
  status: string;
  data: DiaryDetail;
}

interface RecordResponse {
  status: string;
  message?: string;
  data: { inspection: InspectionRecord };
}

export const INSPECTIONS_KEY = ["inspections"];
export const DIARY_KEY = ["realtor", "inspections"];

// Mirrors the default in server/src/validators/inspection.validator.ts.
export const PAGE_SIZE = 12;

/**
 * The resting query both lists open on. The sidebar count pills read the same one,
 * so a pill and its page share a single cache entry instead of firing a request
 * each, the way EMPTY_QUERY and QUEUE_QUERY do.
 */
export const UPCOMING_QUERY: InspectionQuery = {
  window: "upcoming",
  sort: "soonest",
  page: 1,
};

/** The archive reads the other way round: most recent first. */
export const PAST_QUERY: InspectionQuery = { window: "past", sort: "latest", page: 1 };

/** The API writes the sentence ("Your viewing request is with the realtor"), so pass
 *  it through rather than inventing one on this end. */
interface RecordResult {
  inspection: InspectionRecord;
  message?: string;
}

const unwrap = (res: { data: RecordResponse }): RecordResult => ({
  inspection: res.data.data.inspection,
  message: res.data.message,
});

/** One ISO timestamp from a date and a time, or "" while either is still empty.
 *  A booking is picked as two fields and stored as one moment, so this is where the
 *  two meet. `YYYY-MM-DDTHH:mm` with no zone is read as local time, which is what
 *  the person choosing it meant. */
export const toSlot = (date: string, time: string): string => {
  if (!date || !time) return "";

  const parsed = dayjs(`${date}T${time}`);

  return parsed.isValid() ? parsed.toISOString() : "";
};

/** The reverse, to seed the fields from a booking that already exists. */
export const fromSlot = (iso: string): { date: string; time: string } => {
  const parsed = dayjs(iso);

  return parsed.isValid()
    ? { date: parsed.format("YYYY-MM-DD"), time: parsed.format("HH:mm") }
    : { date: "", time: "" };
};

/** Whether the appointment is behind us. The API is the authority (it refuses to
 *  close out a viewing that has not happened), but the console has to decide what
 *  to offer before it asks. */
export const slotPassed = (slot: string): boolean => new Date(slot).getTime() < Date.now();

/* ------------------------------------------------------------------ *
 * The buyer's side.
 * ------------------------------------------------------------------ */

export function useMyInspections(query: InspectionQuery) {
  return useQuery({
    queryKey: [...INSPECTIONS_KEY, query],
    queryFn: async () => {
      const res = await api.get<InspectionListResponse>("/inspections/me", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useMyInspection(id: string) {
  return useQuery({
    queryKey: [...INSPECTIONS_KEY, id],
    queryFn: async () => {
      const res = await api.get<InspectionDetailResponse>(`/inspections/me/${id}`);
      return res.data.data;
    },
  });
}

export interface BookInspectionInput {
  property: string;
  /** An ISO timestamp. The composer builds it from a date and a time slot. */
  slot: string;
  note?: string;
}

export function useBookInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BookInspectionInput): Promise<RecordResult> =>
      unwrap(await api.post<RecordResponse>("/inspections", input)),
    // No setQueryData: the detail cache holds the listing and the realtor beside the
    // booking, and a create answers with the booking alone.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INSPECTIONS_KEY });
    },
  });
}

export function useRescheduleInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; slot: string }): Promise<RecordResult> =>
      unwrap(
        await api.patch<RecordResponse>(`/inspections/me/${input.id}/slot`, {
          slot: input.slot,
        }),
      ),
    onSuccess: ({ inspection }) => {
      // The detail cache holds { inspection, property, realtor }, so patch the half
      // that changed rather than dropping the listing and the person with it.
      queryClient.setQueryData<InspectionDetail>(
        [...INSPECTIONS_KEY, inspection.id],
        (prev) => (prev ? { ...prev, inspection } : prev),
      );
      void queryClient.invalidateQueries({ queryKey: INSPECTIONS_KEY });
    },
  });
}

/* ------------------------------------------------------------------ *
 * The realtor's side. The same records, read as their diary.
 * ------------------------------------------------------------------ */

export function useRealtorInspections(query: InspectionQuery) {
  return useQuery({
    queryKey: [...DIARY_KEY, query],
    queryFn: async () => {
      const res = await api.get<DiaryListResponse>("/inspections/realtor", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useRealtorInspection(id: string) {
  return useQuery({
    queryKey: [...DIARY_KEY, id],
    queryFn: async () => {
      const res = await api.get<DiaryDetailResponse>(`/inspections/realtor/${id}`);
      return res.data.data;
    },
  });
}

/** Confirm, decline or close out a booking. Declining needs a reason, which the API
 *  enforces: a refusal the buyer cannot act on is worse than no answer. */
export type InspectionDecision = "confirmed" | "declined" | "completed";

export function useDecideInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      status: InspectionDecision;
      response?: string;
    }): Promise<RecordResult> =>
      unwrap(
        await api.patch<RecordResponse>(`/inspections/realtor/${input.id}/status`, {
          status: input.status,
          ...(input.response ? { response: input.response } : {}),
        }),
      ),
    onSuccess: ({ inspection }) => {
      queryClient.setQueryData<DiaryDetail>([...DIARY_KEY, inspection.id], (prev) =>
        prev ? { ...prev, inspection } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: DIARY_KEY });
    },
  });
}

/* ------------------------------------------------------------------ *
 * Both sides. One endpoint calls a viewing off whoever asks, so the two hooks
 * share the request and differ only in which console's cache they refresh.
 * ------------------------------------------------------------------ */

const cancelBooking = async (id: string): Promise<RecordResult> =>
  unwrap(await api.patch<RecordResponse>(`/inspections/${id}/cancel`));

export function useCancelMyInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: ({ inspection }) => {
      queryClient.setQueryData<InspectionDetail>(
        [...INSPECTIONS_KEY, inspection.id],
        (prev) => (prev ? { ...prev, inspection } : prev),
      );
      void queryClient.invalidateQueries({ queryKey: INSPECTIONS_KEY });
    },
  });
}

export function useCancelRealtorInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: ({ inspection }) => {
      queryClient.setQueryData<DiaryDetail>([...DIARY_KEY, inspection.id], (prev) =>
        prev ? { ...prev, inspection } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: DIARY_KEY });
    },
  });
}
