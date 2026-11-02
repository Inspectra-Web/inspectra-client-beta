import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";

/**
 * The paid realtor course: one teaser video on what INSPECTRA does for a realtor. The
 * admin uploads it, a prospective realtor pays for it as a guest, and finishing the video
 * issues the invite that unlocks realtor sign-up.
 */

export type CourseStatus = "draft" | "published";
export type EnrollmentStatus = "pending" | "paid" | "completed";

/** The sales page's view. No `videoUrl`: the video is what the payment buys. */
export interface PublicCourse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  /** Length of the video, shown on the sales page. */
  minutes: number;
  /** Naira. */
  price: number;
  status: CourseStatus;
  updatedAt: string;
}

/** A paid learner's and the admin's view. */
export interface Course extends PublicCourse {
  videoUrl: string;
}

/** What the admin edits and saves whole. Status has its own write. */
export type CourseBody = Omit<Course, "id" | "status" | "updatedAt">;

/** A row in the admin table. */
export interface Enrollment {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  status: EnrollmentStatus;
  reference: string;
  amount: number;
  paidAt?: string;
  completedAt?: string;
  /** Set once the invite has been used to register. */
  registered: boolean;
  createdAt: string;
}

/** What the player knows about the person watching. */
export type LearnerEnrollment = Omit<Enrollment, "phone" | "reference" | "amount">;

export interface EnrollBody {
  fullname: string;
  email: string;
  phone: string;
}

/** `link` is the Flutterwave checkout; `reference` our tx_ref. */
export interface EnrollResult {
  link: string;
  reference: string;
}

/** What a confirmed payment hands back to the browser that paid. */
export interface VerifiedEnrollment {
  reference: string;
  amount: number;
  email: string;
  access: string;
}

export interface LearnerCourse {
  course: Course;
  enrollment: LearnerEnrollment;
}

/** Who a registration invite belongs to, so sign-up can fill and lock their details. */
export interface Invite {
  fullname: string;
  email: string;
}

export type EnrollmentFilter = EnrollmentStatus | "all";

export interface EnrollmentsQuery {
  q: string;
  status: EnrollmentFilter;
  page: number;
}

export interface EnrollmentsPage {
  enrollments: Enrollment[];
  total: number;
  pages: number;
  counts: Record<EnrollmentFilter, number>;
  /** Of everyone, how many have used their invite. */
  registered: number;
}

export const COURSE_KEY = ["course"];
export const LEARN_KEY = ["course", "learn"];
export const ADMIN_COURSE_KEY = ["admin", "course"];
export const ENROLLMENTS_KEY = ["admin", "course", "enrollments"];

export const ENROLLMENTS_PAGE_SIZE = 10;
export const ALL_ENROLLMENTS: EnrollmentsQuery = { q: "", status: "all", page: 1 };

interface Envelope<T> {
  status: string;
  message?: string;
  data: T;
}

/* Public ------------------------------------------------------------------------ */

/** The published course, or null while it is in draft. */
export function useCourse() {
  return useQuery({
    queryKey: COURSE_KEY,
    queryFn: async () => {
      const res = await api.get<Envelope<{ course: PublicCourse | null }>>("/course");
      return res.data.data.course;
    },
  });
}

/** Starts a guest checkout. */
export function useEnroll() {
  return useMutation({
    mutationFn: async (body: EnrollBody) => {
      const res = await api.post<Envelope<EnrollResult>>("/course/enroll", body);
      return res.data.data;
    },
  });
}

/**
 * Confirms a payment after Flutterwave sends the guest back. A query, not a mutation, like
 * useVerifyPayment: StrictMode remounts would fire a POST twice, and the cache dedupes by
 * key. The endpoint is idempotent regardless.
 */
export function useVerifyEnrollment(reference: string, transactionId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["verify-enrollment", reference],
    queryFn: async () => {
      const res = await api.post<Envelope<VerifiedEnrollment>>(
        `/course/enroll/${reference}/verify`,
        { transactionId },
      );
      void queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
      return res.data.data;
    },
    enabled: reference.length > 0 && transactionId.length > 0,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

/* Learner ----------------------------------------------------------------------- */

export function useLearnerCourse(access: string) {
  return useQuery({
    queryKey: [...LEARN_KEY, access],
    enabled: access !== "",
    retry: false,
    queryFn: async () => {
      const res = await api.get<Envelope<LearnerCourse>>(`/course/learn/${access}`);
      return res.data.data;
    },
  });
}

/** The video ended: marks it watched and answers with the invite. Safe to repeat. */
export function useFinishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ access }: { access: string }) => {
      const res = await api.post<Envelope<{ invite: string; enrollment: LearnerEnrollment }>>(
        `/course/learn/${access}/finish`,
      );
      return res.data.data;
    },
    onSuccess: ({ enrollment }, { access }) => {
      queryClient.setQueryData<LearnerCourse>([...LEARN_KEY, access], (prev) =>
        prev ? { ...prev, enrollment } : prev,
      );
    },
  });
}

/** Valid only once the video is watched, and only until used. */
export function useInvite(invite: string) {
  return useQuery({
    queryKey: ["course", "invite", invite],
    enabled: invite !== "",
    retry: false,
    queryFn: async () => {
      const res = await api.get<Envelope<{ invite: Invite }>>(`/course/invites/${invite}`);
      return res.data.data.invite;
    },
  });
}

/* Admin ------------------------------------------------------------------------- */

/** The course in any status. The first read creates the draft. */
export function useAdminCourse() {
  return useQuery({
    queryKey: ADMIN_COURSE_KEY,
    queryFn: async () => {
      const res = await api.get<Envelope<{ course: Course }>>("/admin/course");
      return res.data.data.course;
    },
  });
}

function useAdminCourseWrite<V>(write: (vars: V) => Promise<Course>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: write,
    onSuccess: (course) => {
      queryClient.setQueryData(ADMIN_COURSE_KEY, course);
      void queryClient.invalidateQueries({ queryKey: COURSE_KEY, exact: true });
    },
  });
}

export function useSaveCourse() {
  return useAdminCourseWrite(async (body: CourseBody) => {
    const res = await api.put<Envelope<{ course: Course }>>("/admin/course", body);
    return res.data.data.course;
  });
}

export function useSetCourseStatus() {
  return useAdminCourseWrite(async (status: CourseStatus) => {
    const res = await api.patch<Envelope<{ course: Course }>>("/admin/course/status", { status });
    return res.data.data.course;
  });
}

/** One file to the course's storage, answered with its URL for the form to save. */
export function useUploadCourseAsset() {
  return useMutation({
    mutationFn: async ({ kind, file }: { kind: "cover" | "video"; file: File }) => {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post<Envelope<{ url: string }>>("/admin/course/upload", form, {
        params: { kind },
      });
      return res.data.data.url;
    },
  });
}

/** Everyone who started a checkout. Counts ignore the status filter. */
export function useAdminEnrollments(query: EnrollmentsQuery) {
  return useQuery({
    queryKey: [...ENROLLMENTS_KEY, query],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await api.get<Envelope<EnrollmentsPage>>("/admin/course/enrollments", {
        params: { q: query.q || undefined, status: query.status, page: query.page, limit: ENROLLMENTS_PAGE_SIZE },
      });
      return res.data.data;
    },
  });
}
