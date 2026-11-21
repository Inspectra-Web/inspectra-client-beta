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

/**
 * A lesson as the admin sees it. Its video is an uploaded file (`stored`) or a `link`;
 * `videoUrl` is where it plays from right now (an uploaded file's address expires within
 * the hour). A lesson with no video is hidden from realtors.
 */
export interface AdminLesson extends LessonOutline {
  hasVideo: boolean;
  stored: boolean;
  link: string;
  videoUrl: string;
}

/** The admin's view: every lesson, and whether uploads can go to video storage. */
export interface AdminCourse extends Omit<PublicCourse, "lessons"> {
  lessons: AdminLesson[];
  videoStorage: boolean;
}

/** A lesson as a paid realtor sees it. An uploaded file's address expires within the hour. */
export interface LearnerLesson extends LessonOutline {
  videoUrl: string;
}

export interface LearnerCourseView extends Omit<PublicCourse, "lessons"> {
  lessons: LearnerLesson[];
}

/** The course's own details, saved whole. Status and lessons have their own writes. */
export type CourseBody = Pick<AdminCourse, "title" | "subtitle" | "description" | "cover" | "price">;

/**
 * One lesson's details, saved whole. `videoUrl` is its link; empty keeps an uploaded file.
 * An uploaded file goes up separately, through `uploadLessonVideo`.
 */
export interface LessonBody {
  title: string;
  summary: string;
  videoUrl: string;
  minutes: number;
}

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
  /** The LambaCard payout. Absent before payment, and on courses paid before payouts began. */
  incentive?: EnrollmentIncentive;
}

export type IncentiveStatus = "due" | "sending" | "sent";

export interface EnrollmentIncentive {
  status: IncentiveStatus;
  amount: number;
  sentAt?: string;
  transferRef: string;
  /** Whether it went out is unknown; only Flutterwave's dashboard can say. */
  needsCheck: boolean;
}

/** What the player knows about the person watching. */
export type LearnerEnrollment = Omit<Enrollment, "phone" | "reference" | "amount" | "incentive">;

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
  /** An old guest buyer's sign-up invite; null for everyone with an account. */
  invite: string | null;
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

/** An old guest buyer's sign-up invite, valid until used. */
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
}

/** Adds a lesson, or saves one whole. Answers with the course, the saved lesson last if new. */
export function useSaveLesson() {
  return useAdminCourseWrite(async ({ id, body }: SaveLessonInput) => {
    const res = id
      ? await api.put<Envelope<{ course: AdminCourse }>>(`/admin/course/lessons/${id}`, body)
      : await api.post<Envelope<{ course: AdminCourse }>>("/admin/course/lessons", body);
    return res.data.data.course;
  });
}

/** The largest lesson video the API accepts. */
export const LESSON_VIDEO_MAX_BYTES = 5 * 1024 * 1024 * 1024;
/** Parts sent at once. More would not be faster on a slow connection, only flakier. */
const PARALLEL_PARTS = 3;
/** Tries per part before the upload gives up. */
const PART_TRIES = 4;

export interface LessonUploadProgress {
  loaded: number;
  total: number;
}

/**
 * Uploads a lesson's video straight from this browser to video storage, in parts, so a
 * large file never passes through the API. A part that fails is sent again on its own,
 * with a growing pause between tries; `signal` cancels the upload, and storage drops the
 * parts already sent. Resolves with the course once the file is the lesson's video.
 */
export async function uploadLessonVideo({
  lessonId,
  file,
  minutes,
  onProgress,
  signal,
}: {
  lessonId: string;
  file: File;
  minutes: number;
  onProgress: (progress: LessonUploadProgress) => void;
  signal: AbortSignal;
}): Promise<AdminCourse> {
  const base = `/admin/course/lessons/${lessonId}/upload`;
  const start = await api.post<Envelope<{ uploadId: string; partSize: number; partCount: number }>>(base, {
    fileName: file.name,
    contentType: file.type || "video/mp4",
    size: file.size,
  });
  const { uploadId, partSize, partCount } = start.data.data;

  const sent = new Map<number, number>();
  const report = () =>
    onProgress({ loaded: [...sent.values()].reduce((sum, n) => sum + n, 0), total: file.size });

  const sendPart = async (partNumber: number): Promise<{ partNumber: number; etag: string }> => {
    const blob = file.slice((partNumber - 1) * partSize, partNumber * partSize);

    for (let attempt = 1; ; attempt++) {
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      try {
        // Signed per try: a slow retry must not outlive its address.
        const signed = await api.post<Envelope<{ parts: { partNumber: number; url: string }[] }>>(
          `${base}/parts`,
          { uploadId, partNumbers: [partNumber] },
        );
        const url = signed.data.data.parts[0]?.url;
        if (!url) throw new Error("No address for the part");

        const etag = await putPart(url, blob, signal, (loaded) => {
          sent.set(partNumber, loaded);
          report();
        });
        sent.set(partNumber, blob.size);
        report();
        return { partNumber, etag };
      } catch (error) {
        if (signal.aborted || attempt >= PART_TRIES) throw error;
        sent.set(partNumber, 0);
        report();
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      }
    }
  };

  try {
    const queue = Array.from({ length: partCount }, (_, i) => i + 1);
    const parts: { partNumber: number; etag: string }[] = [];
    await Promise.all(
      Array.from({ length: Math.min(PARALLEL_PARTS, partCount) }, async () => {
        for (let next = queue.shift(); next !== undefined; next = queue.shift()) parts.push(await sendPart(next));
      }),
    );

    const done = await api.post<Envelope<{ course: AdminCourse }>>(`${base}/complete`, { uploadId, parts, minutes });
    return done.data.data.course;
  } catch (error) {
    // Best effort: storage also clears an abandoned upload on its own after a week.
    void api.post(`${base}/cancel`, { uploadId }).catch(() => undefined);
    throw error;
  }
}

/** PUTs one part to its signed address and answers with the ETag storage gives it. */
function putPart(
  url: string,
  blob: Blob,
  signal: AbortSignal,
  onLoaded: (loaded: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (event) => onLoaded(event.loaded);
    xhr.onload = () => {
      const etag = xhr.getResponseHeader("ETag");
      if (xhr.status >= 200 && xhr.status < 300 && etag) resolve(etag);
      else reject(new Error(`Part upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Part upload failed"));
    xhr.onabort = () => reject(new DOMException("Cancelled", "AbortError"));
    signal.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(blob);
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
