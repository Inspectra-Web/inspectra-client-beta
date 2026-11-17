import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";
import { ME_KEY } from "./auth";

/**
 * The paid realtor course: one teaser video on what INSPECTRA does for a realtor. The
 * admin uploads it, a prospective realtor opens their account and pays in one checkout,
 * and finishing the video opens their realtor console. Guests who paid before accounts
 * were opened at checkout still get a sign-up invite when the video ends.
 */

export type CourseStatus = "draft" | "published";
export type EnrollmentStatus = "pending" | "paid" | "completed";

/** A lesson as the sales page lists it: what it is, never the video. */
export interface LessonOutline {
  id: string;
  title: string;
  summary: string;
  minutes: number;
}

/** The sales page's view. No video links: the videos are what the payment buys. */
export interface PublicCourse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  /** Every lesson's length added up. */
  minutes: number;
  /** Naira. */
  price: number;
  status: CourseStatus;
  updatedAt: string;
  lessons: LessonOutline[];
}

/** A lesson as the admin sees it, video included. */
export interface AdminLesson extends LessonOutline {
  videoUrl: string;
}

/** The admin's view: every lesson with its video. */
export interface AdminCourse extends Omit<PublicCourse, "lessons"> {
  lessons: AdminLesson[];
}

/**
 * A lesson as a paid learner sees it. `videoUrl` is empty while the lesson is locked: the
 * API keeps a locked lesson's video back until the ones before it are watched.
 */
export interface LearnerLesson extends LessonOutline {
  watched: boolean;
  unlocked: boolean;
  videoUrl: string;
}

export interface LearnerCourseView extends Omit<PublicCourse, "lessons"> {
  lessons: LearnerLesson[];
}

/** The course's own details, saved whole. Status and lessons have their own writes. */
export type CourseBody = Pick<AdminCourse, "title" | "subtitle" | "description" | "cover" | "price">;

/** One lesson's details, saved whole. A new video file rides beside them. */
export type LessonBody = Omit<AdminLesson, "id">;

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
  /** Has an account: opened at checkout, or by a guest's invite. */
  registered: boolean;
  createdAt: string;
}

/** What the player knows about the person watching. */
export type LearnerEnrollment = Omit<Enrollment, "phone" | "reference" | "amount"> & {
  watchedLessons: string[];
};

export interface JoinCourseBody {
  fullname: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

/**
 * The signed-in realtor's own enrollment. `access` is null until it is paid for.
 * `dashboardOpened` is true when this very read opened a locked account that had paid.
 */
export interface MyEnrollment {
  enrollment: LearnerEnrollment | null;
  access: string | null;
  dashboardOpened: boolean;
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
  course: LearnerCourseView;
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
  /** Of everyone, how many watched and have an account: realtors who have joined. */
  registered: number;
}

export const COURSE_KEY = ["course"];
export const LEARN_KEY = ["course", "learn"];
export const MY_ENROLLMENT_KEY = ["course", "me"];
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

/** Opens the realtor account and the checkout in one submit. */
export function useJoinCourse() {
  return useMutation({
    mutationFn: async (body: JoinCourseBody) => {
      const res = await api.post<Envelope<EnrollResult>>("/course/join", body);
      return res.data.data;
    },
  });
}

/** A signed-in realtor whose console is still locked, paying from their account. */
export function useCourseCheckout() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<Envelope<EnrollResult>>("/course/checkout");
      return res.data.data;
    },
  });
}

