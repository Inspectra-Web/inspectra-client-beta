import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Loader2, ShieldCheck, UserRound, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { PasswordField } from "@/components/auth/AuthField";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { AccountProfile } from "@/components/realtor/AccountProfile";
import { AccountSettings } from "@/components/realtor/AccountSettings";
import { securitySchema, type SecurityValues } from "@/lib/accountSchema";
import { passwordStrength } from "@/lib/authSchemas";
import { cn } from "@/lib/cn";

const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;

const TABS = [
  { id: "profile", label: "Profile", Icon: UserRound },
  { id: "settings", label: "Settings", Icon: Settings2 },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function RealtorAccount() {
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader title="Account" subtitle="Your public profile and how buyers reach you." />
      </Reveal>

      {/* tab switch */}
      <Reveal y={12}>
        <div role="tablist" aria-label="Account views" className="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active ? "bg-ink text-bg" : "text-muted hover:text-ink",
                )}
              >
                <t.Icon className="size-4" aria-hidden />
                {t.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      {tab === "profile" ? (
        <AccountProfile onEdit={() => setTab("settings")} />
      ) : (
        <div className="space-y-6">
          <AccountSettings onSaved={() => setTab("profile")} />
          <Reveal y={16}>
            <SecuritySection />
          </Reveal>
        </div>
      )}
    </div>
  );
}

/* Security ----------------------------------------------------------------- */
function SecuritySection() {
  const {
    register, handleSubmit, watch, reset,
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
        <PasswordField label="Current password" autoComplete="current-password" error={errors.currentPassword?.message} {...register("currentPassword")} />
        <div className="space-y-2">
          <PasswordField label="New password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
          {pw && !errors.password && (
            <div className="flex items-center gap-3">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      i < score
                        ? score <= 1 ? "bg-rose-500" : score === 2 ? "bg-amber-500" : score === 3 ? "bg-brand" : "bg-verified"
                        : "bg-line",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-muted">{STRENGTH_LABELS[score]}</span>
            </div>
          )}
        </div>
        <PasswordField label="Confirm new password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className={cn(buttonClasses("brand", "md"), "min-w-40 disabled:opacity-60")}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <><ShieldCheck className="size-4" aria-hidden /> Update password</>}
          </button>
        </div>
      </form>
    </Panel>
  );
}
