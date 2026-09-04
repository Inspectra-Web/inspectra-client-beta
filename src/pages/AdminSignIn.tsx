import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import { ConsoleProof } from "@/components/auth/authProof";
import { signInSchema, type SignInValues } from "@/lib/authSchemas";
import { apiMessage, apiStatus } from "@/lib/api";
import { useAdminLogin } from "@/lib/auth";
import { displayName } from "@/lib/format";

export function AdminSignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAdminLogin();

  const from = (location.state as { from?: string } | null)?.from;

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
      navigate(from ?? "/admin", { replace: true });
    } catch (error) {
      const status = apiStatus(error);
      const message = apiMessage(error);

      if (status === 401) {
        setError("password", { message });
        return;
      }

      toast.error(message);
    }
  }

  return (
    <AuthShell
      side={{
        eyebrow: "Admin console",
        headline: (
          <>
            The desk where trust
            <span className="block text-brand-gradient">gets decided.</span>
          </>
        ),
        sub: "Review titles and documents, certify realtors, and settle disputes. Restricted to INSPECTRA staff.",
        proof: <ConsoleProof />,
      }}
    >
      <header>
        <h1 className="display text-4xl max-sm:text-3xl">Admin sign in</h1>
        <p className="mt-2 text-muted">
          Staff access only. Looking for your account?{" "}
          <Link to="/login" className="font-medium text-brand-ink hover:underline">
            Sign in here
          </Link>
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <AuthField
          label="Work email"
          type="email"
          autoComplete="email"
          placeholder="you@inspectraweb.com"
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
