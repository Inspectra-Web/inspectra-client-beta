import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiMessage } from "@/lib/api";
import { ArrowRight, Clock, KeyRound, Loader2, Smartphone, type LucideIcon } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { AuthField } from "@/components/auth/AuthField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useEnroll, type PublicCourse } from "@/lib/course";
import { enrollSchema, type EnrollValues } from "@/lib/courseSchema";
import { formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

export function CourseEnrol({ course }: { course: PublicCourse }) {
  const facts: { label: string; Icon: LucideIcon }[] = [
    { label: `${course.minutes}-minute video`, Icon: Clock },
    { label: "Watch on your phone or laptop", Icon: Smartphone },
    { label: "Registration unlocks when it ends", Icon: KeyRound },
  ];

  return (
    <section id="enrol" className="scroll-mt-24 border-t border-line bg-surface/40 py-28 max-lg:py-20 max-sm:py-16">
      <Container className="grid grid-cols-[minmax(0,1fr)_26rem] items-start gap-16 max-lg:grid-cols-1 max-lg:gap-12">
        <Reveal y={16}>
          <span className="eyebrow">About the video</span>
          <h2 className="display mt-4 text-[2.6rem] leading-[1.08] text-ink text-balance max-lg:text-4xl max-sm:text-[2rem]">
            What INSPECTRA does for the realtor who closes here
          </h2>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-muted">{course.description}</p>

          <ul className="mt-10 space-y-4">
            {facts.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-3 text-ink">
                <span className="grid size-9 place-items-center rounded-full bg-brand/10 text-brand-ink">
                  <Icon className="size-4" aria-hidden />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm text-muted">
            Already a realtor on INSPECTRA?{" "}
            <Link to="/login" className="font-semibold text-brand-ink hover:underline">
              Sign in
            </Link>
          </p>
        </Reveal>

        <Reveal y={16} delay={0.05} className="sticky top-24 max-lg:static">
          <EnrolCard course={course} />
        </Reveal>
      </Container>
    </section>
  );
}

function EnrolCard({ course }: { course: PublicCourse }) {
  const enroll = useEnroll();
  // A refusal worth reading, like "already paid, link re-sent", stays in the card.
  const [problem, setProblem] = useState<string | null>(null);
  // Checked details wait here while the buyer confirms them. Null means the dialog is shut.
  const [review, setReview] = useState<EnrollValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnrollValues>({ resolver: zodResolver(enrollSchema) });

  function onSubmit(values: EnrollValues) {
    setProblem(null);
    setReview(values);
  }

  async function pay() {
    if (!review) return;
    try {
      const { link } = await enroll.mutateAsync(review);
      window.location.assign(link);
      // Keep the spinner while the browser leaves for the checkout.
      await new Promise(() => {});
    } catch (error) {
      setProblem(apiMessage(error, "Checkout did not start. Try again."));
    }
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-8 shadow-[0_30px_60px_-40px_rgba(10,30,45,0.35)] max-sm:p-6">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-faint">One payment</p>
      <p className="display mt-1 text-5xl tabular-nums tracking-[-0.03em] text-ink">
        {formatPriceFull(course.price)}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <AuthField
          label="Full name"
          autoComplete="name"
          error={errors.fullname?.message}
          {...register("fullname")}
        />
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          hint={<span className="text-xs text-faint">Your course link goes here</span>}
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthField
          label="Phone"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "mt-2 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-[#04121f] shadow-[0_10px_30px_-12px_rgba(26,172,240,0.8)] transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60",
          )}
        >
          {isSubmitting ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <>
              Pay {formatPriceFull(course.price)} <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </button>
        <p className="text-center text-xs text-faint">Card, bank transfer or USSD</p>
      </form>
      {problem && (
        <p role="alert" className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-ink">
          {problem}
        </p>
      )}

      <ConfirmDialog
        open={review !== null}
        onOpenChange={(open) => !open && setReview(null)}
        title="Check your details before you pay"
        description="Your course link is emailed to this address, and you register as a realtor with this same email. It cannot be changed after you pay."
        confirmLabel={`Pay ${formatPriceFull(course.price)}`}
        cancelLabel="Edit details"
        pending={enroll.isPending}
        onConfirm={pay}
      >
        {review && (
          <dl className="mt-5 divide-y divide-line rounded-2xl border border-line bg-surface-2/40">
            {(
              [
                ["Full name", review.fullname],
                ["Email", review.email],
                ["Phone", review.phone],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className={cn("min-w-0 truncate text-right text-sm font-semibold text-ink", label === "Email" && "text-brand-ink")}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </ConfirmDialog>
    </div>
  );
}
