import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock,
  FileText,
  ShieldCheck,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { PropertySummary } from "@/components/dashboard/PropertySummary";
import { RealtorSummary } from "@/components/dashboard/RealtorSummary";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { propertyById, realtorById, submissionFor } from "@/data/admin";
import { deriveDocChecks, type DocCheck, type DocState } from "@/lib/listing";
import type { VerificationStatus } from "@/types";
import { cn } from "@/lib/cn";

// Admin can move a submitted document to one of two decisions; "missing" ones stay locked.
type Decision = DocState;

const TONE: Record<
  DocState,
  { ring: string; pill: string; Icon: typeof BadgeCheck; label: string }
> = {
  verified: { ring: "bg-verified/12 text-verified", pill: "text-verified", Icon: BadgeCheck, label: "Approved" },
  "in-review": { ring: "bg-gold/12 text-gold", pill: "text-gold", Icon: Clock, label: "In review" },
  flagged: { ring: "bg-rose-500/12 text-rose-500", pill: "text-rose-500", Icon: TriangleAlert, label: "Flagged" },
  missing: { ring: "bg-surface-2 text-faint", pill: "text-faint", Icon: Upload, label: "Not submitted" },
};

export function AdminVerificationDetail() {
  const { id } = useParams();
  const property = id ? propertyById(id) : undefined;

  const [status, setStatus] = useState<VerificationStatus | undefined>(property?.status);
  const [docs, setDocs] = useState<DocCheck[]>(() => (property ? deriveDocChecks(property) : []));

  if (!property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <FileText className="size-7" />
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Listing not found</h1>
        <p className="mt-2 max-w-sm text-muted">This submission is not in the queue.</p>
        <Link to="/admin/verification" className={buttonClasses("brand", "md", "mt-7")}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to queue
        </Link>
      </div>
    );
  }

  const realtor = realtorById(property.realtorId);
  const submission = submissionFor(property.id);
  const setDoc = (label: string, state: Decision) =>
    setDocs((prev) => prev.map((d) => (d.label === label ? { ...d, state } : d)));

  const approved = docs.filter((d) => d.state === "verified").length;
  const anyBlocked = docs.some((d) => d.state === "flagged" || d.state === "missing");

  function decide(next: VerificationStatus, message: string) {
    setStatus(next);
    if (next === "verified") setDocs((prev) => prev.map((d) => (d.state === "missing" ? d : { ...d, state: "verified" })));
    toast.success(message);
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/admin/verification"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to queue
        </Link>
        <div className="mt-4">
          <PageHeader
            title={
              <span className="flex items-center gap-3">
                {property.title}
                {status && <StatusBadge status={status} className="align-middle" />}
              </span>
            }
            subtitle={`${property.ref} · ${property.location}, ${property.city}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 items-start gap-6 max-lg:grid-cols-1">
        {/* review + decision */}
        <div className="col-span-2 space-y-6 max-lg:col-span-1">
          <Panel
            title="Document review"
            action={
              <span className="text-sm text-muted">
                <span className="font-semibold tabular-nums text-ink">{approved}</span> of {docs.length} approved
              </span>
            }
            bodyClassName="divide-y divide-line"
          >
            {docs.map((d) => {
              const tone = TONE[d.state];
              const locked = d.state === "missing";
              return (
                <div key={d.label} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", tone.ring)}>
                    <tone.Icon className="size-5" strokeWidth={2.2} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{d.label}</p>
                    <p className={cn("text-xs font-semibold", tone.pill)}>{tone.label}</p>
                  </div>
                  {locked ? (
                    <span className="text-xs text-faint">Awaiting upload</span>
                  ) : (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDoc(d.label, "verified")}
                        aria-pressed={d.state === "verified"}
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors",
                          d.state === "verified"
                            ? "bg-verified text-white"
                            : "border border-line text-muted hover:text-ink",
                        )}
                      >
                        <Check className="size-4" aria-hidden />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setDoc(d.label, "flagged")}
                        aria-pressed={d.state === "flagged"}
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors",
                          d.state === "flagged"
                            ? "bg-rose-500 text-white"
                            : "border border-line text-muted hover:text-ink",
                        )}
                      >
                        <TriangleAlert className="size-4" aria-hidden />
                        Flag
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </Panel>

          {/* decision */}
          <Panel>
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-ink">
                <ShieldCheck className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-ink">The decision</h3>
                <p className="mt-1 text-sm text-muted">
                  Verifying mints the badge and puts the listing live in trust-ranked search. Disputing pulls it
                  and notifies the realtor.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="brand"
                onClick={() => decide("verified", "Listing verified. The badge is live.")}
                disabled={status === "verified" || anyBlocked}
              >
                <BadgeCheck className="size-4" aria-hidden />
                Verify listing
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("Change request sent to the realtor.")}
              >
                <Clock className="size-4" aria-hidden />
                Request changes
              </Button>
              <Button
                variant="outline"
                onClick={() => decide("disputed", "Listing disputed and pulled from search.")}
                disabled={status === "disputed"}
                className="text-rose-500 hover:bg-rose-500/10"
              >
                <TriangleAlert className="size-4" aria-hidden />
                Dispute
              </Button>
            </div>
            {anyBlocked && status !== "verified" && (
              <p className="mt-3 text-xs text-faint">
                Approve or resolve every document before you can verify.
              </p>
            )}
          </Panel>
        </div>

        {/* aside */}
        <div className="space-y-4">
          <PropertySummary property={property} to={`/admin/listings/${property.id}`} />
          {realtor && <RealtorSummary realtor={realtor} />}
          {submission && (
            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-wider text-faint">
                Submission
              </p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Submitted</dt>
                  <dd className="text-ink">{submission.submittedAt}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Listing ref</dt>
                  <dd className="tabular-nums text-ink">{property.ref}</dd>
                </div>
                {submission.note && (
                  <div className="pt-1 text-muted">{submission.note}</div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
