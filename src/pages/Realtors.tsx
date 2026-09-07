import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Search, ArrowUpRight, SearchX, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Reveal } from "@/components/ui/Reveal";
import { CredentialCard } from "@/components/realtor/CredentialCard";
import { apiMessage } from "@/lib/api";
import { usePublicRealtors, type PublicRealtorQuery } from "@/lib/realtors";
import { cn } from "@/lib/cn";

const INTRO_IMG =
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=80";

const EMPTY: PublicRealtorQuery = { q: "", city: "all", sort: "recommended", page: 1 };

export function Realtors() {
  const [typed, setTyped] = useState("");
  const [query, setQuery] = useState<PublicRealtorQuery>(EMPTY);
  const [openId, setOpenId] = useState<string | null>(null);

  // The server does the searching, so hold off a beat rather than firing a
  // request per keystroke. Any new search starts again at page 1.
  useEffect(() => {
    const timer = setTimeout(
      () => setQuery((prev) => (prev.q === typed.trim() ? prev : { ...prev, q: typed.trim(), page: 1 })),
      300,
    );
    return () => clearTimeout(timer);
  }, [typed]);

  const { data, isPending, isError, error, isPlaceholderData } = usePublicRealtors(query);

  const results = data?.realtors ?? [];
  const cities = data?.cities ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? query.page;
  const pages = data?.pages ?? 1;

  const selectProps = (id: string) => ({
    open: openId === id,
    onOpenChange: (o: boolean) => setOpenId((prev) => (o ? id : prev === id ? null : prev)),
  });

  const reset = () => {
    setTyped("");
    setQuery(EMPTY);
  };

  return (
    <div>
      {/* intro — dark band with a realtor image; the header floats over it */}
      <section className="relative overflow-hidden bg-deep dark:bg-[#06121b] text-white">
        <img
          src={INTRO_IMG}
          alt=""
          className="absolute inset-0 size-full object-cover object-center"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-deep/66 dark:bg-[#06121b]/82" />
        <div className="absolute inset-0 bg-linear-to-t from-[#06121b] via-[#06121b]/70 to-[#06121b]/45" />

        <Container className="relative z-10 pb-14 pt-28 max-lg:pt-24 max-sm:pb-12">
          <div className="flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
            <div className="max-w-2xl">
              <p className="text-brand-gradient text-xs font-semibold uppercase tracking-[0.2em]">
                Verified realtors
              </p>
              <h1 className="display mt-4 text-5xl text-balance max-lg:text-4xl max-sm:text-3xl">
                Realtors you can actually verify
              </h1>
              <p className="mt-4 max-w-xl text-lg text-white/75 text-pretty max-sm:text-base">
                Every profile here belongs to a real, named professional. Find the one who
                knows your area, then reach out knowing exactly who is on the other end.
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
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint"
                aria-hidden
              />
              <Input
                type="search"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Search by name, agency or area…"
                aria-label="Search realtors"
                className="h-10 pl-11"
              />
            </div>
            <div className="flex gap-2.5 max-md:grid max-md:grid-cols-2">
              <FilterSelect
                {...selectProps("city")}
                label="City"
                value={query.city}
                onChange={(city) => setQuery((prev) => ({ ...prev, city, page: 1 }))}
                options={[
                  { value: "all", label: "All cities" },
                  ...cities.map((c) => ({ value: c, label: c })),
                ]}
              />
              <FilterSelect
                {...selectProps("sort")}
                label="Sort realtors"
                value={query.sort}
                onChange={(sort) =>
                  setQuery((prev) => ({ ...prev, sort: sort as PublicRealtorQuery["sort"], page: 1 }))
                }
                options={[
                  { value: "recommended", label: "Recommended" },
                  { value: "newest", label: "Newest" },
                  { value: "name", label: "Name (A–Z)" },
                ]}
              />
            </div>
          </div>
        </Container>
      </div>

      {/* the list */}
      <section className="py-12 max-sm:py-10">
        <Container>
          {isError ? (
            <Notice
              title="Could not load realtors"
              body={apiMessage(error, "Something went wrong fetching the directory.")}
              action={
                <button type="button" onClick={reset} className={cn(buttonClasses("primary", "md"), "mt-6")}>
                  Try again
                </button>
              }
            />
          ) : isPending ? (
            <CardsSkeleton />
          ) : (
            <>
              <p className="text-sm text-muted">
                <span className="font-semibold text-ink">{total}</span>{" "}
                {total === 1 ? "verified realtor" : "verified realtors"}
              </p>

              {results.length > 0 ? (
                <div
                  className={cn(
                    "mt-6 grid grid-cols-3 gap-6 transition-opacity max-lg:grid-cols-2 max-sm:grid-cols-1",
                    isPlaceholderData && "opacity-60",
                  )}
                >
                  {results.map((r, i) => (
                    <Reveal key={r.id} delay={(i % 3) * 0.07}>
                      <CredentialCard realtor={r} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <Notice
                  title="No realtors match that"
                  body="Try another city, or clear the search — we're verifying new realtors every month."
                  action={
                    <button type="button" onClick={reset} className={cn(buttonClasses("primary", "md"), "mt-6")}>
                      Clear filters
                    </button>
                  }
                />
              )}

              {pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
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
          )}
        </Container>
      </section>
    </div>
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
    <div className="mx-auto mt-6 max-w-md rounded-2xl border border-line bg-surface px-8 py-16 text-center">
      <SearchX className="mx-auto size-8 text-faint" aria-hidden />
      <h3 className="display mt-4 text-2xl text-ink">{title}</h3>
      <p className="mt-2 text-muted text-pretty">{body}</p>
      {action}
    </div>
  );
}

function CardsSkeleton() {
  return (
    <>
      <div className="h-5 w-32 animate-pulse rounded bg-surface-2" />
      <div className="mt-6 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-line bg-surface">
            <div className="aspect-4/5 animate-pulse bg-surface-2" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
              <div className="h-8 w-full animate-pulse rounded-full bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </>
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
    <Select
      value={value}
      onValueChange={onChange}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger
        aria-label={label}
        className="h-10 w-full min-w-36 max-md:min-w-0"
      >
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
