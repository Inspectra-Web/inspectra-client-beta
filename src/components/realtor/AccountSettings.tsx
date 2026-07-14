import { useEffect, useRef, useState } from "react";
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
import { realtorSettingsSchema, type RealtorSettingsValues } from "@/lib/accountSchema";
import { realtor } from "@/data/realtor";
import { cn } from "@/lib/cn";

const GENDERS = ["Female", "Male", "Other", "Prefer not to say"];
const AVAILABILITY = ["Available", "Busy", "Away"];
const CONTACT_MEANS = ["Phone", "WhatsApp", "Email", "Phone & WhatsApp"];
const SPECIALTIES = [
  "Waterfront homes", "Serviced apartments", "Luxury homes", "Shortlets", "Land & plots",
  "Commercial property", "Duplexes", "Penthouses", "Off-plan developments", "Student housing",
  "Gated estates", "Rentals", "Property investment", "Terraces & townhouses", "Bungalows",
];

/** Editable realtor profile settings (image_2). Mock: validates, simulates a save, toasts. */
export function AccountSettings({ onSaved }: { onSaved: () => void }) {
  const r = realtor;
  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<RealtorSettingsValues>({
    resolver: zodResolver(realtorSettingsSchema),
    defaultValues: {
      firstName: r.firstName, lastName: r.lastName, middleName: r.middleName,
      selfDescription: r.selfDescription, email: r.email, address: r.address,
      city: r.city, state: r.state, country: r.country, telephone: r.phone,
      whatsapp: r.whatsapp, language: r.languages,
      gender: r.gender, experience: r.experience, specialization: r.specialization,
      agencyName: r.agency, region: r.region, agencyAddress: r.agencyAddress,
      availabilityStatus: r.availabilityStatus, contactMeans: r.contactMeans,
    },
  });

  const desc = watch("selfDescription") ?? "";
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const selectProps = (id: string) => ({
    open: openSelect === id,
    onOpenChange: (o: boolean) => setOpenSelect((prev) => (o ? id : prev === id ? null : prev)),
  });

  // photo preview (mock; object URL, session only)
  const [photo, setPhoto] = useState(r.avatar);
  const objectUrl = useRef<string | null>(null);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const url = URL.createObjectURL(file);
    objectUrl.current = url;
    setPhoto(url);
    e.target.value = "";
  }

  async function onSubmit() {
    await new Promise((res) => setTimeout(res, 800));
    toast.success("Profile updated");
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* profile photo */}
      <Panel title="Profile photo">
        <div className="flex items-center gap-6 max-sm:flex-col max-sm:items-start">
          <img src={photo} alt="Profile" className="size-24 shrink-0 rounded-2xl object-cover ring-1 ring-line" />
          <label className="group flex flex-1 cursor-pointer flex-col items-center rounded-2xl border border-dashed border-line bg-surface-2/40 px-6 py-7 text-center transition-colors hover:border-brand/50 hover:bg-surface-2/70 max-sm:w-full">
            <span className="grid size-11 place-items-center rounded-2xl bg-linear-to-br from-brand/25 to-brand/5 text-brand-ink ring-1 ring-brand/15">
              <ImagePlus className="size-5" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">Upload your profile photo</p>
            <p className="mt-1 text-xs text-muted">A clear, professional headshot works best. JPG or PNG.</p>
            <span className={cn(buttonClasses("outline", "sm"), "mt-3")}>Select photo</span>
            <input type="file" accept="image/*" onChange={onPickPhoto} className="sr-only" />
          </label>
        </div>
      </Panel>

      {/* self summary */}
      <Panel title="Self summary">
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <AuthField label="First name" error={errors.firstName?.message} {...register("firstName")} />
            <AuthField label="Last name" error={errors.lastName?.message} {...register("lastName")} />
            <AuthField label="Middle name" {...register("middleName")} />
          </div>

          <div>
            <label htmlFor="selfDescription" className="mb-1.5 block text-sm font-medium text-ink">Self description</label>
            <textarea
              id="selfDescription" rows={4} maxLength={600}
              placeholder="Tell buyers what you specialize in and how you work…"
              className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              {...register("selfDescription")}
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-rose-500">{errors.selfDescription?.message}</span>
              <span className="text-xs text-faint">{desc.length}/600</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <AuthField label="Email address" type="email" error={errors.email?.message} {...register("email")} />
            <AuthField label="Address" {...register("address")} />
          </div>
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <AuthField label="City" {...register("city")} />
            <AuthField label="State / Province" {...register("state")} />
            <AuthField label="Country" {...register("country")} />
          </div>
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <AuthField label="Telephone" type="tel" error={errors.telephone?.message} {...register("telephone")} />
            <AuthField label="WhatsApp" type="tel" {...register("whatsapp")} />
            <AuthField label="Language" {...register("language")} />
          </div>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <LabeledSelect label="Gender" value={watch("gender") ?? ""} placeholder="Select gender" onValueChange={(val) => setValue("gender", val)} {...selectProps("gender")}>
              {GENDERS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
            </LabeledSelect>
          </div>
        </div>
      </Panel>

      {/* professional details */}
      <Panel title="Professional details">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <AuthField label="Experience" placeholder="e.g. 8 years in luxury real estate" {...register("experience")} />
            <AuthField label="Agency name" {...register("agencyName")} />
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
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <AuthField label="Region" {...register("region")} />
            <AuthField label="Agency address" {...register("agencyAddress")} />
          </div>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <LabeledSelect label="Availability status" value={watch("availabilityStatus") ?? ""} placeholder="Select availability" onValueChange={(val) => setValue("availabilityStatus", val)} {...selectProps("availability")}>
              {AVAILABILITY.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}
            </LabeledSelect>
            <LabeledSelect label="Main contact means" value={watch("contactMeans") ?? ""} placeholder="Select contact means" onValueChange={(val) => setValue("contactMeans", val)} {...selectProps("contactMeans")}>
              {CONTACT_MEANS.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </LabeledSelect>
          </div>
        </div>
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
