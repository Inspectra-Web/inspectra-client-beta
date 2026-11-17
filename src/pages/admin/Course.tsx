import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Clock, Eye, EyeOff, ImagePlus, ListVideo, Loader2, Play } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Panel } from "@/components/dashboard/Panel";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Input } from "@/components/ui/Input";
import { CourseTabs } from "@/components/course/CourseTabs";
import { LessonsPanel } from "@/components/course/LessonsPanel";
import {
  PendingNote,
  UploadStatus,
  chipLabel,
  startUpload,
  tooLarge,
  type Picked,
  type Uploading,
} from "@/components/course/courseUpload";
import {
  ALL_ENROLLMENTS,
  useAdminCourse,
  useAdminEnrollments,
  useSaveCourse,
  useSetCourseStatus,
  type AdminCourse as Course,
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
  price: course.price,
});

function CourseEditor({ course }: { course: Course }) {
  const save = useSaveCourse();
  const setStatus = useSetCourseStatus();
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [uploading, setUploading] = useState<Uploading | null>(null);
  // Picked but not yet uploaded: previewed from a local link until Save sends it.
  const [pendingCover, setPendingCover] = useState<Picked | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CourseValues>({ resolver: zodResolver(courseSchema), values: valuesOf(course) });

  const live = watch();
  const published = course.status === "published";
  const playable = course.lessons.some((lesson) => lesson.videoUrl);

  // The local preview holds memory until released.
  useEffect(() => () => {
    if (pendingCover) URL.revokeObjectURL(pendingCover.preview);
  }, [pendingCover]);

  // Kept in the browser until Save: nothing reaches storage for an edit that is discarded
  // or lost to a reload.
  function pickCover(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    const problem = tooLarge(file, "cover");
    if (problem) {
      toast.error(problem);
      return;
    }

    const preview = URL.createObjectURL(file);
    setPendingCover({ file, preview });
    setValue("cover", preview, { shouldDirty: true, shouldValidate: true });
  }

  async function onSubmit(values: CourseValues) {
    // A picked file counts only while the field still shows it.
    const cover = pendingCover && values.cover === pendingCover.preview ? pendingCover.file : undefined;

    // The API fills the link from the uploaded file; a local preview link means nothing to it.
    const body = { ...values, cover: cover ? course.cover : values.cover };

    if (cover) setUploading(startUpload());
    try {
      await save.mutateAsync({
        body,
        cover,
        onProgress: ({ loaded, total }) =>
          setUploading((prev) => (prev ? { ...prev, loaded, total } : prev)),
      });
      setPendingCover(null);
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
    <div className="space-y-6">
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
              disabled={course.lessons.length === 0 || isDirty || setStatus.isPending}
              title={
                isDirty
                  ? "Save your changes before publishing"
                  : course.lessons.length === 0
                    ? "Add a lesson before publishing"
                    : undefined
              }
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
        lessons={course.lessons.length}
        minutes={course.minutes}
        playable={playable}
        onReplaceCover={() => coverRef.current?.click()}
        uploading={uploading}
      />
      <input
        ref={coverRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          pickCover(e.target.files);
          e.target.value = "";
        }}
      />

      <Funnel />

      {/* Lessons: saved one at a time, apart from the details below -------- */}
      <LessonsPanel course={course} />

      {/* Spec sheet ------------------------------------------------------- */}
      <form onSubmit={handleSubmit(onSubmit)}>
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
            <Row label="Cover image" note="Shown on the course page" error={errors.cover?.message}>
              <button
                type="button"
                disabled={uploading !== null}
                onClick={() => coverRef.current?.click()}
                className={buttonClasses("outline", "md")}
              >
                <ImagePlus className="size-4" aria-hidden /> {live.cover ? "Replace cover" : "Upload cover"}
              </button>
              {uploading ? (
                <UploadStatus uploading={uploading} label="Cover upload" />
              ) : (
                pendingCover && live.cover === pendingCover.preview && <PendingNote picked={pendingCover} />
              )}
            </Row>
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

        <SaveBar
          dirty={isDirty}
          saving={isSubmitting}
          onDiscard={() => {
            setPendingCover(null);
            reset(valuesOf(course));
          }}
        />
      </form>

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
    </div>
  );
}

