import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BadgeCheck, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { Input } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { realtors } from "@/data/mock";
import { realtorPlan } from "@/data/admin";
import { cn } from "@/lib/cn";

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  max: "Max",
};

export function AdminRealtors() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cert, setCert] = useState("all");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return realtors.filter((r) => {
      if (cert === "certified" && !r.certified) return false;
      if (cert === "uncertified" && r.certified) return false;
      if (query && !`${r.name} ${r.agency} ${r.city}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [q, cert]);

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Realtors"
          subtitle="The certified professionals behind every listing on the platform."
        />
      </Reveal>

      <Reveal y={16}>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
            <Input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, agency or city…"
              aria-label="Search realtors"
              className="h-10 pl-11"
            />
          </div>
          <AdminSelect
            label="Certification"
            value={cert}
            onChange={setCert}
            options={[
              { value: "all", label: "All realtors" },
              { value: "certified", label: "Certified" },
              { value: "uncertified", label: "Not certified" },
            ]}
          />
        </div>
      </Reveal>

      <Reveal y={16}>
        <DataTable
          minWidthClass="sm:min-w-[800px]"
          head={
            <tr>
              <th className={cn(thCls, "w-12")}>S/N</th>
              <th className={thCls}>Realtor</th>
              <th className={cn(thCls, "max-md:hidden")}>City</th>
              <th className={thCls}>Certified</th>
              <th className={cn(thCls, "max-lg:hidden")}>Plan</th>
              <th className={cn(thCls, "max-md:hidden")}>Verified</th>
              <th className={cn(thCls, "max-md:hidden")}>Deals</th>
            </tr>
          }
        >
          {rows.map((r, i) => (
            <tr key={r.id} className={rowCls} onClick={() => navigate(`/admin/realtors/${r.id}`)}>
              <td className={cn(tdCls, "tabular-nums text-muted")}>{i + 1}</td>
              <td className={tdCls}>
                <div className="flex items-center gap-3">
                  <img
                    src={`${r.avatar}?auto=format&fit=facearea&facepad=3&w=72&h=72&q=80`}
                    alt=""
                    className="size-10 shrink-0 rounded-full object-cover ring-1 ring-line"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{r.name}</p>
                    <p className="truncate text-xs text-muted">{r.agency}</p>
                  </div>
                </div>
              </td>
              <td className={cn(tdCls, "text-sm text-muted max-md:hidden")}>{r.city}</td>
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
              <td className={cn(tdCls, "text-sm text-muted max-lg:hidden")}>
                {PLAN_LABEL[realtorPlan[r.id] ?? "starter"]}
              </td>
              <td className={cn(tdCls, "tabular-nums text-muted max-md:hidden")}>{r.verifiedListings}</td>
              <td className={cn(tdCls, "tabular-nums text-muted max-md:hidden")}>{r.completedDeals}</td>
            </tr>
          ))}
        </DataTable>
      </Reveal>
    </div>
  );
}
