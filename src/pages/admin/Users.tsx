import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, thCls, tdCls, rowCls } from "@/components/dashboard/DataTable";
import { Input } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { directoryUsers, type UserRole, type UserStatus } from "@/data/admin";
import { cn } from "@/lib/cn";

const ROLE_TONE: Record<UserRole, string> = {
  admin: "bg-brand/12 text-brand-ink",
  realtor: "bg-verified/12 text-verified",
  seeker: "bg-surface-2 text-muted",
};
const ROLE_LABEL: Record<UserRole, string> = { admin: "Admin", realtor: "Realtor", seeker: "Seeker" };

const STATUS_TONE: Record<UserStatus, string> = {
  active: "text-verified",
  suspended: "text-rose-500",
  pending: "text-gold",
};

export function AdminUsers() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return directoryUsers.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (query && !`${u.name} ${u.email} ${u.city}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [q, role]);

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
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email or city…"
              aria-label="Search users"
              className="h-10 pl-11"
            />
          </div>
          <AdminSelect
            label="Role"
            value={role}
            onChange={setRole}
            options={[
              { value: "all", label: "All roles" },
              { value: "seeker", label: "Seekers" },
              { value: "realtor", label: "Realtors" },
              { value: "admin", label: "Admins" },
            ]}
          />
        </div>
      </Reveal>

      <Reveal y={16}>
        <DataTable
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
          {rows.map((u, i) => (
              <tr
                key={u.id}
                className={rowCls}
                onClick={() => navigate(`/admin/users/${u.id}`)}
              >
                <td className={cn(tdCls, "tabular-nums text-muted")}>{i + 1}</td>
                <td className={tdCls}>
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt="" className="size-10 shrink-0 rounded-full object-cover ring-1 ring-line" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{u.name}</p>
                      <p className="truncate text-xs text-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className={tdCls}>
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", ROLE_TONE[u.role])}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className={cn(tdCls, "text-sm text-muted max-md:hidden")}>{u.city}</td>
                <td className={cn(tdCls, "text-sm font-medium capitalize", STATUS_TONE[u.status])}>{u.status}</td>
                <td className={cn(tdCls, "text-sm text-muted max-md:hidden")}>{u.joined}</td>
              </tr>
          ))}
        </DataTable>
      </Reveal>

      <p className="text-sm text-muted">
        <span className="font-semibold tabular-nums text-ink">{rows.length}</span> of {directoryUsers.length} users
      </p>
    </div>
  );
}
