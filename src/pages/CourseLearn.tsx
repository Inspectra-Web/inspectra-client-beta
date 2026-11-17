import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  Clock,
  KeyRound,
  Loader2,
  Lock,
  MailWarning,
  Play,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";

import { apiMessage } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { CourseShell } from "@/components/course/CourseShell";
import { LessonVideo } from "@/components/course/LessonVideo";
import {
  useFinishLesson,
  useLearnerCourse,
  type LearnerCourseView,
  type LearnerEnrollment,
  type LearnerLesson,
} from "@/lib/course";
import { displayName } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Within this many seconds of the end counts as the end: players stop a hair short. */
const END_SLACK = 1.5;
/** How far ahead of the furthest point watched a time update may land without being a skip. */
const SKIP_SLACK = 2;

export function CourseLearn() {
  const [params] = useSearchParams();
  const access = params.get("access") ?? "";
  const { data, isPending, error } = useLearnerCourse(access);

  return (
    <CourseShell
      aside={
        data && (
          <p className="text-sm text-white/60">
            Watching as <span className="font-medium text-white">{displayName(data.enrollment.fullname)}</span>
          </p>
        )
      }
    >
      {!access ? (
        <Problem
          title="Open the link from your email"
          body="Your course has its own link, sent to you after payment. Open it from that email to watch."
        />
      ) : isPending ? (
        <div className="aspect-video animate-pulse rounded-2xl bg-white/5" />
      ) : error || !data ? (
        <Problem title="This link does not open a course" body={apiMessage(error, "Check the link in your email and try again.")} />
      ) : data.course.lessons.length === 0 ? (
        <Problem title="The lessons are on their way" body="This course has no lessons yet. Check back shortly." />
      ) : (
        <Classroom course={data.course} enrollment={data.enrollment} access={access} />
      )}
    </CourseShell>
  );
}

