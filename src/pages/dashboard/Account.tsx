import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Loader2, Camera, Check, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  seekerProfileSchema,
  securitySchema,
  type SeekerProfileValues,
  type SecurityValues,
} from "@/lib/accountSchema";
import { passwordStrength } from "@/lib/authSchemas";
import { apiMessage } from "@/lib/api";
import { useAuthUser, useUpdatePassword } from "@/lib/auth";
import {
  AVATAR_MAX_MB,
  avatarError,
  PROPERTY_INTERESTS,
  useProfile,
  useRemoveAvatar,
  useUpdateProfile,
  useUploadAvatar,
} from "@/lib/profile";
import { displayName } from "@/lib/format";
import { cn } from "@/lib/cn";

const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Kano"];
const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;

export function Account() {
  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader title="Account" subtitle="Manage your profile, preferences and security." />
      </Reveal>

      <Reveal y={16}>
        <ProfileSection />
      </Reveal>
      <Reveal y={16}>
        <PreferencesSection />
      </Reveal>
      {/* <Reveal y={16}>
        <NotificationsSection />
      </Reveal> */}
      <Reveal y={16}>
        <SecuritySection />
      </Reveal>
    </div>
  );
}

/* Profile ------------------------------------------------------------------ */
function PanelSkeleton({ title }: { title: string }) {
  return (
    <Panel title={title}>
      <div className="h-40 animate-pulse rounded-xl bg-surface-2" />
    </Panel>
  );
}

function ProfileSection() {
  const user = useAuthUser();
  const { data: profile, isPending } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SeekerProfileValues>({
    resolver: zodResolver(seekerProfileSchema),
    // values, not defaultValues: the form fills in once the profile arrives.
    values: {
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      phone: user.phone ?? "",
    },
  });

  async function onSubmit(input: SeekerProfileValues) {
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
          <SaveButton pending={isSubmitting} label="Save changes" icon={Check} />
        </div>
      </form>
    </Panel>
  );
}

function AvatarPicker() {
  const user = useAuthUser();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const busy = uploadAvatar.isPending || removeAvatar.isPending;
  const [error, setError] = useState<string | null>(null);

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    // Checked here so an oversized file never leaves the browser.
    const rejection = avatarError(file);
    setError(rejection);
    if (rejection) return;

    try {
      await uploadAvatar.mutateAsync(file);
      toast.success("Photo updated");
    } catch (error) {
      toast.error(apiMessage(error));
    }
  }

  async function onRemove() {
    setError(null);

    try {
      await removeAvatar.mutateAsync();
      toast.success("Photo removed");
    } catch (error) {
      toast.error(apiMessage(error));
    }
  }

  return (
    <div className="mb-6 flex items-center gap-4">
      <UserAvatar
        name={displayName(user.fullname)}
        avatar={user.avatar}
        className="size-16 text-base"
      />
      <div className="flex flex-wrap items-center gap-2">
        <label
          className={cn(
            buttonClasses("outline", "sm"),
            "cursor-pointer",
            busy && "pointer-events-none opacity-60",
          )}
        >
          {uploadAvatar.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Camera className="size-4" aria-hidden />
          )}
          Change photo
          <input
            type="file"
            accept="image/*"
            onChange={onPick}
            disabled={busy}
            className="sr-only"
          />
        </label>
        {user.avatar && (
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className={cn(buttonClasses("ghost", "sm"), "disabled:opacity-60")}
          >
            Remove
          </button>
        )}
        {error ? (
          <p role="alert" className="w-full text-xs text-rose-500">
            {error}
          </p>
        ) : (
          <p className="w-full text-xs text-muted">
            JPG, PNG or WebP, up to {AVATAR_MAX_MB}MB.
          </p>
        )}
      </div>
    </div>
  );
}

/* Preferences -------------------------------------------------------------- */
function PreferencesSection() {
  const { data: profile, isPending } = useProfile();
  const updateProfile = useUpdateProfile();

  const [city, setCity] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[] | null>(null);

  const currentCity = city ?? profile?.preferredCity ?? "";
  const currentInterests = interests ?? profile?.propertyInterests ?? [];

  const toggle = (slug: string) =>
    setInterests(
      currentInterests.includes(slug)
        ? currentInterests.filter((x) => x !== slug)
        : [...currentInterests, slug],
    );

  async function save() {
    try {
      await updateProfile.mutateAsync({
        preferredCity: currentCity,
        propertyInterests: currentInterests,
      });
      setCity(null);
      setInterests(null);
      toast.success("Preferences saved");
    } catch (error) {
      toast.error(apiMessage(error));
    }
  }

  if (isPending) return <PanelSkeleton title="Search preferences" />;

  return (
    <Panel title="Search preferences">
      <div className="space-y-6">
        <div className="max-w-xs">
          <label className="mb-1.5 block text-sm font-medium text-ink">Preferred city</label>
          <Select value={currentCity} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-2.5 text-sm font-medium text-ink">Property types you are after</p>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_INTERESTS.map((t) => {
              const on = currentInterests.includes(t.slug);
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => toggle(t.slug)}
                  aria-pressed={on}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    on
                      ? "border-brand bg-brand/10 text-brand-ink"
                      : "border-line text-muted hover:border-brand/40 hover:text-ink",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <SaveButton
            pending={updateProfile.isPending}
            label="Save preferences"
            icon={Check}
            onClick={save}
          />
        </div>
      </div>
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
          <SaveButton pending={isSubmitting} label="Update password" icon={ShieldCheck} />
        </div>
      </form>
    </Panel>
  );
}

/* Shared save button ------------------------------------------------------- */
function SaveButton({
  pending,
  label,
  icon: Icon,
  onClick,
}: {
  pending: boolean;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={pending}
      className={cn(buttonClasses("brand", "md"), "min-w-36 disabled:opacity-60")}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <>
          <Icon className="size-4" aria-hidden />
          {label}
        </>
      )}
    </button>
  );
}
