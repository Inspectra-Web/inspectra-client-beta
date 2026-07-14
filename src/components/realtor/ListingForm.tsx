import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Loader2, Upload, Video, FileText, Check, X, ArrowLeft, ArrowRight,
  ShieldCheck, Plus, Images, Building2, Sparkles, Wallet, FolderCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TagInput } from "@/components/ui/TagInput";
import { buttonClasses } from "@/components/ui/Button";
import {
  makeListingSchema,
  emptyListingValues,
  propertyToFormValues,
  PROPERTY_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  LISTING_STATUS_OPTIONS,
  AMENITIES,
  DOC_TYPES,
  type ListingValues,
} from "@/lib/listingSchema";
import type { Property } from "@/types";
import { cn } from "@/lib/cn";

const MAX_IMAGES = 15;

// Same faint architectural backdrop the auth split-screen / CertHero use.
const SIDE_BG =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80";

const naira = (n?: number) =>
  n || n === 0 ? "₦" + Number(n).toLocaleString("en-NG") : "—";

interface StepDef {
  id: string;
  label: string;
  hint: string;
  Icon: LucideIcon;
  fields: (keyof ListingValues)[];
}

const STEPS: StepDef[] = [
  { id: "media", label: "Photos & video", hint: "Show the property at its best.", Icon: Images, fields: ["images", "videos"] },
  { id: "details", label: "Details", hint: "What it is, where it sits, the price.", Icon: Building2, fields: ["title", "type", "category", "listingStatus", "description", "price", "fullAddress", "city", "state", "country"] },
  { id: "features", label: "Features & amenities", hint: "The rooms and what's included.", Icon: Sparkles, fields: [] },
  { id: "pricing", label: "Pricing & fees", hint: "Everything a buyer pays, upfront.", Icon: Wallet, fields: [] },
  { id: "review", label: "Documents & review", hint: "Attach titles and submit.", Icon: FolderCheck, fields: [] },
];

