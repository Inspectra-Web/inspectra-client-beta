import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/Button";
import { profileSchema, securitySchema, type ProfileValues, type SecurityValues } from "@/lib/accountSchema";
import { admin } from "@/data/admin";

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

function ProfileSection() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: admin.name, email: admin.email, phone: "+234 801 234 5678" },
  });

  async function onSubmit(values: ProfileValues) {
    await new Promise((r) => setTimeout(r, 500));
    toast.success(`Profile saved for ${values.name}.`);
  }

  return (
    <Panel title="Profile">
      <div className="mb-5 flex items-center gap-4">
        <img src={admin.avatar} alt={admin.name} className="size-14 rounded-full object-cover ring-1 ring-line" />
        <div>
          <p className="font-semibold text-ink">{admin.role}</p>
          <p className="text-sm text-muted">Admin since {admin.memberSince}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthField label="Full name" error={errors.name?.message} {...register("name")} />
        <AuthField label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <AuthField label="Phone" error={errors.phone?.message} {...register("phone")} />
        <Button type="submit" variant="brand" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Panel>
  );
}

function SecuritySection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SecurityValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Password updated.");
    reset();
  }

  return (
    <Panel title="Security">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PasswordField
          label="Current password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <PasswordField label="New password" error={errors.password?.message} {...register("password")} />
        <PasswordField
          label="Confirm new password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" variant="brand" disabled={isSubmitting}>
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Panel>
  );
}
