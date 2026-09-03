import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Loader2, Check, ImagePlus } from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { AuthField } from "@/components/auth/AuthField";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/Select";
import { TagInput } from "@/components/ui/TagInput";
import { buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { realtorSettingsSchema, type RealtorSettingsValues } from "@/lib/accountSchema";
import { apiMessage } from "@/lib/api";
import { useAuthUser } from "@/lib/auth";
import {
  AVATAR_MAX_MB,
  avatarError,
  useProfile,
  useRemoveAvatar,
  useUpdateProfile,
  useUploadAvatar,
  type ProfileUpdate,
} from "@/lib/profile";
import { displayName } from "@/lib/format";
import { cn } from "@/lib/cn";

const GENDERS = ["Female", "Male", "Other", "Prefer not to say"];
const AVAILABILITY = ["Available", "Busy", "Away"];
const CONTACT_MEANS = ["Phone", "WhatsApp", "Email", "Phone & WhatsApp"];
const SPECIALTIES = [
  "Waterfront homes", "Serviced apartments", "Luxury homes", "Shortlets", "Land & plots",
  "Commercial property", "Duplexes", "Penthouses", "Off-plan developments", "Student housing",
  "Gated estates", "Rentals", "Property investment", "Terraces & townhouses", "Bungalows",
];

/** Editable realtor profile settings, saved through PATCH /profile/me. */
export function AccountSettings({ onSaved }: { onSaved: () => void }) {
  const user = useAuthUser();
  const { data: profile, isPending } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<RealtorSettingsValues>({
    resolver: zodResolver(realtorSettingsSchema),
    // values, not defaultValues: the form fills in once the profile arrives.
    values: {
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      middleName: profile?.middleName ?? "",
      bio: profile?.bio ?? "",
      address: profile?.address ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      country: profile?.country ?? "",
      phone: user.phone ?? "",
      whatsapp: profile?.whatsapp ?? "",
      language: profile?.language ?? "",
      gender: profile?.gender ?? "",
      jobTitle: profile?.jobTitle ?? "",
      experience: profile?.experience ?? "",
      specialization: profile?.specialization ?? [],
      agencyName: profile?.agencyName ?? "",
      region: profile?.region ?? "",
      agencyAddress: profile?.agencyAddress ?? "",
      availabilityStatus: profile?.availabilityStatus ?? "Available",
      contactMeans: profile?.contactMeans ?? "Email",
      socials: {
        instagram: profile?.socials?.instagram ?? "",
        linkedin: profile?.socials?.linkedin ?? "",
        facebook: profile?.socials?.facebook ?? "",
        x: profile?.socials?.x ?? "",
      },
    },
  });

  const desc = watch("bio") ?? "";
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const selectProps = (id: string) => ({
    open: openSelect === id,
    onOpenChange: (o: boolean) => setOpenSelect((prev) => (o ? id : prev === id ? null : prev)),
  });

  async function onSubmit(input: RealtorSettingsValues) {
    // The Selects are bound to fixed option lists, so the widened strings are
    // safe to narrow here. gender has no default on the server, so an
    // unanswered one is omitted rather than sent as "" which fails the enum.
    const { gender, ...rest } = input;
    const payload = (gender ? input : rest) as ProfileUpdate;

    try {
      await updateProfile.mutateAsync(payload);
      toast.success("Profile updated");
      onSaved();
    } catch (error) {
      toast.error(apiMessage(error));
    }
  }

  if (isPending)
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse rounded-2xl border border-line bg-surface-2" />
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-surface-2" />
      </div>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <PhotoPanel />

      {/* self summary */}
      <Panel title="Self summary">
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <AuthField label="First name" error={errors.firstName?.message} {...register("firstName")} />
            <AuthField label="Last name" error={errors.lastName?.message} {...register("lastName")} />
            <AuthField label="Middle name" {...register("middleName")} />
          </div>

          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-ink">Self description</label>
            <textarea
              id="bio" rows={4} maxLength={600}
              placeholder="Tell buyers what you specialize in and how you work…"
              className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              {...register("bio")}
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-rose-500">{errors.bio?.message}</span>
              <span className="text-xs text-faint">{desc.length}/600</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email address</label>
              <input
                value={user.email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-muted"
              />
              <p className="mt-1.5 text-xs text-muted">
                Your email is tied to sign-in. Contact support to change it.
              </p>
            </div>
            <AuthField label="Address" {...register("address")} />
          </div>
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <AuthField label="City" {...register("city")} />
            <AuthField label="State / Province" {...register("state")} />
            <AuthField label="Country" {...register("country")} />
          </div>
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <AuthField label="Telephone" type="tel" error={errors.phone?.message} {...register("phone")} />
            <AuthField label="WhatsApp" type="tel" error={errors.whatsapp?.message} {...register("whatsapp")} />
            <AuthField label="Language" {...register("language")} />
          </div>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <LabeledSelect label="Gender" value={watch("gender") ?? ""} placeholder="Select gender" onValueChange={(val) => setValue("gender", val, { shouldDirty: true })} {...selectProps("gender")}>
              {GENDERS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
            </LabeledSelect>
          </div>
        </div>
      </Panel>

      {/* professional details */}
      <Panel title="Professional details">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <AuthField label="Job title" placeholder="e.g. Senior Realtor" {...register("jobTitle")} />
            <AuthField label="Experience" placeholder="e.g. 8 years in luxury real estate" {...register("experience")} />
          </div>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <AuthField label="Agency name" {...register("agencyName")} />
            <AuthField label="Agency address" {...register("agencyAddress")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Areas of specialty</label>
            <TagInput
              value={watch("specialization") ?? []}
              onChange={(next) => setValue("specialization", next, { shouldDirty: true })}
              suggestions={SPECIALTIES}
              placeholder={(watch("specialization")?.length ?? 0) ? "Add another…" : "Type a specialty, e.g. Waterfront homes"}
            />
            <p className="mt-2 text-xs text-muted">Start typing and pick a suggestion to keep wording consistent, or add your own.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <AuthField label="Region" {...register("region")} />
            <LabeledSelect label="Availability status" value={watch("availabilityStatus") ?? ""} placeholder="Select availability" onValueChange={(val) => setValue("availabilityStatus", val, { shouldDirty: true })} {...selectProps("availability")}>
              {AVAILABILITY.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}
            </LabeledSelect>
            <LabeledSelect label="Main contact means" value={watch("contactMeans") ?? ""} placeholder="Select contact means" onValueChange={(val) => setValue("contactMeans", val, { shouldDirty: true })} {...selectProps("contactMeans")}>
              {CONTACT_MEANS.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </LabeledSelect>
          </div>
        </div>
      </Panel>

      {/* social handles */}
      <Panel title="Social handles">
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <AuthField label="Instagram" placeholder="instagram.com/yourhandle" {...register("socials.instagram")} />
          <AuthField label="LinkedIn" placeholder="linkedin.com/in/yourname" {...register("socials.linkedin")} />
          <AuthField label="Facebook" placeholder="facebook.com/yourpage" {...register("socials.facebook")} />
          <AuthField label="X (Twitter)" placeholder="x.com/yourhandle" {...register("socials.x")} />
        </div>
        <p className="mt-3 text-xs text-muted">
          These appear on your public profile so buyers can reach you. Leave any blank to hide it.
        </p>
      </Panel>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className={cn(buttonClasses("brand", "md"), "min-w-44 disabled:opacity-60")}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <><Check className="size-4" aria-hidden /> Update profile</>}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

/** Its own form-free block: uploading is immediate, not part of the save. */
function PhotoPanel() {
  const user = useAuthUser();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const busy = uploadAvatar.isPending || removeAvatar.isPending;

  const [error, setError] = useState<string | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const rejection = avatarError(file);
    setError(rejection);
    if (rejection) return;

    try {
      await uploadAvatar.mutateAsync(file);
      toast.success("Photo updated");
    } catch (err) {
      toast.error(apiMessage(err));
    }
  }

  async function onRemove() {
    setError(null);

    try {
      await removeAvatar.mutateAsync();
      toast.success("Photo removed");
    } catch (err) {
      toast.error(apiMessage(err));
    }
  }

  return (
    <Panel title="Profile photo">
      <div className="flex items-center gap-6 max-sm:flex-col max-sm:items-start">
        <UserAvatar
          name={displayName(user.fullname)}
          avatar={user.avatar}
          className="size-32 shrink-0 rounded-2xl text-3xl max-sm:size-28"
        />
        <div className="flex-1 max-sm:w-full">
          <label className="group flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-line bg-surface-2/40 px-6 py-7 text-center transition-colors hover:border-brand/50 hover:bg-surface-2/70">
            <span className="grid size-11 place-items-center rounded-2xl bg-linear-to-br from-brand/25 to-brand/5 text-brand-ink ring-1 ring-brand/15">
              {uploadAvatar.isPending ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : (
                <ImagePlus className="size-5" aria-hidden />
              )}
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">Upload your profile photo</p>
            <p className="mt-1 text-xs text-muted">
              A clear, professional headshot works best. JPG, PNG or WebP, up to {AVATAR_MAX_MB}MB.
            </p>
            <span className={cn(buttonClasses("outline", "sm"), "mt-3", busy && "opacity-60")}>
              Select photo
            </span>
            <input type="file" accept="image/*" onChange={onPick} disabled={busy} className="sr-only" />
          </label>

          <div className="mt-2 flex items-center justify-between gap-3">
            {error ? (
              <p role="alert" className="text-xs text-rose-500">{error}</p>
            ) : (
              <span />
            )}
            {user.avatar && (
              <button
                type="button"
                onClick={() => setConfirmingRemove(true)}
                disabled={busy}
                className={cn(buttonClasses("ghost", "sm"), "disabled:opacity-60")}
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingRemove}
        onOpenChange={setConfirmingRemove}
        title="Remove your photo?"
        description="Your profile will fall back to your initials. Buyers see this photo on your public profile."
        confirmLabel="Remove photo"
        destructive
        pending={removeAvatar.isPending}
        onConfirm={onRemove}
      />
    </Panel>
  );
}

function LabeledSelect({
  label, value, onValueChange, placeholder, children, open, onOpenChange,
}: {
  label: string; value: string; onValueChange: (v: string) => void; placeholder?: string;
  children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink">{label}</label>
      <Select value={value} onValueChange={onValueChange} open={open} onOpenChange={onOpenChange}>
        <SelectTrigger aria-label={label} className="h-11 w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}
