import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Search, ArrowUpRight, SearchX } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Reveal } from "@/components/ui/Reveal";
import { CredentialCard } from "@/components/realtor/CredentialCard";
import { realtors } from "@/data/mock";
import { realtorMeta } from "@/lib/realtorMeta";
import { cn } from "@/lib/cn";

const INTRO_IMG =
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=80";

const CERTIFIED = realtors.filter((r) => r.certified);
const CITIES = Array.from(new Set(CERTIFIED.map((r) => r.city)));

export function Realtors() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState("active");
  const [openId, setOpenId] = useState<string | null>(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = CERTIFIED.filter((r) => {
      if (query && !`${r.name} ${r.agency} ${r.city}`.toLowerCase().includes(query)) return false;
      if (city !== "all" && r.city !== city) return false;
      return true;
    });
    if (sort === "verified") return [...list].sort((a, b) => b.verifiedListings - a.verifiedListings);
    if (sort === "newest") return [...list].sort((a, b) => realtorMeta(b).since - realtorMeta(a).since);
    return [...list].sort((a, b) => b.completedDeals - a.completedDeals);
  }, [q, city, sort]);

  const selectProps = (id: string) => ({
    open: openId === id,
    onOpenChange: (o: boolean) => setOpenId((prev) => (o ? id : prev === id ? null : prev)),
  });

  const reset = () => {
    setQ("");
    setCity("all");
    setSort("active");
  };

  return (
    <div>
      {/* intro — dark band with a realtor image; the header floats over it */}
      <section className="relative overflow-hidden bg-[#06121b] text-white">
        <img src={INTRO_IMG} alt="" className="absolute inset-0 size-full object-cover object-center" fetchPriority="high" />
        <div className="absolute inset-0 bg-[#06121b]/80" />
        <div className="absolute inset-0 bg-linear-to-t from-[#06121b] via-[#06121b]/70 to-[#06121b]/45" />

        <Container className="relative z-10 pb-14 pt-28 max-lg:pt-24 max-sm:pb-12">
          <div className="flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
            <div className="max-w-2xl">
              <p className="text-brand-gradient text-xs font-semibold uppercase tracking-[0.2em]">
                Certified realtors
              </p>
              <h1 className="display mt-4 text-5xl text-balance max-lg:text-4xl max-sm:text-3xl">
                Realtors you can actually vet
              </h1>
              <p className="mt-4 max-w-xl text-lg text-white/75 text-pretty max-sm:text-base">
                Every realtor here passed a proctored certification in title law, valuation and ethics — so
                the person guiding your biggest purchase has actually been tested.
              </p>
            </div>
            <Link
              to="/enablement"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              Get certified
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>

      {/* sticky filter toolbar */}
      <div className="sticky top-16 z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
        <Container>
          <div className="flex items-center gap-2.5 py-4 max-md:flex-col max-md:items-stretch">
            <div className="relative min-w-56 flex-1 max-md:w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
              <Input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or agency…"
                aria-label="Search realtors"
                className="h-10 pl-11"
              />
            </div>
            <div className="flex gap-2.5 max-md:grid max-md:grid-cols-2">
              <FilterSelect
                {...selectProps("city")}
                label="City"
                value={city}
                onChange={setCity}
                options={[{ value: "all", label: "All cities" }, ...CITIES.map((c) => ({ value: c, label: c }))]}
              />
              <FilterSelect
                {...selectProps("sort")}
                label="Sort realtors"
                value={sort}
                onChange={setSort}
                options={[
                  { value: "active", label: "Most active" },
                  { value: "verified", label: "Most verified" },
                  { value: "newest", label: "Newest" },
                ]}
              />
            </div>
          </div>
        </Container>
      </div>

      {/* the list */}
      <section className="py-12 max-sm:py-10">
        <Container>
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{results.length}</span>{" "}
            {results.length === 1 ? "certified realtor" : "certified realtors"}
          </p>

          {results.length > 0 ? (
            <div className="mt-6 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {results.map((r, i) => (
                <Reveal key={r.id} delay={(i % 3) * 0.07}>
                  <CredentialCard realtor={r} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-line bg-surface px-8 py-16 text-center">
              <SearchX className="mx-auto size-8 text-faint" aria-hidden />
              <h3 className="display mt-4 text-2xl text-ink">No realtors match that</h3>
              <p className="mt-2 text-muted text-pretty">
                Try another city, or clear the search — we're certifying new realtors every month.
              </p>
              <button type="button" onClick={reset} className={cn(buttonClasses("primary", "md"), "mt-6")}>
                Clear filters
              </button>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  open,
  onOpenChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange} open={open} onOpenChange={onOpenChange}>
      <SelectTrigger aria-label={label} className="h-10 w-full min-w-36 max-md:min-w-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
