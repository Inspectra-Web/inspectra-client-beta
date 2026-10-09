import { Link } from "react-router";
import { toast } from "react-toastify";
import { ChevronRight, ClipboardList, Loader2, Plus, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { apiMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import {
  ACTIVE_REQUESTS_MAX,
  requestState,
  useMyRequests,
  useRenewRequest,
  type PropertyRequest,
  type RequestState,
} from "@/lib/requests";
import { budgetText, cityLabel, requestTitle } from "@/lib/requestSchema";
import { cn } from "@/lib/cn";

// Live requests first, then the ones waiting on a renewal, then the finished ones.
const ORDER: Record<RequestState, number> = { active: 0, expired: 1, closed: 2 };

export function Requests() {
  const { data, isPending, isError, error } = useMyRequests();

  const requests = [...(data ?? [])].sort(
    (a, b) => ORDER[requestState(a)] - ORDER[requestState(b)],
  );
  const live = requests.filter((r) => requestState(r) === "active").length;
  const full = live >= ACTIVE_REQUESTS_MAX;

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="My requests"
          subtitle="We'll tell you when verified homes that match go live."
          actions={
            data && !full ? (
              <Link to="/request" className={buttonClasses("brand", "md")}>
                <Plus className="size-4" aria-hidden />
                New request
              </Link>
            ) : undefined
          }
        />
      </Reveal>

      {full && (
        <Reveal y={16}>
          <p className="rounded-xl border border-line bg-surface-2/50 px-4 py-3 text-sm text-muted">
            You have {ACTIVE_REQUESTS_MAX} active requests, the most you can hold at once. Close
            one to file another.
          </p>
        </Reveal>
      )}

      {isError ? (
        <Reveal y={16}>
          <EmptyState icon={ClipboardList} title="Could not load your requests" message={apiMessage(error)} />
        </Reveal>
      ) : isPending ? (
        <ListSkeleton />
      ) : requests.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={ClipboardList}
            title="No requests yet"
            message="Tell us the home you're looking for, and you'll be among the first to hear when verified homes that match go live."
            action={
              <Link to="/request" className={buttonClasses("brand", "md")}>
                <Plus className="size-4" aria-hidden />
                File a request
              </Link>
            }
          />
        </Reveal>
      ) : (
        <div className="space-y-4">
          {requests.map((request, i) => (
            <Reveal key={request.id} y={14} delay={i * 0.04}>
              <Row request={request} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ request }: { request: PropertyRequest }) {
  const state = requestState(request);
  const renew = useRenewRequest();

  const where = request.areas.length
    ? request.areas.join(", ")
    : `Anywhere in ${cityLabel(request.city)}`;
  const details = [where, request.bedrooms != null ? `${request.bedrooms}+ bedrooms` : null]
    .filter(Boolean)
    .join(" · ");

  async function onRenew() {
    try {
      await renew.mutateAsync(request.id);
      toast.success("Renewed for another 90 days.");
    } catch (err) {
      toast.error(apiMessage(err, "Could not renew this request."));
    }
  }

  return (
    <article
      className={cn(
        "group relative rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_16px_36px_-22px_rgba(10,30,45,0.2)]",
        state === "closed" && "opacity-75",
      )}
    >
      <Link
        to={`/dashboard/requests/${request.id}`}
        aria-label={`Open ${requestTitle(request)}`}
        className="absolute inset-0 z-[1] rounded-2xl"
      />

      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-ink max-sm:size-10">
          <ClipboardList className="size-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-1 font-semibold text-ink">{requestTitle(request)}</h3>
              <p className="line-clamp-1 text-sm text-muted">{details}</p>
            </div>
            <StatusPill status={state} className="shrink-0" />
          </div>

          <p className="mt-3 text-sm font-medium tabular-nums text-ink">{budgetText(request)}</p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-faint">
              {state === "active" && `Active until ${formatDate(request.expiresAt)}`}
              {state === "expired" && `Expired ${formatDate(request.expiresAt)}`}
              {state === "closed" && `Closed ${formatDate(request.updatedAt)}`}
            </p>

            {/* Above the card's link layer, so it renews in place instead of opening the request. */}
            {state === "expired" && (
              <button
                type="button"
                onClick={onRenew}
                disabled={renew.isPending}
                className={cn(buttonClasses("outline", "sm"), "relative z-[2]")}
              >
                {renew.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <RotateCcw className="size-4" aria-hidden />
                )}
                Still looking? Renew
              </button>
            )}
          </div>
        </div>

        <ChevronRight className="mt-1 size-5 shrink-0 self-center text-faint transition-colors group-hover:text-brand-ink max-sm:hidden" />
      </div>
    </article>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5">
          <div className="size-12 shrink-0 animate-pulse rounded-xl bg-surface-2" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="h-4 w-56 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-40 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-32 animate-pulse rounded bg-surface-2" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-surface-2" />
        </div>
      ))}
    </div>
  );
}
