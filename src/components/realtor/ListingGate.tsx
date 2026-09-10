import { Link } from "react-router";
import { ArrowRight, Circle, ScanFace, ShieldAlert, UserRound } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const IDENTITY = "a verified identity";

/**
 * Why this realtor cannot list a property yet. The missing items come from the server
 * (listingEligibility in profile.service.ts) and are rendered as sent, so the panel and
 * the 403 behind the composer can never disagree about the rule.
 *
 * Two CTAs rather than one, because the two halves are fixed in different places: the
 * profile fields on the Settings tab, the identity check on its own.
 */
export function ListingGate({
  missing,
  className,
}: {
  missing: string[];
  className?: string;
}) {
  const identity = missing.includes(IDENTITY);
  const fields = missing.filter((item) => item !== IDENTITY);

  return (
    <section
      className={cn(
        "rounded-2xl border border-dashed border-line bg-surface p-8 max-sm:p-6",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-surface-2 text-faint">
        <ShieldAlert className="size-6" aria-hidden />
      </span>

      <h2 className="display mt-5 text-2xl text-ink">Finish your setup before you list</h2>
      <p className="mt-2 max-w-lg leading-relaxed text-muted">
        A listing carries your name to the buyer, so INSPECTRA has to know who is behind
        it first. Here is what is still missing.
      </p>

      <ul className="mt-6 space-y-2.5">
        {missing.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm text-ink">
            <Circle className="size-3.5 shrink-0 text-faint" aria-hidden />
            <span className="first-letter:uppercase">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap gap-3">
        {fields.length > 0 && (
          <Link to="/realtor/account?tab=settings" className={buttonClasses("brand", "md")}>
            <UserRound className="size-4" aria-hidden />
            Complete your profile
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
        {identity && (
          <Link
            to="/realtor/account?tab=identity"
            className={buttonClasses(fields.length ? "outline" : "brand", "md")}
          >
            <ScanFace className="size-4" aria-hidden />
            Verify your identity
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </section>
  );
}
