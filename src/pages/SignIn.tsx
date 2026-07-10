import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import { GoogleButton, OrDivider } from "@/components/auth/SocialAuth";
import { VerifiedProof } from "@/components/auth/authProof";
import { signInSchema, type SignInValues } from "@/lib/authSchemas";

export function SignIn() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: SignInValues) {
    // Mock auth: no backend yet, simulate a request then land the user in the app.
    await new Promise((r) => setTimeout(r, 900));
    toast.success(`Welcome back, ${values.email.split("@")[0]}`);
    navigate("/listings");
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