/** The signed-in realtor's course: whether they have paid, and their link once they have. */
export function useMyEnrollment(enabled: boolean) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: MY_ENROLLMENT_KEY,
    enabled,
    queryFn: async () => {
      const res = await api.get<Envelope<MyEnrollment>>("/course/me");
      // The account's `courseLocked` just changed on the server: read it again.
      if (res.data.data.dashboardOpened) void queryClient.invalidateQueries({ queryKey: ME_KEY });
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
      // Paying opened a signed-in realtor's dashboard on the server: read the account again.
      void queryClient.invalidateQueries({ queryKey: ME_KEY });
      void queryClient.invalidateQueries({ queryKey: MY_ENROLLMENT_KEY });
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

/**
 * A lesson ended: marks it watched and answers with the course as it now stands, so the
 * next lesson arrives open with its video. The last one completes the enrollment, which
 * opens the dashboard of an account, or hands an old guest row its sign-up invite. Safe to
 * repeat.
 */
export function useFinishLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ access, lessonId }: { access: string; lessonId: string }) => {
      const res = await api.post<Envelope<LearnerCourse & { invite: string | null }>>(
        `/course/learn/${access}/lessons/${lessonId}/finish`,
      );
      return res.data.data;
    },
    onSuccess: ({ course, enrollment }, { access }) => {
      queryClient.setQueryData<LearnerCourse>([...LEARN_KEY, access], { course, enrollment });
      if (enrollment.status === "completed") {
        // The signed-in realtor's `courseLocked` may just have changed on the server.
        void queryClient.invalidateQueries({ queryKey: ME_KEY });
        void queryClient.invalidateQueries({ queryKey: MY_ENROLLMENT_KEY });
      }
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
      const res = await api.get<Envelope<{ course: AdminCourse }>>("/admin/course");
      return res.data.data.course;
    },
  });
}

function useAdminCourseWrite<V>(write: (vars: V) => Promise<AdminCourse>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: write,
    onSuccess: (course) => {
      queryClient.setQueryData(ADMIN_COURSE_KEY, course);
      void queryClient.invalidateQueries({ queryKey: COURSE_KEY, exact: true });
    },
  });
}

/** The largest course upload the API accepts, matching Cloudinary's Free-plan video cap. */
export const COURSE_UPLOAD_MAX_MB = 100;

/** How far the browser has got sending a save to the API. */
export interface UploadProgress {
  loaded: number;
  total: number;
}

export interface SaveCourseInput {
  body: CourseBody;
  /** A cover picked since the last save. It reaches storage only as part of this save. */
  cover?: File;
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * Saves the course's details with any new cover in one request. Files are not uploaded
 * when picked, so a reload or discard never leaves one in storage; the API deletes a file
 * it uploaded if the save then fails, and deletes a replaced one once it succeeds.
 * `onProgress` covers the browser-to-API leg; the API's hand-off to storage reports nothing.
 */
export function useSaveCourse() {
  return useAdminCourseWrite(async ({ body, cover, onProgress }: SaveCourseInput) => {
    const form = new FormData();
    form.append("course", JSON.stringify(body));
    if (cover) form.append("courseCover", cover);

    const res = await api.put<Envelope<{ course: AdminCourse }>>("/admin/course", form, {
      onUploadProgress: (event) =>
        onProgress?.({ loaded: event.loaded, total: event.total ?? 0 }),
    });
    return res.data.data.course;
  });
}

export interface SaveLessonInput {
  /** Absent for a new lesson. */
  id?: string;
  body: LessonBody;
  /** A video picked in the browser, sent with this save and only then. */
  video?: File;
  onProgress?: (progress: UploadProgress) => void;
}

/** Adds a lesson, or saves one whole, with any new video in the same request. */
export function useSaveLesson() {
  return useAdminCourseWrite(async ({ id, body, video, onProgress }: SaveLessonInput) => {
    const form = new FormData();
    form.append("lesson", JSON.stringify(body));
    if (video) form.append("lessonVideo", video);

    const res = await api.request<Envelope<{ course: AdminCourse }>>({
      method: id ? "put" : "post",
      url: id ? `/admin/course/lessons/${id}` : "/admin/course/lessons",
      data: form,
      onUploadProgress: (event) =>
        onProgress?.({ loaded: event.loaded, total: event.total ?? 0 }),
    });
    return res.data.data.course;
  });
}

/** Removes a lesson and its uploaded video. */
export function useDeleteLesson() {
  return useAdminCourseWrite(async (id: string) => {
    const res = await api.delete<Envelope<{ course: AdminCourse }>>(`/admin/course/lessons/${id}`);
    return res.data.data.course;
  });
}

/** Every lesson id, in the new order. */
export function useReorderLessons() {
  return useAdminCourseWrite(async (ids: string[]) => {
    const res = await api.put<Envelope<{ course: AdminCourse }>>("/admin/course/lessons/order", { ids });
    return res.data.data.course;
  });
}

export function useSetCourseStatus() {
  return useAdminCourseWrite(async (status: CourseStatus) => {
    const res = await api.patch<Envelope<{ course: AdminCourse }>>("/admin/course/status", { status });
    return res.data.data.course;
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
