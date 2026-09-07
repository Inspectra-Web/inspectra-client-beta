import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Search, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { apiMessage } from "@/lib/api";
import type { AuthRole, AuthStatus } from "@/lib/auth";
import { useAdminUsers, PAGE_SIZE, type DirectoryQuery } from "@/lib/adminUsers";
import { displayName, monthYear } from "@/lib/format";
import { cn } from "@/lib/cn";

const ROLE_TONE: Record<AuthRole, string> = {
  admin: "bg-brand/12 text-brand-ink",
  realtor: "bg-verified/12 text-verified",
  seeker: "bg-surface-2 text-muted",
};
const ROLE_LABEL: Record<AuthRole, string> = { admin: "Admin", realtor: "Realtor", seeker: "Seeker" };

const STATUS_TONE: Record<AuthStatus, string> = {
  active: "text-verified",
  suspended: "text-rose-500",
  pending: "text-gold",
};

export function AdminUsers() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [query, setQuery] = useState<DirectoryQuery>({
    q: "",
    role: "all",
    status: "all",
    page: 1,
  });
  const [openId, setOpenId] = useState<string | null>(null);

  const selectProps = (id: string) => ({
    open: openId === id,
    onOpenChange: (o: boolean) => setOpenId((prev) => (o ? id : prev === id ? null : prev)),
  });

  // The server does the searching, so hold off a beat rather than firing a
  // request per keystroke. Any new search starts again at page 1.
  useEffect(() => {
    const timer = setTimeout(
      () => setQuery((prev) => (prev.q === typed.trim() ? prev : { ...prev, q: typed.trim(), page: 1 })),
      300,
    );
    return () => clearTimeout(timer);
  }, [typed]);

  const { data, isPending, isError, error, isPlaceholderData } = useAdminUsers(query);

  const rows = data?.users ?? [];
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const filtered = query.q !== "" || query.role !== "all" || query.status !== "all";

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Users"
          subtitle="Everyone on the platform: seekers, certified realtors and the admin team."
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
              placeholder="Search by name, email or city…"
              aria-label="Search users"
              className="h-10 pl-11"
            />
          </div>
          <AdminSelect
            label="Role"
            {...selectProps("role")}
            value={query.role}
            onChange={(role) => setQuery((prev) => ({ ...prev, role: role as DirectoryQuery["role"], page: 1 }))}
            options={[
              { value: "all", label: "All roles" },
              { value: "seeker", label: "Seekers" },
              { value: "realtor", label: "Realtors" },
              { value: "admin", label: "Admins" },
            ]}
          />
          <AdminSelect
            label="Status"
            {...selectProps("status")}
            value={query.status}
            onChange={(status) => setQuery((prev) => ({ ...prev, status: status as DirectoryQuery["status"], page: 1 }))}
            options={[
              { value: "all", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "suspended", label: "Suspended" },
            ]}
          />
        </div>
      </Reveal>

      {isError ? (
        <Reveal y={16}>
          <EmptyState
            icon={UsersRound}
            title="Could not load users"
            message={apiMessage(error)}
          />
        </Reveal>
      ) : isPending ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <Reveal y={16}>
          <EmptyState
            icon={UsersRound}
            title={filtered ? "No matching users" : "No users yet"}
            message={
              filtered
                ? "Nothing matches those filters. Try a different search or widen the role and status."
                : "Accounts will appear here as people sign up."
            }
          />
        </Reveal>
      ) : (
        <Reveal y={16}>
          <DataTable
            className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
            minWidthClass="sm:min-w-[720px]"
            head={
              <tr>
                <th className={cn(thCls, "w-12")}>S/N</th>
                <th className={thCls}>User</th>
                <th className={thCls}>Role</th>
                <th className={cn(thCls, "max-md:hidden")}>City</th>
                <th className={thCls}>Status</th>
                <th className={cn(thCls, "max-md:hidden")}>Joined</th>
              </tr>
            }
          >
            {rows.map((u, i) => {
              const name = displayName(u.fullname);

              return (
                <tr
                  key={u.id}
                  className={rowCls}
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                >
                  <td className={cn(tdCls, "tabular-nums text-muted")}>
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-3">
                      <UserAvatar name={name} avatar={u.avatar} className="size-10" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{name}</p>
                        <p className="truncate text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={tdCls}>
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", ROLE_TONE[u.role])}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className={cn(tdCls, "text-sm text-muted max-md:hidden")}>{u.city || "—"}</td>
                  <td className={cn(tdCls, "text-sm font-medium capitalize", STATUS_TONE[u.status])}>{u.status}</td>
                  <td className={cn(tdCls, "text-sm text-muted max-md:hidden")}>{monthYear(u.createdAt)}</td>
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
            {total === 1 ? "user" : "users"}
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
