import { useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { Heart, X, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import { savedPropertyIds } from "@/data/seeker";
import { propertyById } from "@/data/mock";

export function Saved() {
  // Dashboard-only mock: seeded from mock data, held locally so Remove empties it live.
  const [ids, setIds] = useState<string[]>(savedPropertyIds);
  const items = ids.map(propertyById).filter((p) => p != null);

  const remove = (id: string) => {
    setIds((prev) => prev.filter((x) => x !== id));
    toast.info("Removed from saved");
  };

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader
          title="Saved homes"
          subtitle={
            items.length
              ? `${items.length} home${items.length === 1 ? "" : "s"} you're keeping an eye on`
              : "Your shortlist lives here"
          }
        />
      </Reveal>

      {items.length ? (
        <Reveal
          className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1"
          y={16}
        >
          {items.map((p) => (
            <div key={p.id} className="relative">
              <PropertyCard property={p} />
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label={`Remove ${p.title} from saved`}
                className="absolute right-3 top-3 z-20 grid size-8 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm ring-1 ring-black/5 transition-colors hover:text-rose-500"
              >
                <X className="size-4" strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </Reveal>
      ) : (
        <Reveal y={16}>
          <EmptyState
            icon={Heart}
            title="No saved homes yet"
            message="Tap the heart on any listing to keep it here and compare at your own pace."
            action={
              <Link to="/listings" className={buttonClasses("brand", "md")}>
                <Search className="size-4" aria-hidden />
                Browse listings
              </Link>
            }
          />
        </Reveal>
      )}
    </div>
  );
}
