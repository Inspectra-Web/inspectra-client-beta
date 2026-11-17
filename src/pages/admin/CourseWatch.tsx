import { useState } from "react";
import { Link } from "react-router";
import { Clock, Film, Info, Play } from "lucide-react";

import { CourseTabs } from "@/components/course/CourseTabs";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { apiMessage } from "@/lib/api";
import { useAdminCourse } from "@/lib/course";
import { cn } from "@/lib/cn";

/**
 * The admin watching the course as a realtor would, without paying. It reads the admin
 * course (any status), so nothing is enrolled, recorded or unlocked, any lesson can be
 * picked, and seeking is free.
 */
export function AdminCourseWatch() {
  const { data: course, isPending, isError, error } = useAdminCourse();
  const [picked, setPicked] = useState(0);

  const lessons = course?.lessons ?? [];
  const index = Math.min(picked, Math.max(0, lessons.length - 1));
  const lesson = lessons[index];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-faint">
          Realtor acquisition
        </p>
        <h1 className="display mt-1 text-3xl text-ink max-sm:text-2xl">Watch the course</h1>
      </header>

      <CourseTabs />

      {isError ? (
        <EmptyState icon={Film} title="Could not load the course" message={apiMessage(error)} />
      ) : isPending ? (
        <div className="aspect-video animate-pulse rounded-2xl bg-surface-2" />
      ) : !lesson ? (
        <EmptyState
          icon={Film}
          title="No lessons yet"
          message="Add a lesson and its video on the Course tab, then watch it here."
        />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_20rem] items-start gap-6 max-lg:grid-cols-1">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-line">
              {lesson.videoUrl ? (
                <video
                  key={lesson.id}
                  src={lesson.videoUrl}
                  poster={course.cover || undefined}
                  controls
                  playsInline
                  controlsList="nodownload"
                  className="aspect-video w-full"
                />
              ) : (
                <div className="grid aspect-video place-items-center text-sm text-white/60">
                  This lesson has no video yet.
                </div>
              )}
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm text-faint">
              Lesson {index + 1} of {lessons.length}
              <span aria-hidden>·</span>
              <Clock className="size-4" aria-hidden /> {lesson.minutes} min
            </p>
            <h2 className="display mt-1 text-2xl text-ink text-balance">{lesson.title || "Untitled lesson"}</h2>
            {lesson.summary && <p className="mt-2 max-w-2xl leading-relaxed text-muted">{lesson.summary}</p>}
          </div>

          <aside className="space-y-4">
            <ol className="overflow-hidden rounded-2xl border border-line bg-surface">
              {lessons.map((l, i) => (
                <li key={l.id} className={cn(i > 0 && "border-t border-line")}>
                  <button
                    type="button"
                    onClick={() => setPicked(i)}
                    aria-current={i === index ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      i === index ? "bg-brand/10" : "hover:bg-surface-2",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums",
                        i === index ? "bg-brand text-[#04121f]" : "bg-surface-2 text-ink",
                      )}
                    >
                      {i === index ? <Play className="ml-px size-3 fill-current" aria-hidden /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{l.title || "Untitled lesson"}</span>
                      <span className="block text-xs tabular-nums text-faint">{l.minutes} min</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="flex gap-3 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
              <p>
                You are watching as an admin. Nothing is paid, recorded or unlocked, and you can
                pick any lesson and skip ahead. Realtors watch in order, to the end of each.{" "}
                <Link to="/admin/course" className="font-medium text-brand-ink hover:underline">
                  Edit the course
                </Link>
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
