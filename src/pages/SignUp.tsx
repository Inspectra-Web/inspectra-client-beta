import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  GraduationCap,
  Loader2,
  MailCheck,
  Search,
  TriangleAlert,
} from "lucide-react";
import { toast } from "react-toastify";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
// import { GoogleButton, OrDivider } from "@/components/auth/SocialAuth";
import { VerifiedProof, CredentialProof } from "@/components/auth/authProof";
import { signUpSchema, type SignUpValues } from "@/lib/authSchemas";
import {
  apiMessage,
  apiStatus,
  registerAccount,
  resendVerification,
} from "@/lib/api";
import { useInvite } from "@/lib/course";
import { cn } from "@/lib/cn";

const ROLES = [
  {
    value: "seeker",
    label: "I'm looking for a property",
    desc: "Rent, buy, lease or shortlet a verified home.",
    Icon: Search,
  },
  {
    value: "realtor",
    label: "I'm a realtor",
    desc: "Watch the realtor course, then list your properties.",
    Icon: BadgeCheck,
  },
] as const;

// The dark panel speaks to whichever audience is selected.
const SIDE = {
  seeker: {
    eyebrow: "For seekers",
    headline: (
      <>
        Search only homes that are
        <span className="block text-brand-gradient">actually verified.</span>
      </>
    ),
    sub: "Every listing is checked for title, documents and fees before it reaches you. Tell us what you're looking for and be first to hear when matching homes go live.",
    proof: <VerifiedProof />,
  },
  realtor: {
    eyebrow: "For realtors",
    headline: (
      <>
        List as a name buyers
        <span className="block text-foil">already trust.</span>
      </>
    ),
    sub: "Get certified once, then carry a credential buyers recognise on your profile, on your listings and in every deal.",
    proof: <CredentialProof />,
  },
} as const;

