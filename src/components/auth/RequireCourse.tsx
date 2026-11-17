import { useEffect } from "react";
import { Link, Outlet } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader2, Lock } from "lucide-react";

import { CourseShell } from "@/components/course/CourseShell";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { apiMessage } from "@/lib/api";
import { ME_KEY, useAuthUser } from "@/lib/auth";
import { useMyEnrollment } from "@/lib/course";

const PRIMARY =
  "mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5";

/**
 * The realtor dashboard, for an account opened at the course checkout. It stays locked
 * until the course is paid for, and every realtor route on the API refuses it until then,
 * so the dashboard is replaced by the one step left to take. Sits inside RequireAuth,
 * which has already settled the session.
 */
export function RequireCourse() {
  const user = useAuthUser();

  if (!user.courseLocked) return <Outlet />;

  return <CourseLock />;
}

function CourseLock() {
  const queryClient = useQueryClient();
  const mine = useMyEnrollment(true);
  const paid = !!mine.data?.access;

  // Paid means the server has opened the dashboard (at payment, or on this very read for
  // someone who paid before that), so the account in the browser is stale: read it again,
  // which swaps this screen for the dashboard.
  useEffect(() => {
    if (paid) void queryClient.invalidateQueries({ queryKey: ME_KEY });
  }, [paid, queryClient]);

  return (
    <CourseShell
      aside={<LogoutButton className="w-auto text-white/70 hover:bg-white/10 hover:text-white" />}
    >
      <div className="mx-auto max-w-xl py-16 text-center max-sm:py-8">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
          <Lock className="size-6" aria-hidden />
        </span>
        <h1 className="display mt-6 text-4xl max-sm:text-3xl">Complete your payment to open your dashboard</h1>

        {mine.isPending || paid ? (
          <Loader2 className="mx-auto mt-8 size-6 animate-spin text-white/60" aria-label="Opening your dashboard" />
        ) : mine.isError ? (
          <p className="mx-auto mt-4 max-w-md text-white/70">{apiMessage(mine.error)}</p>
        ) : (
          <>
            <p className="mx-auto mt-4 max-w-md text-white/70">
              Your account is ready. Pay for the course and your realtor dashboard opens straight
              away. The lessons are yours to watch whenever you like.
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
