import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { AvatarPicker } from "@/components/dashboard/AvatarPicker";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import {
  identityProfileSchema,
  securitySchema,
  type IdentityProfileValues,
  type SecurityValues,
} from "@/lib/accountSchema";
import { passwordStrength } from "@/lib/authSchemas";
import { apiMessage } from "@/lib/api";
import { useAuthUser, useUpdatePassword } from "@/lib/auth";
import { useProfile, useUpdateProfile } from "@/lib/profile";
import { cn } from "@/lib/cn";

const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;

const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { month: "long", year: "numeric" });

export function AdminAccount() {
  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader title="Account" subtitle="Your admin profile and sign-in security." />
      </Reveal>

      <div className="grid grid-cols-2 items-start gap-6 max-lg:grid-cols-1">
        <Reveal y={16}>
          <ProfileSection />
        </Reveal>
        <Reveal y={16} delay={0.05}>
          <SecuritySection />
        </Reveal>
      </div>
    </div>
  );
}

function PanelSkeleton({ title }: { title: string }) {
  return (
    <Panel title={title}>
      <div className="h-40 animate-pulse rounded-xl bg-surface-2" />
    </Panel>
  );
}

/* Profile ------------------------------------------------------------------ */
// Only the shared identity fields: the server 403s the realtor and seeker blocks
// for an admin, so those never appear here.
function ProfileSection() {
  const user = useAuthUser();
  const { data: profile, isPending } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IdentityProfileValues>({
    resolver: zodResolver(identityProfileSchema),
    // values, not defaultValues: the form fills in once the profile arrives.
    values: {
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      phone: user.phone ?? "",
    },
  });

  async function onSubmit(input: IdentityProfileValues) {
    try {
      await updateProfile.mutateAsync(input);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(apiMessage(error));
    }
  }

  if (isPending) return <PanelSkeleton title="Profile" />;

  return (
    <Panel title="Profile">
      <AvatarPicker />

      <p className="mb-5 text-sm text-muted">
        Admin since {monthYear(user.createdAt)}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <AuthField
            label="First name"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <AuthField
            label="Last name"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
        <AuthField
          label="Phone"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input
            value={user.email}
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-muted"
          />
          <p className="mt-1.5 text-xs text-muted">
            Your email is tied to sign-in. Contact support to change it.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(buttonClasses("brand", "md"), "min-w-40 disabled:opacity-60")}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <>
                <Check className="size-4" aria-hidden /> Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </Panel>
  );
}

/* Security ----------------------------------------------------------------- */
function SecuritySection() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SecurityValues>({ resolver: zodResolver(securitySchema) });

  const updatePassword = useUpdatePassword();

  const pw = watch("password") ?? "";
  const score = passwordStrength(pw);

  async function onSubmit(input: SecurityValues) {
    try {
      await updatePassword.mutateAsync(input);
      toast.success("Password updated");
      reset();
    } catch (error) {
      toast.error(apiMessage(error));
    }
  }

  return (
    <Panel title="Security">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <PasswordField
          label="Current password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <div className="space-y-2">
          <PasswordField
            label="New password"
            autoComplete="new-password"
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
                      i < score
                        ? score <= 1
                          ? "bg-rose-500"
                          : score === 2
                            ? "bg-amber-500"
                            : score === 3
                              ? "bg-brand"
                              : "bg-verified"
                        : "bg-line",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-muted">
                {STRENGTH_LABELS[score]}
              </span>
            </div>
          )}
        </div>
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(buttonClasses("brand", "md"), "min-w-40 disabled:opacity-60")}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <>
                <ShieldCheck className="size-4" aria-hidden /> Update password
              </>
            )}
          </button>
        </div>
      </form>
    </Panel>
  );
}
