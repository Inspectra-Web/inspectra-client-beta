import { Link } from "react-router";
import { ArrowRight, GraduationCap } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { useCourse, useMyEnrollment } from "@/lib/course";

/**
 * A paid realtor who has not finished the course is nudged back to it from the overview.
 * Paying already opened the dashboard, so this is an invitation, not a gate, and it goes
 * once every lesson is watched. Nothing shows for a realtor who has not paid.
 */
export function CourseBanner() {
  const mine = useMyEnrollment(true);
  const course = useCourse();

  const enrollment = mine.data?.enrollment;
  const access = mine.data?.access;
  if (!access || !enrollment || enrollment.status === "completed") return null;

  const total = course.data?.lessons.length ?? 0;
  const ids = new Set(course.data?.lessons.map((lesson) => lesson.id) ?? []);
  const watched = enrollment.watchedLessons.filter((id) => ids.has(id)).length;

  return (
    <Reveal y={12}>
      <section className="flex items-center gap-4 rounded-2xl border border-brand/30 bg-brand/5 p-5 max-sm:flex-col max-sm:items-start">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-ink">
          <GraduationCap className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">Continue your course</p>
          <p className="mt-0.5 text-sm text-muted">
            {total > 0 ? `${watched} of ${total} lessons watched. ` : ""}
            Learn how your digital asset rewards are earned.
          </p>
        </div>
        <Link
          to={`/course/learn?access=${encodeURIComponent(access)}`}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-[#04121f] transition-transform hover:-translate-y-0.5"
        >
          {watched > 0 ? "Continue" : "Start"} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    </Reveal>
  );
}
