import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, GraduationCap, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DataTable, tdCls, thCls } from "@/components/dashboard/DataTable";
import { CourseTabs } from "@/components/course/CourseTabs";
import {
  ENROLLMENTS_PAGE_SIZE,
  useAdminEnrollments,
  type Enrollment,
  type EnrollmentFilter,
  type EnrollmentsQuery,
} from "@/lib/course";
import { formatDate, formatPhone } from "@/lib/format";
import { cn } from "@/lib/cn";

const FILTERS: { value: EnrollmentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Awaiting payment" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Watched" },
];

export function AdminCourseEnrollments() {
  const [query, setQuery] = useState<EnrollmentsQuery>({ q: "", status: "all", page: 1 });
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => setQuery((prev) => (prev.q === typed.trim() ? prev : { ...prev, q: typed.trim(), page: 1 })),
      300,
    );
    return () => clearTimeout(timer);
  }, [typed]);

  const { data, isPending, isError, isPlaceholderData } = useAdminEnrollments(query);
  const rows = data?.enrollments ?? [];
  const filtered = query.q !== "" || query.status !== "all";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-faint">
          Realtor acquisition
        </p>
        <h1 className="display mt-1 text-3xl text-ink max-sm:text-2xl">Enrollments</h1>
      </header>

      <CourseTabs />


      <div className="flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-stretch">
        <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-2">
          {FILTERS.map(({ value, label }) => {
            const active = query.status === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setQuery((prev) => ({ ...prev, status: value, page: 1 }))}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                  active
                    ? "border-ink bg-ink text-bg"
                    : "border-line text-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                {label}
                {data && (
                  <span className={cn("tabular-nums", active ? "text-bg/70" : "text-faint")}>
                    {data.counts[value]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative w-80 max-lg:w-full">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint"
            aria-hidden
          />
          <Input
            type="search"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Search name, email or phone"
            aria-label="Search enrollments"
            className="h-10 pl-11"
          />
        </div>
      </div>

      {isError ? (
        <EmptyState
          icon={GraduationCap}
          title="Enrollments did not load"
          message="Refresh the page to try again."
        />
      ) : isPending ? (
        <div className="h-72 animate-pulse rounded-2xl border border-line bg-surface-2/50" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={filtered ? "No one matches" : "No enrollments yet"}
          message={
            filtered
              ? "Nobody fits that search and status. Clear the search or pick another status."
              : "When a realtor pays for the course, they appear here."
          }
        />
      ) : (
        <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
          <DataTable
            minWidthClass="sm:min-w-[880px]"
            head={
              <tr>
                <th className={cn(thCls, "w-14")}>S/N</th>
                <th className={thCls}>Realtor</th>
                <th className={cn(thCls, "max-md:hidden")}>Phone</th>
                <th className={cn(thCls, "max-md:hidden")}>Paid on</th>
                <th className={thCls}>Progress</th>
              </tr>
            }
          >
            {rows.map((enrollment, i) => (
              <tr key={enrollment.id} className="transition-colors hover:bg-surface-2/40">
                <td className={cn(tdCls, "tabular-nums text-faint")}>
                  {(query.page - 1) * ENROLLMENTS_PAGE_SIZE + i + 1}
                </td>
                <td className={tdCls}>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={enrollment.fullname} avatar="" className="size-8" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{enrollment.fullname}</p>
                      <p className="truncate text-xs text-faint">{enrollment.email}</p>
                    </div>
                  </div>
                </td>
                <td className={cn(tdCls, "tabular-nums text-muted max-md:hidden")}>
                  {formatPhone(enrollment.phone)}
                </td>
                <td className={cn(tdCls, "text-muted max-md:hidden")}>
                  {enrollment.paidAt ? formatDate(enrollment.paidAt) : <span className="text-faint">Not yet</span>}
                </td>
                <td className={tdCls}>
                  <Progress enrollment={enrollment} />
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {!isError && !isPending && rows.length > 0 && data && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">{rows.length}</span> of {data.total}{" "}
            {data.total === 1 ? "realtor" : "realtors"}
          </p>
          {data.pages > 1 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={query.page <= 1}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft className="size-4" aria-hidden /> Previous
              </Button>
              <span className="text-sm tabular-nums text-muted">
                Page {query.page} of {data.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={query.page >= data.pages}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** The same three steps as the funnel on the course page, filled as far as this realtor got. */
function Progress({ enrollment }: { enrollment: Enrollment }) {
  const reached = [
    enrollment.status !== "pending",
    enrollment.status === "completed",
    enrollment.registered,
  ];
  const step = reached.lastIndexOf(true);

  const label =
    step === -1
      ? "Awaiting payment"
      : step === 0
        ? "Paid, not watched"
        : step === 1
          ? `Watched ${formatDate(enrollment.completedAt ?? enrollment.createdAt)}`
          : "Registered";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1" aria-hidden>
        {reached.map((on, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-6 rounded-full",
              on ? (i === 2 ? "bg-verified" : "bg-brand") : "bg-surface-2 ring-1 ring-inset ring-line",
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "text-sm",
          step === 2 ? "font-semibold text-verified" : step === -1 ? "text-gold" : "text-ink",
        )}
      >
        {label}
      </span>
    </div>
  );
}
