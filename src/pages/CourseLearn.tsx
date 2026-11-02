import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Clock, KeyRound, Loader2, Lock, MailWarning, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";

import { apiMessage } from "@/lib/api";
import { CourseShell } from "@/components/course/CourseShell";
import { useFinishCourse, useLearnerCourse, type Course, type LearnerEnrollment } from "@/lib/course";
import { displayName } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Within this many seconds of the end counts as the end: players stop a hair short. */
const END_SLACK = 1.5;

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
        ) : (
          <Screening course={data.course} enrollment={data.enrollment} access={access} />
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

function Screening({ course, enrollment, access }: { course: Course; enrollment: LearnerEnrollment; access: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const furthest = useRef(0);
  const [progress, setProgress] = useState(enrollment.status === "completed" ? 1 : 0);
  const finish = useFinishCourse();

  const unlocked = enrollment.status === "completed";

  function onTimeUpdate() {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    furthest.current = Math.max(furthest.current, video.currentTime);
    if (!unlocked) setProgress(furthest.current / video.duration);
  }

  // Rewinding is fine; jumping past what has been watched is not.
  function onSeeking() {
    const video = videoRef.current;
    if (!video || unlocked) return;
    if (video.currentTime > furthest.current + 1) video.currentTime = furthest.current;
  }

  function onEnded() {
    const video = videoRef.current;
    if (!video || unlocked || finish.isPending) return;
    if (furthest.current < video.duration - END_SLACK) return;
    setProgress(1);
    finish.mutate({ access }, { onError: () => toast.error("Your progress was not saved. Play the last seconds again.") });
  }

  return (
    <div className="space-y-8">

      <div className="overflow-hidden rounded-2xl bg-black shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
        <video
          ref={videoRef}
          src={course.videoUrl}
          poster={course.cover}
          controls
          playsInline
          controlsList="nodownload noplaybackrate"
          onTimeUpdate={onTimeUpdate}
          onSeeking={onSeeking}
          onEnded={onEnded}
          className="aspect-video w-full"
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-10 max-lg:grid-cols-1 max-lg:gap-8">
        <div>
          <p className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#38c0ff]">
            Realtor course
            <span className="h-px w-6 bg-white/30" aria-hidden />
            <span className="inline-flex items-center gap-1 text-white/60">
              <Clock className="size-3.5" aria-hidden /> {course.minutes} min
            </span>
          </p>
          <h1 className="display mt-3 text-[2.2rem] leading-[1.1] text-balance max-sm:text-[1.7rem]">
            {course.title}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/70">{course.description}</p>
        </div>

        <KeyCard
          progress={progress}
          unlocked={unlocked}
          finishing={finish.isPending}
          registered={enrollment.registered}
          invite={finish.data?.invite}
          access={access}
          onReplay={() => {
            const video = videoRef.current;
            if (!video) return;
            video.currentTime = 0;
            void video.play();
          }}
        />
      </div>
    </div>
  );
}

/** The registration key: fills as the video plays, and opens into the invite at the end. */
function KeyCard({
  progress,
  unlocked,
  finishing,
  registered,
  invite,
  access,
  onReplay,
}: {
  progress: number;
  unlocked: boolean;
  finishing: boolean;
  registered: boolean;
  invite?: string;
  access: string;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const finish = useFinishCourse();
  const pct = Math.round(progress * 100);

  // A returning learner has no invite in memory; finishing again is safe and hands it back.
  async function register() {
    try {
      const key = invite ?? (await finish.mutateAsync({ access })).invite;
      navigate(`/register?role=realtor&invite=${encodeURIComponent(key)}`);
    } catch {
      toast.error("Your registration link did not open. Try again.");
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl p-6 ring-1 transition-colors duration-500",
        unlocked ? "bg-brand/10 ring-brand/40" : "bg-white/5 ring-white/10",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-full transition-colors duration-500",
            unlocked ? "bg-brand text-[#04121f]" : "bg-white/10 text-white",
          )}
        >
          {unlocked ? <KeyRound className="size-5" aria-hidden /> : <Lock className="size-5" aria-hidden />}
        </span>
        <div>
          <p className="text-sm font-semibold">
            {registered ? "You are registered" : unlocked ? "Registration unlocked" : "Registration link"}
          </p>
          <p className="text-xs text-white/60">
            {registered
              ? "Sign in to your realtor account"
              : unlocked
                ? "Create your realtor account"
                : "Unlocks when the video ends"}
          </p>
        </div>
      </div>

      <div
        className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label="Video watched"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={cn("h-full rounded-full", unlocked ? "bg-brand" : "bg-white/70")}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduced ? 0 : 0.4, ease: "easeOut" }}
        />
      </div>
      <p className="mt-2 text-xs tabular-nums text-white/50">{pct}% watched</p>

      <AnimatePresence mode="wait" initial={false}>
        {registered ? (
          <motion.div key="registered" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/login"
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white font-semibold text-[#04121f] transition-transform hover:-translate-y-0.5"
            >
              Sign in <ArrowRight className="size-4" aria-hidden />
            </Link>
          </motion.div>
        ) : unlocked ? (
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
                <Loader2 className="size-4 animate-spin" aria-hidden /> Unlocking
              </>
            ) : (
              "Watch without skipping ahead. You can rewind any time."
            )}
          </motion.p>
        )}
      </AnimatePresence>

      {unlocked && !registered && (
        <button
          type="button"
          onClick={onReplay}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 transition-colors hover:text-white"
        >
          <RotateCcw className="size-3.5" aria-hidden /> Watch again
        </button>
      )}
    </div>
  );
}
