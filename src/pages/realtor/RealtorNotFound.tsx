import { Link } from "react-router";
import { Compass, ArrowLeft } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

/** In-shell 404 for unknown /realtor/* paths (keeps the dashboard chrome). */
export function RealtorNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
        <Compass className="size-7" />
      </span>
      <h1 className="display mt-5 text-3xl text-ink">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted">
        That dashboard page doesn't exist. Let's get you back on track.
      </p>
      <Link to="/realtor" className={buttonClasses("brand", "md", "mt-7")}>
        <ArrowLeft className="size-4" aria-hidden />
        Back to overview
      </Link>
    </div>
  );
}
