import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  ArrowDown,
  ArrowUp,
  CircleAlert,
  Clock,
  Film,
  HardDrive,
  Link2,
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
  ADMIN_COURSE_KEY,
  COURSE_KEY,
  LESSON_VIDEO_MAX_BYTES,
  uploadLessonVideo,
  useDeleteLesson,
  useReorderLessons,
  useSaveLesson,
  type AdminCourse,
  type AdminLesson,
} from "@/lib/course";
import { apiMessage } from "@/lib/api";
import { lessonSchema, type LessonValues } from "@/lib/courseSchema";
import { cn } from "@/lib/cn";
import { UploadStatus, megabytes, startUpload, type Uploading } from "./courseUpload";
import { LessonVideo, videoSource, type VideoSource } from "./LessonVideo";

/** Matches MAX_LESSONS on the server. */
const MAX_LESSONS = 12;

const SOURCE_LABEL: Record<VideoSource, string> = {
  youtube: "YouTube link",
  vimeo: "Vimeo link",
  wistia: "Wistia link",
  drive: "Google Drive link",
  file: "Video link",
  unknown: "Link",
};

/** Which lesson the dialog is open on: a new one, or an existing one by value. */
type Editing = { lesson: AdminLesson | null } | null;

/**
 * The course's lessons, in the order realtors see them. Each write saves straight away,
 * separate from the course details, so there is nothing here for the save bar.
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
    const [moved] = ids.splice(index, 1);
    if (!moved) return;
    ids.splice(index + step, 0, moved);

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
            Realtors see them in this order and can watch any of them. A lesson shows once it
            has a video.
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
                  {lesson.stored ? (
                    <span className="inline-flex items-center gap-1">
                      <HardDrive className="size-3.5" aria-hidden /> Uploaded file
                    </span>
                  ) : lesson.link ? (
                    <span className="inline-flex items-center gap-1">
                      <Link2 className="size-3.5" aria-hidden /> {SOURCE_LABEL[videoSource(lesson.link)]}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gold">
                      <CircleAlert className="size-3.5" aria-hidden /> No video yet, hidden from realtors
                    </span>
                  )}
                  {lesson.summary && <span className="min-w-0 truncate">{lesson.summary}</span>}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <IconButton label="Move up" disabled={i === 0 || reorder.isPending} onClick={() => move(i, -1)}>
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

      {editing && (
        <LessonDialog lesson={editing.lesson} storage={course.videoStorage} onClose={() => setEditing(null)} />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this lesson?"
        description={`"${deleting?.title || "Untitled lesson"}" is removed, and its video too if it was uploaded here.`}
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
  children: ReactNode;
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

type Mode = "upload" | "link";
const MODES: Mode[] = ["upload", "link"];

function LessonDialog({
  lesson,
  storage,
  onClose,
}: {
  lesson: AdminLesson | null;
  storage: boolean;
  onClose: () => void;
}) {
  const save = useSaveLesson();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>(lesson?.link || !storage ? "link" : "upload");
  const [file, setFile] = useState<{ file: File; preview: string } | null>(null);
  const [uploading, setUploading] = useState<Uploading | null>(null);
  const abort = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LessonValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title ?? "",
      summary: lesson?.summary ?? "",
      videoUrl: lesson?.link ?? "",
      minutes: lesson?.minutes ?? 0,
    },
  });

  const link = watch("videoUrl").trim();
  const source = videoSource(link);

  // The link preview follows once typing pauses, so a YouTube player is not rebuilt on
  // every keystroke.
  const [previewLink, setPreviewLink] = useState(link);
  useEffect(() => {
    const timer = setTimeout(() => setPreviewLink(link), 600);
    return () => clearTimeout(timer);
  }, [link]);

  // The local preview holds memory until released.
  useEffect(() => () => {
    if (file) URL.revokeObjectURL(file.preview);
  }, [file]);

  const [lengthRead, setLengthRead] = useState(false);
  function onDuration(seconds: number) {
    const read = Math.max(1, Math.ceil(seconds / 60));
    setLengthRead(true);
    if (read !== getValues("minutes")) setValue("minutes", read, { shouldValidate: true });
  }

  function pick(files: FileList | null) {
    const picked = files?.[0];
    if (!picked) return;
    if (!picked.type.startsWith("video/")) {
      toast.error("Pick a video file.");
      return;
    }
    if (picked.size > LESSON_VIDEO_MAX_BYTES) {
      toast.error(`This video is ${megabytes(picked.size)}. The limit is 5 GB, so compress it first.`);
      return;
    }
    setLengthRead(false);
    setFile({ file: picked, preview: URL.createObjectURL(picked) });
  }

  async function onSubmit(values: LessonValues) {
    if (mode === "link" && !values.videoUrl) {
      setError("videoUrl", { message: "Paste the link, or switch to Upload a file" });
      return;
    }
    if (mode === "upload" && !file && !lesson?.stored) {
      toast.error("Choose a video file to upload, or use a link.");
      return;
    }

    try {
      // The details first; an upload then attaches its file to the saved lesson. Uploading
      // over a link keeps the link playing until the file is in.
      const course = await save.mutateAsync({
        id: lesson?.id,
        body: { ...values, videoUrl: mode === "link" ? values.videoUrl : (lesson?.link ?? "") },
      });

      if (mode === "upload" && file) {
        const lessonId = lesson?.id ?? course.lessons.at(-1)?.id;
        if (!lessonId) throw new Error("The lesson was not saved.");

        const controller = new AbortController();
        abort.current = controller;
        setUploading(startUpload());
        const updated = await uploadLessonVideo({
          lessonId,
          file: file.file,
          minutes: Math.max(1, values.minutes || 1),
          signal: controller.signal,
          onProgress: ({ loaded, total }) =>
            setUploading((prev) => (prev ? { ...prev, loaded, total } : prev)),
        });
        queryClient.setQueryData(ADMIN_COURSE_KEY, updated);
        void queryClient.invalidateQueries({ queryKey: COURSE_KEY, exact: true });
      }

      toast.success(lesson ? "Lesson saved" : "Lesson added");
      onClose();
    } catch (error) {
      if (abort.current?.signal.aborted) toast.info("Upload cancelled. The lesson details are saved.");
      else toast.error(apiMessage(error, "The video did not upload. Check your connection and try again."));
      void queryClient.invalidateQueries({ queryKey: ADMIN_COURSE_KEY });
    } finally {
      abort.current = null;
      setUploading(null);
    }
  }

  const busy = isSubmitting || uploading !== null;

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent closeLabel="Close" className="max-w-xl">
        <DialogTitle>{lesson ? "Edit lesson" : "Add a lesson"}</DialogTitle>
        <DialogDescription>
          Upload the video, or link to one. An uploaded video can only be watched inside
          INSPECTRA; a link can be opened anywhere.
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <Field label="Title" htmlFor="lesson-title" error={errors.title?.message}>
            <Input id="lesson-title" placeholder="Blockchain technology" disabled={busy} {...register("title")} />
          </Field>

          <Field label="Summary" htmlFor="lesson-summary" note="Optional, a line or two" error={errors.summary?.message}>
            <textarea
              id="lesson-summary"
              rows={2}
              disabled={busy}
              className="w-full resize-y rounded-2xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              {...register("summary")}
            />
          </Field>

          <div>
            <div role="tablist" aria-label="Video source" className="inline-flex rounded-full bg-surface-2 p-1">
              {MODES.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={mode === value}
                  disabled={busy || (value === "upload" && !storage)}
                  onClick={() => {
                    setMode(value);
                    setLengthRead(false);
                  }}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors disabled:opacity-50",
                    mode === value ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
                  )}
                >
                  {value === "upload" ? <Upload className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
                  {value === "upload" ? "Upload a file" : "Use a link"}
                </button>
              ))}
            </div>
            {!storage && <p className="mt-2 text-xs text-faint">Uploads are not set up on this server, so use a link.</p>}

            {mode === "upload" ? (
              <div className="mt-4">
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
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileRef.current?.click()}
                    className={buttonClasses("outline", "md")}
                  >
                    <Upload className="size-4" aria-hidden />
                    {file || lesson?.stored ? "Choose another file" : "Choose a video"}
                  </button>
                  <span className="text-xs text-faint">Up to 5 GB. Smaller files upload far faster.</span>
                </div>

                {file ? (
                  <p className="mt-2 text-xs text-muted">
                    <span className="font-semibold text-ink">{file.file.name}</span> · {megabytes(file.file.size)}
                  </p>
                ) : (
                  lesson?.stored && (
                    <p className="mt-2 text-xs text-muted">This lesson has an uploaded video. Choose a file to replace it.</p>
                  )
                )}

                {uploading ? (
                  <div className="mt-3">
                    <UploadStatus uploading={uploading} label="Video upload" />
                    <p className="mt-1 text-xs text-faint">Keep this window open until it finishes.</p>
                  </div>
                ) : file ? (
                  <LessonVideo key={file.preview} src={file.preview} onDuration={onDuration} className="mt-3 rounded-xl" />
                ) : (
                  lesson?.stored && lesson.videoUrl && <LessonVideo src={lesson.videoUrl} className="mt-3 rounded-xl" />
                )}
              </div>
            ) : (
              <div className="mt-4">
                <Field
                  label="Link"
                  htmlFor="lesson-video"
                  note="YouTube, Vimeo, Google Drive or a video file"
                  error={errors.videoUrl?.message}
                >
                  <Input id="lesson-video" placeholder="https://youtu.be/…" disabled={busy} {...register("videoUrl")} />
                </Field>
                {link && source === "drive" && (
                  <p className="mt-2 text-xs text-muted">
                    Share the Drive file as <span className="font-semibold text-ink">Anyone with the link</span>, or
                    realtors will be asked to request access.
                  </p>
                )}
                {link && source === "unknown" && (
                  <p className="mt-2 text-xs text-gold">
                    This link may not play. A YouTube, Vimeo, Drive or video file link works best.
                  </p>
                )}
                {link && previewLink === link && (
                  <LessonVideo key={previewLink} src={previewLink} onDuration={onDuration} className="mt-3 rounded-xl" />
                )}
                {lesson?.stored && (
                  <p className="mt-2 text-xs text-gold">Saving a link replaces this lesson&apos;s uploaded video.</p>
                )}
              </div>
            )}
          </div>

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
                disabled={busy}
                className="w-32"
                {...register("minutes", { valueAsNumber: true })}
              />
              {!lengthRead && (
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <Clock className="size-3.5" aria-hidden />
                  {mode === "upload"
                    ? file
                      ? "Reading it from the file"
                      : "Filled in from the file you choose"
                    : source === "drive"
                      ? "Drive does not report it, so type it"
                      : "Press play on the preview to fill this in, or type it"}
                </span>
              )}
            </div>
          </Field>

          <div className="flex justify-end gap-2 border-t border-line pt-5">
            {uploading ? (
              <button type="button" onClick={() => abort.current?.abort()} className={buttonClasses("outline", "md")}>
                Cancel upload
              </button>
            ) : (
              <button type="button" disabled={busy} onClick={onClose} className={buttonClasses("ghost", "md")}>
                Cancel
              </button>
            )}
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
  children: ReactNode;
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