export function SignUp() {
  // Registration does not sign you in, so the page flips to a reassurance state
  // holding the address rather than navigating anywhere.
  const [sentTo, setSentTo] = useState<string | null>(null);
  // The account can exist while its verification email did not go out.
  const [emailFailed, setEmailFailed] = useState(false);
  const [resending, setResending] = useState(false);
  const [searchParams] = useSearchParams();
  // Realtor accounts are opened by the invite the course hands out when the video ends.
  const invite = searchParams.get("invite") ?? "";
  const inviteQuery = useInvite(invite);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role:
        invite || searchParams.get("role") === "realtor" ? "realtor" : "seeker",
    },
  });

  const role = watch("role");
  const invited = inviteQuery.data;

  // The invite carries who paid, so the account is opened in their name and address.
  useEffect(() => {
    if (!invited) return;
    setValue("fullname", invited.fullname);
    setValue("email", invited.email);
  }, [invited, setValue]);

  async function onSubmit(values: SignUpValues) {
    try {
      const { emailSent } = await registerAccount({
        fullname: values.fullname,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: values.role,
        ...(values.role === "realtor" && invite ? { invite } : {}),
      });
      setEmailFailed(!emailSent);
      setSentTo(values.email);
    } catch (error) {
      const message = apiMessage(error);

      // A taken email belongs on the field that caused it, not in a toast.
      if (apiStatus(error) === 409) {
        setError("email", { message });
        return;
      }

      toast.error(message);
    }
  }

  async function handleResend() {
    if (!sentTo) return;

    setResending(true);
    try {
      toast.success(await resendVerification(sentTo));
      setEmailFailed(false);
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setResending(false);
    }
  }

  if (sentTo)
    return (
      <AuthShell side={SIDE[role ?? "seeker"]}>
        <div className="text-center">
          <span className="inline-grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
            <MailCheck className="size-7" />
          </span>
          <h1 className="display mt-6 text-4xl max-sm:text-3xl">
            {emailFailed ? "Your account is ready" : "Check your inbox"}
          </h1>
          {emailFailed ? (
            <p className="mt-3 text-muted">
              We could not send the verification email to{" "}
              <span className="font-medium text-ink">{sentTo}</span>. Send it again
              below, then open it to activate your account and sign in.
            </p>
          ) : (
            <p className="mt-3 text-muted">
              We sent a verification link to{" "}
              <span className="font-medium text-ink">{sentTo}</span>. Open it to
              activate your account, then sign in. The link expires in 24 hours.
            </p>
          )}

          {emailFailed && (
            <div className="mt-8">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-7 font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
            >
              {resending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Send the verification email"}
            </button>
            </div>
          )}

          {!emailFailed && (
          <p className="mt-8 text-sm text-muted">
            Nothing yet? Check your spam folder, or{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-medium text-brand-ink hover:underline disabled:opacity-60"
            >
              {resending ? "sending..." : "resend the link"}
            </button>
            .
          </p>
          )}

          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );

  return (
    <AuthShell side={SIDE[role ?? "seeker"]}>
      <header>
        <h1 className="display text-4xl max-sm:text-3xl">
          Create your account
        </h1>
        <p className="mt-2 text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-brand-ink hover:underline"
          >
            Sign in
          </Link>
        </p>
      </header>

      {/* role choice: two obvious, selectable cards. An invite has already chosen. */}
      {!invite && (
        <fieldset className="mt-7">
          <legend className="text-sm font-medium text-ink">
            I'm signing up as
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            {ROLES.map(({ value, label, desc, Icon }) => {
              const active = role === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValue("role", value, { shouldValidate: true })
                  }
                  aria-pressed={active}
                  className={cn(
                    "group relative flex flex-col rounded-2xl border p-4 text-left transition-all duration-200",
                    active
                      ? "border-brand bg-brand/5 ring-2 ring-brand/30"
                      : "border-line bg-surface hover:border-brand/40 hover:-translate-y-0.5",
                  )}
                >
                  {/* selected check */}
                  <span
                    className={cn(
                      "absolute right-3 top-3 grid size-5 place-items-center rounded-full transition-colors",
                      active
                        ? "bg-brand text-[#04121f]"
                        : "border border-line text-transparent",
                    )}
                    aria-hidden
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-xl transition-colors",
                      active
                        ? "bg-brand/15 text-brand-ink"
                        : "bg-surface-2 text-muted",
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="mt-3 text-sm font-semibold text-ink">
                    {label}
                  </span>
                  <span className="mt-1 text-xs leading-snug text-muted">
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {role === "realtor" && !invite ? (
        <CourseGate />
      ) : role === "realtor" && inviteQuery.isPending ? (
        <div className="mt-7 h-80 animate-pulse rounded-2xl bg-surface-2" />
      ) : role === "realtor" && inviteQuery.isError ? (
        <InviteProblem message={apiMessage(inviteQuery.error)} />
      ) : (
        <>
          {invited && (
            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-verified/30 bg-verified/10 p-4">
              <CircleCheck
                className="mt-0.5 size-5 shrink-0 text-verified"
                aria-hidden
              />
              <div>
                <p className="text-sm font-semibold text-ink">
                  Course completed
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  Your realtor account opens with the details you enrolled with.
                  Set a password to finish.
                </p>
              </div>
            </div>
          )}

          {/* Google sign-up is not wired to the API yet, so it stays off until it works. */}
          {/* <div className="mt-6 space-y-4">
        <GoogleButton label="Sign up with Google" />
        <OrDivider />
      </div> */}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <AuthField
              label="Full name"
              autoComplete="name"
              placeholder="Chinedu Okeke"
              error={errors.fullname?.message}
              {...register("fullname")}
            />

            <AuthField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              readOnly={!!invited}
              className={cn(
                invited && "cursor-not-allowed bg-surface-2 text-muted",
              )}
              hint={
                invited ? (
                  <span className="text-xs text-faint">
                    Where your course link went
                  </span>
                ) : undefined
              }
              error={errors.email?.message}
              {...register("email")}
            />

            <PasswordField
              label="Password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...register("password")}
            />

            <PasswordField
              label="Confirm password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <div>
              <label className="flex items-start gap-2.5 text-sm text-muted">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-line accent-brand"
                  {...register("acceptTerms")}
                />
                <span>
                  I agree to INSPECTRA's{" "}
                  <Link
                    to="/terms"
                    className="font-medium text-brand-ink hover:underline"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-medium text-brand-ink hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1.5 text-[13px] text-rose-500">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <>
                  Create account
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}

/** Realtor sign-up without an invite: the way in is the course. */
function CourseGate() {
  return (
    <div className="mt-7 rounded-2xl border border-line bg-surface p-6">
      <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand-ink">
        <GraduationCap className="size-5" aria-hidden />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-ink">
        Realtor accounts start with the course
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Watch the short realtor course and your registration link unlocks when
        it ends.
      </p>
      <Link
        to="/course"
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5"
      >
        See the realtor course <ArrowRight className="size-4" aria-hidden />
      </Link>
      <p className="mt-4 text-center text-xs text-faint">
        Already watched it? Open your course link from your email and register
        from there.
      </p>
    </div>
  );
}

function InviteProblem({ message }: { message: string }) {
  return (
    <div className="mt-7 rounded-2xl border border-gold/30 bg-gold/10 p-6">
      <p className="flex items-center gap-2 font-semibold text-ink">
        <TriangleAlert className="size-5 text-gold" aria-hidden /> Registration
        link not accepted
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to="/login"
          className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
        >
          Sign in
        </Link>
        <Link
          to="/course"
          className="inline-flex h-10 items-center rounded-full border border-line px-5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
        >
          Realtor course
        </Link>
      </div>
    </div>
  );
}
