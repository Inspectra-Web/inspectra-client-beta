import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowRight, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/AuthField";
import { SecurityProof } from "@/components/auth/authProof";
import {
  resetSchema,
  passwordStrength,
  type ResetValues,
} from "@/lib/authSchemas";
import { cn } from "@/lib/cn";

const STRENGTH = [
  { label: "Too weak", tone: "bg-rose-500", text: "text-rose-500" },
  { label: "Weak", tone: "bg-rose-500", text: "text-rose-500" },
  { label: "Fair", tone: "bg-amber-500", text: "text-amber-600" },
  { label: "Good", tone: "bg-brand", text: "text-brand-ink" },
  { label: "Strong", tone: "bg-verified", text: "text-verified" },
] as const;

export function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const hasToken = !!params.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  const pw = watch("password") ?? "";
  const score = passwordStrength(pw);
  const meter = STRENGTH[score];

  async function onSubmit(_values: ResetValues) {
    // Mock: no token is verified against a backend. Simulate the update, then send the
    // user to sign in with their new password.
    await new Promise((r) => setTimeout(r, 900));
    toast.success("Password updated. Please sign in.");
    navigate("/login");
  }

  return (
    <AuthShell
      side={{
        eyebrow: "Secure your account",
        headline: (
          <>
            Set a new password,
            <span className="block text-brand-gradient">stay protected.</span>
          </>
        ),
        sub: "Choose a strong password you don't use anywhere else. You'll use it every time you sign in.",
        proof: <SecurityProof />,
      }}
    >
      <header>
        <h1 className="display text-4xl max-sm:text-3xl">Set a new password</h1>
        <p className="mt-2 text-muted">
          Create a password you'll remember. Make it at least 8 characters with a letter
          and a number.
        </p>
      </header>

      {!hasToken && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted">
          <ShieldAlert className="mt-0.5 size-4.5 shrink-0 text-amber-600" aria-hidden />
          <p>
            This reset link looks incomplete. Open the link from your email, or{" "}
            <Link
              to="/forgot-password"
              className="font-medium text-brand-ink hover:underline"
            >
              request a new one
            </Link>
            .
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div className="space-y-2">
          <PasswordField
            label="New password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register("password")}
          />
          {pw && !errors.password && (
            <div className="flex items-center gap-3">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      i < score ? meter.tone : "bg-line",
                    )}
                  />
                ))}
              </div>
              <span className={cn("text-xs font-medium", meter.text)}>
                {meter.label}
              </span>
            </div>
          )}
        </div>

        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
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
              Update password
              <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </button>
      </form>

      <Link
        to="/login"
        className="mt-8 inline-block text-sm font-medium text-muted hover:text-ink"
      >
        Back to sign in
      </Link>
    </AuthShell>
  );
}
