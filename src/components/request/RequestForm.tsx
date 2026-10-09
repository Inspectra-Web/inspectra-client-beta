import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useForm, type Path, type PathValue, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ArrowLeft, ArrowRight, Check, ClipboardCheck, Home, Loader2, MapPin, ShieldCheck,
  UserRound, Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { TagInput } from "@/components/ui/TagInput";
import { buttonClasses } from "@/components/ui/Button";
import { PasswordField } from "@/components/auth/AuthField";
import { RequestSummary } from "@/components/request/RequestSummary";
import { apiMessage, apiStatus } from "@/lib/api";
import type { ContactMeans } from "@/lib/profile";
import {
  useCreateRequest,
  useUpdateRequest,
  useJoinWaitlist,
  type PropertyRequest,
  type RequestCategory,
} from "@/lib/requests";
import {
  AREA_SUGGESTIONS,
  AREAS_MAX,
  BEDROOM_OPTIONS,
  BUDGET_PERIOD,
  CATEGORY_OPTIONS,
  CITY_OPTIONS,
  CONTACT_OPTIONS,
  INTENT_OPTIONS,
  NOTES_MAX,
  TIMELINE_OPTIONS,
  TYPES_BY_CATEGORY,
  amountOf,
  asksBedrooms,
  emptyRequestValues,
  makeRequestSchema,
  requestToValues,
  typeOptions,
  valuesToRequestBody,
  type RequestFormMode,
  type RequestValues,
} from "@/lib/requestSchema";
import { cn } from "@/lib/cn";

/** The fixed header's height plus breathing room. */
const HEADER_OFFSET = 96;

const SIDE_BG =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80";

// The request half of the form survives a detour through sign in. Account fields and
// passwords are never written here.
const DRAFT_KEY = "inspectra:request-draft";
const DRAFT_FIELDS = [
  "intent", "category", "type", "bedrooms", "city", "areas", "budgetMin", "budgetMax",
  "timeline", "notes",
] as const satisfies (keyof RequestValues)[];

function readDraft(): Partial<RequestValues> {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<RequestValues>) : {};
  } catch {
    return {};
  }
}

function writeDraft(values: RequestValues) {
  try {
    const draft = Object.fromEntries(DRAFT_FIELDS.map((key) => [key, values[key]]));
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage blocked: the draft is a convenience, so losing it is fine.
  }
}

function clearRequestDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // As above.
  }
}

interface StepDef {
  id: string;
  label: string;
  hint: string;
  Icon: LucideIcon;
  fields: (keyof RequestValues)[];
}

const BASE_STEPS: StepDef[] = [
  { id: "what", label: "What you need", hint: "Rent, buy, lease or shortlet, and the kind of place.", Icon: Home, fields: ["intent", "category", "type", "bedrooms"] },
  { id: "where", label: "Where", hint: "Your city and the areas you'd live in.", Icon: MapPin, fields: ["city", "areas"] },
  { id: "budget", label: "Budget and timing", hint: "What you can spend, and when you need it.", Icon: Wallet, fields: ["budgetMin", "budgetMax", "timeline", "notes"] },
];

const LAST_STEP: Record<RequestFormMode, StepDef> = {
  join: { id: "you", label: "Your details", hint: "So we can reach you when homes match.", Icon: UserRound, fields: ["fullname", "email", "phone", "contactMeans", "password", "confirmPassword", "consent"] },
  seeker: { id: "review", label: "Review", hint: "Check it over, then file it.", Icon: ClipboardCheck, fields: ["consent"] },
  edit: { id: "review", label: "Review", hint: "Check your changes, then save them.", Icon: ClipboardCheck, fields: [] },
};

const SUBMIT_LABEL: Record<RequestFormMode, string> = {
  join: "Join the waitlist",
  seeker: "File request",
  edit: "Save changes",
};

export type RequestFormResult =
  | { kind: "joined"; email: string; request: PropertyRequest }
  | { kind: "filed"; request: PropertyRequest }
  | { kind: "saved"; request: PropertyRequest };

/**
 * The waitlist request, as a short guided form. Signed out, the last step takes the
 * account too and submits both at once; a signed-in seeker just reviews and files; an
 * edit opens on a saved request with every step reachable.
 */
