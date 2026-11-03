import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Clock, Eye, EyeOff, ImagePlus, Loader2, Play, Upload, X } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Panel } from "@/components/dashboard/Panel";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Input } from "@/components/ui/Input";
import { CourseTabs } from "@/components/course/CourseTabs";
import {
  ALL_ENROLLMENTS,
  useAdminCourse,
  useAdminEnrollments,
  useSaveCourse,
  useSetCourseStatus,
  COURSE_UPLOAD_MAX_MB,
  type Course,
} from "@/lib/course";
import { apiMessage } from "@/lib/api";
import { courseSchema, type CourseValues } from "@/lib/courseSchema";
import { formatDate, formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

export function AdminCourse() {
  const { data: course, isPending, isError } = useAdminCourse();

  if (isPending)
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-surface-2" />
        <div className="h-[26rem] animate-pulse rounded-3xl bg-surface-2" />
      </div>
    );

  if (isError || !course)
    return (
      <Panel>
        <p className="text-sm text-muted">The course could not be loaded. Refresh the page to try again.</p>
      </Panel>
    );

  return <CourseEditor course={course} />;
}

const valuesOf = (course: Course): CourseValues => ({
  title: course.title,
  subtitle: course.subtitle,
  description: course.description,
  cover: course.cover,
  videoUrl: course.videoUrl,
  minutes: course.minutes,
  price: course.price,
});