/* Stage ---------------------------------------------------------------------- */

function Stage({
  values,
  lessons,
  minutes,
  playable,
  onReplaceCover,
  uploading,
}: {
  values: CourseValues;
  lessons: number;
  minutes: number;
  playable: boolean;
  onReplaceCover: () => void;
  uploading: Uploading | null;
}) {
  const price = Number.isFinite(values.price) ? formatPriceFull(values.price) : "₦";

  return (
    <section
      aria-label="Course preview"
      className="relative isolate overflow-hidden rounded-3xl bg-[#05121c] text-white"
    >
      <div className="relative grid min-h-[26rem] grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-end gap-10 p-10 max-lg:grid-cols-1 max-lg:gap-8 max-sm:min-h-0 max-sm:p-6">
        {values.cover && (
          <img src={values.cover} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
        )}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,#05121c_8%,rgba(5,18,28,0.88)_45%,rgba(5,18,28,0.35)_100%)] max-lg:bg-[linear-gradient(0deg,#05121c_30%,rgba(5,18,28,0.6)_100%)]"
        />

        <div className="max-w-2xl">
          <p className="flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#7ad4ff]">
            <span>Realtor course</span>
            <span className="h-px w-6 bg-white/30" aria-hidden />
            <span className="inline-flex items-center gap-1 text-white/70">
              <ListVideo className="size-3.5" aria-hidden /> {lessons} {lessons === 1 ? "lesson" : "lessons"}
            </span>
            <span className="inline-flex items-center gap-1 text-white/70">
              <Clock className="size-3.5" aria-hidden /> {minutes} min
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
          <WatchButton playable={playable} />
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/55">
              One payment
            </p>
            <p className="display mt-1 text-5xl tabular-nums tracking-[-0.03em] max-sm:text-4xl">{price}</p>
            <p className="mt-2 text-sm text-white/60">Paying opens the realtor dashboard</p>
          </div>
        </div>

        <div className="absolute right-5 top-5 flex gap-2 max-sm:right-4 max-sm:top-4">
          <StageChip onClick={onReplaceCover} disabled={uploading !== null}>
            <ImagePlus className="size-3.5" aria-hidden />
            {uploading ? chipLabel(uploading) : "Cover"}
          </StageChip>
        </div>
      </div>
    </section>
  );
}

/** Goes to the Watch tab, where every lesson plays without the realtor's no-skip rule. */
function WatchButton({ playable }: { playable: boolean }) {
  const reduce = useReducedMotion();

  const inner = (
    <>
      <span className="relative grid size-16 place-items-center rounded-full bg-brand text-[#04121f] shadow-[0_12px_40px_-10px_rgba(26,172,240,0.9)] transition-transform duration-300 group-hover:scale-105">
        {!reduce && playable && (
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
        {playable ? "Watch the lessons" : "Add a lesson video to watch"}
      </span>
    </>
  );

  return playable ? (
    <Link to="/admin/course/watch" className="group flex items-center gap-4 text-left">
      {inner}
    </Link>
  ) : (
    <span className="flex items-center gap-4 opacity-40">{inner}</span>
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
  const joined = data?.registered ?? null;

  // Watching is not tracked, so the path ends at the dashboard opening.
  const steps = [
    { label: "Paid", value: paid, of: null, note: data ? `${data.counts.pending} started checkout` : "" },
    { label: "Joined", value: joined, of: paid, note: "Dashboard open, from the payment" },
  ];

  return (
    <ol className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-surface max-md:grid-cols-1">
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
          className="sticky bottom-6 z-20 mx-auto mt-6 flex w-fit items-center gap-4 rounded-full border border-line bg-surface/95 py-2 pl-5 pr-2 shadow-[0_18px_40px_-20px_rgba(10,30,45,0.35)] backdrop-blur-xl max-sm:w-full max-sm:justify-between"
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
