import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, Clock, KeyRound, MailWarning, Play } from "lucide-react";

import { apiMessage } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { CourseShell } from "@/components/course/CourseShell";
import { LessonVideo } from "@/components/course/LessonVideo";
import { useLearnerCourse, type LearnerCourse } from "@/lib/course";
import { displayName } from "@/lib/format";
import { cn } from "@/lib/cn";

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
        <Classroom data={data} />
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

/**
 * The lessons, any of them, in any order. Watching is not tracked: paying is what opens
 * the dashboard and earns the reward, so the course is there to dip into.
 */
function Classroom({ data }: { data: LearnerCourse }) {
  const { course, enrollment, invite } = data;
  const lessons = course.lessons;
  const [current, setCurrent] = useState(0);
  const lesson = lessons[current] ?? lessons[0];
  if (!lesson) return null;

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-2xl shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
        <LessonVideo key={lesson.id} src={lesson.videoUrl} poster={course.cover} />
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
          <h1 className="display mt-3 text-[2.2rem] leading-[1.1] text-balance max-sm:text-[1.7rem]">{lesson.title}</h1>
          {lesson.summary && <p className="mt-4 max-w-2xl leading-relaxed text-white/70">{lesson.summary}</p>}
          <p className="mt-6 text-sm text-white/50">{course.title}</p>
        </div>

        <div className="space-y-5">
          <ol className="overflow-hidden rounded-2xl ring-1 ring-white/10" aria-label="Lessons">
            {lessons.map((item, i) => {
              const playing = i === current;
              return (
                <li key={item.id} className={cn(i > 0 && "border-t border-white/10")}>
                  <button
                    type="button"
                    onClick={() => setCurrent(i)}
                    aria-current={playing ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      playing ? "bg-white/10" : "hover:bg-white/5",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums",
                        playing ? "bg-brand text-[#04121f]" : "bg-white/10 text-white/70",
                      )}
                    >
                      {playing ? <Play className="ml-px size-3 fill-current" aria-hidden /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{item.title}</span>
                      <span className="block text-xs tabular-nums text-white/45">{item.minutes} min</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <WayIn registered={enrollment.registered} invite={invite} />
        </div>
      </div>
    </div>
  );
}

/**
 * Where the course leads. An account's dashboard opened when it paid, so it is offered
 * straight away; an old guest buyer is handed their sign-up invite.
 */
function WayIn({ registered, invite }: { registered: boolean; invite: string | null }) {
  const { data: user } = useMe();
  const signedIn = user?.role === "realtor";

  const to = registered
    ? signedIn
      ? "/realtor"
      : "/login"
    : invite
      ? `/register?role=realtor&invite=${encodeURIComponent(invite)}`
      : "/login";

  return (
    <div className="rounded-2xl bg-brand/10 p-6 ring-1 ring-brand/40">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-[#04121f]">
          <KeyRound className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">{registered ? "Your dashboard is open" : "Your realtor account"}</p>
          <p className="text-xs text-white/60">
            {registered ? "Watch any lesson, any time." : "Create it to open your dashboard."}
          </p>
        </div>
      </div>
      <Link
        to={to}
        state={registered && !signedIn ? { from: "/realtor" } : undefined}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5"
      >
        {registered ? (signedIn ? "Go to your dashboard" : "Sign in to your dashboard") : "Register as a realtor"}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
