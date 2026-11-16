import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Clock,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Play,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { apiMessage, apiStatus } from "@/lib/api";
import { useMe, type AuthUser } from "@/lib/auth";
import {
  useCourseCheckout,
  useJoinCourse,
  useMyEnrollment,
  type PublicCourse,
} from "@/lib/course";
import { joinCourseSchema, type JoinCourseValues } from "@/lib/courseSchema";
import { formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

const PAY_BUTTON =
  "inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60";

export function CourseEnrol({ course }: { course: PublicCourse }) {
  const { data: user } = useMe();
  const { hash } = useLocation();
  const sectionRef = useRef<HTMLElement>(null);

  // Links to /course#enrol arrive before the course has loaded, so the browser finds no
  // #enrol to jump to. The section does it itself once it exists.
  useEffect(() => {
    if (hash === "#enrol") sectionRef.current?.scrollIntoView({ behavior: "instant" });
  }, [hash]);

  const facts: { label: string; Icon: LucideIcon }[] = [
    { label: `${course.minutes}-minute video`, Icon: Clock },
    { label: "Watch on your phone or laptop", Icon: Smartphone },
    { label: "Your realtor console opens when it ends", Icon: KeyRound },
  ];

  return (
    <section ref={sectionRef} id="enrol" className="scroll-mt-24 border-t border-line bg-surface/40 py-28 max-lg:py-20 max-sm:py-16">
      <Container className="grid grid-cols-[minmax(0,1fr)_26rem] items-start gap-16 max-lg:grid-cols-1 max-lg:gap-12">
        <Reveal y={16}>
          <span className="eyebrow">About the video</span>
          <h2 className="display mt-4 text-[2.6rem] leading-[1.08] text-ink text-balance max-lg:text-4xl max-sm:text-[2rem]">
            What INSPECTRA does for the realtor who closes here
          </h2>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-muted">{course.description}</p>

          <ul className="mt-10 space-y-4">
            {facts.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-3 text-ink">
                <span className="grid size-9 place-items-center rounded-full bg-brand/10 text-brand-ink">
                  <Icon className="size-4" aria-hidden />
                </span>
                {label}
              </li>
            ))}
          </ul>

          {!user && (
            <p className="mt-10 text-sm text-muted">
              Already have an account?{" "}
              <SignInLink />
            </p>
          )}
        </Reveal>

        <Reveal y={16} delay={0.05} className="sticky top-24 max-lg:static">
          <div className="rounded-3xl border border-line bg-surface p-8 shadow-[0_30px_60px_-40px_rgba(10,30,45,0.35)] max-sm:p-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-faint">One payment</p>
            <p className="display mt-1 text-5xl tabular-nums tracking-[-0.03em] text-ink">
              {formatPriceFull(course.price)}
            </p>
            {user ? <SignedInCard user={user} course={course} /> : <JoinForm course={course} />}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/** Brings the visitor back to this card after signing in. */
function SignInLink() {
  return (
    <Link to="/login" state={{ from: "/course#enrol" }} className="font-semibold text-brand-ink hover:underline">
      Sign in
    </Link>
  );
}

/** Sends the browser to Flutterwave and keeps the spinner up while it leaves. */
async function goToCheckout(link: string) {
  window.location.assign(link);
  await new Promise(() => {});
}

function Problem({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-ink">
      {children}
    </p>
  );
}

/** Signed out: the account and the payment in one form. */
function JoinForm({ course }: { course: PublicCourse }) {
  const join = useJoinCourse();
  // A refusal worth reading, like "already paid, link re-sent", stays in the card.
  const [problem, setProblem] = useState<{ message: string; signIn: boolean } | null>(null);
  // Checked details wait here while the buyer confirms them. Null means the dialog is shut.
  const [review, setReview] = useState<JoinCourseValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinCourseValues>({ resolver: zodResolver(joinCourseSchema) });

  function onSubmit(values: JoinCourseValues) {
    setProblem(null);
    setReview(values);
  }

  async function pay() {
    if (!review) return;
    try {
      const { link } = await join.mutateAsync(review);
      await goToCheckout(link);
    } catch (error) {
      setReview(null);
      const message = apiMessage(error, "Checkout did not start. Try again.");
      setProblem({
        message,
        // The 409s that mean the email has an account say so; "link emailed again" does not.
        signIn: apiStatus(error) === 409 && /sign in/i.test(message),
      });
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <AuthField
          label="Full name"
          autoComplete="name"
          error={errors.fullname?.message}
          {...register("fullname")}
        />
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          hint={<span className="text-xs text-faint">You sign in with this</span>}
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthField
          label="Phone"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <button type="submit" disabled={isSubmitting} className={cn("mt-2", PAY_BUTTON)}>
          {isSubmitting ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <>
              Create account and pay <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </button>
        <p className="text-center text-xs text-faint">Card, bank transfer or USSD</p>
      </form>

      {problem && (
        <Problem>
          {problem.message}
          {problem.signIn && (
            <>
              {" "}
              <SignInLink />
            </>
          )}
        </Problem>
      )}

      <ConfirmDialog
        open={review !== null}
        onOpenChange={(open) => !open && setReview(null)}
        title="Check your details before you pay"
        description="This opens your realtor account. You sign in with this email, and your course link is sent to it. It cannot be changed after you pay."
        confirmLabel={`Pay ${formatPriceFull(course.price)}`}
        cancelLabel="Edit details"
        pending={join.isPending}
        onConfirm={pay}
      >
        {review && (
          <dl className="mt-5 divide-y divide-line rounded-2xl border border-line bg-surface-2/40">
            {(
              [
                ["Full name", review.fullname],
                ["Email", review.email],
                ["Phone", review.phone],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className={cn("min-w-0 truncate text-right text-sm font-semibold text-ink", label === "Email" && "text-brand-ink")}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </ConfirmDialog>
    </>
  );
}

/**
 * Signed in, the card answers for the account: pay in one click, watch what is paid for,
 * or go to the console the course already opened. A seeker or admin is told the course
 * opens a realtor account of its own.
 */
function SignedInCard({ user, course }: { user: AuthUser; course: PublicCourse }) {
  const locked = user.role === "realtor" && user.courseLocked;
  const mine = useMyEnrollment(locked);
  const checkout = useCourseCheckout();
  const [problem, setProblem] = useState<string | null>(null);

  if (user.role !== "realtor")
    return (
      <Note>
        The course opens a realtor account. You are signed in as{" "}
        <span className="font-semibold text-ink">{user.email}</span>, so sign out and enrol with a
        different email.
      </Note>
    );

  if (!locked)
    return (
      <>
        <Note>Your realtor console is already open.</Note>
        <Link to="/realtor" className={cn("mt-6", PAY_BUTTON)}>
          <LayoutDashboard className="size-4" aria-hidden />
          Go to your console
        </Link>
      </>
    );

  if (mine.isPending) return <div className="mt-8 h-13 animate-pulse rounded-full bg-surface-2" />;

  if (mine.data?.access)
    return (
      <>
        <Note>You have paid for the course. Your console opens when the video ends.</Note>
        <Link
          to={`/course/learn?access=${encodeURIComponent(mine.data.access)}`}
          className={cn("mt-6", PAY_BUTTON)}
        >
          <Play className="size-4 fill-current" aria-hidden />
          Watch the course
        </Link>
      </>
    );

  async function pay() {
    setProblem(null);
    try {
      const { link } = await checkout.mutateAsync();
      await goToCheckout(link);
    } catch (error) {
      setProblem(apiMessage(error, "Checkout did not start. Try again."));
    }
  }

  return (
    <>
      <Note>
        Complete your payment to watch the course. Your course link goes to{" "}
        <span className="font-semibold text-ink">{user.email}</span>.
      </Note>
      <button type="button" onClick={pay} disabled={checkout.isPending} className={cn("mt-6", PAY_BUTTON)}>
        {checkout.isPending ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <>
            Pay {formatPriceFull(course.price)} <ArrowRight className="size-4" aria-hidden />
          </>
        )}
      </button>
      <p className="mt-3 text-center text-xs text-faint">Card, bank transfer or USSD</p>
      {problem && <Problem>{problem}</Problem>}
    </>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-6 text-sm leading-relaxed text-muted">{children}</p>;
}
