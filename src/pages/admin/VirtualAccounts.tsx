import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Landmark, Search } from "lucide-react";
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
  useAdminVirtualAccounts,
  PAGE_SIZE,
  VIRTUAL_ACCOUNTS_QUERY,
  type VirtualAccountQuery,
} from "@/lib/adminVirtualAccounts";
import { displayName, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export function AdminVirtualAccounts() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [query, setQuery] = useState<VirtualAccountQuery>(VIRTUAL_ACCOUNTS_QUERY);
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setQuery((prev) => (prev.q === typed.trim() ? prev : { ...prev, q: typed.trim(), page: 1 })),
      300,
    );
    return () => clearTimeout(timer);
  }, [typed]);

  const { data, isPending, isError, error, isPlaceholderData } = useAdminVirtualAccounts(query);

  const rows = data?.accounts ?? [];
  const counts = data?.counts;
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const filtered = query.q !== "" || query.status !== "all";

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Virtual accounts"
          subtitle="Every realtor's NGN account, held by INSPECTRA on their behalf."
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
              placeholder="Search by name, email or account number…"
              aria-label="Search virtual accounts"
              className="h-10 pl-11"
            />
          </div>
          <AdminSelect
            label="Status"
            open={statusOpen}
            onOpenChange={setStatusOpen}
            value={query.status}
            onChange={(status) =>
              setQuery((prev) => ({ ...prev, status: status as VirtualAccountQuery["status"], page: 1 }))
            }
            options={[
              { value: "all", label: counts ? `All accounts (${counts.all})` : "All accounts" },
              { value: "active", label: counts ? `Active (${counts.active})` : "Active" },
              { value: "pending", label: counts ? `Opening (${counts.pending})` : "Opening" },
            ]}
          />
        </div>
      </Reveal>

      {isError ? (
        <Reveal y={16}>
          <EmptyState icon={Landmark} title="Could not load virtual accounts" message={apiMessage(error)} />
        </Reveal>
      ) : isPending ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={Landmark}
            title={filtered ? "No matching accounts" : "No virtual accounts yet"}
            message={
              filtered
                ? "Nothing matches those filters. Try a different search or widen them."
                : "Accounts appear here as identity-verified realtors open them."
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
                <th className={thCls}>Account number</th>
                <th className={cn(thCls, "max-md:hidden")}>Bank</th>
                <th className={thCls}>Status</th>
                <th className={cn(thCls, "max-lg:hidden")}>Opened</th>
              </tr>
            }
          >
            {rows.map((a, i) => {
              const name = displayName(a.realtor.fullname);
              const active = a.status === "active";

              return (
                <tr key={a.id} className={rowCls} onClick={() => navigate(`/admin/realtors/${a.realtor.id}`)}>
                  <td className={cn(tdCls, "tabular-nums text-muted")}>
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-3">
                      <UserAvatar name={name} avatar={a.realtor.avatar} className="size-10" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{name}</p>
                        <p className="truncate text-xs text-muted">{a.realtor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={cn(tdCls, "font-medium tabular-nums text-ink")}>
                    {a.accountNumber || "—"}
                  </td>
                  <td className={cn(tdCls, "text-sm text-muted max-md:hidden")}>{a.bankName || "—"}</td>
                  <td className={tdCls}>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                        active ? "bg-verified/12 text-verified" : "bg-gold/15 text-gold",
                      )}
                    >
                      {active ? "Active" : "Opening"}
                    </span>
                  </td>
                  <td className={cn(tdCls, "text-sm text-muted max-lg:hidden")}>
                    {a.activatedAt ? formatDate(a.activatedAt) : "—"}
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
            {total === 1 ? "account" : "accounts"}
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
