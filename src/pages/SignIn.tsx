import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowRight, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import { GoogleButton, OrDivider } from "@/components/auth/SocialAuth";
import { VerifiedProof } from "@/components/auth/authProof";
import { signInSchema, type SignInValues } from "@/lib/authSchemas";
import { apiMessage, apiStatus, resendVerification } from "@/lib/api";
import { homeFor, useLogin } from "@/lib/auth";
import { displayName } from "@/lib/format";

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  // Set by RequireAuth when it bounced someone off a protected URL.
  const from = (location.state as { from?: string } | null)?.from;

  const [unverified, setUnverified] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: SignInValues) {
    try {
      const user = await login.mutateAsync({
        email: values.email,
        password: values.password,
      });
      toast.success(`Welcome back, ${displayName(user.fullname).split(" ")[0]}`);
      navigate(from ?? homeFor(user.role), { replace: true });
    } catch (error) {
      const status = apiStatus(error);
      const message = apiMessage(error);

      // The server will not say whether the email or the password was wrong, so
      // neither do we: one inline error, and the email field is left untouched.
      if (status === 401) {
        setError("password", { message });
        return;
      }

      // Unverified and suspended are both 403 and differ only in prose.
      if (status === 403 && /verify/i.test(message)) {
        setUnverified(values.email);
        return;
      }

      toast.error(message);
    }
  }

  async function handleResend() {
    if (!unverified) return;

    setResending(true);
    try {
      await resendVerification(unverified);
      setResent(true);
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      side={{
        eyebrow: "Verified real estate",
        headline: (
          <>
            Welcome back to the
            <span className="block text-brand-gradient">verified way to buy.</span>
          </>
        ),
        sub: "Pick up where you left off: saved homes, booked inspections and every message, all in one trusted place.",
        proof: <VerifiedProof />,
      }}
    >
      <header>
        <h1 className="display text-4xl max-sm:text-3xl">Sign in</h1>
        <p className="mt-2 text-muted">
          New to INSPECTRA?{" "}
          <Link to="/register" className="font-medium text-brand-ink hover:underline">
            Create an account
          </Link>
        </p>
      </header>

      <div className="mt-8 space-y-4">
        <GoogleButton label="Continue with Google" />
        <OrDivider />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          hint={
            <Link
              to="/forgot-password"
              className="text-[13px] font-medium text-brand-ink hover:underline"
            >
              Forgot password?
            </Link>
          }
          {...register("password")}
        />

        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            className="size-4 rounded border-line text-brand accent-brand"
            {...register("remember")}
          />
          Keep me signed in
        </label>

        {/* Login is refused until the address is verified. Offer the way out here. */}
        {unverified && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
            <p>
              Your email address is not verified yet. Check your inbox for the link we
              sent to <span className="font-medium text-ink">{unverified}</span>.{" "}
              {resent ? (
                <span className="font-medium text-ink">Sent. Check your inbox.</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-medium text-brand-ink hover:underline disabled:opacity-60"
                >
                  {resending ? "Sending..." : "Resend the link"}
                </button>
              )}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <>
              Sign in
              <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
