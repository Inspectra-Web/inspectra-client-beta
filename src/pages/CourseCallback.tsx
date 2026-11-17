import { useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { ArrowRight, CircleCheck, LayoutDashboard, Loader2, Mail, Play, TriangleAlert } from "lucide-react";

import { apiMessage, resendVerification } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { CourseShell } from "@/components/course/CourseShell";
import { useVerifyEnrollment } from "@/lib/course";
import { formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Where Flutterwave sends a course buyer back to. The API is asked to confirm the
 * transaction; `status=successful` in the URL is only the browser's claim.
 */
export function CourseCallback() {
  const [params] = useSearchParams();
  const reference = params.get("tx_ref") ?? "";
  const transactionId = params.get("transaction_id") ?? "";
  const declared = params.get("status") ?? "";

  // Flutterwave says "cancelled" when someone backs out of the hosted page.
  const abandoned = declared === "cancelled" || (!transactionId && declared !== "successful");
  const verify = useVerifyEnrollment(abandoned ? "" : reference, transactionId);
  const { data: user } = useMe();

  return (
    <CourseShell>
      <div className="mx-auto max-w-xl py-12 text-center max-sm:py-6">
        {abandoned ? (
          <>
            <Outcome
              tone="warn"
              icon={<TriangleAlert className="size-7" aria-hidden />}
              title="Payment not completed"
              body="Nothing was charged. You can enrol again whenever you are ready."
            />
            <Actions>
              <PrimaryLink to="/course#enrol">Back to the course</PrimaryLink>
            </Actions>
          </>
        ) : verify.isPending ? (
          <Outcome
            tone="brand"
            icon={<Loader2 className="size-7 animate-spin" aria-hidden />}
            title="Confirming your payment"
            body="This takes a few seconds. Keep this tab open."
          />
        ) : verify.isError ? (
          <>
            <Outcome
              tone="danger"
              icon={<TriangleAlert className="size-7" aria-hidden />}
              title="Your payment is not confirmed yet"
              body={`${apiMessage(verify.error, "We could not confirm it yet.")} If you were charged, your course link will still arrive by email once the payment clears.`}
              note={reference ? `Reference ${reference}` : undefined}
            />
            <Actions>
              <button
                type="button"
                onClick={() => void verify.refetch()}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-7 font-semibold transition-colors hover:bg-white/10"
              >
                Check again
              </button>
            </Actions>
          </>
        ) : (
          <>
            <Outcome
              tone="verified"
              icon={<CircleCheck className="size-7" aria-hidden />}
              title="Payment received"
              body={`${formatPriceFull(verify.data.amount)} paid. You can watch the course now.`}
              note={`Reference ${verify.data.reference}`}
            />

            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-white/5 p-4 text-left ring-1 ring-white/10">
              <Mail className="mt-0.5 size-5 shrink-0 text-[#38c0ff]" aria-hidden />
              <p className="text-sm leading-relaxed text-white/75">
                Your course link is also on its way to{" "}
                <span className="font-semibold text-white">{verify.data.email}</span>. Keep that
                email: the link is how you come back to the lessons.
              </p>
            </div>

            {/* Someone who paid while signed in has verified the address and is in already. */}
            {!user && <SignInSteps email={verify.data.email} />}

            <Actions>
              <PrimaryLink to={`/course/learn?access=${encodeURIComponent(verify.data.access)}`}>
                <Play className="size-4 fill-current" aria-hidden /> Watch now
              </PrimaryLink>
              {user?.role === "realtor" && (
                <Link
                  to="/realtor"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-7 font-semibold transition-colors hover:bg-white/10"
                >
                  <LayoutDashboard className="size-4" aria-hidden /> Go to your dashboard
                </Link>
              )}
            </Actions>

          </>
        )}
      </div>
    </CourseShell>
  );
}

/**
 * Paying opened the dashboard, but signing in still needs the address verified: paying
 * does not prove the email is theirs, the link in it does. Two plain steps, and the resend
 * right here rather than a trip to sign in to discover it.
 */
function SignInSteps({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function resend() {
    setState("sending");
    try {
      await resendVerification(email);
      setState("sent");
    } catch (error) {
      toast.error(apiMessage(error, "The email did not send. Try again."));
      setState("idle");
    }
  }

  return (
    <div className="mt-4 rounded-2xl bg-brand/10 p-5 text-left ring-1 ring-brand/30">
      <p className="flex items-center gap-2 font-semibold text-white">
        <LayoutDashboard className="size-4 text-[#38c0ff]" aria-hidden /> Your realtor dashboard is open
      </p>
      <ol className="mt-3 space-y-2 text-sm leading-relaxed text-white/75">
        <li className="flex gap-3">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-[0.7rem] font-semibold text-white">1</span>
          <span>
            Open the verification email we sent to{" "}
            <span className="font-semibold text-white">{email}</span> and confirm your address.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-[0.7rem] font-semibold text-white">2</span>
          <span>Sign in with that email and the password you chose.</span>
        </li>
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <Link
          to="/login"
          state={{ from: "/realtor" }}
          className="inline-flex items-center gap-1.5 font-semibold text-[#7ad4ff] hover:underline"
        >
          Sign in <ArrowRight className="size-4" aria-hidden />
        </Link>
        {state === "sent" ? (
          <span className="text-white/60">Sent. Check your inbox and spam folder.</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={state === "sending"}
            className="font-medium text-white/70 hover:text-white disabled:opacity-60"
          >
            {state === "sending" ? "Sending..." : "Resend the verification email"}
          </button>
        )}
      </div>
    </div>
  );
}

const TONES = {
  brand: "bg-brand/15 text-[#7ad4ff]",
  verified: "bg-emerald-400/15 text-emerald-300",
  warn: "bg-amber-400/15 text-amber-300",
  danger: "bg-rose-500/15 text-rose-300",
};

function Outcome({
  tone,
  icon,
  title,
  body,
  note,
}: {
  tone: keyof typeof TONES;
  icon: ReactNode;
  title: string;
  body: string;
  note?: string;
}) {
  return (
    <>
      <span className={cn("inline-grid size-16 place-items-center rounded-full", TONES[tone])}>{icon}</span>
      <h1 className="display mt-6 text-4xl max-sm:text-3xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-white/70">{body}</p>
      {note && <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/40">{note}</p>}
    </>
  );
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>;
}

function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5"
    >
      {children}
      {typeof children === "string" && <ArrowRight className="size-4" aria-hidden />}
    </Link>
  );
}
