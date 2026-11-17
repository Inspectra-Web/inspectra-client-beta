import { motion, useReducedMotion, type Variants } from "motion/react";
import { useState } from "react";
import { ArrowDown, Clock, Coins, Lock, Play, Smartphone, Users } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import type { PublicCourse } from "@/lib/course";
import { formatPriceFull } from "@/lib/format";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// The admin can save a title of up to 200 characters, so the heading steps down as it grows.
function titleSize(title: string) {
  if (title.length <= 40)
    return "text-[3.4rem] leading-[1.05] max-xl:text-5xl max-sm:text-[2.35rem]";
  if (title.length <= 80)
    return "text-[2.6rem] leading-[1.1] max-xl:text-[2.35rem] max-sm:text-[1.9rem]";
  return "text-[2.1rem] leading-[1.15] max-xl:text-[1.9rem] max-sm:text-[1.6rem]";
}

export function CourseHero({ course }: { course: PublicCourse }) {
  const reduced = useReducedMotion();

  return (
    <section className="relative flex min-h-svh items-center overflow-hidden bg-[#06121b]">
      <img
        src={course.cover}
        alt=""
        className="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-[2px]"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-linear-to-r from-[#06121b] via-[#06121b]/85 via-45% to-[#06121b]/55" />

      <Container className="relative z-10 pb-24 pt-32 max-lg:pt-28 max-sm:pb-16 max-sm:pt-24">
        <motion.div
          className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center gap-14 max-lg:grid-cols-1 max-lg:gap-12"
          variants={container}
          initial={reduced ? false : "hidden"}
          animate="show"
        >
          <div>
            <motion.p
              variants={item}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/70"
            >
              <span className="whitespace-nowrap text-[#38c0ff]">Realtor course</span>
              <span className="h-px w-8 bg-white/30" aria-hidden />
              <span className="whitespace-nowrap">Blockchain and AI storytelling</span>
            </motion.p>

            <motion.h1
              variants={item}
              className={cn(
                "display mt-5 text-white text-balance wrap-break-word hyphens-auto",
                titleSize(course.title),
              )}
            >
              {course.title}
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 max-sm:text-base"
            >
              {course.subtitle}
            </motion.p>

            <motion.div variants={item} className="mt-9 flex items-center gap-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
              <a
                href="#enrol"
                className="inline-flex h-13 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand px-8 text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 max-sm:h-12"
              >
                Enrol for {formatPriceFull(course.price)}
                <ArrowDown className="size-4" aria-hidden />
              </a>
              <p className="text-sm text-white/60">
                One payment. Your first digital asset reward starts here.
              </p>
            </motion.div>
          </div>

          <motion.div variants={item}>
            <CourseCard course={course} />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

/** What the payment opens: the locked video up top, then what is inside and what it earns. */
function CourseCard({ course }: { course: PublicCourse }) {
  const [coverFailed, setCoverFailed] = useState(false);

  return (
    <figure className="relative">
      <span className="absolute -right-3 -top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-[#04121f] shadow-[0_10px_24px_-10px_rgba(26,172,240,0.9)] max-sm:right-3">
        <Users className="size-3.5" aria-hidden /> First 100: mentorship paid for
      </span>

      <div className="overflow-hidden rounded-3xl bg-white/[0.06] p-2.5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/15 backdrop-blur-md">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-[radial-gradient(120%_120%_at_20%_10%,#1AACF0_0%,#0b3a57_45%,#06121b_100%)]">
          {course.cover && !coverFailed && (
            <img
              src={course.cover}
              alt=""
              onError={() => setCoverFailed(true)}
              className="size-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-[#06121b]/80 via-[#06121b]/20 to-transparent" />

          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur-md">
            <Lock className="size-3" aria-hidden /> Unlocks after payment
          </span>

          <a
            href="#enrol"
            aria-label="Enrol to watch"
            className="absolute inset-0 m-auto grid size-16 place-items-center rounded-full bg-white text-[#06121b] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.6)] transition-transform hover:scale-105"
          >
            <Play className="ml-0.5 size-6 fill-current" aria-hidden />
          </a>

          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium tabular-nums text-white backdrop-blur-md">
            <Clock className="size-3.5" aria-hidden /> {course.minutes} min
          </span>
        </div>

        <div className="px-4 pb-3 pt-5 max-sm:px-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/50">
            Inside the course
          </p>
          <ol className="mt-3 space-y-3">
            {course.lessons.map(({ id, title, minutes }, i) => (
              <li key={id} className="flex items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold tabular-nums text-white">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{title}</span>
                <span className="shrink-0 text-xs tabular-nums text-white/50">{minutes} min</span>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand/10 px-4 py-3 ring-1 ring-brand/25">
            <Coins className="size-5 shrink-0 text-[#38c0ff]" aria-hidden />
            <p className="text-sm text-white/85">Earn a $USD digital asset on every INSPECTRA deal</p>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
            <div>
              <p className="text-xs text-white/50">One payment</p>
              <p className="display text-3xl tabular-nums text-white">{formatPriceFull(course.price)}</p>
            </div>
            <p className="flex items-center gap-1.5 pb-1 text-xs text-white/60">
              <Smartphone className="size-3.5" aria-hidden /> Phone or laptop
            </p>
          </div>
        </div>
      </div>
    </figure>
  );
}