/** Guided add/edit listing composer. Mock (Phase 6): validates, simulates a save, then navigates. */
export function ListingForm({ mode, initial }: { mode: "new" | "edit"; initial?: Property }) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const {
    register, handleSubmit, watch, setValue, trigger,
    formState: { errors, isSubmitting },
  } = useForm<ListingValues>({
    resolver: zodResolver(makeListingSchema(mode)) as Resolver<ListingValues>,
    defaultValues: initial ? propertyToFormValues(initial) : emptyListingValues,
  });

  const v = watch();
  const last = STEPS.length - 1;
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(mode === "edit" ? last : 0);
  const [feeDraft, setFeeDraft] = useState({ name: "", amount: "", optional: false });
  const [docType, setDocType] = useState("");
  const docFileRef = useRef<HTMLInputElement>(null);

  // Only one Select open at a time (Radix re-enables background pointer events; see index.css).
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const selectProps = (id: string) => ({
    open: openSelect === id,
    onOpenChange: (o: boolean) => setOpenSelect((prev) => (o ? id : prev === id ? null : prev)),
  });

  // Track object URLs we create for picked files so we can revoke them (avoid leaks).
  const created = useRef<Set<string>>(new Set());
  useEffect(() => {
    const urls = created.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);
  const makeUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    created.current.add(url);
    return url;
  };
  const revoke = (url: string) => {
    if (created.current.has(url)) {
      URL.revokeObjectURL(url);
      created.current.delete(url);
    }
  };

  function addImages(files: FileList | null) {
    if (!files?.length) return;
    const next = [...v.images];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_IMAGES) break;
      next.push(makeUrl(file));
    }
    setValue("images", next, { shouldValidate: true, shouldDirty: true });
  }
  function removeImage(url: string) {
    revoke(url);
    setValue("images", v.images.filter((i) => i !== url), { shouldValidate: true, shouldDirty: true });
  }
  function setVideo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (v.videoFile) revoke(v.videoFile);
    setValue("videoFile", makeUrl(file), { shouldDirty: true });
  }
  function clearVideo() {
    if (v.videoFile) revoke(v.videoFile);
    setValue("videoFile", "", { shouldDirty: true });
  }
  function attachDoc(files: FileList | null) {
    const file = files?.[0];
    if (!file || !docType) return;
    setValue("documents", [...v.documents, { name: docType, file: file.name }], { shouldDirty: true });
    setDocType("");
  }
  const removeDocAt = (i: number) =>
    setValue("documents", v.documents.filter((_, idx) => idx !== i), { shouldDirty: true });

  function addFee() {
    const name = feeDraft.name.trim();
    const amount = Number(feeDraft.amount);
    if (!name || Number.isNaN(amount)) return;
    setValue("additionalFees", [...v.additionalFees, { name, amount, optional: feeDraft.optional }], { shouldDirty: true });
    setFeeDraft({ name: "", amount: "", optional: false });
  }
  const removeFee = (i: number) =>
    setValue("additionalFees", v.additionalFees.filter((_, idx) => idx !== i), { shouldDirty: true });

  async function goNext() {
    const fields = STEPS[step].fields;
    if (fields.length && !(await trigger(fields))) return;
    setStep((s) => {
      const n = Math.min(s + 1, last);
      setMaxReached((m) => Math.max(m, n));
      return n;
    });
  }
  const goStep = (i: number) => {
    if (mode === "edit" || i <= maxReached) setStep(i);
  };
  function onInvalid(errs: typeof errors) {
    const idx = STEPS.findIndex((s) => s.fields.some((f) => f in errs));
    if (idx >= 0) setStep(idx);
  }
  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 800));
    toast.success(mode === "new" ? "Listing submitted for verification" : "Listing updated");
    navigate(mode === "new" ? "/realtor/listings" : `/realtor/listings/${initial?.id}`);
  }

  const cancelTo = mode === "new" ? "/realtor/listings" : `/realtor/listings/${initial?.id}`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      onKeyDown={(e) => {
        // Enter shouldn't submit mid-wizard (except from the final step); textareas are exempt.
        if (e.key === "Enter" && step !== last && (e.target as HTMLElement).tagName !== "TEXTAREA") {
          e.preventDefault();
        }
      }}
      className="grid grid-cols-[minmax(300px,340px)_1fr] rounded-3xl border border-line bg-surface max-lg:grid-cols-1"
    >
      {/* Cinematic guide panel */}
      <aside className="relative overflow-hidden rounded-l-3xl bg-[#06121b] text-white max-lg:hidden">
        <img src={SIDE_BG} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-cover opacity-[0.14]" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#06121b] via-transparent to-[#06121b]" />
        <div className="pointer-events-none absolute -right-40 top-10 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(26,172,240,0.20),transparent_65%)]" />
        <div className="pointer-events-none absolute -left-32 bottom-0 size-[26rem] rounded-full bg-[radial-gradient(circle,rgba(26,172,240,0.10),transparent_65%)]" />

        <div className="relative z-10 flex h-full flex-col p-9">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-white/80">
            {mode === "new" ? "New listing" : "Editing"}
          </span>
          <h2 className="display mt-6 text-[2.1rem] leading-[1.08] text-balance">List with confidence.</h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
            Build it step by step. We verify every listing before it goes live.
          </p>

          {/* vertical stepper */}
          <ol className="mt-10 space-y-1.5">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              const reachable = mode === "edit" || i <= maxReached;
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
                      <span className={cn("block text-sm font-medium", active || done ? "text-white" : "text-white/70")}>
                        {s.label}
                      </span>
                      <span className="block truncate text-xs text-white/45">{s.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-auto flex items-start gap-2.5 border-t border-white/10 pt-6 text-xs text-white/60">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            Every listing is checked by our team and enters as Pending until verified.
          </div>
        </div>
      </aside>

      {/* Step content */}
      <div className="flex min-h-[38rem] flex-col p-8 max-sm:p-6">
        {/* header */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-brand-ink">
              Step {step + 1} of {STEPS.length}
            </p>
            {/* mobile dots */}
            <div className="hidden items-center gap-1.5 max-lg:flex">
              {STEPS.map((s, i) => (
                <span key={s.id} className={cn("size-1.5 rounded-full transition-colors", i === step ? "bg-brand" : i < step ? "bg-brand/40" : "bg-line")} />
              ))}
            </div>
          </div>
          <h1 className="display mt-1 text-2xl text-ink">{STEPS[step].label}</h1>
          <p className="mt-1 text-sm text-muted">{STEPS[step].hint}</p>
        </div>

        {/* step body */}
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
                    <SectionLabel>Photos <span className="text-faint">({v.images.length}/{MAX_IMAGES})</span></SectionLabel>
                    <Dropzone icon={Upload} title="Drag photos here, or browse" hint="High-resolution landscape images, 1920 x 1080px or larger." buttonLabel="Select photos" accept="image/*" multiple onFiles={addImages} error={errors.images?.message} />
                    {v.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-3 max-sm:grid-cols-3">
                        {v.images.map((url, i) => (
                          <div key={url} className="group relative aspect-4/3 overflow-hidden rounded-xl border border-line bg-surface-2">
                            <img src={url} alt={`Property photo ${i + 1}`} className="size-full object-cover" />
                            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[0.6rem] font-semibold text-white">Cover</span>}
                            <button type="button" onClick={() => removeImage(url)} aria-label="Remove photo" className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
                              <X className="size-3.5" aria-hidden />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <SectionLabel>Video tour <span className="text-faint">(optional)</span></SectionLabel>
                    <div className="space-y-4">
                      <Field label="Video URL" placeholder="Paste a YouTube or Vimeo link" error={errors.videos?.message} {...register("videos")} />
                      <OrDivider />
                      {v.videoFile ? (
                        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/50 p-3.5">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-ink"><Video className="size-5" aria-hidden /></span>
                          <p className="flex-1 truncate text-sm font-medium text-ink">Video attached</p>
                          <button type="button" onClick={clearVideo} aria-label="Remove video" className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"><X className="size-4" aria-hidden /></button>
                        </div>
                      ) : (
                        <Dropzone icon={Video} title="Upload a walkthrough" hint="1080p or 720p video, up to 100MB." buttonLabel="Select video" accept="video/*" onFiles={setVideo} />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <Field label="Property title" placeholder="e.g. 4-Bedroom Waterfront Duplex" error={errors.title?.message} {...register("title")} />
                  <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    <FieldSelect label="Property type" value={v.type} onValueChange={(val) => setValue("type", val as ListingValues["type"], { shouldValidate: true })} error={errors.type?.message} {...selectProps("type")}>
                      {PROPERTY_TYPE_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </FieldSelect>
                    <FieldSelect label="Category" value={v.category} onValueChange={(val) => setValue("category", val as ListingValues["category"], { shouldValidate: true })} error={errors.category?.message} {...selectProps("category")}>
                      {CATEGORY_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </FieldSelect>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    <FieldSelect label="Listing status" value={v.listingStatus} onValueChange={(val) => setValue("listingStatus", val as ListingValues["listingStatus"], { shouldValidate: true })} error={errors.listingStatus?.message} {...selectProps("listingStatus")}>
                      {LISTING_STATUS_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </FieldSelect>
                    <Field label="Price (₦)" type="number" inputMode="numeric" min={0} placeholder="0" error={errors.price?.message} {...register("price", { valueAsNumber: true })} />
                  </div>
                  <TextArea label="Description" placeholder="Describe the property, its standout features and the neighbourhood…" value={v.description ?? ""} onChange={(e) => setValue("description", e.target.value, { shouldDirty: true })} error={errors.description?.message} max={1200} />
                  <Field label="Full address" placeholder="e.g. 12 Admiralty Way, Lekki Phase 1" error={errors.fullAddress?.message} {...register("fullAddress")} />
                  <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
                    <Field label="City / LGA" placeholder="e.g. Lekki" error={errors.city?.message} {...register("city")} />
                    <Field label="State" placeholder="e.g. Lagos" error={errors.state?.message} {...register("state")} />
                    <Field label="Country" placeholder="Nigeria" error={errors.country?.message} {...register("country")} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-7">
                  <div>
                    <SectionLabel>Features</SectionLabel>
                    <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-2">
                      <NumberField label="Bedrooms" reg={register("bedrooms", { valueAsNumber: true })} error={errors.bedrooms?.message} />
                      <NumberField label="Bathrooms" reg={register("bathrooms", { valueAsNumber: true })} error={errors.bathrooms?.message} />
                      <NumberField label="Toilets" reg={register("toilets", { valueAsNumber: true })} error={errors.toilets?.message} />
                      <NumberField label="Kitchen" reg={register("kitchen", { valueAsNumber: true })} error={errors.kitchen?.message} />
                      <NumberField label="Garage" reg={register("garage", { valueAsNumber: true })} error={errors.garage?.message} />
                      <NumberField label="Floors" reg={register("floors", { valueAsNumber: true })} error={errors.floors?.message} />
                      <NumberField label="Floor area (sqm)" reg={register("floorArea", { valueAsNumber: true })} error={errors.floorArea?.message} />
                      <NumberField label="Land size (sqm)" reg={register("landSize", { valueAsNumber: true })} error={errors.landSize?.message} />
                      <NumberField label="Year built" reg={register("yearBuilt", { valueAsNumber: true })} error={errors.yearBuilt?.message} />
                    </div>
                  </div>
                  <div>
                    <SectionLabel>Amenities {v.amenities.length > 0 && <span className="text-faint">({v.amenities.length} added)</span>}</SectionLabel>
                    <TagInput
                      value={v.amenities}
                      onChange={(next) => setValue("amenities", next, { shouldDirty: true })}
                      suggestions={AMENITIES}
                      placeholder={v.amenities.length ? "Add another amenity…" : "Type an amenity, e.g. Borehole, 24/7 Security"}
                    />
                    <p className="mt-2 text-xs text-muted">Start typing and pick a suggestion to keep wording consistent, or add your own.</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <SectionLabel>Additional fees</SectionLabel>
                    <p className="mb-3 text-sm text-muted">List every fee upfront: agency, legal, caution deposit, service charge. Buyers see the full breakdown, nothing added at signing.</p>
                    <div className="grid grid-cols-[1fr_9rem_auto] items-end gap-3 max-sm:grid-cols-1">
                      <Field label="Fee name" placeholder="e.g. Agency fee" value={feeDraft.name} onChange={(e) => setFeeDraft((d) => ({ ...d, name: e.target.value }))} />
                      <Field label="Amount (₦)" type="number" inputMode="numeric" min={0} placeholder="0" value={feeDraft.amount} onChange={(e) => setFeeDraft((d) => ({ ...d, amount: e.target.value }))} />
                      <button type="button" onClick={addFee} className={cn(buttonClasses("outline", "md"), "max-sm:w-full")}><Plus className="size-4" aria-hidden /> Add</button>
                    </div>
                    <div className="mt-3">
                      <CheckItem label="This fee is optional" checked={feeDraft.optional} onChange={() => setFeeDraft((d) => ({ ...d, optional: !d.optional }))} />
                    </div>
                    {v.additionalFees.length > 0 && (
                      <ul className="mt-4 overflow-hidden rounded-2xl border border-line">
                        {v.additionalFees.map((f, i) => (
                          <li key={`${f.name}-${i}`} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0">
                            <span className="flex-1 text-sm text-ink">
                              {f.name}
                              {f.optional && <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-[0.65rem] text-faint">optional</span>}
                            </span>
                            <span className="text-sm font-medium tabular-nums text-ink">{naira(f.amount)}</span>
                            <button type="button" onClick={() => removeFee(i)} aria-label={`Remove ${f.name}`} className="grid size-7 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"><X className="size-4" aria-hidden /></button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    <Field label="Payment terms" placeholder="e.g. 50% down, balance in 2 months" error={errors.paymentTerms?.message} {...register("paymentTerms")} />
                    <Field label="Refund policy" placeholder="e.g. Caution deposit fully refundable" error={errors.refundPolicy?.message} {...register("refundPolicy")} />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-7">
                  <div>
                    <SectionLabel>Legal documents</SectionLabel>
                    <p className="mb-3 text-sm text-muted">Choose a document type, then attach the file. Our team verifies each one before the listing goes live.</p>
                    <div className="grid grid-cols-[1fr_auto] items-end gap-3 max-sm:grid-cols-1">
                      <FieldSelect
                        label="Document type"
                        value={docType}
                        onValueChange={setDocType}
                        placeholder="Select a document type"
                        {...selectProps("docType")}
                      >
                        {DOC_TYPES.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                      </FieldSelect>
                      <div>
                        <button
                          type="button"
                          onClick={() => docFileRef.current?.click()}
                          disabled={!docType}
                          className={cn(buttonClasses("outline", "md"), "max-sm:w-full disabled:opacity-50")}
                        >
                          <Upload className="size-4" aria-hidden /> Attach file
                        </button>
                        <input ref={docFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { attachDoc(e.target.files); e.target.value = ""; }} className="sr-only" />
                      </div>
                    </div>

                    {v.documents.length > 0 ? (
                      <ul className="mt-4 space-y-2">
                        {v.documents.map((doc, i) => (
                          <li key={`${doc.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand-ink"><FileText className="size-4" aria-hidden /></span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-ink">{doc.name}</p>
                              <p className="truncate text-xs text-muted">{doc.file || "On file"}</p>
                            </div>
                            <StatusBadge status="pending" />
                            <button type="button" onClick={() => removeDocAt(i)} aria-label={`Remove ${doc.name}`} className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"><X className="size-4" aria-hidden /></button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-xs text-faint">No documents attached yet.</p>
                    )}
                  </div>

                  <div>
                    <SectionLabel>Review</SectionLabel>
                    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-surface-2/40 p-5 max-sm:grid-cols-1">
                      <Summary label="Title" value={v.title || "—"} />
                      <Summary label="Price" value={naira(v.price)} />
                      <Summary label="Type" value={PROPERTY_TYPE_OPTIONS.find((o) => o.value === v.type)?.label ?? "—"} />
                      <Summary label="Status" value={LISTING_STATUS_OPTIONS.find((o) => o.value === v.listingStatus)?.label ?? "—"} />
                      <Summary label="Location" value={[v.city, v.state].filter(Boolean).join(", ") || "—"} />
                      <Summary label="Photos" value={`${v.images.length} added`} />
                      <Summary label="Amenities" value={`${v.amenities.length} selected`} />
                      <Summary label="Documents" value={`${v.documents.length} attached`} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* footer nav */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className={buttonClasses("ghost", "md")}>
              <ArrowLeft className="size-4" aria-hidden /> Back
            </button>
          ) : (
            <button type="button" onClick={() => navigate(cancelTo)} className={buttonClasses("ghost", "md")}>
              Cancel
            </button>
          )}

          {step < last ? (
            <button type="button" onClick={goNext} className={cn(buttonClasses("brand", "md"), "min-w-32")}>
              Continue <ArrowRight className="size-4" aria-hidden />
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className={cn(buttonClasses("brand", "md"), "min-w-48 disabled:opacity-60")}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <><Check className="size-4" aria-hidden /> {mode === "new" ? "Submit listing" : "Save changes"}</>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-faint">{children}</p>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-2 last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="truncate text-right text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

/* Soft-filled field styling: filled at rest, lifts to a clean surface with a brand ring on focus. */
const fieldBase =
  "w-full rounded-xl border border-transparent bg-surface-2 text-sm text-ink transition-colors " +
  "placeholder:text-faint focus-visible:border-brand focus-visible:bg-surface focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50";
const fieldError = "border-rose-400 bg-rose-500/5 focus-visible:ring-rose-400/25";
const selectFieldClass =
  "h-11 w-full rounded-xl border-transparent bg-surface-2 hover:bg-surface-2 focus-visible:bg-surface focus-visible:ring-brand/25";

/** Labeled soft-filled text/number input (forwards its ref to react-hook-form). */
const Field = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { label: string; error?: string }
>(function Field({ label, error, id, className, ...props }, ref) {
  const fieldId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium capitalize text-ink">{label}</label>
      <input id={fieldId} ref={ref} aria-invalid={!!error} className={cn("h-11 px-4", fieldBase, error && fieldError, className)} {...props} />
      {error && <p className="text-[13px] text-rose-500">{error}</p>}
    </div>
  );
});

/** Upload area with drag-and-drop. The whole box is a label so a click anywhere opens the picker. */
function Dropzone({
  icon: Icon, title, hint, buttonLabel, accept, multiple, onFiles, error,
}: {
  icon: LucideIcon; title: string; hint: string; buttonLabel: string; accept: string;
  multiple?: boolean; onFiles: (files: FileList | null) => void; error?: string;
}) {
  const [drag, setDrag] = useState(false);
  return (
    <div className="space-y-1.5">
      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false); }}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center overflow-hidden rounded-2xl border border-dashed px-6 py-9 text-center transition-all duration-200",
          drag
            ? "border-brand bg-brand/[0.06] ring-2 ring-brand/25"
            : error
              ? "border-rose-400 bg-rose-500/[0.03]"
              : "border-line bg-surface-2/40 hover:border-brand/50 hover:bg-surface-2/70",
        )}
      >
        {/* soft glow behind the icon on hover / drag */}
        <span
          className={cn(
            "pointer-events-none absolute -top-14 left-1/2 size-40 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl transition-opacity duration-300",
            drag ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        />
        <span
          className={cn(
            "relative grid size-14 place-items-center rounded-2xl bg-linear-to-br from-brand/25 to-brand/5 text-brand-ink ring-1 ring-brand/15 transition-transform duration-200",
            drag ? "-translate-y-0.5 scale-105" : "group-hover:-translate-y-0.5",
          )}
        >
          <Icon className="size-6" aria-hidden />
        </span>
        <p className="relative mt-4 text-sm font-semibold text-ink">
          {drag ? "Drop to upload" : title}
        </p>
        <p className="relative mt-1 max-w-sm text-xs leading-relaxed text-muted">{hint}</p>
        <span className={cn(buttonClasses("outline", "sm"), "relative mt-4 group-hover:border-brand/40")}>{buttonLabel}</span>
        <input type="file" accept={accept} multiple={multiple} onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} className="sr-only" />
      </label>
      {error && <p className="text-[13px] text-rose-500">{error}</p>}
    </div>
  );
}

/** Labeled Select wired to a form value, with the shared inline-error treatment. */
function FieldSelect({
  label, value, onValueChange, error, children, open, onOpenChange, placeholder,
}: {
  label: string; value: string; onValueChange: (v: string) => void; error?: string;
  children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium capitalize text-ink">{label}</label>
      <Select value={value} onValueChange={onValueChange} open={open} onOpenChange={onOpenChange}>
        <SelectTrigger aria-label={label} className={cn(selectFieldClass, error && "border-rose-400 bg-rose-500/5 focus-visible:ring-rose-400/25")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      {error && <p className="text-[13px] text-rose-500">{error}</p>}
    </div>
  );
}

/** Compact labeled number input for the features grid. */
function NumberField({
  label, reg, error,
}: {
  label: string; reg: ReturnType<ReturnType<typeof useForm<ListingValues>>["register"]>; error?: string;
}) {
  return <Field label={label} type="number" inputMode="numeric" min={0} placeholder="0" error={error} {...reg} />;
}

/** Labeled textarea matching the field styling, with a character counter. */
function TextArea({
  label, value, onChange, placeholder, error, max,
}: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; error?: string; max: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium capitalize text-ink">{label}</label>
      <textarea rows={4} maxLength={max} value={value} onChange={onChange} placeholder={placeholder} className={cn("resize-none px-4 py-3", fieldBase, error && fieldError)} />
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-rose-500">{error}</span>
        <span className="text-xs text-faint">{value.length}/{max}</span>
      </div>
    </div>
  );
}

/** Square checkbox row used for amenities and toggles. */
function CheckItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border transition-colors", checked ? "border-brand bg-brand text-[#04121f]" : "border-line bg-surface")}>
        {checked && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
      </span>
      <span className={checked ? "text-ink" : "text-muted"}>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    </label>
  );
}

/** "OR" divider between the video URL and the video upload. */
function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs font-medium uppercase tracking-wide text-faint">or</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
