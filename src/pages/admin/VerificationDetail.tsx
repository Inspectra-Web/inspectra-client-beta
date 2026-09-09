import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Clock,
  Eye,
  FileText,
  Loader2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Reveal } from "@/components/ui/Reveal";
import { DocumentViewer } from "@/components/listing/DocumentViewer";
import { apiMessage } from "@/lib/api";
import {
  useAdminListing,
  useReviewListing,
  type AdminListingDetail,
  type DocumentDecision,
} from "@/lib/adminListings";
import {
  documentPath,
  listingLocation,
  type DocumentStatus,
  type ListingDocument,
} from "@/lib/properties";
import { displayName, formatDate, formatPriceFull } from "@/lib/format";
import { cn } from "@/lib/cn";

/** The two verdicts a reviewer can put on a document. Untouched ones stay in review. */
const TONE: Record<
  DocumentStatus,
  { ring: string; pill: string; Icon: typeof BadgeCheck; label: string }
> = {
  verified: { ring: "bg-verified/12 text-verified", pill: "text-verified", Icon: BadgeCheck, label: "Verified" },
  pending: { ring: "bg-gold/12 text-gold", pill: "text-gold", Icon: Clock, label: "In review" },
  flagged: { ring: "bg-rose-500/12 text-rose-500", pill: "text-rose-500", Icon: TriangleAlert, label: "Flagged" },
};

const NOTE_MAX = 300;
const REASON_MAX = 200;

const fieldBase =
  "w-full rounded-xl border border-transparent bg-surface-2 text-sm text-ink transition-colors " +
  "placeholder:text-faint focus-visible:border-brand focus-visible:bg-surface focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50";

export function AdminVerificationDetail() {
  const { id = "" } = useParams();
  const { data, isPending, isError, error } = useAdminListing(id);

  if (isPending) return <ReviewSkeleton />;

  if (isError || !data)
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
          <FileText className="size-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-ink">Listing not found</h1>
        <p className="mt-2 text-sm text-muted">
          {apiMessage(error, "This submission is not in the queue.")}
        </p>
        <Link to="/admin/verification" className={buttonClasses("brand", "md", "mt-7")}>
          Back to queue
        </Link>
      </div>
    );

  // Keyed on the listing so the local decisions reset when the record changes.
  return <ReviewView key={data.listing.id} data={data} />;
}

