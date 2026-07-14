import { toast } from "react-toastify";
import { Phone } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

/** Compact buyer card for realtor detail-page asides. Avatar falls back to initials. */
export function BuyerSummary({
  name,
  avatar,
  subtitle = "Prospective buyer",
}: {
  name: string;
  avatar?: string;
  subtitle?: string;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-faint">The buyer</p>
      <div className="mt-2.5 flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="size-11 shrink-0 rounded-full object-cover ring-1 ring-line"
          />
        ) : (
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-brand-ink">
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{name}</p>
          <p className="truncate text-sm text-muted">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => toast.info("Buyer contact is coming soon.")}
        className={buttonClasses("outline", "sm", "mt-4 w-full")}
      >
        <Phone className="size-4" aria-hidden />
        Contact buyer
      </button>
    </div>
  );
}
