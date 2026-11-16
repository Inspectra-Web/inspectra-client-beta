import { Link, Outlet } from "react-router";
import { ArrowRight, Loader2, Lock, Play } from "lucide-react";

import { CourseShell } from "@/components/course/CourseShell";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { apiMessage } from "@/lib/api";
import { useAuthUser } from "@/lib/auth";
import { useMyEnrollment } from "@/lib/course";

const PRIMARY =
  "mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5";

/**
 * The realtor console, for an account the course has opened. One opened at the course
 * checkout stays locked until the video is finished, and every realtor route on the API
 * refuses it until then, so the console is replaced by the one step left to take. Sits
 * inside RequireAuth, which has already settled the session.
 */
export function RequireCourse() {
  const user = useAuthUser();

  if (!user.courseLocked) return <Outlet />;

  return <CourseLock />;
}

function CourseLock() {
  const mine = useMyEnrollment(true);
  const access = mine.data?.access;

  return (
    <CourseShell
      aside={<LogoutButton className="w-auto text-white/70 hover:bg-white/10 hover:text-white" />}
    >
      <div className="mx-auto max-w-xl py-16 text-center max-sm:py-8">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
          <Lock className="size-6" aria-hidden />
        </span>
        <h1 className="display mt-6 text-4xl max-sm:text-3xl">Finish the course to open your console</h1>

        {mine.isPending ? (
          <Loader2 className="mx-auto mt-8 size-6 animate-spin text-white/60" aria-label="Loading" />
        ) : mine.isError ? (
          <p className="mx-auto mt-4 max-w-md text-white/70">{apiMessage(mine.error)}</p>
        ) : access ? (
          <>
            <p className="mx-auto mt-4 max-w-md text-white/70">
              Your payment is in. Watch the video to the end and your realtor console opens.
            </p>
            <Link to={`/course/learn?access=${encodeURIComponent(access)}`} className={PRIMARY}>
              <Play className="size-4 fill-current" aria-hidden /> Watch the course
            </Link>
          </>
        ) : (
          <>
            <p className="mx-auto mt-4 max-w-md text-white/70">
              Your account is ready. Complete your payment for the course, watch it to the end, and
              your realtor console opens.
            </p>
            <Link to="/course#enrol" className={PRIMARY}>
              Complete your payment <ArrowRight className="size-4" aria-hidden />
            </Link>
          </>
        )}
      </div>
    </CourseShell>
  );
}
