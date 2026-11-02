import { Link } from "react-router";
import { ArrowRight, Lock } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { CourseHero } from "@/components/course/CourseHero";
import { CoursePath } from "@/components/course/CoursePath";
import { CourseEnrol } from "@/components/course/CourseEnrol";
import { useCourse } from "@/lib/course";

export function Course() {
  const { data: course, isPending, isError } = useCourse();

  if (isPending) return <section className="min-h-svh animate-pulse bg-[#06121b]" />;

  if (isError || !course) return <OpensSoon />;

  return (
    <>
      <CourseHero course={course} />
      <CoursePath price={course.price} />
      <CourseEnrol course={course} />
    </>
  );
}

/** The course is in draft, or could not be read: either way there is nothing to sell yet. */
function OpensSoon() {
  return (
    <section className="flex min-h-svh items-center bg-[#06121b]">
      <Container className="py-32 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
          <Lock className="size-6 text-white" aria-hidden />
        </span>
        <h1 className="display mt-8 text-5xl text-white max-sm:text-4xl">The realtor course opens soon</h1>
        <p className="mx-auto mt-5 max-w-lg text-lg text-white/70">
          Check back shortly. In the meantime, see what INSPECTRA does for realtors.
        </p>
        <Link
          to="/for-realtors"
          className="mt-9 inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
        >
          For realtors <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Container>
    </section>
  );
}
