import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, X, SearchX, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import { properties } from "@/data/mock";
import type { VerificationStatus } from "@/types";
import { cn } from "@/lib/cn";

const INTRO_IMAGE =
  "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=2000&q=80";

type StatusFilter = "all" | VerificationStatus;

/* Verification is the primary browsing axis — the active pill takes the status
   colour, and each segment carries a live count of the matching listings. */
const SEGMENTS: { key: StatusFilter; label: string; activeCls: string }[] = [
  { key: "all", label: "All", activeCls: "bg-ink text-bg" },
  { key: "verified", label: "Verified", activeCls: "bg-verified text-white" },
  { key: "pending", label: "Pending", activeCls: "bg-gold text-white" },
  { key: "disputed", label: "Disputed", activeCls: "bg-rose-500 text-white" },
];

const STATUS_LABEL: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  disputed: "Disputed",
};

const TYPES = ["Apartment", "Duplex", "Terrace", "Bungalow", "Penthouse", "Land"];
const CITIES = Array.from(new Set(properties.map((p) => p.city)));

const FOR_OPTIONS = [
  { value: "all", label: "For sale or rent" },
  { value: "sale", label: "For sale" },
  { value: "rent", label: "For rent" },
];

const BEDS_OPTIONS = [
  { value: "all", label: "Any beds" },
  { value: "1", label: "1+ beds" },
  { value: "2", label: "2+ beds" },
  { value: "3", label: "3+ beds" },
  { value: "4", label: "4+ beds" },
  { value: "5", label: "5+ beds" },
];

const PRICE_RANGES = [
  { value: "all", label: "Any price", min: 0, max: Infinity },
  { value: "u10", label: "Under ₦10M", min: 0, max: 10_000_000 },
  { value: "10-50", label: "₦10M – ₦50M", min: 10_000_000, max: 50_000_000 },
  { value: "50-150", label: "₦50M – ₦150M", min: 50_000_000, max: 150_000_000 },
  { value: "150-500", label: "₦150M – ₦500M", min: 150_000_000, max: 500_000_000 },
  { value: "500", label: "₦500M+", min: 500_000_000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "price-asc", label: "Price: low to high" },
];