function ReviewView({ data }: { data: AdminListingDetail }) {
  const { listing, realtor } = data;
  const review = useReviewListing();

  // The decisions being composed, seeded from what the API already holds.
  const [decisions, setDecisions] = useState<Record<string, DocumentDecision>>(() =>
    Object.fromEntries(
      listing.documents.map((d) => [d.id, { id: d.id, status: d.status, reason: d.reason }]),
    ),
  );
  const [note, setNote] = useState(listing.verification.note);
  const [confirm, setConfirm] = useState<"verified" | "disputed" | null>(null);
  const [reading, setReading] = useState<ListingDocument | null>(null);

  const docs = listing.documents.map((d) => ({ doc: d, decision: decisions[d.id]! }));
  const cleared = docs.filter((d) => d.decision.status === "verified").length;

  const setDoc = (docId: string, status: DocumentStatus) =>
    setDecisions((prev) => ({
      ...prev,
      // The reason answers a flag, so it goes when the flag does.
      [docId]: { ...prev[docId]!, status, reason: status === "flagged" ? prev[docId]!.reason : "" },
    }));

  const setReason = (docId: string, reason: string) =>
    setDecisions((prev) => ({ ...prev, [docId]: { ...prev[docId]!, reason } }));

  const missingReason = docs.some((d) => d.decision.status === "flagged" && !d.decision.reason.trim());
  const canVerify = docs.length > 0 && cleared === docs.length && !missingReason;
  const canDispute = !!note.trim() && !missingReason;

  async function decide(status: "verified" | "disputed") {
    try {
      const res = await review.mutateAsync({
        id: listing.id,
        status,
        note: note.trim(),
        documents: Object.values(decisions).map((d) => ({ ...d, reason: d.reason.trim() })),
      });
      toast.success(res.message ?? "Review saved.");
    } catch (error) {
      toast.error(apiMessage(error));
    }
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/verification"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to queue
      </Link>

      <Reveal>
        <PageHeader
          title={
            <span className="flex flex-wrap items-center gap-3">
              {listing.title}
              <StatusBadge status={listing.verification.status} />
            </span>
          }
          subtitle={`${listing.ref} · ${listingLocation(listing)}`}
          actions={
            <Link to={`/admin/listings/${listing.id}`} className={buttonClasses("outline", "sm")}>
              Full record
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          }
        />
      </Reveal>

      <div className="grid grid-cols-3 items-start gap-6 max-lg:grid-cols-1">
        <div className="col-span-2 space-y-6 max-lg:col-span-1">
          <Reveal y={16}>
            <Panel
              title="Document review"
              action={
                docs.length > 0 && (
                  <span className="text-sm font-normal text-muted tabular-nums">
                    {cleared} of {docs.length} verified
                  </span>
                )
              }
              bodyClassName="divide-y divide-line"
            >
              {docs.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No documents submitted"
                  message="Nothing to review yet: the realtor has not attached any title documents."
                />
              ) : (
                docs.map(({ doc, decision }) => {
                  const tone = TONE[decision.status];
                  return (
                    <div key={doc.id} className="py-5 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-4 max-sm:flex-wrap">
                        <span
                          className={cn(
                            "grid size-9 shrink-0 place-items-center rounded-full",
                            tone.ring,
                          )}
                        >
                          <tone.Icon className="size-5" strokeWidth={2.2} aria-hidden />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-ink">{doc.name}</p>
                          <p className={cn("text-xs font-semibold", tone.pill)}>{tone.label}</p>
                          {doc.notes && <p className="mt-1 text-sm text-muted">{doc.notes}</p>}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-faint">
                            {doc.issuedDate && <span>Issued {formatDate(doc.issuedDate)}</span>}
                            <button
                              type="button"
                              onClick={() => setReading(doc)}
                              className="inline-flex items-center gap-1.5 font-semibold text-brand-ink transition-opacity hover:opacity-80"
                            >
                              <Eye className="size-3.5" aria-hidden />
                              Open document
                            </button>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2 max-sm:w-full">
                          <Decide
                            on={decision.status === "verified"}
                            onClick={() => setDoc(doc.id, "verified")}
                            activeCls="bg-verified text-[#04121f]"
                            label="Verify"
                          />
                          <Decide
                            on={decision.status === "flagged"}
                            onClick={() => setDoc(doc.id, "flagged")}
                            activeCls="bg-rose-500 text-white"
                            label="Flag"
                          />
                        </div>
                      </div>

                      {decision.status === "flagged" && (
                        <div className="mt-3 pl-13 max-sm:pl-0">
                          <input
                            value={decision.reason}
                            onChange={(e) => setReason(doc.id, e.target.value)}
                            maxLength={REASON_MAX}
                            placeholder="Why is this document flagged? The realtor sees this."
                            className={cn("h-11 px-4", fieldBase)}
                          />
                          {!decision.reason.trim() && (
                            <p className="mt-1 text-xs text-rose-500">
                              A flag needs a reason the realtor can act on.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </Panel>
          </Reveal>

          <Reveal y={16}>
            <Panel title="The decision">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/12 text-brand-ink">
                  <ShieldCheck className="size-5" strokeWidth={2.2} aria-hidden />
                </span>
                <p className="text-sm leading-relaxed text-muted">
                  Verifying mints the badge and puts the listing into trust-ranked search.
                  Disputing pulls it, and the note below is what the realtor reads.
                </p>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="review-note"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Reviewer's note
                </label>
                <textarea
                  id="review-note"
                  rows={3}
                  maxLength={NOTE_MAX}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What the realtor needs to fix, or what you checked."
                  className={cn("resize-none px-4 py-3", fieldBase)}
                />
                <div className="mt-1 flex items-center justify-end">
                  <span className="text-xs text-faint tabular-nums">
                    {note.length}/{NOTE_MAX}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  variant="brand"
                  disabled={!canVerify || review.isPending}
                  onClick={() => setConfirm("verified")}
                >
                  {review.isPending && confirm === "verified" ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <BadgeCheck className="size-4" aria-hidden />
                  )}
                  Verify listing
                </Button>
                <Button
                  variant="outline"
                  disabled={!canDispute || review.isPending}
                  onClick={() => setConfirm("disputed")}
                >
                  {review.isPending && confirm === "disputed" ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <TriangleAlert className="size-4" aria-hidden />
                  )}
                  Dispute
                </Button>
              </div>

              {!canVerify && (
                <p className="mt-3 text-xs text-faint">
                  {docs.length === 0
                    ? "A listing cannot be verified with no documents attached."
                    : "Verify every document before the listing can carry the badge."}
                </p>
              )}
              {!canDispute && !missingReason && (
                <p className="mt-1 text-xs text-faint">A dispute needs a note.</p>
              )}
            </Panel>
          </Reveal>
        </div>

        <Reveal y={16} className="space-y-6">
          <Panel title="Submission">
            <dl className="space-y-3">
              <Record Icon={FileText} label="Documents" value={`${listing.documents.length}`} />
              <Record Icon={CalendarDays} label="Listed" value={formatDate(listing.createdAt)} />
              <Record
                Icon={CalendarDays}
                label="Last edited"
                value={formatDate(listing.updatedAt)}
              />
              {listing.verification.reviewedAt && (
                <Record
                  Icon={BadgeCheck}
                  label="Last reviewed"
                  value={formatDate(listing.verification.reviewedAt)}
                />
              )}
              <Record Icon={ShieldCheck} label="Asking" value={formatPriceFull(listing.price)} />
            </dl>
          </Panel>

          {realtor && (
            <Panel title="Listed by">
              <Link
                to={`/admin/realtors/${realtor.id}`}
                className="group flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
              >
                <UserAvatar
                  name={displayName(realtor.fullname)}
                  avatar={realtor.avatar}
                  className="size-11"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {displayName(realtor.fullname)}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {realtor.agencyName || realtor.email}
                  </p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-faint transition-colors group-hover:text-brand-ink" />
              </Link>

              <div className="mt-3 flex flex-wrap gap-2">
                <Standing on={realtor.certified} label="Certified" />
                <Standing on={realtor.identityVerified} label="Identity verified" />
                <Standing
                  on={realtor.status === "active"}
                  label={realtor.status === "active" ? "Active" : "Suspended"}
                />
              </div>
            </Panel>
          )}
        </Reveal>
      </div>

      <DocumentViewer
        open={reading !== null}
        onClose={() => setReading(null)}
        title={reading?.name ?? ""}
        path={reading ? documentPath(listing.id, reading.id) : ""}
      />

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm === "disputed" ? "Dispute this listing?" : "Verify this listing?"}
        description={
          confirm === "disputed"
            ? "It is pulled from trust-ranked search and the realtor sees your note."
            : "The Verified badge goes live on the listing and it enters trust-ranked search."
        }
        confirmLabel={confirm === "disputed" ? "Dispute" : "Verify"}
        destructive={confirm === "disputed"}
        pending={review.isPending}
        onConfirm={() => decide(confirm ?? "verified")}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Decide({
  on,
  onClick,
  activeCls,
  label,
}: {
  on: boolean;
  onClick: () => void;
  activeCls: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "inline-flex h-9 flex-1 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors",
        on ? activeCls : "border border-line text-muted hover:border-brand/40 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

function Record({
  Icon,
  label,
  value,
}: {
  Icon: typeof BadgeCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 text-sm text-muted">
        <Icon className="size-4 shrink-0 text-faint" aria-hidden />
        {label}
      </dt>
      <dd className="text-right text-sm font-medium tabular-nums text-ink">{value}</dd>
    </div>
  );
}

/** A yes/no fact about the realtor, stated plainly either way. */
function Standing({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={
        on
          ? "inline-flex items-center gap-1.5 rounded-full bg-verified/12 px-2.5 py-1 text-xs font-semibold text-verified"
          : "inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted"
      }
    >
      {on ? (
        <BadgeCheck className="size-3.5" aria-hidden />
      ) : (
        <TriangleAlert className="size-3.5" aria-hidden />
      )}
      {label}
    </span>
  );
}

function ReviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
      <div className="space-y-2">
        <div className="h-7 w-80 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-56 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="grid grid-cols-3 items-start gap-6 max-lg:grid-cols-1">
        <div className="col-span-2 h-80 animate-pulse rounded-2xl bg-surface-2 max-lg:col-span-1" />
        <div className="h-56 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
