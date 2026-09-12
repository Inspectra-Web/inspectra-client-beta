import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  ScanFace,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  UsersRound,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Panel } from "@/components/dashboard/Panel";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  VerificationBar,
  VerificationLegend,
} from "@/components/dashboard/VerificationBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { apiMessage } from "@/lib/api";
import { useAuthUser, type AuthRole } from "@/lib/auth";
import { displayName, formatDate } from "@/lib/format";
import { verifiedRate } from "@/lib/properties";
import { QUEUE_QUERY, useAdminListings } from "@/lib/adminListings";
import {
  DIRECTORY_QUERY,
  useAdminUsers,
  type DirectoryUser,
} from "@/lib/adminUsers";
import {
  REALTORS_QUERY,
  useAdminRealtors,
  type RealtorCounts,
} from "@/lib/adminRealtors";
import { cn } from "@/lib/cn";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** A count with its noun. On a fresh platform these are routinely 1, and "1 seekers"
 *  reads like a bug even though the number is right. */
const plural = (n: number, noun: string) => `${n} ${noun}${n === 1 ? "" : "s"}`;

const ROLE_TONE: Record<AuthRole, string> = {
  admin: "bg-brand/12 text-brand-ink",
  realtor: "bg-verified/12 text-verified",
  seeker: "bg-surface-2 text-muted",
};

const ROLE_LABEL: Record<AuthRole, string> = {
  admin: "Admin",
  realtor: "Realtor",
  seeker: "Seeker",
};

