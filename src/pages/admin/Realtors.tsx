import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BadgeCheck, ChevronLeft, ChevronRight, Search, ShieldCheck, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { apiMessage } from "@/lib/api";
import {
  useAdminRealtors,
  PAGE_SIZE,
  REALTORS_QUERY,
  type RealtorQuery,
} from "@/lib/adminRealtors";
import { displayName, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export function AdminRealtors() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [query, setQuery] = useState<RealtorQuery>(REALTORS_QUERY);
  const [openId, setOpenId] = useState<string | null>(null);

  const selectProps = (id: string) => ({
    open: openId === id,
    onOpenChange: (o: boolean) => setOpenId((prev) => (o ? id : prev === id ? null : prev)),
  });

  useEffect(() => {
    const timer = setTimeout(
      () => setQuery((prev) => (prev.q === typed.trim() ? prev : { ...prev, q: typed.trim(), page: 1 })),
      300,
    );
    return () => clearTimeout(timer);
  }, [typed]);

  const { data, isPending, isError, error, isPlaceholderData } = useAdminRealtors(query);

  const rows = data?.realtors ?? [];
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const filtered =
    query.q !== "" || query.certified !== "all" || query.identity !== "all";

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Realtors"
          subtitle="The professionals behind every listing, with their certification and identity checks."
        />
      </Reveal>

      <Reveal y={16}>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
            <Input
              type="search"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Search by name, agency, email or city…"
              aria-label="Search realtors"
              className="h-10 pl-11"
            />
          </div>
          <AdminSelect
            label="Certification"
            {...selectProps("certified")}
            value={query.certified}
            onChange={(certified) =>
              setQuery((prev) => ({ ...prev, certified: certified as RealtorQuery["certified"], page: 1 }))
            }
            options={[
              { value: "all", label: "All realtors" },
              { value: "yes", label: "Certified" },
              { value: "no", label: "Not certified" },
            ]}
          />
          <AdminSelect
            label="Identity"
            {...selectProps("identity")}
            value={query.identity}
            onChange={(identity) =>
              setQuery((prev) => ({ ...prev, identity: identity as RealtorQuery["identity"], page: 1 }))
            }
            options={[
              { value: "all", label: "Any identity" },
              { value: "verified", label: "ID verified" },
              { value: "unverified", label: "ID unverified" },
            ]}
          />
        </div>
      </Reveal>

      {isError ? (
        <Reveal y={16}>
          <EmptyState icon={UsersRound} title="Could not load realtors" message={apiMessage(error)} />
        </Reveal>
      ) : isPending ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={UsersRound}
            title={filtered ? "No matching realtors" : "No realtors yet"}
            message={
              filtered
                ? "Nothing matches those filters. Try a different search or widen them."
                : "Realtor accounts will appear here as people sign up."
            }
          />
        </Reveal>
      ) : (
        <Reveal y={16}>
          <DataTable
            className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
            minWidthClass="sm:min-w-[800px]"
            head={
              <tr>
                <th className={cn(thCls, "w-12")}>S/N</th>
                <th className={thCls}>Realtor</th>
                <th className={cn(thCls, "max-md:hidden")}>City</th>
                <th className={thCls}>Certified</th>
                <th className={cn(thCls, "max-lg:hidden")}>Identity</th>
                <th className={cn(thCls, "max-md:hidden")}>Joined</th>
              </tr>
            }
          >
            {rows.map((r, i) => {
              const name = displayName(r.fullname);

              return (
                <tr key={r.id} className={rowCls} onClick={() => navigate(`/admin/realtors/${r.id}`)}>
                  <td className={cn(tdCls, "tabular-nums text-muted")}>
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-3">
                      <UserAvatar name={name} avatar={r.avatar} className="size-10" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{name}</p>
                        <p className="truncate text-xs text-muted">{r.agencyName || r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={cn(tdCls, "text-sm text-muted max-md:hidden")}>{r.city || "—"}</td>
                  <td className={tdCls}>
                    {r.certified ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-verified">
                        <BadgeCheck className="size-4" aria-hidden />
                        Certified
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
                        Not certified
                      </span>
                    )}
                  </td>
                  <td className={cn(tdCls, "max-lg:hidden")}>
                    {r.identityVerified ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-verified">
                        <ShieldCheck className="size-4" aria-hidden />
                        Verified
                      </span>
                    ) : (
                      <span className="text-sm text-muted">Unverified</span>
                    )}
                  </td>
                  <td className={cn(tdCls, "text-sm text-muted max-md:hidden")}>
                    {formatDate(r.createdAt)}
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </Reveal>
      )}

      {!isError && !isPending && rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">{rows.length}</span> of {total}{" "}
            {total === 1 ? "realtor" : "realtors"}
          </p>

          {pages > 1 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </Button>
              <span className="text-sm tabular-nums text-muted">
                Page {page} of {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="h-12 border-b border-line bg-surface-2/40" />
      <div className="divide-y divide-line">
        {Array.from({ length: 6 }, (_, i) => (
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
