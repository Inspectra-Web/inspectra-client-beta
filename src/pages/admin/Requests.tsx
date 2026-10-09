import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  UsersRound,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { apiMessage } from "@/lib/api";
import { displayName, formatDate, formatPhone, formatPrice, whatsappDigits } from "@/lib/format";
import { priceSuffix } from "@/lib/listing";
import {
  REQUESTS_QUERY,
  useAdminRequests,
  useRequestDemand,
  type AdminRequestQuery,
  type AdminRequestRow,
  type AdminRequestState,
  type DemandSegment,
  type RequestDemand,
} from "@/lib/adminRequests";
import type { RequestCategory, RequestCity } from "@/lib/requests";
import {
  CITY_OPTIONS,
  INTENT_OPTIONS,
  TIMELINE_OPTIONS,
  TYPES_BY_CATEGORY,
  cityLabel,
  intentLabel,
  requestTitle,
  typeLabel,
} from "@/lib/requestSchema";
import { cn } from "@/lib/cn";

const STATE_LABEL: Record<AdminRequestState, string> = { live: "Active", expired: "Expired", closed: "Closed" };
// The API says "live"; the console says "Active", the same word the seeker sees.
const STATE_PILL = { live: "active", expired: "expired", closed: "closed" } as const;

const SEGMENTS_SHOWN = 10;

/** "₦5M/yr", or "₦30M" for a sale, which carries no period. */
const budget = (amount: number, intent: DemandSegment["intent"]) => `${formatPrice(amount)}${priceSuffix(intent)}`;

/** A segment's kind is a type, or a whole category when the seeker said "any type".
 *  Land has one type, so "Any land" would say nothing. */
const kindLabel = (kind: string) =>
  (TYPES_BY_CATEGORY[kind as RequestCategory]?.length ?? 0) > 1 ? `Any ${typeLabel(kind).toLowerCase()}` : typeLabel(kind);