function CourseEditor({ course }: { course: Course }) {
  const save = useSaveCourse();
  const setStatus = useSetCourseStatus();
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [uploading, setUploading] = useState<Uploading | null>(null);
  // Picked but not yet uploaded: each file is previewed from a local link until Save sends it.
  const [pending, setPending] = useState<Partial<Record<"cover" | "video", Picked>>>({});
  const coverRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CourseValues>({ resolver: zodResolver(courseSchema), values: valuesOf(course) });

  const live = watch();

  // The length is read off the video itself whenever the video changes.
  // An uploaded video's length is read off the file; a pasted link's is typed in by the admin.
  const uploadedVideo = isUploadedVideo(live.videoUrl);
  const length = useVideoMinutes(uploadedVideo ? live.videoUrl : "", (minutes) => {
    if (minutes !== getValues("minutes"))
      setValue("minutes", minutes, { shouldDirty: true, shouldValidate: true });
  });
  const published = course.status === "published";

  // Local previews hold memory until released; release whatever is left on the way out.
  const pendingRef = useRef(pending);
  useEffect(() => {
    pendingRef.current = pending;
  });
  useEffect(() => () => releaseAll(pendingRef.current), []);

  function clearPending() {
    releaseAll(pending);
    setPending({});
  }

  // Kept in the browser until Save: nothing reaches storage for an edit that is discarded
  // or lost to a reload.
  function pick(field: "cover" | "videoUrl", files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    const kind = field === "cover" ? "cover" : "video";

    // Refused before a byte is sent: a long upload that fails at the end wastes the wait.
    if (file.size > COURSE_UPLOAD_MAX_MB * 1024 * 1024) {
      toast.error(
        `This ${kind} is ${Math.ceil(file.size / (1024 * 1024))} MB. The limit is ${COURSE_UPLOAD_MAX_MB} MB, so compress it or upload a shorter cut.`,
      );
      return;
    }

    const preview = URL.createObjectURL(file);
    const previous = pending[kind];
    if (previous) URL.revokeObjectURL(previous.preview);

    setPending((prev) => ({ ...prev, [kind]: { file, preview } }));
    setValue(field, preview, { shouldDirty: true, shouldValidate: true });
  }

  async function onSubmit(values: CourseValues) {
    // A picked file counts only while the field still shows it; a link pasted over it wins.
    const cover = pending.cover && values.cover === pending.cover.preview ? pending.cover.file : undefined;
    const video =
      pending.video && values.videoUrl === pending.video.preview ? pending.video.file : undefined;

    const body = {
      ...values,
      // The API fills these from the uploaded files; a local preview link means nothing to it.
      cover: cover ? course.cover : values.cover,
      videoUrl: video ? course.videoUrl : values.videoUrl,
    };

    const sending = video ?? cover;
    if (sending)
      setUploading({ kind: video ? "video" : "cover", loaded: 0, total: 0, startedAt: Date.now() });

    try {
      await save.mutateAsync({
        body,
        files: { cover, video },
        onProgress: ({ loaded, total }) =>
          setUploading((prev) => (prev ? { ...prev, loaded, total } : prev)),
      });
      clearPending();
      toast.success("Changes saved");
    } catch (error) {
      toast.error(apiMessage(error, "The changes were not saved. Try again."));
    } finally {
      setUploading(null);
    }
  }

  async function changeStatus(status: Course["status"]) {
    try {
      await setStatus.mutateAsync(status);
      toast.success(status === "published" ? "Published" : "Unpublished");
    } catch (error) {
      toast.error(apiMessage(error, "The status did not change. Try again."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header ----------------------------------------------------------- */}
      <header className="flex items-end justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-faint">
            Realtor acquisition
          </p>
          <h1 className="display mt-1 text-3xl text-ink max-sm:text-2xl">Course</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-faint max-md:hidden">Updated {formatDate(course.updatedAt)}</span>
          <StatusPill status={course.status} />
          {published ? (
            <button
              type="button"
              onClick={() => setConfirmUnpublish(true)}
              className={buttonClasses("outline", "md")}
            >
              <EyeOff className="size-4" aria-hidden /> Unpublish
            </button>
          ) : (
            <button
              type="button"
              disabled={!course.videoUrl || isDirty || setStatus.isPending}
              title={isDirty ? "Save your changes before publishing" : undefined}
              onClick={() => changeStatus("published")}
              className={cn(buttonClasses("brand", "md"), "min-w-32")}
            >
              {setStatus.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <>
                  <Eye className="size-4" aria-hidden /> Publish
                </>
              )}
            </button>
          )}
        </div>
      </header>

      <CourseTabs />


      {/* Stage: the course as a realtor will see it ----------------------- */}
      <Stage
        values={live}
        onReplaceCover={() => coverRef.current?.click()}
        onReplaceVideo={() => videoRef.current?.click()}
        uploading={uploading}
      />
      <input
        ref={coverRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          pick("cover", e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={(e) => {
          pick("videoUrl", e.target.files);
          e.target.value = "";
        }}
      />

      <Funnel />

      {/* Spec sheet ------------------------------------------------------- */}
      <section className="rounded-2xl border border-line bg-surface">
        <div className="flex items-baseline justify-between gap-4 border-b border-line px-6 py-4 max-sm:px-5">
          <h2 className="text-base font-semibold text-ink">What the realtor sees</h2>
          <p className="text-xs text-faint max-sm:hidden">The preview above updates as you type</p>
        </div>

        <dl className="divide-y divide-line">
          <Row label="Title" htmlFor="title" error={errors.title?.message}>
            <Input id="title" {...register("title")} />
          </Row>
          <Row label="Subtitle" htmlFor="subtitle" note="One line under the title" error={errors.subtitle?.message}>
            <Input id="subtitle" {...register("subtitle")} />
          </Row>
          <Row
            label="Description"
            htmlFor="description"
            note={`${live.description.length} characters`}
            error={errors.description?.message}
          >
            <textarea
              id="description"
              rows={4}
              className="w-full resize-y rounded-2xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              {...register("description")}
            />
          </Row>
          <Row
            label="Video"
            htmlFor="videoUrl"
            note={`Paste a link or upload a file up to ${COURSE_UPLOAD_MAX_MB} MB`}
            error={errors.videoUrl?.message}
          >
            <div className="flex gap-2 max-sm:flex-col">
              <Input id="videoUrl" placeholder="https://" {...register("videoUrl")} />
              <button
                type="button"
                disabled={uploading !== null}
                onClick={() => videoRef.current?.click()}
                className={cn(buttonClasses("outline", "md"), "shrink-0")}
              >
                <Upload className="size-4" aria-hidden /> Upload
              </button>
            </div>
            {uploading?.kind === "video" ? (
              <UploadStatus uploading={uploading} />
            ) : (
              pending.video &&
              live.videoUrl === pending.video.preview && <PendingNote picked={pending.video} />
            )}
          </Row>
          <Row label="Cover image" note="Shown before the video plays" error={errors.cover?.message}>
            <button
              type="button"
              disabled={uploading !== null}
              onClick={() => coverRef.current?.click()}
              className={buttonClasses("outline", "md")}
            >
              <ImagePlus className="size-4" aria-hidden /> {live.cover ? "Replace cover" : "Upload cover"}
            </button>
            {uploading?.kind === "cover" ? (
              <UploadStatus uploading={uploading} />
            ) : (
              pending.cover &&
              live.cover === pending.cover.preview && <PendingNote picked={pending.cover} />
            )}
          </Row>
          {live.videoUrl && !uploadedVideo ? (
            <Row
              label="Length"
              htmlFor="minutes"
              note="In minutes, for a linked video"
              error={errors.minutes?.message}
            >
              <Input
                id="minutes"
                type="number"
                min={1}
                inputMode="numeric"
                className="w-32"
                {...register("minutes", { valueAsNumber: true })}
              />
            </Row>
          ) : (
          <Row label="Length" note="Read from the video" error={errors.minutes?.message}>
            <p className="flex min-h-11 items-center gap-2 text-sm" aria-live="polite">
              {length === "reading" ? (
                <>
                  <Loader2 className="size-4 animate-spin text-muted" aria-hidden />
                  <span className="text-muted">Reading the video</span>
                </>
              ) : length === "failed" ? (
                <span className="text-gold">
                  Could not read the length from this video. Check the link or upload it again.
                </span>
              ) : live.videoUrl ? (
                <>
                  <Clock className="size-4 text-muted" aria-hidden />
                  <span className="font-semibold tabular-nums text-ink">{live.minutes} min</span>
                </>
              ) : (
                <span className="text-muted">Add a video and its length appears here.</span>
              )}
            </p>
          </Row>
          )}
          <Row label="Price" htmlFor="price" note="Paid once per realtor, in naira" error={errors.price?.message}>
            <Input
              id="price"
              type="number"
              min={100}
              step={100}
              className="w-44"
              {...register("price", { valueAsNumber: true })}
            />
          </Row>
        </dl>
      </section>

      <SaveBar dirty={isDirty} saving={isSubmitting} onDiscard={() => {
          clearPending();
          reset(valuesOf(course));
        }} />

      <ConfirmDialog
        open={confirmUnpublish}
        onOpenChange={setConfirmUnpublish}
        title="Unpublish the course?"
        description="The course page will say it opens soon and nobody new can pay for it. Realtors who already paid can still watch."
        confirmLabel="Unpublish"
        destructive
        pending={setStatus.isPending}
        onConfirm={() => changeStatus("draft")}
      />
    </form>
  );
}

/* Stage ---------------------------------------------------------------------- */

function Stage({
  values,
  onReplaceCover,
  onReplaceVideo,
  uploading,
}: {
  values: CourseValues;
  onReplaceCover: () => void;
  onReplaceVideo: () => void;
  uploading: Uploading | null;
}) {
  const [playing, setPlaying] = useState(false);
  const price = Number.isFinite(values.price) ? formatPriceFull(values.price) : "₦";
  const minutes = Number.isFinite(values.minutes) ? values.minutes : 0;

  return (
    <section
      aria-label="Course preview"
      className="relative isolate overflow-hidden rounded-3xl bg-[#05121c] text-white"
    >
      {playing && values.videoUrl ? (
        <div className="relative aspect-[21/9] w-full bg-black max-lg:aspect-video">
          <video
            key={values.videoUrl}
            src={values.videoUrl}
            poster={values.cover}
            controls
            autoPlay
            className="size-full"
          />
          <button
            type="button"
            onClick={() => setPlaying(false)}
            aria-label="Close the video"
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : (
        <div className="relative grid min-h-[26rem] grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-end gap-10 p-10 max-lg:grid-cols-1 max-lg:gap-8 max-sm:min-h-0 max-sm:p-6">
          {values.cover && (
            <img src={values.cover} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
          )}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,#05121c_8%,rgba(5,18,28,0.88)_45%,rgba(5,18,28,0.35)_100%)] max-lg:bg-[linear-gradient(0deg,#05121c_30%,rgba(5,18,28,0.6)_100%)]"
          />

          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#7ad4ff]">
              <span>Realtor course</span>
              <span className="h-px w-6 bg-white/30" aria-hidden />
              <span className="inline-flex items-center gap-1 text-white/70">
                <Clock className="size-3.5" aria-hidden /> {minutes} min video
              </span>
            </p>
            <h2 className="display mt-4 text-[2.6rem] leading-[1.04] tracking-[-0.02em] text-balance max-xl:text-4xl max-sm:text-[1.75rem]">
              {values.title || "Untitled course"}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 max-sm:text-sm">
              {values.subtitle}
            </p>
          </div>

          <div className="flex flex-col items-start gap-6 justify-self-end max-lg:justify-self-start">
            <PlayButton disabled={!values.videoUrl} onClick={() => setPlaying(true)} />
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/55">
                One payment
              </p>
              <p className="display mt-1 text-5xl tabular-nums tracking-[-0.03em] max-sm:text-4xl">{price}</p>
              <p className="mt-2 text-sm text-white/60">Watch to the end to unlock registration</p>
            </div>
          </div>

          <div className="absolute right-5 top-5 flex gap-2 max-sm:right-4 max-sm:top-4">
            <StageChip onClick={onReplaceCover} disabled={uploading !== null}>
              <ImagePlus className="size-3.5" aria-hidden />
              {uploading?.kind === "cover" ? chipLabel(uploading) : "Cover"}
            </StageChip>
            <StageChip onClick={onReplaceVideo} disabled={uploading !== null}>
              <Upload className="size-3.5" aria-hidden />
              {uploading?.kind === "video" ? chipLabel(uploading) : "Video"}
            </StageChip>
          </div>
        </div>
      )}
    </section>
  );
}

function PlayButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  const reduce = useReducedMotion();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex items-center gap-4 text-left disabled:opacity-40"
    >
      <span className="relative grid size-16 place-items-center rounded-full bg-brand text-[#04121f] shadow-[0_12px_40px_-10px_rgba(26,172,240,0.9)] transition-transform duration-300 group-hover:scale-105">
        {!reduce && !disabled && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-brand"
            animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <Play className="ml-0.5 size-6 fill-current" aria-hidden />
      </span>
      <span className="text-sm font-semibold text-white">
        {disabled ? "Add a video to preview" : "Preview the video"}
      </span>
    </button>
  );
}

function StageChip({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tabular-nums text-white ring-1 ring-white/20 backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-80"
    >
      {children}
    </button>
  );
}

/* Funnel: the realtor's path, with where people actually are ---------------- */

function Funnel() {
  const { data } = useAdminEnrollments(ALL_ENROLLMENTS);

  const paid = data ? data.counts.paid + data.counts.completed : null;
  const watched = data?.counts.completed ?? null;
  const registered = data?.registered ?? null;

  const steps = [
    { label: "Paid", value: paid, of: null, note: data ? `${data.counts.pending} started checkout` : "" },
    { label: "Watched", value: watched, of: paid, note: "Invite unlocked" },
    { label: "Registered", value: registered, of: watched, note: "Joined as a realtor" },
  ];

  return (
    <ol className="grid grid-cols-3 overflow-hidden rounded-2xl border border-line bg-surface max-md:grid-cols-1">
      {steps.map((step, i) => {
        const rate = step.of && step.value !== null ? Math.round((step.value / step.of) * 100) : null;
        return (
          <li
            key={step.label}
            className={cn(
              "relative px-6 py-5 max-sm:px-5",
              i > 0 && "border-l border-line max-md:border-l-0 max-md:border-t",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-medium text-muted">
                <span className="grid size-5 place-items-center rounded-full bg-surface-2 text-[0.68rem] font-semibold tabular-nums text-ink">
                  {i + 1}
                </span>
                {step.label}
              </p>
              {rate !== null && (
                <span className="text-xs font-semibold tabular-nums text-brand-ink">{rate}% of previous</span>
              )}
            </div>
            <p className="display mt-3 text-3xl tabular-nums text-ink">
              {step.value ?? <span className="inline-block h-8 w-10 animate-pulse rounded-lg bg-surface-2" />}
            </p>
            <p className="mt-1 text-xs text-faint">{step.note}</p>
          </li>
        );
      })}
    </ol>
  );
}

/* Spec sheet row ------------------------------------------------------------- */

function Row({
  label,
  htmlFor,
  note,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  note?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[13rem_minmax(0,1fr)] gap-6 px-6 py-5 max-md:grid-cols-1 max-md:gap-2 max-sm:px-5">
      <dt>
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
            {label}
          </label>
        ) : (
          <span className="text-sm font-medium text-ink">{label}</span>
        )}
        {note && <p className="mt-0.5 text-xs text-faint">{note}</p>}
      </dt>
      <dd className="min-w-0">
        {children}
        {error && <p className="mt-1.5 text-[13px] text-rose-500">{error}</p>}
      </dd>
    </div>
  );
}

/* Save bar: only there when something changed -------------------------------- */

function SaveBar({ dirty, saving, onDiscard }: { dirty: boolean; saving: boolean; onDiscard: () => void }) {
  return (
    <AnimatePresence>
      {dirty && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="sticky bottom-6 z-20 mx-auto flex w-fit items-center gap-4 rounded-full border border-line bg-surface/95 py-2 pl-5 pr-2 shadow-[0_18px_40px_-20px_rgba(10,30,45,0.35)] backdrop-blur-xl max-sm:w-full max-sm:justify-between"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <span className="size-2 rounded-full bg-gold" aria-hidden /> Unsaved changes
          </span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={onDiscard} className={buttonClasses("ghost", "sm")}>
              Discard
            </button>
            <button type="submit" disabled={saving} className={cn(buttonClasses("brand", "sm"), "min-w-32")}>
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Save changes"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Upload progress ------------------------------------------------------------ */

/** A file on its way up. `loaded` and `total` are bytes, browser to API. */
interface Uploading {
  kind: "cover" | "video";
  loaded: number;
  total: number;
  startedAt: number;
}

const percentOf = ({ loaded, total }: Uploading) =>
  total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;

// Once every byte has reached the API it is still handing the file to Cloudinary,
// which reports nothing, so the bar says so instead of sitting at 100%.
const sent = (u: Uploading) => u.total > 0 && u.loaded >= u.total;

const chipLabel = (u: Uploading) => (sent(u) ? "Processing" : `${percentOf(u)}%`);

const megabytes = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/** Time left from the average speed so far. Quiet for the first two seconds, while it is noise. */
function timeLeft(u: Uploading): string | null {
  const elapsed = (Date.now() - u.startedAt) / 1000;
  if (elapsed < 2 || u.loaded === 0) return null;

  const seconds = Math.ceil((u.total - u.loaded) / (u.loaded / elapsed));
  if (seconds < 60) return `about ${Math.max(1, seconds)} sec left`;
  return `about ${Math.ceil(seconds / 60)} min left`;
}

function UploadStatus({ uploading }: { uploading: Uploading }) {
  const pct = percentOf(uploading);
  const done = sent(uploading);
  const left = timeLeft(uploading);

  return (
    <div className="mt-3" role="status" aria-live="polite">
      <div
        className="h-2 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-label={uploading.kind === "video" ? "Video upload" : "Cover upload"}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full bg-brand transition-[width] duration-300",
            done && "animate-pulse",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs tabular-nums text-muted">
        {done ? (
          <>
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Processing on the server. This can take a little longer for a large video.
          </>
        ) : (
          <>
            <span className="font-semibold text-ink">{pct}%</span>
            <span>
              {megabytes(uploading.loaded)} of {megabytes(uploading.total)}
            </span>
            {left && <span>· {left}</span>}
          </>
        )}
      </p>
    </div>
  );
}

/* Video length ----------------------------------------------------------------- */

/** A file picked in this browser, or one stored in the course's own Cloudinary folder. */
const isUploadedVideo = (url: string): boolean =>
  url.startsWith("blob:") ||
  /^https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/(?:v\d+\/)?inspectra\/course\//.test(url);

type LengthState = "idle" | "reading" | "read" | "failed";

/**
 * Loads only the video's metadata and reports its length in whole minutes, rounded up so
 * a 7:10 video reads "8 min". Duration needs no CORS, so a pasted link works as well as
 * an upload.
 */
function useVideoMinutes(url: string, onMinutes: (minutes: number) => void): LengthState {
  const [state, setState] = useState<LengthState>("idle");
  const latest = useRef(onMinutes);

  useEffect(() => {
    latest.current = onMinutes;
  });

  useEffect(() => {
    if (!url) {
      setState("idle");
      return;
    }

    let cancelled = false;
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.muted = true;

    probe.onloadedmetadata = () => {
      if (cancelled) return;
      const seconds = probe.duration;
      if (!Number.isFinite(seconds) || seconds <= 0) {
        setState("failed");
        return;
      }
      latest.current(Math.max(1, Math.ceil(seconds / 60)));
      setState("read");
    };
    probe.onerror = () => {
      if (!cancelled) setState("failed");
    };

    setState("reading");
    probe.src = url;

    return () => {
      cancelled = true;
      probe.removeAttribute("src");
      probe.load();
    };
  }, [url]);

  return state;
}

/* Picked files ------------------------------------------------------------------ */

/** A file chosen in the browser, with the local link the preview and length read from. */
interface Picked {
  file: File;
  preview: string;
}

const releaseAll = (pending: Partial<Record<"cover" | "video", Picked>>) => {
  for (const picked of Object.values(pending)) if (picked) URL.revokeObjectURL(picked.preview);
};

function PendingNote({ picked }: { picked: Picked }) {
  return (
    <p className="mt-2 text-xs text-muted">
      <span className="font-semibold text-ink">{picked.file.name}</span> ·{" "}
      {megabytes(picked.file.size)}
    </p>
  );
}
