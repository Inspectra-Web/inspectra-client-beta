import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  ArrowDown,
  ArrowUp,
  CircleAlert,
  Clock,
  Film,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import {
  COURSE_UPLOAD_MAX_MB,
  useDeleteLesson,
  useReorderLessons,
  useSaveLesson,
  type AdminCourse,
  type AdminLesson,
} from "@/lib/course";
import { apiMessage } from "@/lib/api";
import { lessonSchema, type LessonValues } from "@/lib/courseSchema";
import { cn } from "@/lib/cn";
import {
  PendingNote,
  UploadStatus,
  startUpload,
  tooLarge,
  type Picked,
  type Uploading,
} from "./courseUpload";
import { LessonVideo, videoSource } from "./LessonVideo";

/** Matches MAX_LESSONS on the server. */
const MAX_LESSONS = 12;

/** Which lesson the dialog is open on: a new one, or an existing one by value. */
type Editing = { lesson: AdminLesson | null } | null;

/**
 * The course's lessons, in the order realtors watch them. Each write saves straight away,
 * separate from the course details above, so there is nothing here for the save bar.
 */
export function LessonsPanel({ course }: { course: AdminCourse }) {
  const reorder = useReorderLessons();
  const remove = useDeleteLesson();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<AdminLesson | null>(null);

  const lessons = course.lessons;
  const full = lessons.length >= MAX_LESSONS;

  function move(index: number, step: -1 | 1) {
    const ids = lessons.map((lesson) => lesson.id);
    const target = index + step;
    const [moved] = ids.splice(index, 1);
    if (!moved) return;
    ids.splice(target, 0, moved);

    reorder.mutate(ids, {
      onError: (error) => toast.error(apiMessage(error, "The order did not change. Try again.")),
    });
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success("Lesson deleted");
      setDeleting(null);
    } catch (error) {
      toast.error(apiMessage(error, "The lesson was not deleted. Try again."));
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 max-sm:flex-col max-sm:items-start max-sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-ink">Lessons</h2>
          <p className="mt-0.5 text-xs text-faint">
            Realtors watch them in this order, each one to the end.
          </p>
        </div>
        <button
          type="button"
          disabled={full}
          title={full ? `A course holds at most ${MAX_LESSONS} lessons` : undefined}
          onClick={() => setEditing({ lesson: null })}
          className={cn(buttonClasses("brand", "md"), "shrink-0")}
        >
          <Plus className="size-4" aria-hidden /> Add lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="px-6 py-12 text-center max-sm:px-5">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-2 text-faint">
            <Film className="size-5" aria-hidden />
          </span>
          <p className="mt-4 font-medium text-ink">No lessons yet</p>
          <p className="mt-1 text-sm text-muted">Add the first lesson and its video. The course needs one to publish.</p>
        </div>
      ) : (
        <ol className="divide-y divide-line">
          {lessons.map((lesson, i) => (
            <li key={lesson.id} className="flex items-center gap-4 px-6 py-4 max-sm:flex-wrap max-sm:px-5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold tabular-nums text-ink">
                {i + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{lesson.title || "Untitled lesson"}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Clock className="size-3.5" aria-hidden /> {lesson.minutes} min
                  </span>
                  {lesson.videoUrl ? (
                    <span className="inline-flex items-center gap-1">
                      <Film className="size-3.5" aria-hidden /> Video added
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gold">
                      <CircleAlert className="size-3.5" aria-hidden /> No video yet
                    </span>
                  )}
                  {lesson.summary && <span className="min-w-0 truncate">{lesson.summary}</span>}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <IconButton
                  label="Move up"
                  disabled={i === 0 || reorder.isPending}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp className="size-4" aria-hidden />
                </IconButton>
                <IconButton
                  label="Move down"
                  disabled={i === lessons.length - 1 || reorder.isPending}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown className="size-4" aria-hidden />
                </IconButton>
                <IconButton label="Edit lesson" onClick={() => setEditing({ lesson })}>
                  <Pencil className="size-4" aria-hidden />
                </IconButton>
                <IconButton label="Delete lesson" onClick={() => setDeleting(lesson)}>
                  <Trash2 className="size-4" aria-hidden />
                </IconButton>
              </div>
            </li>
          ))}
        </ol>
      )}

      {editing && <LessonDialog lesson={editing.lesson} onClose={() => setEditing(null)} />}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this lesson?"
        description={`"${deleting?.title || "Untitled lesson"}" is removed, and its video too if it was uploaded here. Realtors who already watched it keep their place.`}
        confirmLabel="Delete lesson"
        destructive
        pending={remove.isPending}
        onConfirm={confirmDelete}
      />
    </section>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

/* Add or edit one lesson --------------------------------------------------------- */

const blank: LessonValues = { title: "", summary: "", videoUrl: "", minutes: 0 };

function LessonDialog({ lesson, onClose }: { lesson: AdminLesson | null; onClose: () => void }) {
  const save = useSaveLesson();
  const [picked, setPicked] = useState<Picked | null>(null);
  const [uploading, setUploading] = useState<Uploading | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LessonValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: lesson
      ? { title: lesson.title, summary: lesson.summary, videoUrl: lesson.videoUrl, minutes: lesson.minutes }
      : blank,
  });

  const videoUrl = watch("videoUrl").trim();
  const source = videoSource(videoUrl);

  // The preview follows the link once typing pauses, so a YouTube player is not rebuilt
  // on every keystroke. A picked file shows at once.
  const [previewUrl, setPreviewUrl] = useState(videoUrl);
  useEffect(() => {
    const timer = setTimeout(() => setPreviewUrl(videoUrl), videoUrl.startsWith("blob:") ? 0 : 600);
    return () => clearTimeout(timer);
  }, [videoUrl]);

  // Whatever plays the video reports its length, uploads and links alike; the field stays
  // editable for a player that does not.
  const [lengthRead, setLengthRead] = useState(false);
  function onDuration(seconds: number) {
    const read = Math.max(1, Math.ceil(seconds / 60));
    setLengthRead(true);
    if (read !== getValues("minutes")) setValue("minutes", read, { shouldValidate: true });
  }

  // The local preview holds memory until released.
  useEffect(() => () => {
    if (picked) URL.revokeObjectURL(picked.preview);
  }, [picked]);

  function pick(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    const problem = tooLarge(file, "video");
    if (problem) {
      toast.error(problem);
      return;
    }

    const preview = URL.createObjectURL(file);
    setPicked({ file, preview });
    setValue("videoUrl", preview, { shouldValidate: true });
  }

  async function onSubmit(values: LessonValues) {
    // A picked file counts only while the field still shows it; a link pasted over it wins.
    const video = picked && values.videoUrl === picked.preview ? picked.file : undefined;

    if (video) setUploading(startUpload());
    try {
      await save.mutateAsync({
        id: lesson?.id,
        // The API fills the link from the uploaded file; a local preview means nothing to it.
        body: { ...values, videoUrl: video ? (lesson?.videoUrl ?? "") : values.videoUrl },
        video,
        onProgress: ({ loaded, total }) =>
          setUploading((prev) => (prev ? { ...prev, loaded, total } : prev)),
      });
      toast.success(lesson ? "Lesson saved" : "Lesson added");
      onClose();
    } catch (error) {
      toast.error(apiMessage(error, "The lesson was not saved. Try again."));
    } finally {
      setUploading(null);
    }
  }

  const busy = isSubmitting || uploading !== null;

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent closeLabel="Close" className="max-w-xl">
        <DialogTitle>{lesson ? "Edit lesson" : "Add a lesson"}</DialogTitle>
        <DialogDescription>
          Each lesson is one video. Realtors cannot skip ahead within it or past it.
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <Field label="Title" htmlFor="lesson-title" error={errors.title?.message}>
            <Input id="lesson-title" placeholder="Blockchain technology" {...register("title")} />
          </Field>

          <Field label="Summary" htmlFor="lesson-summary" note="Optional, a line or two" error={errors.summary?.message}>
            <textarea
              id="lesson-summary"
              rows={2}
              className="w-full resize-y rounded-2xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              {...register("summary")}
            />
          </Field>

          <Field
            label="Video"
            htmlFor="lesson-video"
            note={`A YouTube, Vimeo or video link, or a file up to ${COURSE_UPLOAD_MAX_MB} MB`}
            error={errors.videoUrl?.message}
          >
            <div className="flex gap-2 max-sm:flex-col">
              <Input id="lesson-video" placeholder="https://youtu.be/…" {...register("videoUrl")} />
              <button
                type="button"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                className={cn(buttonClasses("outline", "md"), "shrink-0")}
              >
                <Upload className="size-4" aria-hidden /> Upload
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(e) => {
                pick(e.target.files);
                e.target.value = "";
              }}
            />
            {uploading ? (
              <UploadStatus uploading={uploading} label="Video upload" />
            ) : (
              picked && videoUrl === picked.preview && <PendingNote picked={picked} />
            )}
            {source === "drive" ? (
              <p className="mt-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-ink">
                Google Drive links cannot play here: Drive does not let the course see where a
                realtor is in the video, so it could not keep the lessons in order. Upload the
                video to YouTube as <span className="font-semibold">Unlisted</span> and paste that
                link, or upload the file.
              </p>
            ) : (
              videoUrl &&
              !uploading && (
                <>
                  {source === "unknown" && (
                    <p className="mt-3 text-xs text-gold">
                      This link may not play. A YouTube, Vimeo or direct video link works best.
                    </p>
                  )}
                  {previewUrl === videoUrl && (
                    <LessonVideo key={previewUrl} src={previewUrl} onDuration={onDuration} className="mt-3 rounded-xl" />
                  )}
                </>
              )
            )}
          </Field>

          <Field
            label="Length"
            htmlFor="lesson-minutes"
            note={lengthRead ? "Read from the video" : "In minutes"}
            error={errors.minutes?.message}
          >
            <div className="flex items-center gap-3">
              <Input
                id="lesson-minutes"
                type="number"
                min={1}
                inputMode="numeric"
                className="w-32"
                {...register("minutes", { valueAsNumber: true })}
              />
              {videoUrl && !lengthRead && source !== "drive" && (
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <Clock className="size-3.5" aria-hidden />
                  {/* YouTube, Vimeo and Wistia only load, and so only know the length, once played. */}
                  {source === "youtube" || source === "vimeo" || source === "wistia"
                    ? "Press play on the preview to fill this in, or type it"
                    : "Filled in once the video loads"}
                </span>
              )}
            </div>
          </Field>

          <div className="flex justify-end gap-2 border-t border-line pt-5">
            <button type="button" disabled={busy} onClick={onClose} className={buttonClasses("ghost", "md")}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className={cn(buttonClasses("brand", "md"), "min-w-32")}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : lesson ? "Save lesson" : "Add lesson"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
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
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
            {label}
          </label>
        ) : (
          <span className="text-sm font-medium text-ink">{label}</span>
        )}
        {note && <span className="text-xs text-faint">{note}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-[13px] text-rose-500">{error}</p>}
    </div>
  );
}