export function AdminOverview() {
  const firstName = displayName(useAuthUser().fullname).split(" ")[0];

  // Three resting queries. The listings one is the entry the sidebar's queue pill and
  // the Verification page already hold, so on this page it costs nothing.
  const listingsQuery = useAdminListings(QUEUE_QUERY);
  const usersQuery = useAdminUsers(DIRECTORY_QUERY);
  const realtorsQuery = useAdminRealtors(REALTORS_QUERY);

  const header = (
    <Reveal>
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        subtitle="Platform health at a glance, and the work waiting on a human."
      />
    </Reveal>
  );

  // One gate for all three rather than a branch per panel. They are the same admin API
  // under the same cookie, so a partial failure means the session is broken, not that
  // one number is missing; and four tiles reading 0 because a request failed is exactly
  // the invented number this page was rewritten to remove.
  const error =
    listingsQuery.error ?? usersQuery.error ?? realtorsQuery.error ?? null;

  if (error)
    return (
      <div className="space-y-8">
        {header}
        <Reveal y={16}>
          <EmptyState
            icon={ShieldCheck}
            title="Could not load the console"
            message={apiMessage(error)}
          />
        </Reveal>
      </div>
    );

  const listings = listingsQuery.data;
  const users = usersQuery.data;
  const realtors = realtorsQuery.data;

  // Narrowed on the data rather than the three isPending flags, which TypeScript cannot
  // follow across separate queries.
  if (!listings || !users || !realtors)
    return (
      <div className="space-y-8">
        {header}
        <OverviewSkeleton />
      </div>
    );

  const open = listings.counts.pending + listings.counts.disputed;

  return (
    <div className="space-y-8">
      {header}

      {/* stats */}
      <Reveal className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1" y={16}>
        <StatCard
          icon={UsersRound}
          label="Users"
          value={users.counts.all}
          hint={`${plural(users.counts.seeker, "seeker")}, ${plural(users.counts.realtor, "realtor")}`}
          to="/admin/users"
        />
        <StatCard
          icon={BadgeCheck}
          label="Realtors"
          value={realtors.counts.all}
          hint={`${realtors.counts.certified} certified`}
          to="/admin/realtors"
        />
        <StatCard
          icon={Building2}
          label="Listings"
          value={listings.counts.all}
          hint={`${listings.counts.verified} verified and live`}
          to="/admin/listings"
        />
        <StatCard
          icon={TriangleAlert}
          label="Needs review"
          value={open}
          hint={open > 0 ? "Oldest first" : "Queue is clear"}
          to="/admin/verification"
        />
      </Reveal>

      {/* platform trust + who is behind the listings.
          min-w-0 on both tracks: a grid track's automatic minimum is its content's
          min-content width, so one long listing title would push a column past its
          share and squeeze the panel beside it. */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-6 max-lg:grid-cols-1">
        <Reveal y={16} className="min-w-0">
          <Panel title="Platform verification" className="h-full">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="display text-4xl leading-none text-ink">
                  <span className="tabular-nums">{verifiedRate(listings.counts)}</span>
                  <span className="text-2xl text-muted">%</span>
                </p>
                <p className="mt-2 text-sm text-muted">
                  of {listings.counts.all}{" "}
                  {listings.counts.all === 1 ? "listing is" : "listings are"} verified
                </p>
              </div>
              <span className="grid size-11 place-items-center rounded-xl bg-verified/10 text-verified">
                <ShieldCheck className="size-5.5" />
              </span>
            </div>

            <VerificationBar counts={listings.counts} className="mt-5" />
            <VerificationLegend counts={listings.counts} />

            {open > 0 && (
              <Link
                to="/admin/verification"
                className="mt-5 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 p-3.5 transition-colors hover:border-gold/50"
              >
                <TriangleAlert className="size-5 shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">
                    {open} {open === 1 ? "listing is" : "listings are"} waiting on a decision
                  </p>
                  <p className="text-xs text-muted">
                    Nothing goes verified without someone reading the documents.
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-brand-ink" />
              </Link>
            )}
          </Panel>
        </Reveal>

        <Reveal y={16} className="min-w-0">
          <Panel
            title="Realtor standing"
            action={<PanelLink to="/admin/realtors">Directory</PanelLink>}
            className="h-full"
          >
            <StandingRows counts={realtors.counts} />
          </Panel>
        </Reveal>
      </div>

      {/* the queue + the people arriving */}
      <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
        <Reveal y={16} className="col-span-2 min-w-0 max-lg:col-span-1">
          <Panel
            title="Needs a human"
            action={<PanelLink to="/admin/verification">Full queue</PanelLink>}
            bodyClassName="space-y-3"
            className="h-full"
          >
            {listings.listings.length === 0 ? (
              <p className="py-2 text-sm text-muted">
                Queue is clear. Nothing is waiting on a decision right now.
              </p>
            ) : (
              listings.listings.slice(0, 4).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-4 rounded-xl border border-line bg-surface p-3 transition-colors hover:bg-surface-2/40 max-sm:flex-wrap"
                >
                  {l.image ? (
                    <img
                      src={l.image}
                      alt={l.title}
                      className="size-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-surface-2 text-faint">
                      <Building2 className="size-5" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-ink">{l.title}</h3>
                      <StatusBadge status={l.status} className="shrink-0" />
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted">
                      {displayName(l.realtorName) || "Unknown realtor"} · listed{" "}
                      {formatDate(l.createdAt)}
                    </p>
                  </div>
                  <Link
                    to={`/admin/verification/${l.id}`}
                    className={buttonClasses("outline", "sm", "shrink-0 max-sm:w-full")}
                  >
                    Review
                    <ArrowUpRight className="size-4" aria-hidden />
                  </Link>
                </div>
              ))
            )}
          </Panel>
        </Reveal>

        <Reveal y={16} delay={0.05} className="min-w-0">
          <Panel
            title="Recently joined"
            action={<PanelLink to="/admin/users">Directory</PanelLink>}
            className="h-full"
          >
            <JoinedList rows={users.users.slice(0, 5)} />
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PanelLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline"
    >
      {children}
      <ArrowUpRight className="size-4" aria-hidden />
    </Link>
  );
}

/**
 * The two trust axes plus the accounts that have been shut off. Plain rows rather than a
 * second stacked bar: one bar to a page, and these three do not partition a whole the way
 * the verification states do. No foil on the certified row either, because a count of
 * credentials on an ops console is a metric, not a credential moment.
 */
function StandingRows({ counts }: { counts: RealtorCounts }) {
  const rows: { icon: typeof BadgeCheck; label: string; value: number; tone: string }[] = [
    { icon: BadgeCheck, label: "Certified", value: counts.certified, tone: "text-verified" },
    {
      icon: ScanFace,
      label: "Identity verified",
      value: counts.identityVerified,
      tone: "text-brand-ink",
    },
    { icon: UserRound, label: "Suspended", value: counts.suspended, tone: "text-rose-500" },
  ];

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li
          key={row.label}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3"
        >
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg bg-surface", row.tone)}>
            <row.icon className="size-4.5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-muted">{row.label}</span>
          <span className="shrink-0 text-sm tabular-nums text-faint">
            <span className="font-semibold text-ink">{row.value}</span> of {counts.all}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The newest accounts, in the directory's own order: the API sorts createdAt
 *  descending, so these are the newest platform-wide rather than a slice dressed up. */
function JoinedList({ rows }: { rows: DirectoryUser[] }) {
  if (!rows.length)
    return (
      <p className="py-6 text-muted">New accounts will appear here as people sign up.</p>
    );

  return (
    <ul className="space-y-3">
      {rows.map((u) => {
        const name = displayName(u.fullname);

        return (
          <li key={u.id}>
            <Link
              to={`/admin/users/${u.id}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
            >
              <UserAvatar name={name} avatar={u.avatar} className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{name}</p>
                <p className="truncate text-xs text-faint">{formatDate(u.createdAt)}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                  ROLE_TONE[u.role],
                )}
              >
                {ROLE_LABEL[u.role]}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
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
      <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
        <div className="col-span-2 h-80 animate-pulse rounded-2xl bg-surface-2 max-lg:col-span-1" />
        <div className="h-80 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
