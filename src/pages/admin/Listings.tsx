import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListingIntentBadge } from "@/components/ui/ListingIntentBadge";
import { Input } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { properties, realtorById } from "@/data/mock";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

const CITIES = Array.from(new Set(properties.map((p) => p.city)));

export function AdminListings() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const selectProps = (id: string) => ({
    open: openId === id,
    onOpenChange: (o: boolean) => setOpenId((prev) => (o ? id : prev === id ? null : prev)),
  });

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return properties.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (city !== "all" && p.city !== city) return false;
      if (query && !`${p.title} ${p.location} ${p.city} ${p.ref}`.toLowerCase().includes(query))
        return false;
      return true;
    });
  }, [q, status, city]);

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Listings"
          subtitle="Every property on the platform. Open one to moderate its status or media."
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
              placeholder="Search by title, area or ref…"
              aria-label="Search listings"
              className="h-10 pl-11"
            />
          </div>
          <AdminSelect
            {...selectProps("status")}
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All statuses" },
              { value: "verified", label: "Verified" },
              { value: "pending", label: "Pending" },
              { value: "disputed", label: "Disputed" },
            ]}
          />
          <AdminSelect
            {...selectProps("city")}
            label="City"
            value={city}
            onChange={setCity}
            options={[{ value: "all", label: "All cities" }, ...CITIES.map((c) => ({ value: c, label: c }))]}
          />
        </div>
      </Reveal>

      <Reveal y={16}>
        <DataTable
          minWidthClass="sm:min-w-[840px]"
          head={
            <tr>
              <th className={cn(thCls, "w-12")}>S/N</th>
              <th className={thCls}>Property</th>
              <th className={thCls}>Offer</th>
              <th className={thCls}>Ref</th>
              <th className={cn(thCls, "max-md:hidden")}>Realtor</th>
              <th className={thCls}>Price</th>
              <th className={thCls}>Status</th>
            </tr>
          }
        >
          {rows.map((p, i) => {
            const realtor = realtorById(p.realtorId);
            return (
              <tr key={p.id} className={rowCls} onClick={() => navigate(`/admin/listings/${p.id}`)}>
                <td className={cn(tdCls, "tabular-nums text-muted")}>{i + 1}</td>
                <td className={tdCls}>
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{p.title}</p>
                      <p className="truncate text-xs text-muted">
                        {p.location}, {p.city}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={tdCls}>
                  <ListingIntentBadge listingFor={p.listingFor} />
                </td>
                <td className={cn(tdCls, "whitespace-nowrap text-sm tabular-nums text-muted")}>{p.ref}</td>
                <td className={cn(tdCls, "whitespace-nowrap text-sm text-muted max-md:hidden")}>
                  {realtor?.name ?? "-"}
                </td>
                <td className={cn(tdCls, "font-medium tabular-nums text-ink")}>{formatPrice(p.price)}</td>
                <td className={tdCls}>
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            );
          })}
        </DataTable>
      </Reveal>

      <p className="text-sm text-muted">
        <span className="font-semibold tabular-nums text-ink">{rows.length}</span> of {properties.length} listings
      </p>
    </div>
  );
}
