import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Blocks,
  Coins,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Play,
  Smartphone,
  Sparkles,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { apiMessage, apiStatus } from "@/lib/api";
import { useMe, type AuthUser } from "@/lib/auth";
import {
  forgetReferralCode,
  referralCodeFrom,
  rememberReferralCode,
  useCourseCheckout,
  useJoinCourse,
  useMyEnrollment,
  useReferrer,
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
  const referral = useReferral();
  const sectionRef = useRef<HTMLElement>(null);

  // Links to /course#enrol arrive before the course has loaded, so the browser finds no
  // #enrol to jump to. The section does it itself once it exists.
  useEffect(() => {
    if (hash === "#enrol") sectionRef.current?.scrollIntoView({ behavior: "instant" });
  }, [hash]);

  const facts: { label: string; Icon: LucideIcon }[] = [
    { label: "Blockchain technology masterclass", Icon: Blocks },
    { label: "Advanced AI storytelling masterclass", Icon: Sparkles },
    { label: "How INSPECTRA works and how rewards are earned", Icon: Play },
    { label: "Your realtor dashboard, open as soon as you pay", Icon: KeyRound },
    { label: "A $USD digital asset on every transaction", Icon: Coins },
    { label: "Paid-for mentorship for the first 100 realtors", Icon: Users },
    { label: "Watch on your phone or laptop", Icon: Smartphone },
  ];

  return (
    <section ref={sectionRef} id="enrol" className="scroll-mt-24 border-t border-line bg-surface/40 py-28 max-lg:py-20 max-sm:py-16">
      <Container className="grid grid-cols-[minmax(0,1fr)_26rem] items-start gap-16 max-lg:grid-cols-1 max-lg:gap-12">
        <Reveal y={16}>
          <span className="eyebrow">What you get</span>
          <h2 className="display mt-4 text-[2.6rem] leading-[1.08] text-ink text-balance max-lg:text-4xl max-sm:text-[2rem]">
            Everything one payment opens for you
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
            {user ? (
              <SignedInCard user={user} course={course} referral={referral} />
            ) : (
              <JoinForm course={course} referral={referral} />
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

interface Referral {
  /** The code to send with the checkout; empty when there is none or it does not work. */
  code: string;
  /** Set once the code is confirmed. */
  firstName: string | null;
  checking: boolean;
  broken: boolean;
  /** Where the code came from, so a bad one is explained in the right place. */
  typed: boolean;
  /** A code the buyer typed in. */
  apply: (code: string) => void;
  /** Drops the referral: the buyer removed it, or the checkout turned it down. */
  drop: () => void;
}

/**
 * The referral this visitor arrived with, from a link or typed in. A code the server says
 * does not work is dropped and said so; one it could not check yet is still sent, and the
 * checkout checks it again.
 */
function useReferral(): Referral {
  const { search } = useLocation();
  const [code, setCode] = useState(() => referralCodeFrom(search));
  const [typed, setTyped] = useState(false);
  const referrer = useReferrer(code);

  const status = referrer.isError ? apiStatus(referrer.error) : undefined;
  const broken = code !== "" && (status === 400 || status === 422);

  useEffect(() => {
    if (broken) forgetReferralCode();
  }, [broken]);

  return {
    code: broken ? "" : code,
    firstName: referrer.data ?? null,
    checking: code !== "" && referrer.isFetching,
    broken,
    typed,
    apply: (next) => {
      const clean = next.trim().toUpperCase();
      if (!clean) return;
      rememberReferralCode(clean);
      setTyped(true);
      setCode(clean);
    },
    drop: () => {
      forgetReferralCode();
      setCode("");
    },
  };
}

/** A refusal that names the referral link means the link went bad: pay without it. */
const referralRefused = (message: string) => /referral link/i.test(message);

function ReferralNote({ referral }: { referral: Referral }) {
  if (referral.firstName)
    return (
      <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-brand/25 bg-brand/8 px-4 py-3 text-sm text-ink">
        <UserCheck className="size-4 shrink-0 text-brand-ink" aria-hidden />
        <span className="min-w-0 flex-1">
          Referred by <span className="font-semibold capitalize">{referral.firstName}</span>
        </span>
        <button
          type="button"
          onClick={referral.drop}
          className="shrink-0 text-xs font-semibold text-muted hover:text-ink hover:underline"
        >
          Remove
        </button>
      </div>
    );

  return (
    <>
      {referral.broken && !referral.typed && (
        <p className="mt-6 rounded-2xl border border-line bg-surface-2/50 px-4 py-3 text-sm text-muted">
          This referral link does not work. You can still join, just without a referrer.
        </p>
      )}
      <ReferralCodeEntry referral={referral} />
    </>
  );
}

/** For a buyer given a code rather than a link. Closed until asked for, so it stays out of the way. */
function ReferralCodeEntry({ referral }: { referral: Referral }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 text-sm font-semibold text-brand-ink hover:underline"
      >
        Have a referral code?
      </button>
    );

  return (
    <form
      className="mt-6"
      onSubmit={(event) => {
        event.preventDefault();
        referral.apply(value);
      }}
    >
      <label htmlFor="referral-code" className="text-sm font-medium text-ink">
        Referral code
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="referral-code"
          value={value}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          maxLength={8}
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. A6S3T56V"
          aria-invalid={referral.typed && referral.broken}
          className="h-11 min-w-0 flex-1 rounded-full border border-line bg-bg px-4 text-sm tracking-[0.12em] text-ink outline-none placeholder:tracking-normal placeholder:text-faint focus:border-brand"
        />
        <button
          type="submit"
          disabled={!value.trim() || referral.checking}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-bg transition-opacity disabled:opacity-50"
        >
          {referral.checking ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Apply"}
        </button>
      </div>
      {referral.typed && referral.broken && (
        <p role="alert" className="mt-2 text-sm text-muted">
          That code does not work. Check it with the realtor who gave it to you, or join without one.
        </p>
      )}
    </form>
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
function JoinForm({ course, referral }: { course: PublicCourse; referral: Referral }) {
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
      const { link } = await join.mutateAsync({
        ...review,
        ...(referral.code && { referralCode: referral.code }),
      });
      await goToCheckout(link);
    } catch (error) {
      setReview(null);
      const message = apiMessage(error, "Checkout did not start. Try again.");
      if (referralRefused(message)) {
        referral.drop();
        setProblem({ message: `${message} Pay again to join without a referrer.`, signIn: false });
        return;
      }
      setProblem({
        message,
        // The 409s that mean the email has an account say so; "link emailed again" does not.
        signIn: apiStatus(error) === 409 && /sign in/i.test(message),
      });
    }
  }

  return (
    <>
      <ReferralNote referral={referral} />
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
                ...(referral.firstName ? [["Referred by", referral.firstName]] : []),
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-muted">{label}</dt>
                <dd
                  className={cn(
                    "min-w-0 truncate text-right text-sm font-semibold text-ink",
                    label === "Email" && "text-brand-ink",
                    label === "Referred by" && "capitalize",
                  )}
                >
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
 * Signed in, the card answers for the account. Any realtor pays in one click, whether
 * their dashboard is waiting on the payment or was open before the course existed; once
 * paid, they watch. A seeker is told the course opens a realtor account of its own, and
 * an admin is sent to watch it free.
 */
function SignedInCard({
  user,
  course,
  referral,
}: {
  user: AuthUser;
  course: PublicCourse;
  referral: Referral;
}) {
  const realtor = user.role === "realtor";
  const locked = realtor && user.courseLocked;
  const mine = useMyEnrollment(realtor);
  const checkout = useCourseCheckout();
  const [problem, setProblem] = useState<string | null>(null);

  if (user.role === "admin")
    return (
      <>
        <Note>Admins watch the course free, from the admin dashboard.</Note>
        <Link to="/admin/course/watch" className={cn("mt-6", PAY_BUTTON)}>
          <Play className="size-4 fill-current" aria-hidden />
          Watch the course
        </Link>
      </>
    );

  if (user.role !== "realtor")
    return (
      <Note>
        The course opens a realtor account. You are signed in as{" "}
        <span className="font-semibold text-ink">{user.email}</span>, so sign out and enrol with a
        different email.
      </Note>
    );

  if (mine.isPending) return <div className="mt-8 h-13 animate-pulse rounded-full bg-surface-2" />;

  if (mine.data?.access)
    return (
      <>
        <Note>You have paid for the course, and your realtor dashboard is open.</Note>
        <Link
          to={`/course/learn?access=${encodeURIComponent(mine.data.access)}`}
          className={cn("mt-6", PAY_BUTTON)}
        >
          <Play className="size-4 fill-current" aria-hidden />
          Watch the course
        </Link>
        <DashboardLink />
      </>
    );

  async function pay() {
    setProblem(null);
    try {
      const { link } = await checkout.mutateAsync(referral.code || undefined);
      await goToCheckout(link);
    } catch (error) {
      const message = apiMessage(error, "Checkout did not start. Try again.");
      if (referralRefused(message)) {
        referral.drop();
        setProblem(`${message} Pay again to continue without a referrer.`);
        return;
      }
      setProblem(message);
    }
  }

  return (
    <>
      <ReferralNote referral={referral} />
      <Note>
        {locked
          ? "Complete your payment and your realtor dashboard opens straight away."
          : "Your dashboard is open. Add the masterclasses and the digital asset rewards."}{" "}
        Your course link goes to <span className="font-semibold text-ink">{user.email}</span>.
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
      {!locked && <DashboardLink />}
    </>
  );
}

function DashboardLink() {
  return (
    <Link
      to="/realtor"
      className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline"
    >
      <LayoutDashboard className="size-4" aria-hidden /> Go to your dashboard
    </Link>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-6 text-sm leading-relaxed text-muted">{children}</p>;
}
