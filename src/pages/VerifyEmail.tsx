import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";

import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { VerifiedProof } from "@/components/auth/authProof";
import { apiMessage, resendVerification, verifyEmail } from "@/lib/api";
import { forgotSchema, type ForgotValues } from "@/lib/authSchemas";

/** Reused by the failure state so an expired link is not a dead end. */
function ResendForm() {
  const [sent, setSent] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  async function onSubmit(values: ForgotValues) {
    try {
      const message = await resendVerification(values.email);
      setSent(message);
    } catch (error) {
      toast.error(apiMessage(error));
    }
  }

  if (sent) return <p className="mt-6 text-sm text-muted">{sent}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4 text-left">
      <AuthField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Send a new link"}
      </button>
    </form>
  );
}

export function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  // Deliberately a query, not a useEffect. React 19 StrictMode remounts in dev and
  // re-runs effects, which would POST the single-use token twice: the first call
  // consumes it, the second 400s, and a good link looks expired. The query cache
  // dedupes by key, so the remount joins the same in-flight promise.
  const verify = useQuery({
    queryKey: ["verify-email", token],
    queryFn: () => verifyEmail(token),
    enabled: token.length > 0,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return (
    <AuthShell
      side={{
        eyebrow: "Email verification",
        headline: (
          <>
            One click, and your
            <span className="block text-brand-gradient">account is live.</span>
          </>
        ),
        sub: "Verifying your address keeps INSPECTRA free of throwaway accounts, so every enquiry a realtor receives is from a real person.",
        proof: <VerifiedProof />,
      }}
    >
      <div className="text-center">
        {/* A disabled query stays pending forever, so the no-token case is checked first. */}
        {!token ? (
          <>
            <span className="inline-grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
              <ShieldAlert className="size-7" />
            </span>
            <h1 className="display mt-6 text-4xl max-sm:text-3xl">Link incomplete</h1>
            <p className="mt-3 text-muted">
              This verification link is missing its token. Open the link straight from
              your email, or request a new one below.
            </p>
            <ResendForm />
          </>
        ) : verify.isPending ? (
          <>
            <span className="inline-grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
              <Loader2 className="size-7 animate-spin" />
            </span>
            <h1 className="display mt-6 text-4xl max-sm:text-3xl">Verifying your email</h1>
            <p className="mt-3 text-muted">This only takes a second.</p>
          </>
        ) : verify.isError ? (
          <>
            <span className="inline-grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
              <ShieldAlert className="size-7" />
            </span>
            <h1 className="display mt-6 text-4xl max-sm:text-3xl">Link expired</h1>
            <p className="mt-3 text-muted">{apiMessage(verify.error)}</p>
            <p className="mt-2 text-sm text-muted">
              Verification links last 24 hours and work once. Enter your email for a
              fresh one.
            </p>
            <ResendForm />
          </>
        ) : (
          <>
            <span className="inline-grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
              <BadgeCheck className="size-7" />
            </span>
            <h1 className="display mt-6 text-4xl max-sm:text-3xl">Email verified</h1>
            <p className="mt-3 text-muted">{verify.data}</p>
            <Link
              to="/login"
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5"
            >
              Sign in
            </Link>
          </>
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
}
