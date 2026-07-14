import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { SecurityProof } from "@/components/auth/authProof";
import { forgotSchema, type ForgotValues } from "@/lib/authSchemas";

export function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  async function onSubmit(values: ForgotValues) {
    // Mock: no email is actually sent. Swap to the reassurance state.
    await new Promise((r) => setTimeout(r, 900));
    setSentTo(values.email);
  }

  return (
    <AuthShell
      side={{
        eyebrow: "Account recovery",
        headline: (
          <>
            A quick reset,
            <span className="block text-brand-gradient">and you're back in.</span>
          </>
        ),
        sub: "We'll email you a secure link to set a new password. Your saved homes and inspections are waiting.",
        proof: <SecurityProof />,
      }}
    >
      {sentTo ? (
        <div>
          <span className="grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
            <MailCheck className="size-7" aria-hidden />
          </span>
          <h1 className="display mt-6 text-4xl max-sm:text-3xl">Check your inbox</h1>
          <p className="mt-3 text-muted">
            If an account exists for{" "}
            <span className="font-medium text-ink">{sentTo}</span>, we've sent a link to
            reset your password. It expires in 30 minutes.
          </p>

          <div className="mt-8 space-y-3 text-sm">
            <p className="text-muted">
              Didn't get it? Check spam, or{" "}
              <button
                type="button"
                onClick={() => setSentTo(null)}
                className="font-medium text-brand-ink hover:underline"
              >
                try another email
              </button>
              .
            </p>
          </div>

          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-brand-ink"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <header>
            <h1 className="display text-4xl max-sm:text-3xl">Forgot password?</h1>
            <p className="mt-2 text-muted">
              Enter the email tied to your account and we'll send you a reset link.
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <>
                  Send reset link
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </button>
          </form>

          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to sign in
          </Link>
        </>
      )}
    </AuthShell>
  );
}
