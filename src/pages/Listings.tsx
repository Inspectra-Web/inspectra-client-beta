import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Search,
  X,
  SearchX,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button, buttonClasses } from "@/components/ui/Button";
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
import type { VerificationStatus } from "@/types";
import { LISTING_INTENT_LABEL } from "@/lib/listing";
import { apiMessage } from "@/lib/api";
import { typeLabel } from "@/lib/properties";
import {
  usePublicListings,
  toCardListing,
  EMPTY_QUERY,
  type MarketplaceQuery,
} from "@/lib/marketplace";
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

const FOR_OPTIONS = [
  { value: "all", label: "Any offer type" },
  { value: "sale", label: "For sale" },
  { value: "rent", label: "For rent" },
  { value: "lease", label: "For lease" },
  { value: "shortlet", label: "Shortlet" },
];

const BEDS_OPTIONS = [
  { value: "0", label: "Any beds" },
  { value: "1", label: "1+ beds" },
  { value: "2", label: "2+ beds" },
  { value: "3", label: "3+ beds" },
  { value: "4", label: "4+ beds" },
  { value: "5", label: "5+ beds" },
];

/* Buckets the reader thinks in, sent to the API as minPrice / maxPrice. An open
   top end omits maxPrice rather than sending a number that would ever expire. */
const PRICE_RANGES: { value: string; label: string; min?: number; max?: number }[] = [
  { value: "all", label: "Any price" },
  { value: "u10", label: "Under ₦10M", max: 10_000_000 },
  { value: "10-50", label: "₦10M – ₦50M", min: 10_000_000, max: 50_000_000 },
  { value: "50-150", label: "₦50M – ₦150M", min: 50_000_000, max: 150_000_000 },
  { value: "150-500", label: "₦150M – ₦500M", min: 150_000_000, max: 500_000_000 },
  { value: "500", label: "₦500M+", min: 500_000_000 },
];

/* "Recommended" is verified-first, not paid placement: there is no featured tier. */
const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "price-asc", label: "Price: low to high" },
];

