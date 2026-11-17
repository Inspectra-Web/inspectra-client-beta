import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Eye,
  Inbox,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DateBlock } from "@/components/dashboard/DateBlock";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ListingGate } from "@/components/realtor/ListingGate";
import {
  VerificationBar,
  VerificationLegend,
} from "@/components/dashboard/VerificationBar";
import { apiMessage } from "@/lib/api";
import { useAuthUser } from "@/lib/auth";
import { useListingEligibility } from "@/lib/profile";
import { displayName, formatTime, timeAgo } from "@/lib/format";
import {
  useMyListings,
  listingLocation,
  verifiedRate,
  PORTFOLIO_QUERY,
  type ListingCounts,
  type RealtorListing,
} from "@/lib/properties";
import { useLeads, EMPTY_QUERY, type LeadRow } from "@/lib/inquiries";
import {
  useRealtorInspections,
  UPCOMING_QUERY,
  type DiaryRow,
} from "@/lib/inspections";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function RealtorOverview() {
  const navigate = useNavigate();
  const firstName = displayName(useAuthUser().fullname).split(" ")[0];

  // One listings read serves the two tiles, the verification panel and the most-viewed
  // list. The leads and diary queries are the resting ones the sidebar pills already
  // hold, so on this page they cost nothing.
  const { data: listings, isPending, isError, error } = useMyListings(PORTFOLIO_QUERY);
  const leadQuery = useLeads(EMPTY_QUERY);
  const diaryQuery = useRealtorInspections(UPCOMING_QUERY);

  // Undefined while the profile query is in flight: the gate is not shown on a guess.
  const { data: eligibility } = useListingEligibility();
  const barred = eligibility ? !eligibility.ready : false;

  const header = (
    <Reveal>
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        subtitle="Here's how your portfolio and pipeline are doing today."
      />
    </Reveal>
  );

  const gate = barred && (
    <Reveal y={12}>
      <ListingGate missing={eligibility!.missing} />
    </Reveal>
  );

  // A failed portfolio request must not fall back to zeros: a zero that means "the
  // request failed" is exactly the invented number this page was wired to remove.
  if (isError)
    return (
      <div className="space-y-8">
        {header}
        {gate}
        <Reveal y={16}>
          <EmptyState
            icon={Building2}
            title="Could not load your portfolio"
            message={apiMessage(error)}
          />
        </Reveal>
      </div>
    );

  if (isPending)
    return (
      <div className="space-y-8">
        {header}
        {gate}
        <OverviewSkeleton />
      </div>
    );

  const { counts, views, properties } = listings;

  // Four panels agreeing that nothing has happened is worse than one that says so. The
  // pipeline is checked too, not just the portfolio: a realtor who deleted their last
  // listing can still have leads waiting, and must not be told to start from scratch.
  const nothingYet =
    counts.all === 0 &&
    (leadQuery.data?.counts.all ?? 0) === 0 &&
    (diaryQuery.data?.counts.all ?? 0) === 0;

  if (nothingYet)
    return (
      <div className="space-y-8">
        {header}
        {gate}
        <Reveal y={16}>
          <EmptyState
            icon={Building2}
            title="Your portfolio starts with one listing"
            message="Add a property and we will check its documents before it goes live. Views, leads and viewings all start from there."
            action={
              <Button
                variant="brand"
                disabled={barred}
                title={barred ? "Finish your setup before you list" : undefined}
                onClick={() => navigate("/realtor/listings/new")}
              >
                New listing
              </Button>
            }
          />
        </Reveal>
      </div>
    );

  const newLeads = leadQuery.data?.counts.new ?? 0;
  const requested = diaryQuery.data?.counts.requested ?? 0;

  return (
    <div className="space-y-8">
      {header}
      {gate}

      {/* stats */}
      <Reveal className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1" y={16}>
        <StatCard
          icon={Building2}
          label="Active listings"
          value={counts.all}
          to="/realtor/listings"
        />
        <StatCard
          icon={Eye}
          label="Total views"
          value={views.toLocaleString()}
          hint="Across your portfolio"
          to="/realtor/listings"
        />
        <StatCard
          icon={Inbox}
          label="Leads"
          value={leadQuery.data?.counts.all ?? 0}
          hint={newLeads > 0 ? `${newLeads} awaiting a reply` : "All caught up"}
          to="/realtor/leads"
        />
        <StatCard
          icon={CalendarCheck}
          label="Upcoming inspections"
          value={diaryQuery.data?.counts.upcoming ?? 0}
          hint={requested > 0 ? `${requested} awaiting your answer` : "Nothing to answer"}
          to="/realtor/inspections"
        />
      </Reveal>

      {/* verification health (signature) + the portfolio's best performers.
          min-w-0 on both tracks: a grid track's automatic minimum is its content's
          min-content width, so one long listing title would otherwise push the right
          column past its 1fr share and squeeze the signature panel beside it. */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-6 max-lg:grid-cols-1">
        <Reveal y={16} className="min-w-0">
          <VerificationPanel counts={counts} />
        </Reveal>
        <Reveal y={16} className="min-w-0">
          <Panel
            title="Most viewed"
            action={<PanelLink to="/realtor/listings">Manage all</PanelLink>}
            className="h-full"
          >
            <ListingsList rows={properties.slice(0, 4)} />
          </Panel>
        </Reveal>
      </div>

      {/* leads + inspections */}
      <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        <Reveal y={16} className="min-w-0">
          <Panel
            title="Latest leads"
            action={<PanelLink to="/realtor/leads">View all</PanelLink>}
            className="h-full"
          >
            {leadQuery.isPending ? (
              <RowsSkeleton round />
            ) : leadQuery.isError ? (
              <p className="py-6 text-muted">{apiMessage(leadQuery.error)}</p>
            ) : (
              <LeadsList rows={leadQuery.data.leads.slice(0, 3)} />
            )}
          </Panel>
        </Reveal>
        <Reveal y={16} className="min-w-0">
          <Panel
            title="Upcoming inspections"
            action={<PanelLink to="/realtor/inspections">View all</PanelLink>}
            className="h-full"
          >
            {diaryQuery.isPending ? (
              <RowsSkeleton />
            ) : diaryQuery.isError ? (
              <p className="py-6 text-muted">{apiMessage(diaryQuery.error)}</p>
            ) : (
              <InspectionsList rows={diaryQuery.data.inspections.slice(0, 3)} />
            )}
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PanelLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-sm font-medium text-brand-ink hover:underline">
      {children}
    </Link>
  );
}

/** Signature: the realtor's verification standing across their portfolio. */
function VerificationPanel({ counts }: { counts: ListingCounts }) {
  const rate = verifiedRate(counts);
  const needAttention = counts.pending + counts.disputed;

  return (
    <Panel title="Portfolio verification" className="h-full">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="display text-4xl leading-none text-ink">
            <span className="tabular-nums">{rate}</span>
            <span className="text-2xl text-muted">%</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            of your {counts.all} {counts.all === 1 ? "listing is" : "listings are"} verified
          </p>
        </div>
        <span className="grid size-11 place-items-center rounded-xl bg-verified/10 text-verified">
          <ShieldCheck className="size-5.5" />
        </span>
      </div>

      <VerificationBar counts={counts} className="mt-5" />
      <VerificationLegend counts={counts} />

      {needAttention > 0 && (
        <Link
          to="/realtor/verification"
          className="mt-5 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 p-3.5 transition-colors hover:border-gold/50"
        >
          <TriangleAlert className="size-5 shrink-0 text-gold" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">
              {needAttention} {needAttention === 1 ? "listing needs" : "listings need"} attention
            </p>
            <p className="text-xs text-muted">
              Complete verification to keep them live in search.
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-brand-ink" />
        </Link>
      )}
    </Panel>
  );
}

/** The resting query is every thread, newest first, so these rows are the latest few
 *  rather than the unanswered ones: filtering one page of twelve down to "new" could
 *  miss a waiting thread sitting on page two. The count that matters is on the tile. */
function LeadsList({ rows }: { rows: LeadRow[] }) {
  if (!rows.length)
    return (
      <p className="py-6 text-muted">
        Buyer inquiries on your listings will appear here as they come in.
      </p>
    );

  return (
    <ul className="space-y-3">
      {rows.map((lead) => {
        const name = displayName(lead.seeker.fullname);

        return (
          <li key={lead.id}>
            <Link
              to={`/realtor/leads/${lead.id}`}
              className="flex gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
            >
              <UserAvatar name={name} avatar={lead.seeker.avatar} className="size-9" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink">{name}</p>
                  <StatusPill status={lead.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-faint">
                  {lead.property.title} · {timeAgo(lead.lastMessageAt)}
                </p>
                <p className="mt-1 line-clamp-1 text-sm text-muted">{lead.lastMessage}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** The diary's next few, soonest first: the list's own order, so no sorting here.
 *  Each row opens its own booking rather than the list, because answering a request
 *  is the reason a realtor clicks one. */
function InspectionsList({ rows }: { rows: DiaryRow[] }) {
  if (!rows.length)
    return (
      <p className="py-6 text-muted">
        When a buyer books a viewing on one of your listings, it will show up here.
      </p>
    );

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            to={`/realtor/inspections/${row.id}`}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
          >
            <DateBlock date={row.slot} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{row.property.title}</p>
              <p className="mt-0.5 truncate text-sm text-muted">
                {formatTime(row.slot)} with {displayName(row.seeker.fullname)}
              </p>
              <p className="mt-1">
                <StatusPill status={row.status} />
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** The portfolio's best performers, as the API ranked them. There is no per-listing
 *  lead count on the model, so views is the one real figure a row can carry. */
function ListingsList({ rows }: { rows: RealtorListing[] }) {
  return (
    <ul className="space-y-2.5">
      {rows.map((l) => (
        <li key={l.id}>
          <Link
            to={`/realtor/listings/${l.id}`}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
          >
            <Thumbnail src={l.images[0]} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{l.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted">{listingLocation(l)}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-faint">
                <Eye className="size-3.5" aria-hidden />
                <span className="tabular-nums">{l.views.toLocaleString()}</span>
                {l.views === 1 ? "view" : "views"}
              </p>
            </div>
            <StatusBadge status={l.verification.status} className="shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** A listing with no photo yet still needs a tile, or the row collapses. */
function Thumbnail({ src }: { src?: string }) {
  if (!src)
    return (
      <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-surface-2 text-faint ring-1 ring-line">
        <Building2 className="size-5" aria-hidden />
      </span>
    );

  return (
    <img src={src} alt="" className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-line" />
  );
}

function RowsSkeleton({ round }: { round?: boolean }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-line p-3">
          <div
            className={`shrink-0 animate-pulse bg-surface-2 ${
              round ? "size-9 rounded-full" : "size-16 rounded-2xl"
            }`}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-40 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-28 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[132px] animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>
      <div className="grid grid-cols-[1.5fr_1fr] gap-6 max-lg:grid-cols-1">
        <div className="h-72 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-72 animate-pulse rounded-2xl bg-surface-2" />
      </div>
      <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
