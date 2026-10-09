import type { RequestBody } from "@/lib/requests";
import {
  asksBedrooms,
  budgetText,
  cityLabel,
  intentLabel,
  timelineLabel,
  typeLabel,
} from "@/lib/requestSchema";
import { cn } from "@/lib/cn";

/** A request read back as label and value rows: the review step, the success screen
 *  and the dashboard all show the brief this one way. */
export function RequestSummary({ request, className }: { request: RequestBody; className?: string }) {
  const rows: [string, string][] = [
    ["Looking to", intentLabel(request.intent)],
    ["Property", typeLabel(request.type ?? request.category)],
    ["City", cityLabel(request.city)],
    ["Areas", request.areas.length ? request.areas.join(", ") : "Anywhere in the city"],
  ];

  if (asksBedrooms(request.category))
    rows.push(["Bedrooms", request.bedrooms != null ? `${request.bedrooms}+` : "Any"]);

  rows.push(["Budget", budgetText(request)], ["When", timelineLabel(request.timeline)]);

  return (
    <dl className={cn("rounded-2xl border border-line bg-surface-2/40 px-5 py-2", className)}>
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-start justify-between gap-4 border-b border-line/70 py-2.5 last:border-b-0"
        >
          <dt className="shrink-0 text-sm text-muted">{label}</dt>
          <dd className="min-w-0 text-right text-sm font-medium text-ink">{value}</dd>
        </div>
      ))}
      {request.notes && (
        <div className="border-t border-line/70 py-2.5">
          <dt className="text-sm text-muted">Notes</dt>
          <dd className="mt-1 text-sm text-ink">{request.notes}</dd>
        </div>
      )}
    </dl>
  );
}