function Problem({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
        <MailWarning className="size-6" aria-hidden />
      </span>
      <h1 className="display mt-6 text-3xl">{title}</h1>
      <p className="mt-3 text-white/70">{body}</p>
      <Link
        to="/course"
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-semibold transition-colors hover:bg-white/10"
      >
        Go to the course page <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

/** Where to start: the first open lesson not yet watched, or the first lesson once all are. */
const startingLesson = (lessons: LearnerLesson[]): number => {
  const next = lessons.findIndex((lesson) => lesson.unlocked && !lesson.watched);
  return next === -1 ? 0 : next;
};

function Classroom({
  course,
  enrollment,
  access,
}: {
  course: LearnerCourseView;
  enrollment: LearnerEnrollment;
  access: string;
}) {
  const lessons = course.lessons;
  const [current, setCurrent] = useState(() => startingLesson(lessons));
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const furthest = useRef(0);
  const finish = useFinishLesson();

  const completed = enrollment.status === "completed";
  const lesson = lessons[current] ?? lessons[0];
  if (!lesson) return null;

  const watchedCount = lessons.filter((l) => l.watched).length;
  // The course so far, with the lesson playing counted for the part watched.
  const overall = completed ? 1 : (watchedCount + (lesson.watched ? 0 : progress)) / lessons.length;

  function open(index: number) {
    const target = lessons[index];
    if (!target?.unlocked || index === current) return;
    furthest.current = 0;
    setProgress(0);
    setCurrent(index);
  }

  // Rewinding is fine; jumping past what has been watched is not, until the lesson is done.
  // Checked on every time update as well as on seeking: an embedded YouTube or Vimeo
  // player does not always report the seek itself, but its next time update shows the jump.
  function holdBack(video: HTMLVideoElement): boolean {
    if (lesson?.watched || video.currentTime <= furthest.current + SKIP_SLACK) return false;
    video.currentTime = furthest.current;
    return true;
  }

  function onTimeUpdate(video: HTMLVideoElement) {
    if (!video.duration || holdBack(video)) return;
    furthest.current = Math.max(furthest.current, video.currentTime);
    if (!lesson?.watched) setProgress(furthest.current / video.duration);
  }

  function onEnded(video: HTMLVideoElement) {
    if (!lesson || lesson.watched || finish.isPending) return;
    if (furthest.current < video.duration - END_SLACK) return;
    setProgress(1);

    finish.mutate(
      { access, lessonId: lesson.id },
      {
        onSuccess: ({ course: next }) => {
          const following = next.lessons[current + 1];
          if (following?.unlocked) {
            toast.success(`Lesson ${current + 2} is open`);
            furthest.current = 0;
            setProgress(0);
            setCurrent(current + 1);
          }
        },
        onError: () => toast.error("Your progress was not saved. Play the last seconds again."),
      },
    );
  }

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-2xl bg-black shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
        <LessonVideo
          key={lesson.id}
          playerRef={videoRef}
          src={lesson.videoUrl}
          poster={course.cover}
          onTimeUpdate={onTimeUpdate}
          onSeeking={holdBack}
          onEnded={onEnded}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-10 max-lg:grid-cols-1 max-lg:gap-8">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#38c0ff]">
            Lesson {current + 1} of {lessons.length}
            <span className="h-px w-6 bg-white/30" aria-hidden />
            <span className="inline-flex items-center gap-1 text-white/60">
              <Clock className="size-3.5" aria-hidden /> {lesson.minutes} min
            </span>
          </p>
          <h1 className="display mt-3 text-[2.2rem] leading-[1.1] text-balance max-sm:text-[1.7rem]">
            {lesson.title}
          </h1>
          {lesson.summary && <p className="mt-4 max-w-2xl leading-relaxed text-white/70">{lesson.summary}</p>}
          <p className="mt-6 text-sm text-white/50">{course.title}</p>
        </div>

        <div className="space-y-5">
          <KeyCard
            progress={overall}
            completed={completed}
            finishing={finish.isPending}
            registered={enrollment.registered}
            invite={finish.data?.invite}
            access={access}
            lastLessonId={lessons[lessons.length - 1]?.id ?? lesson.id}
            remaining={lessons.length - watchedCount}
            onReplay={() => {
              const video = videoRef.current;
              if (!video) return;
              video.currentTime = 0;
              void video.play();
            }}
          />
          <LessonList lessons={lessons} current={current} onOpen={open} />
        </div>
      </div>
    </div>
  );
}

/** Every lesson, in order: watched ones ticked, the open one playable, the rest locked. */
function LessonList({
  lessons,
  current,
  onOpen,
}: {
  lessons: LearnerLesson[];
  current: number;
  onOpen: (index: number) => void;
}) {
  return (
    <ol className="overflow-hidden rounded-2xl ring-1 ring-white/10" aria-label="Lessons">
      {lessons.map((lesson, i) => {
        const playing = i === current;
        return (
          <li key={lesson.id} className={cn(i > 0 && "border-t border-white/10")}>
            <button
              type="button"
              disabled={!lesson.unlocked}
              onClick={() => onOpen(i)}
              aria-current={playing ? "true" : undefined}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                playing ? "bg-white/10" : "hover:bg-white/5",
                "disabled:cursor-not-allowed disabled:hover:bg-transparent",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums",
                  lesson.watched
                    ? "bg-brand text-[#04121f]"
                    : playing
                      ? "bg-white text-[#06121b]"
                      : "bg-white/10 text-white/60",
                )}
              >
                {lesson.watched ? (
                  <Check className="size-3.5" aria-hidden />
                ) : playing ? (
                  <Play className="ml-px size-3 fill-current" aria-hidden />
                ) : !lesson.unlocked ? (
                  <Lock className="size-3" aria-hidden />
                ) : (
                  i + 1
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-sm font-medium", lesson.unlocked ? "text-white" : "text-white/50")}>
                  {lesson.title}
                </span>
                <span className="block text-xs tabular-nums text-white/45">
                  {lesson.minutes} min
                  {lesson.watched ? " · Watched" : !lesson.unlocked ? " · Opens after the one before" : ""}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Course progress, filled as the lessons are watched. An enrollment with an account
 * (`registered`) already has its dashboard open, from the payment, so it always offers the
 * way in; a guest's from before accounts were opened at checkout unlocks its sign-up invite
 * when the last lesson ends.
 */
function KeyCard({
  progress,
  completed,
  finishing,
  registered,
  invite,
  access,
  lastLessonId,
  remaining,
  onReplay,
}: {
  progress: number;
  completed: boolean;
  finishing: boolean;
  registered: boolean;
  invite?: string | null;
  access: string;
  lastLessonId: string;
  remaining: number;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const finish = useFinishLesson();
  const { data: user } = useMe();
  const pct = Math.round(progress * 100);

  // A returning guest has no invite in memory; finishing a watched lesson again is safe and
  // hands it back.
  async function register() {
    try {
      const key = invite ?? (await finish.mutateAsync({ access, lessonId: lastLessonId })).invite;
      // No invite means the enrollment has an account by now: sign in to it instead.
      navigate(key ? `/register?role=realtor&invite=${encodeURIComponent(key)}` : "/login");
    } catch {
      toast.error("Your registration link did not open. Try again.");
    }
  }

  const lessonsLeft = `${remaining} ${remaining === 1 ? "lesson" : "lessons"} to go`;
  // Paying opened an account's dashboard, so the card is lit for it from the start; an
  // old guest row lights up only when its sign-up invite unlocks.
  const lit = registered || completed;
  const heading = registered
    ? completed
      ? { title: "Course finished", body: "Your dashboard has everything a realtor needs" }
      : { title: "Your dashboard is open", body: `${lessonsLeft}. Keep going to learn how your rewards are earned.` }
    : completed
      ? { title: "Registration unlocked", body: "Create your realtor account" }
      : { title: "Registration link", body: `Unlocks when the last lesson ends. ${lessonsLeft}.` };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 ring-1 transition-colors duration-500",
        lit ? "bg-brand/10 ring-brand/40" : "bg-white/5 ring-white/10",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-500",
            lit ? "bg-brand text-[#04121f]" : "bg-white/10 text-white",
          )}
        >
          {lit ? <KeyRound className="size-5" aria-hidden /> : <Lock className="size-5" aria-hidden />}
        </span>
        <div>
          <p className="text-sm font-semibold">{heading.title}</p>
          <p className="text-xs text-white/60">{heading.body}</p>
        </div>
      </div>

      <div
        className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label="Course watched"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={cn("h-full rounded-full", lit ? "bg-brand" : "bg-white/70")}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduced ? 0 : 0.4, ease: "easeOut" }}
        />
      </div>
      <p className="mt-2 text-xs tabular-nums text-white/50">{pct}% of the course watched</p>

      <AnimatePresence mode="wait" initial={false}>
        {registered ? (
          <motion.div key="registered" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {/* Signed out (or as someone else), sign-in carries them on to the dashboard. */}
            <Link
              to={user?.role === "realtor" ? "/realtor" : "/login"}
              state={user?.role === "realtor" ? undefined : { from: "/realtor" }}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5"
            >
              {user?.role === "realtor" ? "Go to your dashboard" : "Sign in to your dashboard"}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </motion.div>
        ) : completed ? (
          <motion.div key="unlocked" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <button
              type="button"
              onClick={register}
              disabled={finish.isPending}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {finish.isPending ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : (
                <>
                  Register as a realtor <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.p
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center gap-2 text-sm text-white/60"
          >
            {finishing ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden /> Saving your progress
              </>
            ) : (
              "Watch each lesson to the end, in order. You can rewind any time."
            )}
          </motion.p>
        )}
      </AnimatePresence>

      {completed && (
        <button
          type="button"
          onClick={onReplay}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 transition-colors hover:text-white"
        >
          <RotateCcw className="size-3.5" aria-hidden /> Watch this lesson again
        </button>
      )}
    </div>
  );
}