export function Listings() {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState("");
  const [price, setPrice] = useState("all");
  const [query, setQuery] = useState<MarketplaceQuery>(EMPTY_QUERY);
  const [open, setOpen] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  // The server does the searching, so hold off a beat rather than firing a request
  // per keystroke. Any new search starts again at page 1.
  useEffect(() => {
    const timer = setTimeout(
      () =>
        setQuery((prev) =>
          prev.q === typed.trim() ? prev : { ...prev, q: typed.trim(), page: 1 },
        ),
      300,
    );
    return () => clearTimeout(timer);
  }, [typed]);

  const { data, isPending, isError, error, isPlaceholderData } = usePublicListings(query);

  const listings = data?.listings ?? [];
  const counts = data?.counts ?? { all: 0, verified: 0, pending: 0, disputed: 0 };
  const cities = data?.cities ?? [];
  const types = data?.types ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;

  /** Every filter change lands the reader back on the first page. */
  const set = (patch: Partial<MarketplaceQuery>) =>
    setQuery((prev) => ({ ...prev, ...patch, page: 1 }));

  const setPriceRange = (value: string) => {
    const range = PRICE_RANGES.find((r) => r.value === value);
    setPrice(value);
    set({ minPrice: range?.min, maxPrice: range?.max });
  };

  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (query.q)
    chips.push({
      key: "q",
      label: `“${query.q}”`,
      clear: () => {
        setTyped("");
        set({ q: "" });
      },
    });
  if (query.status !== "all")
    chips.push({
      key: "status",
      label: STATUS_LABEL[query.status],
      clear: () => set({ status: "all" }),
    });
  if (query.type !== "all")
    chips.push({
      key: "type",
      label: typeLabel(query.type),
      clear: () => set({ type: "all" }),
    });
  if (query.city !== "all")
    chips.push({ key: "city", label: query.city, clear: () => set({ city: "all" }) });
  if (query.listingStatus !== "all")
    chips.push({
      key: "for",
      label: LISTING_INTENT_LABEL[query.listingStatus],
      clear: () => set({ listingStatus: "all" }),
    });
  if (query.beds > 0)
    chips.push({
      key: "beds",
      label: `${query.beds}+ beds`,
      clear: () => set({ beds: 0 }),
    });
  if (price !== "all")
    chips.push({
      key: "price",
      label: PRICE_RANGES.find((r) => r.value === price)!.label,
      clear: () => setPriceRange("all"),
    });

  const reset = () => {
    setTyped("");
    setPrice("all");
    setQuery(EMPTY_QUERY);
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
        {/* top scrim so the floating (transparent) header's nav stays legible */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-[#06121b]/70 to-transparent" />

        <Container className="relative z-10 pb-16 pt-28 max-lg:pb-14 max-lg:pt-24 max-sm:pb-12">
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
              <span className="font-semibold text-ink">{total}</span>{" "}
              {total === 1 ? "home" : "homes"}
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
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        placeholder="Search by area, city or listing ref…"
                        aria-label="Search listings"
                        className="h-10 pl-11"
                      />
                    </div>

                    <div
                      role="group"
                      aria-label="Filter by verification status"
                      className="no-scrollbar inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface p-1 max-sm:w-full max-sm:overflow-x-auto"
                    >
                      {SEGMENTS.map((s) => {
                        const active = query.status === s.key;
                        return (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => set({ status: s.key })}
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
                      value={query.type}
                      onChange={(type) => set({ type })}
                      options={[
                        { value: "all", label: "All types" },
                        ...types.map((t) => ({ value: t, label: typeLabel(t) })),
                      ]}
                      triggerClassName="min-w-36 flex-1"
                    />
                    <FilterSelect
                      {...selectProps("city")}
                      label="City"
                      value={query.city}
                      onChange={(city) => set({ city })}
                      options={[
                        { value: "all", label: "All cities" },
                        ...cities.map((c) => ({ value: c, label: c })),
                      ]}
                      triggerClassName="min-w-36 flex-1"
                    />
                    <FilterSelect
                      {...selectProps("for")}
                      label="Sale or rent"
                      value={query.listingStatus}
                      onChange={(v) =>
                        set({ listingStatus: v as MarketplaceQuery["listingStatus"] })
                      }
                      options={FOR_OPTIONS}
                      triggerClassName="min-w-36 flex-1"
                    />
                    <FilterSelect
                      {...selectProps("beds")}
                      label="Bedrooms"
                      value={String(query.beds)}
                      onChange={(v) => set({ beds: Number(v) })}
                      options={BEDS_OPTIONS}
                      triggerClassName="min-w-36 flex-1"
                    />
                    <FilterSelect
                      {...selectProps("price")}
                      label="Price range"
                      value={price}
                      onChange={setPriceRange}
                      options={PRICE_RANGES}
                      triggerClassName="min-w-36 flex-1"
                    />

                    <div className="flex shrink-0 items-center gap-2 max-sm:w-full">
                      <span className="text-sm text-muted max-sm:hidden">Sort</span>
                      <FilterSelect
                        {...selectProps("sort")}
                        label="Sort listings"
                        value={query.sort}
                        onChange={(v) => set({ sort: v as MarketplaceQuery["sort"] })}
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
          {isError ? (
            <Notice
              title="Could not load listings"
              body={apiMessage(error, "Something went wrong fetching the marketplace.")}
              action={
                <button
                  type="button"
                  onClick={reset}
                  className={cn(buttonClasses("primary", "md"), "mt-6")}
                >
                  Try again
                </button>
              }
            />
          ) : isPending ? (
            <GridSkeleton />
          ) : listings.length > 0 ? (
            <>
              <div
                className={cn(
                  "grid grid-cols-3 gap-x-6 gap-y-10 transition-opacity max-lg:grid-cols-2 max-sm:grid-cols-1",
                  isPlaceholderData && "opacity-60",
                )}
              >
                {listings.map((listing, i) => (
                  <Reveal key={listing.id} delay={(i % 3) * 0.08}>
                    <PropertyCard listing={toCardListing(listing)} />
                  </Reveal>
                ))}
              </div>

              {pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))}
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                    Previous
                  </Button>
                  <span className="text-sm tabular-nums text-muted">
                    Page {page} of {pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pages}
                    onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                    <ChevronRight className="size-4" aria-hidden />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Notice
              title={
                chips.length > 0 ? "No homes match these filters" : "No listings yet"
              }
              body={
                chips.length > 0
                  ? "Try widening the price range or clearing the verification filter. New listings are checked and added every week."
                  : "The first verified homes are on their way. Check back shortly."
              }
              action={
                chips.length > 0 ? (
                  <Button onClick={reset} className="mt-6">
                    Clear all filters
                  </Button>
                ) : undefined
              }
            />
          )}
        </Container>
      </section>
    </>
  );
}

function Notice({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface px-8 py-16 text-center">
      <SearchX className="mx-auto size-8 text-faint" aria-hidden />
      <h2 className="display mt-4 text-2xl text-ink">{title}</h2>
      <p className="mt-2 text-muted text-pretty">{body}</p>
      {action}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-x-6 gap-y-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i}>
          <div className="aspect-[10/9] animate-pulse rounded-2xl bg-surface-2" />
          <div className="space-y-2 pt-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-2/5 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
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
