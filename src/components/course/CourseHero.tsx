import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowDown, Clock, Lock } from "lucide-react";

import { Container } from "@/components/ui/Container";
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
              className="flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/70"
            >
              <span className="text-[#38c0ff]">Realtor course</span>
              <span className="h-px w-8 bg-white/30" aria-hidden />
              <span>{course.minutes} min video</span>
            </motion.p>

            <motion.h1
              variants={item}
              className="display mt-5 text-[3.4rem] leading-[1.05] text-white text-balance max-xl:text-5xl max-sm:text-[2.35rem]"
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
                One payment. Watch it, then register as a realtor.
              </p>
            </motion.div>
          </div>

          <motion.div variants={item}>
            <LockedScreen course={course} />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

/** The video as it waits behind the payment: its first frame, with a lock where play would be. */
function LockedScreen({ course }: { course: PublicCourse }) {
  return (
    <figure className="relative">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/15">
        <img src={course.cover} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-[#06121b]/55" />

        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-white/10 ring-1 ring-white/30 backdrop-blur-md">
              <Lock className="size-6 text-white" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-white">Unlocks when you pay</span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-linear-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
          <span className="h-1 flex-1 rounded-full bg-white/25" aria-hidden />
          <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-white/80">
            <Clock className="size-3.5" aria-hidden /> {course.minutes}:00
          </span>
        </div>
      </div>
      <figcaption className="mt-4 flex items-center justify-between text-sm text-white/60">
        <span>Watch on your phone or laptop</span>
        <span className="display text-xl text-white">{formatPriceFull(course.price)}</span>
      </figcaption>
    </figure>
  );
}
