import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Check, Clock, GraduationCap, Loader2, Play } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { useCourse, useCourseCheckout, useMyEnrollment } from "@/lib/course";
import { formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * The realtor course from inside the dashboard: their progress and a way back into the
 * player once paid, or the price and a one-click checkout if not. Open to every realtor,
 * including those whose dashboard was open before the course existed.
 */
export function RealtorCourse() {
  const course = useCourse();
  const mine = useMyEnrollment(true);

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Realtor course"
          subtitle="The masterclasses, how INSPECTRA works, and how your digital asset rewards are earned."
        />
      </Reveal>

      {course.isPending || mine.isPending ? (
        <div className="h-72 animate-pulse rounded-2xl border border-line bg-surface" />
      ) : course.isError || mine.isError ? (
        <EmptyState
          icon={GraduationCap}
          title="Could not load the course"
          message={apiMessage(course.error ?? mine.error)}
        />
      ) : !course.data ? (
        <EmptyState
          icon={GraduationCap}
          title="The course opens soon"
          message="It is being prepared. Check back shortly."
        />
      ) : (
        <Reveal y={16}>
          <Panel className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm text-faint">
              <GraduationCap className="size-4" aria-hidden />
              {course.data.lessons.length} {course.data.lessons.length === 1 ? "lesson" : "lessons"}
              <span aria-hidden>·</span>
              <Clock className="size-4" aria-hidden /> {course.data.minutes} min
            </p>
            <h2 className="display mt-2 text-2xl text-ink text-balance">{course.data.title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{course.data.subtitle}</p>

            {mine.data?.access ? (
              <Progress
                lessons={course.data.lessons}
                watched={mine.data.enrollment?.watchedLessons ?? []}
                completed={mine.data.enrollment?.status === "completed"}
                access={mine.data.access}
              />
            ) : (
              <Buy price={course.data.price} />
            )}
          </Panel>
        </Reveal>
      )}
    </div>
  );
}

function Progress({
  lessons,
  watched,
  completed,
  access,
}: {
  lessons: { id: string; title: string; minutes: number }[];
  watched: string[];
  completed: boolean;
  access: string;
}) {
  const done = new Set(watched);
  const count = completed ? lessons.length : lessons.filter((l) => done.has(l.id)).length;
  const pct = lessons.length ? Math.round((count / lessons.length) * 100) : 0;

  return (
    <>
      <div className="mt-6">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-ink">
            {completed ? "Course finished" : `${count} of ${lessons.length} lessons watched`}
          </span>
          <span className="tabular-nums text-faint">{pct}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-label="Course watched"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={cn("h-full rounded-full", completed ? "bg-verified" : "bg-brand")} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ol className="mt-6 divide-y divide-line rounded-2xl border border-line">
        {lessons.map((lesson, i) => {
          const seen = completed || done.has(lesson.id);
          return (
            <li key={lesson.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums",
                  seen ? "bg-brand/15 text-brand-ink" : "bg-surface-2 text-ink",
                )}
              >
                {seen ? <Check className="size-3.5" aria-hidden /> : i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{lesson.title}</span>
              <span className="shrink-0 text-xs tabular-nums text-faint">{lesson.minutes} min</span>
            </li>
          );
        })}
      </ol>

      <Link
        to={`/course/learn?access=${encodeURIComponent(access)}`}
        className={cn(buttonClasses("brand", "md"), "mt-6")}
      >
        <Play className="size-4 fill-current" aria-hidden />
        {completed ? "Watch again" : count > 0 ? "Continue the course" : "Start the course"}
      </Link>
    </>
  );
}

function Buy({ price }: { price: number }) {
  const checkout = useCourseCheckout();
  const [problem, setProblem] = useState<string | null>(null);

  async function pay() {
    setProblem(null);
    try {
      const { link } = await checkout.mutateAsync();
      window.location.assign(link);
    } catch (error) {
      setProblem(apiMessage(error, "Checkout did not start. Try again."));
    }
  }

  return (
    <div className="mt-6 flex items-end justify-between gap-6 border-t border-line pt-6 max-sm:flex-col max-sm:items-start">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">One payment</p>
        <p className="display mt-1 text-4xl tabular-nums text-ink">{formatPriceFull(price)}</p>
        <Link to="/course" className="mt-2 inline-block text-sm font-medium text-brand-ink hover:underline">
          See what is inside
        </Link>
      </div>
      <div className="flex flex-col items-end gap-2 max-sm:items-start">
        <button
          type="button"
          onClick={pay}
          disabled={checkout.isPending}
          className={cn(buttonClasses("brand", "md"), "min-w-40")}
        >
          {checkout.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <>
              Pay {formatPriceFull(price)} <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </button>
        <p className="text-xs text-faint">Card, bank transfer or USSD</p>
        {problem && <p role="alert" className="text-sm text-gold">{problem}</p>}
      </div>
    </div>
  );
}
