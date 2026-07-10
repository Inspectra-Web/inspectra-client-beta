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
import {
  profileSchema,
  securitySchema,
  type ProfileValues,
  type SecurityValues,
} from "@/lib/accountSchema";
import { passwordStrength } from "@/lib/authSchemas";
import { seeker } from "@/data/seeker";
import { cn } from "@/lib/cn";

const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Kano"];
const INTERESTS = ["Apartment", "Duplex", "Terrace", "Bungalow", "Penthouse", "Land"];
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
      <Reveal y={16}>
        <NotificationsSection />
      </Reveal>
      <Reveal y={16}>
        <SecuritySection />
      </Reveal>
    </div>
  );
}

/* Profile ------------------------------------------------------------------ */
function ProfileSection() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: seeker.name, email: seeker.email, phone: seeker.phone },
  });

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Profile updated");
  }

  return (
    <Panel title="Profile">
      <div className="mb-6 flex items-center gap-4">
        <img
          src={seeker.avatar}
          alt={seeker.name}
          className="size-16 rounded-full object-cover ring-1 ring-line"
        />
        <button type="button" className={buttonClasses("outline", "sm")}>
          <Camera className="size-4" />
          Change photo
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <AuthField
            label="Full name"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
          <AuthField
            label="Phone"
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="flex justify-end">
          <SaveButton pending={isSubmitting} label="Save changes" icon={Check} />
        </div>
      </form>
    </Panel>
  );
}

/* Preferences -------------------------------------------------------------- */
function PreferencesSection() {
  const [city, setCity] = useState(seeker.city);
  const [interests, setInterests] = useState<string[]>(["Apartment", "Terrace"]);
  const [pending, setPending] = useState(false);

  const toggle = (t: string) =>
    setInterests((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  async function save() {
    setPending(true);
    await new Promise((r) => setTimeout(r, 800));
    setPending(false);
    toast.success("Preferences saved");
  }

  return (
    <Panel title="Search preferences">
      <div className="space-y-6">
        <div className="max-w-xs">
          <label className="mb-1.5 block text-sm font-medium text-ink">Preferred city</label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue />
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
          <p className="mb-2.5 text-sm font-medium text-ink">Property types you're after</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((t) => {
              const on = interests.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggle(t)}
                  aria-pressed={on}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    on
                      ? "border-brand bg-brand/10 text-brand-ink"
                      : "border-line text-muted hover:border-brand/40 hover:text-ink",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <SaveButton pending={pending} label="Save preferences" icon={Check} onClick={save} />
        </div>
      </div>
    </Panel>
  );
}

/* Notifications ------------------------------------------------------------ */
const NOTIFS = [
  { key: "email", label: "Email updates", desc: "New verified matches and price changes." },
  { key: "sms", label: "SMS alerts", desc: "Time-sensitive updates on homes you saved." },
  { key: "inspections", label: "Inspection reminders", desc: "A nudge before each viewing." },
  { key: "digest", label: "Weekly digest", desc: "A roundup of fresh listings for your search." },
] as const;

function NotificationsSection() {
  const [state, setState] = useState<Record<string, boolean>>({
    email: true,
    sms: false,
    inspections: true,
    digest: true,
  });

  return (
    <Panel title="Notifications">
      <ul className="divide-y divide-line">
        {NOTIFS.map((n) => (
          <li key={n.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-ink">{n.label}</p>
              <p className="mt-0.5 text-sm text-muted">{n.desc}</p>
            </div>
            <Toggle
              on={state[n.key]}
              onChange={() => {
                setState((s) => ({ ...s, [n.key]: !s[n.key] }));
                toast.success("Notification preference updated");
              }}
              label={n.label}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        on ? "bg-brand" : "bg-surface-2 ring-1 ring-inset ring-line",
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          on ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
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

  const pw = watch("password") ?? "";
  const score = passwordStrength(pw);

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Password updated");
    reset();
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
