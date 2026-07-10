import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Loader2, Search, BadgeCheck, Check } from "lucide-react";
import { toast } from "react-toastify";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import { GoogleButton, OrDivider } from "@/components/auth/SocialAuth";
import { VerifiedProof, CredentialProof } from "@/components/auth/authProof";
import { signUpSchema, type SignUpValues } from "@/lib/authSchemas";
import { cn } from "@/lib/cn";

const ROLES = [
  {
    value: "seeker",
    label: "I'm looking to buy",
    desc: "Browse verified homes and book inspections.",
    Icon: Search,
  },
  {
    value: "realtor",
    label: "I'm a realtor",
    desc: "Get certified and list your properties.",
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
    sub: "Every listing is checked for title, documents and fees before it reaches you. Save the ones you love and book inspections in a tap.",
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
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "seeker" },
  });

  const role = watch("role");

  async function onSubmit(values: SignUpValues) {
    // Mock signup: simulate the request, then route by role. Realtors head toward
    // certification (the prerequisite to list); seekers head into browsing.
    await new Promise((r) => setTimeout(r, 900));
    toast.success("Account created. Welcome to INSPECTRA.");
    navigate(values.role === "realtor" ? "/enablement" : "/dashboard");
  }

  return (
    <AuthShell side={SIDE[role ?? "seeker"]}>
      <header>
        <h1 className="display text-4xl max-sm:text-3xl">Create your account</h1>
        <p className="mt-2 text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-ink hover:underline">
            Sign in
          </Link>
        </p>
      </header>

      {/* role choice: two obvious, selectable cards */}
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
                onClick={() => setValue("role", value, { shouldValidate: true })}
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
                    active ? "bg-brand text-[#04121f]" : "border border-line text-transparent",
                  )}
                  aria-hidden
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl transition-colors",
                    active ? "bg-brand/15 text-brand-ink" : "bg-surface-2 text-muted",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="mt-3 text-sm font-semibold text-ink">{label}</span>
                <span className="mt-1 text-xs leading-snug text-muted">{desc}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 space-y-4">
        <GoogleButton label="Sign up with Google" />
        <OrDivider />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <AuthField
          label="Full name"
          autoComplete="name"
          placeholder="Chinedu Okeke"
          error={errors.name?.message}
          {...register("name")}
        />

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
              <Link to="/terms" className="font-medium text-brand-ink hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-medium text-brand-ink hover:underline">
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
    </AuthShell>
  );
}
