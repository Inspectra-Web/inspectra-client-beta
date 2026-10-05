import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Loader2, Check, ImagePlus, Lock, CalendarDays } from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { AuthField } from "@/components/auth/AuthField";
import { Calendar } from "@/components/ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
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
import { useIdentity } from "@/lib/identity";
import {
  AVATAR_MAX_MB,
  avatarError,
  REGIONS,
  useProfile,
  useRemoveAvatar,
  useUpdateProfile,
  useUploadAvatar,
  type ProfileUpdate,
} from "@/lib/profile";
import { displayName, formatDate } from "@/lib/format";
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
  const { data: identity } = useIdentity();

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
      gender: profile?.gender ?? "",
      dateOfBirth: profile?.dateOfBirth?.slice(0, 10) ?? "",
      specialization: profile?.specialization ?? [],
      agencyName: profile?.agencyName ?? "",
      // A free-text region from before the zones were fixed reads as unset, so saving the
      // form does not send back a value the server now refuses.
      region: REGIONS.some((r) => r.value === profile?.region) ? profile!.region : "",
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

  const nameLocked = identity?.ninVerified === true;
  const lockedField = cn(nameLocked && "cursor-not-allowed bg-surface-2/60 text-muted");
  // A NIN verified before the date was asked for leaves it open once, as the server does.
  const dobLocked = nameLocked && !!profile?.dateOfBirth;

  const desc = watch("bio") ?? "";
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const selectProps = (id: string) => ({
    open: openSelect === id,
    onOpenChange: (o: boolean) => setOpenSelect((prev) => (o ? id : prev === id ? null : prev)),
  });

  async function onSubmit(input: RealtorSettingsValues) {
    // The Selects are bound to fixed option lists, so the widened strings are
    // safe to narrow here. gender and dateOfBirth have no default on the server,
    // so an unanswered one is omitted rather than sent as "" which fails validation.
    const { gender, dateOfBirth, ...rest } = input;
    const payload = {
      ...rest,
      ...(gender && { gender }),
      ...(dateOfBirth && { dateOfBirth }),
    } as ProfileUpdate;

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
          <div>
            <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
              <AuthField label="First name" readOnly={nameLocked} className={lockedField} error={errors.firstName?.message} {...register("firstName")} />
              <AuthField label="Last name" readOnly={nameLocked} className={lockedField} error={errors.lastName?.message} {...register("lastName")} />
              <AuthField label="Middle name" readOnly={nameLocked} className={lockedField} {...register("middleName")} />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-faint">
              {nameLocked && <Lock className="size-3 shrink-0" aria-hidden />}
              {nameLocked
                ? "Locked to your verified NIN."
                : "Must match your NIN exactly, including your middle name, before you verify your identity."}
            </p>
          </div>

          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-ink">Self description</label>
            <textarea
              id="bio" rows={4}
              placeholder="Tell buyers what you specialize in and how you work…"
              className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              {...register("bio")}
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-rose-500">{errors.bio?.message}</span>
              {/* A count, not a budget: there is no ceiling to count down to now. */}
              <span className="text-xs text-faint">
                {desc.length} {desc.length === 1 ? "character" : "characters"}
              </span>
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
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <AuthField label="Telephone" type="tel" error={errors.phone?.message} {...register("phone")} />
            <AuthField label="WhatsApp" type="tel" error={errors.whatsapp?.message} {...register("whatsapp")} />
          </div>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <LabeledSelect label="Gender" value={watch("gender") ?? ""} placeholder="Select gender" onValueChange={(val) => setValue("gender", val, { shouldDirty: true })} {...selectProps("gender")}>
              {GENDERS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
            </LabeledSelect>
            <BirthDateField
              value={watch("dateOfBirth") ?? ""}
              onChange={(val) => setValue("dateOfBirth", val, { shouldDirty: true, shouldValidate: true })}
              locked={dobLocked}
              error={errors.dateOfBirth?.message}
              {...selectProps("dateOfBirth")}
            />
          </div>
        </div>
      </Panel>

      {/* professional details */}
      <Panel title="Professional details">
        <div className="space-y-5">
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
            <LabeledSelect label="Region" value={watch("region") ?? ""} placeholder="Where you operate" onValueChange={(val) => setValue("region", val, { shouldDirty: true })} {...selectProps("region")}>
              {REGIONS.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
            </LabeledSelect>
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

/** "YYYY-MM-DD" in and out, read back as "14th May 1990". */
function BirthDateField({
  value, onChange, locked, error, open, onOpenChange,
}: {
  value: string; onChange: (v: string) => void; locked: boolean; error?: string;
  open?: boolean; onOpenChange?: (open: boolean) => void;
}) {
  // The calendar cannot offer a day the API would refuse: 18 at the youngest, 120 at the oldest.
  const latest = dayjs().subtract(18, "year").toDate();
  const earliest = dayjs().subtract(120, "year").toDate();
  const selected = value ? dayjs(value).toDate() : undefined;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink">Date of birth</label>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger
          type="button"
          aria-label="Date of birth"
          aria-invalid={!!error}
          disabled={locked}
          className={cn(
            "flex h-11 w-full items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm transition-colors hover:bg-surface-2 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
            value ? "text-ink" : "text-faint",
            locked && "cursor-not-allowed bg-surface-2/60 text-muted hover:bg-surface-2/60",
            error && "border-rose-400 focus-visible:ring-rose-400/25",
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-faint" aria-hidden />
          <span className="truncate">{value ? formatDate(value) : "Select your date of birth"}</span>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            autoFocus
            captionLayout="dropdown"
            hideNavigation
            selected={selected}
            defaultMonth={selected ?? latest}
            startMonth={earliest}
            endMonth={latest}
            disabled={{ after: latest }}
            onSelect={(day) => {
              if (!day) return;
              onChange(dayjs(day).format("YYYY-MM-DD"));
              onOpenChange?.(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-[13px] text-rose-500">{error}</p>}
      <p className="flex items-center gap-1.5 text-xs text-faint">
        {locked && <Lock className="size-3 shrink-0" aria-hidden />}
        {locked ? "Locked to your verified NIN." : "Must match your NIN and BVN."}
      </p>
    </div>
  );
}