export function Listings() {
  const reduced = useReducedMotion();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [type, setType] = useState("all");
  const [city, setCity] = useState("all");
  const [listingFor, setListingFor] = useState("all");
  const [beds, setBeds] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("featured");
  const [open, setOpen] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  /* Everything except the verification segment — so the segment counts stay
     honest as the other filters and the search narrow the set. */
  const base = useMemo(() => {
    const query = q.trim().toLowerCase();
    const range = PRICE_RANGES.find((r) => r.value === price)!;
    const minBeds = beds === "all" ? 0 : Number(beds);
    return properties.filter((p) => {
      if (query && !`${p.title} ${p.location} ${p.city} ${p.ref}`.toLowerCase().includes(query))
        return false;
      if (type !== "all" && p.type !== type) return false;
      if (city !== "all" && p.city !== city) return false;
      if (listingFor !== "all" && p.listingFor !== listingFor) return false;
      if (minBeds && (p.beds == null || p.beds < minBeds)) return false;
      if (p.price < range.min || p.price >= range.max) return false;
      return true;
    });
  }, [q, type, city, listingFor, beds, price]);

  const counts = useMemo(
    () => ({
      all: base.length,
      verified: base.filter((p) => p.status === "verified").length,
      pending: base.filter((p) => p.status === "pending").length,
      disputed: base.filter((p) => p.status === "disputed").length,
    }),
    [base],
  );

  const results = useMemo(() => {
    const list = status === "all" ? base : base.filter((p) => p.status === status);
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [base, status, sort]);

  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (q.trim()) chips.push({ key: "q", label: `“${q.trim()}”`, clear: () => setQ("") });
  if (status !== "all")
    chips.push({ key: "status", label: STATUS_LABEL[status], clear: () => setStatus("all") });
  if (type !== "all") chips.push({ key: "type", label: type, clear: () => setType("all") });
  if (city !== "all") chips.push({ key: "city", label: city, clear: () => setCity("all") });
  if (listingFor !== "all")
    chips.push({
      key: "for",
      label: listingFor === "sale" ? "For sale" : "For rent",
      clear: () => setListingFor("all"),
    });
  if (beds !== "all") chips.push({ key: "beds", label: `${beds}+ beds`, clear: () => setBeds("all") });
  if (price !== "all")
    chips.push({
      key: "price",
      label: PRICE_RANGES.find((r) => r.value === price)!.label,
      clear: () => setPrice("all"),
    });

  const reset = () => {
    setQ("");
    setStatus("all");
    setType("all");
    setCity("all");
    setListingFor("all");
    setBeds("all");
    setPrice("all");
    setSort("featured");
  };

  // Only one filter dropdown open at a time — opening one closes the others; a
  // dropdown's own close event only clears state if it's still the active one,
  // so it can't clobber a sibling that was opened in the same click.
  const selectProps = (id: string) => ({
    open: openId === id,
    onOpenChange: (o: boolean) => setOpenId((prev) => (o ? id : prev === id ? null : prev)),
  });

  return (
    <>
      {/* Intro band — architectural photograph under the hero's dark treatment. */}
      <section className="relative overflow-hidden bg-deep text-white dark:bg-[#06121b]">
        <img
          src={INTRO_IMAGE}
          alt=""
          className="absolute inset-0 size-full object-cover"
          fetchPriority="high"
        />
        {/* Brand-navy scrim, lighter in light mode so the band reads as a designed
            photographic banner rather than a stark black block on warm paper. */}
        <div className="absolute inset-0 bg-deep/66 dark:bg-[#06121b]/82" />
        <div className="absolute inset-0 bg-linear-to-t from-deep/70 via-transparent to-transparent dark:from-[#06121b] dark:via-[#06121b]/60 dark:to-[#06121b]/40" />

        <Container className="relative z-10 py-20 max-lg:py-16 max-sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Browse listings
          </p>
          <h1 className="display mt-4 max-w-2xl text-5xl text-balance max-lg:text-4xl max-sm:text-3xl">
            Homes you can actually trust
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80 text-pretty max-sm:text-base">
            Every INSPECTRA listing shows exactly where its paperwork stands — title, survey and
            consent — before you ever place a call.
          </p>
        </Container>
      </section>

      {/* Sticky toolbar — collapsible so the grid can take the full stage. */}
      <div className="sticky top-16 z-30 border-b border-line bg-bg/90 backdrop-blur-xl">
        <Container>
          {/* Always-visible bar: toggle + result count + active filters. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              <SlidersHorizontal className="size-4 text-muted" aria-hidden />
              {open ? "Hide filters" : "Filters"}
              {chips.length > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-semibold text-[#04121f]">
                  {chips.length}
                </span>
              )}
              <ChevronDown
                className={cn("size-4 text-faint transition-transform", open && "rotate-180")}
                aria-hidden
              />
            </button>

            <span className="h-5 w-px bg-line max-sm:hidden" aria-hidden />

            <p className="text-sm text-muted">
              <span className="font-semibold text-ink">{results.length}</span>{" "}
              {results.length === 1 ? "home" : "homes"}
            </p>

            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={c.clear}
                aria-label={`Remove ${c.label} filter`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink transition-colors hover:border-ink/30 max-sm:hidden"
              >
                {c.label}
                <X className="size-3.5 text-faint transition-colors group-hover:text-ink" aria-hidden />
              </button>
            ))}
            {chips.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="text-sm font-medium text-brand-ink hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Collapsible panel: verification segments + filter controls. */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="panel"
                initial={reduced ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="-mx-1 -mt-1 overflow-hidden px-1 pt-1"
              >
                <div className="flex flex-col gap-3 pb-4">
                  {/* search + verification segments share the top row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-64 flex-1">
                      <Search
                        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint"
                        aria-hidden
                      />
                      <Input
                        type="search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by area, city or listing ref…"
                        aria-label="Search listings"
                        className="h-10 pl-11"
                      />
                    </div>

                    <div
                      role="group"
                      aria-label="Filter by verification status"
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface p-1 max-sm:w-full max-sm:overflow-x-auto"
                    >
                      {SEGMENTS.map((s) => {
                        const active = status === s.key;
                        return (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => setStatus(s.key)}
                            aria-pressed={active}
                            className={cn(
                              "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors",
                              active ? s.activeCls : "text-muted hover:text-ink",
                            )}
                          >
                            {s.label}
                            <span
                              className={cn(
                                "rounded-full px-1.5 text-xs tabular-nums",
                                active ? "bg-white/20" : "bg-surface-2 text-faint",
                              )}
                            >
                              {counts[s.key]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* filter controls grow to fill the width; sort sits at the end */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <FilterSelect
                      {...selectProps("type")}
                      label="Property type"
                      value={type}
                      onChange={setType}
                      options={[
                        { value: "all", label: "All types" },
                        ...TYPES.map((t) => ({ value: t, label: t })),
                      ]}
                      triggerClassName="min-w-36 flex-1"
                    />
                    <FilterSelect
                      {...selectProps("city")}
                      label="City"
                      value={city}
                      onChange={setCity}
                      options={[
                        { value: "all", label: "All cities" },
                        ...CITIES.map((c) => ({ value: c, label: c })),
                      ]}
                      triggerClassName="min-w-36 flex-1"
                    />
                    <FilterSelect
                      {...selectProps("for")}
                      label="Sale or rent"
                      value={listingFor}
                      onChange={setListingFor}
                      options={FOR_OPTIONS}
                      triggerClassName="min-w-36 flex-1"
                    />
                    <FilterSelect
                      {...selectProps("beds")}
                      label="Bedrooms"
                      value={beds}
                      onChange={setBeds}
                      options={BEDS_OPTIONS}
                      triggerClassName="min-w-36 flex-1"
                    />
                    <FilterSelect
                      {...selectProps("price")}
                      label="Price range"
                      value={price}
                      onChange={setPrice}
                      options={PRICE_RANGES}
                      triggerClassName="min-w-36 flex-1"
                    />

                    <div className="flex shrink-0 items-center gap-2 max-sm:w-full">
                      <span className="text-sm text-muted max-sm:hidden">Sort</span>
                      <FilterSelect
                        {...selectProps("sort")}
                        label="Sort listings"
                        value={sort}
                        onChange={setSort}
                        options={SORT_OPTIONS}
                        triggerClassName="w-40 max-sm:flex-1"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </div>

      {/* Results */}
      <section className="py-12 max-sm:py-10">
        <Container>
          {results.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-6 gap-y-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {results.map((property, i) => (
                <Reveal key={property.id} delay={(i % 3) * 0.08}>
                  <PropertyCard property={property} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface px-8 py-16 text-center">
              <SearchX className="mx-auto size-8 text-faint" aria-hidden />
              <h2 className="display mt-4 text-2xl text-ink">No homes match these filters</h2>
              <p className="mt-2 text-muted text-pretty">
                Try widening the price range or clearing the verification filter. New listings are
                checked and added every week.
              </p>
              <Button onClick={reset} className="mt-6">
                Clear all filters
              </Button>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

/* Thin wrapper over the shadcn Select for the filter row — sizes to content. */
function FilterSelect({
  label,
  value,
  onChange,
  options,
  triggerClassName,
  open,
  onOpenChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  triggerClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange} open={open} onOpenChange={onOpenChange}>
      <SelectTrigger aria-label={label} className={triggerClassName ?? "w-auto"}>
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
