import { Heart, MessageSquare, CalendarCheck, Eye } from "lucide-react";
import { Link } from "react-router";
import type { Activity, ActivityKind } from "@/data/seeker";
import { propertyById } from "@/data/mock";

const ICON: Record<ActivityKind, typeof Heart> = {
  saved: Heart,
  inquiry: MessageSquare,
  inspection: CalendarCheck,
  viewed: Eye,
};

/** One row in the recent-activity timeline. Pass `isLast` to drop the connector line. */
export function ActivityItem({
  activity,
  isLast = false,
}: {
  activity: Activity;
  isLast?: boolean;
}) {
  const Icon = ICON[activity.kind];
  const property = activity.propertyId ? propertyById(activity.propertyId) : undefined;

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!isLast && (
        <span
          className="absolute bottom-0 left-4 top-9 w-px bg-line"
          aria-hidden
        />
      )}
      <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-brand-ink">
        <Icon className="size-4" />
      </span>
      <div className="pt-1">
        <p className="text-sm leading-snug text-ink">
          <span className="text-muted">{activity.label} </span>
          {property ? (
            <Link
              to={`/listings/${property.id}`}
              className="font-medium hover:text-brand-ink"
            >
              {property.title}
            </Link>
          ) : (
            "a listing"
          )}
        </p>
        <p className="mt-0.5 text-xs text-faint">{activity.at}</p>
      </div>
    </li>
  );
}