export function RequestForm({
  mode,
  initial,
  cancelTo,
  onDone,
}: {
  mode: RequestFormMode;
  /** The request being edited. Required in edit mode. */
  initial?: PropertyRequest;
  /** Where the first step's Cancel goes. Without it, step one shows no Cancel. */
  cancelTo?: string;
  onDone: (result: RequestFormResult) => void;
}) {
  const reduced = useReducedMotion();
  const join = useJoinWaitlist();
  const create = useCreateRequest();
  const update = useUpdateRequest();
  const editing = mode === "edit";
  const STEPS = [...BASE_STEPS, LAST_STEP[mode]];
  const last = STEPS.length - 1;

  const {
    register, handleSubmit, watch, setValue, trigger, setError,
    formState: { errors, isSubmitting },
  } = useForm<RequestValues>({
    resolver: zodResolver(makeRequestSchema(mode)) as Resolver<RequestValues>,
    // An edit starts from the saved request, never from a draft left by another one.
    defaultValues: editing && initial ? requestToValues(initial) : { ...emptyRequestValues, ...readDraft() },
  });

  const v = watch();
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(editing ? last : 0);
  const formRef = useRef<HTMLFormElement>(null);
  const firstStep = useRef(true);

  // Continue sits at the foot of a tall card, so a new step would open with its heading
  // scrolled away. Bring the top back under the fixed header, but only when it is gone.
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    const top = formRef.current?.getBoundingClientRect().top ?? 0;
    if (top < HEADER_OFFSET)
      window.scrollTo({ top: window.scrollY + top - HEADER_OFFSET, behavior: reduced ? "auto" : "smooth" });
  }, [step, reduced]);

  useEffect(() => {
    if (editing) return;
    const sub = watch((values) => writeDraft(values as RequestValues));
    return () => sub.unsubscribe();
  }, [watch, editing]);

  // Only one Select open at a time (Radix re-enables background pointer events; see index.css).
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const selectProps = (id: string) => ({
    open: openSelect === id,
    onOpenChange: (o: boolean) => setOpenSelect((prev) => (o ? id : prev === id ? null : prev)),
  });

  const set = <K extends Path<RequestValues>>(key: K, value: PathValue<RequestValues, K>) =>
    setValue(key, value, { shouldDirty: true, shouldValidate: key in errors });

  function chooseCategory(category: RequestCategory) {
    set("category", category);
    if (v.type && !TYPES_BY_CATEGORY[category].includes(v.type)) set("type", "");
    if (!asksBedrooms(category)) set("bedrooms", "");
  }

  function chooseCity(city: RequestValues["city"]) {
    // Areas belong to a city, so a new city starts the list again.
    if (city !== v.city) set("areas", []);
    set("city", city);
  }

  /** Amounts are typed loosely and shown grouped: "1500000" reads back as "1,500,000". */
  function typeAmount(key: "budgetMin" | "budgetMax", raw: string) {
    const amount = amountOf(raw);
    set(key, amount === undefined ? "" : amount.toLocaleString("en-NG"));
  }

  async function goNext() {
    if (!(await trigger(STEPS[step].fields))) return;
    setStep((s) => {
      const n = Math.min(s + 1, last);
      setMaxReached((m) => Math.max(m, n));
      return n;
    });
  }

  const goStep = (i: number) => {
    if (i <= maxReached) setStep(i);
  };

  function onInvalid(errs: typeof errors) {
    const idx = STEPS.findIndex((s) => s.fields.some((f) => f in errs));
    if (idx >= 0) setStep(idx);
  }

  async function onSubmit(values: RequestValues) {
    const request = valuesToRequestBody(values);

    try {
      if (mode === "join") {
        const email = values.email.trim();
        const saved = await join.mutateAsync({
          fullname: values.fullname.trim(),
          email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          phone: values.phone.trim(),
          contactMeans: values.contactMeans as ContactMeans,
          request,
          consent: true,
        });
        clearRequestDraft();
        onDone({ kind: "joined", email, request: saved });
      } else if (editing && initial) {
        const saved = await update.mutateAsync({ id: initial.id, body: request });
        onDone({ kind: "saved", request: saved });
      } else {
        const saved = await create.mutateAsync(request);
        clearRequestDraft();
        onDone({ kind: "filed", request: saved });
      }
    } catch (error) {
      // An address already on file is the one failure with a field to point at.
      if (mode === "join" && apiStatus(error) === 409) {
        setError("email", { message: apiMessage(error) });
        return;
      }
      toast.error(
        apiMessage(error, editing ? "We couldn't save your changes. Please try again." : "We couldn't file your request. Please try again."),
      );
    }
  }

  const submit = handleSubmit(onSubmit, onInvalid);
  const period = BUDGET_PERIOD[v.intent];

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      onKeyDown={(e) => {
        // Enter shouldn't submit mid-wizard (except from the final step); textareas are exempt.
        if (e.key === "Enter" && step !== last && (e.target as HTMLElement).tagName !== "TEXTAREA") {
          e.preventDefault();
        }
      }}
      className="grid grid-cols-[minmax(280px,320px)_1fr] rounded-3xl border border-line bg-surface max-lg:grid-cols-1"
    >
      {/* Guide panel */}
      <aside className="relative overflow-hidden rounded-l-3xl bg-[#06121b] text-white max-lg:hidden">
        <img src={SIDE_BG} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-cover opacity-[0.14]" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#06121b] via-transparent to-[#06121b]" />
        <div className="pointer-events-none absolute -right-40 top-10 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(26,172,240,0.20),transparent_65%)]" />

        <div className="relative z-10 flex h-full flex-col p-8">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-white/80">
            {editing ? "Editing" : "Waitlist"}
          </span>
          <h2 className="display mt-6 text-[2rem] leading-[1.08] text-balance">First to know.</h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
            Tell us once. When verified homes that match go live, you hear before anyone else.
          </p>

          <ol className="mt-10 space-y-1.5">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              const reachable = i <= maxReached;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goStep(i)}
                    disabled={!reachable}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      active ? "bg-white/10" : reachable ? "hover:bg-white/5" : "cursor-not-allowed opacity-50",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg border text-sm font-semibold transition-colors",
                        done && "border-brand bg-brand text-[#04121f]",
                        active && "border-brand bg-brand/15 text-white",
                        !done && !active && "border-white/20 text-white/60",
                      )}
                    >
                      {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : <s.Icon className="size-4" aria-hidden />}
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block text-sm font-medium", active || done ? "text-white" : "text-white/70")}>{s.label}</span>
                      <span className="block truncate text-xs text-white/45">{s.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-auto flex items-start gap-2.5 border-t border-white/10 pt-6 text-xs text-white/60">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            Every home we send you is verified: the property and the realtor both.
          </div>
        </div>
      </aside>

      <div className="flex min-h-[36rem] min-w-0 flex-col p-8 max-sm:p-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-brand-ink">Step {step + 1} of {STEPS.length}</p>
            <div className="hidden items-center gap-1.5 max-lg:flex">
              {STEPS.map((s, i) => (
                <span key={s.id} className={cn("size-1.5 rounded-full transition-colors", i === step ? "bg-brand" : i < step ? "bg-brand/40" : "bg-line")} />
              ))}
            </div>
          </div>
          <h2 className="display mt-1 text-2xl text-ink">{STEPS[step].label}</h2>
          <p className="mt-1 text-sm text-muted">{STEPS[step].hint}</p>
        </div>

        <div className="mt-7 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <SectionLabel>I want to</SectionLabel>
                    <div className="grid grid-cols-4 gap-3 max-md:grid-cols-2">
                      {INTENT_OPTIONS.map((o) => (
                        <ChoiceCard key={o.value} active={v.intent === o.value} onClick={() => set("intent", o.value)} title={o.label} hint={o.hint} />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    <FieldSelect label="Category" value={v.category} onValueChange={(val) => chooseCategory(val as RequestCategory)} error={errors.category?.message} {...selectProps("category")}>
                      {CATEGORY_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </FieldSelect>
                    {/* Radix Select cannot hold "", so "any" stands in for no type. */}
                    <FieldSelect label="Type" value={v.type || "any"} onValueChange={(val) => set("type", val === "any" ? "" : val)} error={errors.type?.message} {...selectProps("type")}>
                      <SelectItem value="any">Any type</SelectItem>
                      {typeOptions(v.category).map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </FieldSelect>
                  </div>
                  {asksBedrooms(v.category) && (
                    <div>
                      <SectionLabel>Bedrooms, at least</SectionLabel>
                      <div className="flex flex-wrap gap-2">
                        <Chip active={!v.bedrooms} onClick={() => set("bedrooms", "")}>Any</Chip>
                        {BEDROOM_OPTIONS.map((n) => (
                          <Chip key={n} active={v.bedrooms === n} onClick={() => set("bedrooms", n)}>{n}+</Chip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <SectionLabel>City</SectionLabel>
                    <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
                      {CITY_OPTIONS.map((o) => (
                        <ChoiceCard key={o.value} active={v.city === o.value} onClick={() => chooseCity(o.value)} title={o.label} />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted">We're opening in these three cities first.</p>
                  </div>
                  <div>
                    <SectionLabel>Areas <span className="text-faint">(optional, up to {AREAS_MAX})</span></SectionLabel>
                    <TagInput
                      value={v.areas}
                      onChange={(next) => set("areas", next.slice(0, AREAS_MAX))}
                      suggestions={AREA_SUGGESTIONS[v.city]}
                      placeholder={v.areas.length ? "Add another area…" : "Type an area, e.g. " + AREA_SUGGESTIONS[v.city][0]}
                    />
                    {errors.areas?.message ? (
                      <p className="mt-1.5 text-[13px] text-rose-500">{errors.areas.message}</p>
                    ) : (
                      <p className="mt-2 text-xs text-muted">Leave it empty if anywhere in the city works.</p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <SectionLabel>Budget <span className="text-faint">({period})</span></SectionLabel>
                    <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                      <AmountField label="Minimum (optional)" value={v.budgetMin} onChange={(raw) => typeAmount("budgetMin", raw)} error={errors.budgetMin?.message} />
                      <AmountField label="Maximum" value={v.budgetMax} onChange={(raw) => typeAmount("budgetMax", raw)} error={errors.budgetMax?.message} />
                    </div>
                  </div>
                  <div>
                    <SectionLabel>When do you need it?</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {TIMELINE_OPTIONS.map((o) => (
                        <Chip key={o.value} active={v.timeline === o.value} onClick={() => set("timeline", o.value)}>{o.label}</Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink">Anything else? <span className="font-normal text-faint">(optional)</span></label>
                    <textarea
                      id="notes"
                      rows={3}
                      maxLength={NOTES_MAX}
                      placeholder="e.g. Close to Unilag, needs parking for two cars"
                      className={cn("resize-none px-4 py-3", fieldBase, errors.notes && fieldError)}
                      {...register("notes")}
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-rose-500">{errors.notes?.message}</span>
                      <span className="text-xs text-faint">{v.notes.length}/{NOTES_MAX}</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <SectionLabel>Your request</SectionLabel>
                    <RequestSummary request={valuesToRequestBody(v)} />
                  </div>

                  {mode === "join" && (
                    <div>
                      <div className="flex items-baseline justify-between gap-3">
                        <SectionLabel>Your account</SectionLabel>
                        <p className="text-xs text-muted">
                          Have one?{" "}
                          <Link to="/login" state={{ from: "/request" }} className="font-medium text-brand-ink hover:underline">Sign in</Link>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                        <Field label="Full name" autoComplete="name" placeholder="e.g. Ada Obi" error={errors.fullname?.message} {...register("fullname")} />
                        <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
                        <Field label="Phone number" type="tel" autoComplete="tel" placeholder="e.g. 0803 123 4567" error={errors.phone?.message} {...register("phone")} />
                        <FieldSelect label="Best way to reach you" value={v.contactMeans} onValueChange={(val) => set("contactMeans", val)} error={errors.contactMeans?.message} {...selectProps("contactMeans")}>
                          {CONTACT_OPTIONS.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                        </FieldSelect>
                        <PasswordField label="Password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password?.message} className={passwordSoft} {...register("password")} />
                        <PasswordField label="Confirm password" autoComplete="new-password" placeholder="Re-enter your password" error={errors.confirmPassword?.message} className={passwordSoft} {...register("confirmPassword")} />
                      </div>
                    </div>
                  )}

                  {/* Consent was given when the request was filed; an edit does not ask again. */}
                  {!editing && (
                    <div>
                      <label className="flex items-start gap-2.5 text-sm text-muted">
                        <input type="checkbox" className="mt-0.5 size-4 shrink-0 rounded border-line accent-brand" {...register("consent")} />
                        {mode === "join" ? (
                          <span>
                            I agree to INSPECTRA's{" "}
                            <Link to="/terms" className="font-medium text-brand-ink hover:underline">Terms</Link> and{" "}
                            <Link to="/privacy" className="font-medium text-brand-ink hover:underline">Privacy Policy</Link>, and to being contacted about homes that match this request.
                          </span>
                        ) : (
                          <span>I agree to being contacted about homes that match this request.</span>
                        )}
                      </label>
                      {errors.consent && <p className="mt-1.5 text-[13px] text-rose-500">{errors.consent.message}</p>}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className={buttonClasses("ghost", "md")}>
              <ArrowLeft className="size-4" aria-hidden /> Back
            </button>
          ) : cancelTo ? (
            <Link to={cancelTo} className={buttonClasses("ghost", "md")}>Cancel</Link>
          ) : (
            <span />
          )}

          {/* One node, always type="button": see the note in ListingForm. */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={step < last ? goNext : submit}
            className={cn(buttonClasses("brand", "md"), step < last ? "min-w-32" : "min-w-44", "disabled:opacity-60")}
          >
            {step < last ? (
              <>Continue <ArrowRight className="size-4" aria-hidden /></>
            ) : isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <><Check className="size-4" aria-hidden /> {SUBMIT_LABEL[mode]}</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-faint">{children}</p>;
}

const fieldBase =
  "w-full rounded-xl border border-transparent bg-surface-2 text-sm text-ink transition-colors " +
  "placeholder:text-faint focus-visible:border-brand focus-visible:bg-surface focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50";
const fieldError = "border-rose-400 bg-rose-500/5 focus-visible:ring-rose-400/25";
/** PasswordField renders the pill Input; this brings it in line with the soft fields beside it. */
const passwordSoft =
  "rounded-xl border-transparent bg-surface-2 focus-visible:bg-surface focus-visible:ring-brand/25";

const Field = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { label: string; error?: string }
>(function Field({ label, error, id, className, ...props }, ref) {
  const fieldId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">{label}</label>
      <input id={fieldId} ref={ref} aria-invalid={!!error} className={cn("h-11 px-4", fieldBase, error && fieldError, className)} {...props} />
      {error && <p className="text-[13px] text-rose-500">{error}</p>}
    </div>
  );
});

function AmountField({
  label, value, onChange, error,
}: {
  label: string; value: string; onChange: (raw: string) => void; error?: string;
}) {
  const id = label.toLowerCase().replace(/\W+/g, "-");
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-sm text-muted">₦</span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className={cn("h-11 pl-8 pr-4 tabular-nums", fieldBase, error && fieldError)}
        />
      </div>
      {error && <p className="text-[13px] text-rose-500">{error}</p>}
    </div>
  );
}

function FieldSelect({
  label, value, onValueChange, error, children, open, onOpenChange,
}: {
  label: string; value: string; onValueChange: (v: string) => void; error?: string;
  children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="text-sm font-medium text-ink">{label}</label>
      <Select value={value} onValueChange={onValueChange} open={open} onOpenChange={onOpenChange}>
        <SelectTrigger
          aria-label={label}
          className={cn(
            "h-11 w-full rounded-xl border-transparent bg-surface-2 hover:bg-surface-2 focus-visible:bg-surface focus-visible:ring-brand/25",
            error && "border-rose-400 bg-rose-500/5 focus-visible:ring-rose-400/25",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      {error && <p className="text-[13px] text-rose-500">{error}</p>}
    </div>
  );
}

/** A large single-choice tile: intent and city. */
function ChoiceCard({
  active, onClick, title, hint,
}: {
  active: boolean; onClick: () => void; title: string; hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-2xl border px-4 py-3.5 text-left transition-colors duration-200",
        active ? "border-brand bg-brand/[0.07] ring-1 ring-brand/30" : "border-line bg-surface hover:border-brand/40",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{title}</span>
        <span className={cn("grid size-4.5 place-items-center rounded-full border transition-colors", active ? "border-brand bg-brand text-[#04121f]" : "border-line")}>
          {active && <Check className="size-3" strokeWidth={3} aria-hidden />}
        </span>
      </span>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </button>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 rounded-full border px-4 text-sm font-medium transition-colors",
        active ? "border-brand bg-brand/10 text-brand-ink" : "border-line text-muted hover:border-brand/40 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