export function AdminRequests() {
  return (
    <div className="space-y-10">
      <Reveal>
        <PageHeader
          title="Requests"
          subtitle="The seeker waitlist: what people want, where, and for how much."
        />
      </Reveal>

      <Demand />
      <RequestList />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Demand: the figures a realtor is pitched with.
 * ------------------------------------------------------------------ */

function Demand() {
  const { data, isPending, isError, error } = useRequestDemand();

  if (isError)
    return <EmptyState icon={ClipboardList} title="Could not load demand" message={apiMessage(error)} />;

  if (isPending)
    return (
      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>
    );

  return (
    <section className="space-y-6">
      <Reveal y={16} className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        <StatCard
          icon={ClipboardList}
          label="Live requests"
          value={data.requests}
          hint={`From ${data.seekers} verified ${data.seekers === 1 ? "seeker" : "seekers"}`}
        />
        {CITY_OPTIONS.map((city) => (
          <StatCard
            key={city.value}
            icon={MapPin}
            label={city.label}
            value={data.cities[city.value] ?? 0}
            hint={intentSplit(data, city.value)}
          />
        ))}
      </Reveal>

      <p className="-mt-2 text-xs text-faint">
        Counts live requests from seekers who verified their email. Expired, closed and unverified
        ones are in the list below but not in these figures.
      </p>

      <div className="grid grid-cols-[1.6fr_1fr] gap-6 max-xl:grid-cols-1">
        <Reveal y={16} className="min-w-0">
          <Panel title="Top demand">
            {data.segments.length === 0 ? (
              <p className="py-6 text-sm text-muted">No live demand yet.</p>
            ) : (
              <div className="no-scrollbar -mx-6 overflow-x-auto max-sm:-mx-5">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className={cn(thCls, "pt-0")}>Wanted</th>
                      <th className={cn(thCls, "whitespace-nowrap pt-0 text-right")}>Requests</th>
                      <th className={cn(thCls, "whitespace-nowrap pt-0 text-right")}>Median budget</th>
                      <th className={cn(thCls, "whitespace-nowrap pt-0 text-right")}>Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {data.segments.slice(0, SEGMENTS_SHOWN).map((s) => (
                      <tr key={`${s.city}-${s.intent}-${s.kind}`}>
                        <td className={cn(tdCls, "py-3")}>
                          <p className="font-medium text-ink">{kindLabel(s.kind)}</p>
                          <p className="text-xs text-muted">
                            {intentLabel(s.intent)} · {cityLabel(s.city)}
                          </p>
                        </td>
                        <td className={cn(tdCls, "py-3 text-right font-semibold tabular-nums text-ink")}>{s.count}</td>
                        <td className={cn(tdCls, "whitespace-nowrap py-3 text-right tabular-nums text-ink")}>{budget(s.budgetMedian, s.intent)}</td>
                        <td className={cn(tdCls, "whitespace-nowrap py-3 text-right tabular-nums text-muted")}>
                          {s.budgetLow === s.budgetHigh
                            ? budget(s.budgetLow, s.intent)
                            : `${formatPrice(s.budgetLow)} to ${budget(s.budgetHigh, s.intent)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </Reveal>

        <div className="space-y-6">
          <Reveal y={16}>
            <Panel title="Most-requested areas">
              {data.areas.length === 0 ? (
                <p className="py-2 text-sm text-muted">No areas named yet.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {data.areas.map((a) => (
                    <li
                      key={`${a.city}-${a.name}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2/50 px-3 py-1.5 text-sm"
                    >
                      <span className="font-medium text-ink">{a.name}</span>
                      <span className="text-xs text-faint">{cityLabel(a.city)}</span>
                      <span className="rounded-full bg-brand/12 px-1.5 text-xs font-semibold tabular-nums text-brand-ink">
                        {a.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </Reveal>

          <Reveal y={16}>
            <Panel title="When they need it">
              <dl className="divide-y divide-line">
                {TIMELINE_OPTIONS.map((t) => (
                  <div key={t.value} className="flex items-center justify-between py-2.5 text-sm">
                    <dt className="text-muted">{t.label}</dt>
                    <dd className="font-semibold tabular-nums text-ink">{data.timelines[t.value] ?? 0}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** "3 rent · 1 buy". The demand endpoint splits by city and by intent, not both, so
 *  this reads the segments, which carry the pair. */
function intentSplit(data: RequestDemand, city: RequestCity): string | undefined {
  const tally = new Map<string, number>();
  for (const s of data.segments)
    if (s.city === city) tally.set(s.intent, (tally.get(s.intent) ?? 0) + s.count);

  if (!tally.size) return undefined;
  return INTENT_OPTIONS.filter((o) => tally.has(o.value))
    .map((o) => `${tally.get(o.value)} ${o.label.toLowerCase()}`)
    .join(" · ");
}

/* ------------------------------------------------------------------ *
 * The list: every request, to reach the person behind it.
 * ------------------------------------------------------------------ */

function RequestList() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [query, setQuery] = useState<AdminRequestQuery>(REQUESTS_QUERY);
  const [openId, setOpenId] = useState<string | null>(null);

  const selectProps = (id: string) => ({
    open: openId === id,
    onOpenChange: (o: boolean) => setOpenId((prev) => (o ? id : prev === id ? null : prev)),
  });

  // The server does the searching, so hold off a beat rather than firing per keystroke.
  useEffect(() => {
    const timer = setTimeout(
      () => setQuery((prev) => (prev.q === typed.trim() ? prev : { ...prev, q: typed.trim(), page: 1 })),
      300,
    );
    return () => clearTimeout(timer);
  }, [typed]);

  const { data, isPending, isError, error, isPlaceholderData } = useAdminRequests(query);

  const rows = data?.requests ?? [];
  const counts = data?.counts;
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const filtered = query.q !== "" || query.state !== "all" || query.city !== "all" || query.intent !== "all";

  const withCount = (label: string, n?: number) => (counts ? `${label} (${n ?? 0})` : label);
  const sum = (o?: Partial<Record<string, number>>) => Object.values(o ?? {}).reduce<number>((a, b) => a + (b ?? 0), 0);

  return (
    <section className="space-y-5">
      <Reveal y={16}>
        <h2 className="text-xl font-semibold text-ink">All requests</h2>
        <p className="mt-1 text-sm text-muted">Each seeker agreed to be contacted about homes that match.</p>
      </Reveal>

      <Reveal y={16}>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
            <Input
              type="search"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Search by name, email, phone or area…"
              aria-label="Search requests"
              className="h-10 pl-11"
            />
          </div>
          <AdminSelect
            label="State"
            {...selectProps("state")}
            value={query.state}
            onChange={(state) => setQuery((prev) => ({ ...prev, state: state as AdminRequestQuery["state"], page: 1 }))}
            options={[
              { value: "all", label: withCount("All states", sum(counts?.states)) },
              ...(["live", "expired", "closed"] as const).map((s) => ({
                value: s,
                label: withCount(STATE_LABEL[s], counts?.states[s]),
              })),
            ]}
          />
          <AdminSelect
            label="City"
            {...selectProps("city")}
            value={query.city}
            onChange={(city) => setQuery((prev) => ({ ...prev, city: city as AdminRequestQuery["city"], page: 1 }))}
            options={[
              { value: "all", label: withCount("All cities", sum(counts?.cities)) },
              ...CITY_OPTIONS.map((c) => ({ value: c.value, label: withCount(c.label, counts?.cities[c.value]) })),
            ]}
          />
          <AdminSelect
            label="Looking to"
            {...selectProps("intent")}
            value={query.intent}
            onChange={(intent) => setQuery((prev) => ({ ...prev, intent: intent as AdminRequestQuery["intent"], page: 1 }))}
            options={[
              { value: "all", label: withCount("Any intent", sum(counts?.intents)) },
              ...INTENT_OPTIONS.map((o) => ({ value: o.value, label: withCount(o.label, counts?.intents[o.value]) })),
            ]}
          />
        </div>
      </Reveal>

      {isError ? (
        <EmptyState icon={UsersRound} title="Could not load requests" message={apiMessage(error)} />
      ) : isPending ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={filtered ? "No matching requests" : "No requests yet"}
          message={
            filtered
              ? "Nothing matches those filters. Try a different search or widen the state, city and intent."
              : "Requests will appear here as seekers join the waitlist."
          }
        />
      ) : (
        <DataTable
          className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
          minWidthClass="sm:min-w-[760px]"
          head={
            <tr>
              <th className={thCls}>Seeker</th>
              <th className={thCls}>Wants</th>
              <th className={cn(thCls, "max-md:hidden")}>Budget</th>
              <th className={cn(thCls, "max-lg:hidden")}>Contact</th>
              <th className={thCls}>State</th>
            </tr>
          }
        >
          {rows.map((r) => (
            <Row
              key={r.id}
              row={r}
              onOpen={() => navigate(`/admin/users/${r.seeker.id}`)}
            />
          ))}
        </DataTable>
      )}

      {!isError && !isPending && rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">{rows.length}</span> of {total}{" "}
            {total === 1 ? "request" : "requests"}
          </p>

          {pages > 1 && (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))}>
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </Button>
              <span className="text-sm tabular-nums text-muted">
                Page {page} of {pages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))}>
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** A row opens the seeker's account; the contact links act on their own. */
function Row({ row, onOpen }: { row: AdminRequestRow; onOpen: () => void }) {
  const { seeker } = row;
  const name = displayName(seeker.fullname);
  const phone = seeker.whatsapp || seeker.phone;
  const wantsWhatsapp = seeker.contactMeans.includes("WhatsApp");
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const range =
    row.budgetMin != null
      ? `${formatPrice(row.budgetMin)} to ${budget(row.budgetMax, row.intent)}`
      : `Up to ${budget(row.budgetMax, row.intent)}`;

  return (
    <tr className={cn(rowCls, row.state !== "live" && "opacity-70")} onClick={onOpen}>
      <td className={cn(tdCls, "max-w-[13rem]")}>
        <div className="flex items-center gap-3">
          <UserAvatar name={name} avatar={seeker.avatar} className="size-10" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{name}</p>
            <p className="truncate text-xs text-muted">{seeker.email}</p>
            {!seeker.verified && (
              <p className="mt-0.5 text-[0.7rem] font-semibold text-gold">Email not verified</p>
            )}
          </div>
        </div>
      </td>
      <td className={cn(tdCls, "max-w-[16rem]")}>
        <p className="flex items-center gap-1.5 font-medium text-ink">
          <Building className="size-3.5 shrink-0 text-faint" aria-hidden />
          <span className="truncate">{requestTitle(row)}</span>
        </p>
        <p className="truncate text-xs text-muted">
          {[
            row.areas.length ? row.areas.join(", ") : "Anywhere in the city",
            row.bedrooms != null ? `${row.bedrooms}+ bed` : null,
            TIMELINE_OPTIONS.find((t) => t.value === row.timeline)?.label,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {row.notes && <p className="mt-0.5 line-clamp-1 text-xs italic text-faint">"{row.notes}"</p>}
        <p className="mt-0.5 text-[0.7rem] tabular-nums text-faint">
          {row.ref} · Filed {formatDate(row.createdAt)}
        </p>
      </td>
      <td className={cn(tdCls, "whitespace-nowrap tabular-nums text-ink max-md:hidden")}>{range}</td>
      <td className={cn(tdCls, "max-lg:hidden")}>
        <div className="space-y-1 whitespace-nowrap text-xs">
          {phone && (
            <a href={`tel:${phone}`} onClick={stop} className="flex items-center gap-1.5 text-ink hover:text-brand-ink">
              <Phone className="size-3.5 text-faint" aria-hidden />
              {formatPhone(phone)}
            </a>
          )}
          <div className="flex items-center gap-3">
            {phone && wantsWhatsapp && (
              <a
                href={`https://wa.me/${whatsappDigits(phone)}`}
                target="_blank"
                rel="noreferrer"
                onClick={stop}
                className="inline-flex items-center gap-1.5 text-ink hover:text-brand-ink"
              >
                <MessageCircle className="size-3.5 text-faint" aria-hidden />
                WhatsApp
              </a>
            )}
            <a href={`mailto:${seeker.email}`} onClick={stop} className="inline-flex items-center gap-1.5 text-ink hover:text-brand-ink">
              <Mail className="size-3.5 text-faint" aria-hidden />
              Email
            </a>
          </div>
          {seeker.contactMeans && <p className="text-faint">Prefers {seeker.contactMeans}</p>}
        </div>
      </td>
      <td className={tdCls}>
        <StatusPill status={STATE_PILL[row.state]} />
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="h-12 border-b border-line bg-surface-2/40" />
      <div className="divide-y divide-line">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4 max-sm:px-4">
            <div className="size-10 shrink-0 animate-pulse rounded-full bg-surface-2" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-40 animate-pulse rounded bg-surface-2" />
              <div className="h-3 w-56 animate-pulse rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
