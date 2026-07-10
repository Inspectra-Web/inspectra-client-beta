import { Check, Minus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import {
  COMPARE_GROUPS,
  TIERS,
  type CompareValue,
  type CompareRow,
} from "@/data/pricing";

function CellValue({ value }: { value: CompareValue }) {
  if (value === true) {
    return (
      <span className="mx-auto grid size-5 place-items-center rounded-full bg-verified/15">
        <Check className="size-3 text-verified" strokeWidth={3.5} aria-hidden />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus className="mx-auto size-4 text-faint" aria-hidden />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-[0.9rem] text-ink/85">{value}</span>;
}

export function PricingCompare() {
  return (
    <section id="compare" className="scroll-mt-20 py-28 max-lg:py-20 max-sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Compare plans"
          title="Every feature, side by side"
          intro="The full breakdown of what each plan includes, so you can pick the one that fits how you list today and upgrade the moment you outgrow it."
        />

        {/* desktop table */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-line max-md:hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-surface">
                <th className="w-2/5 px-6 py-5 align-bottom" scope="col">
                  <span className="credential-meta text-[0.62rem] text-faint">
                    Features
                  </span>
                </th>
                {TIERS.map((tier) => (
                  <th key={tier.id} scope="col" className="px-4 py-5 text-center align-bottom">
                    <span
                      className={cn(
                        "display text-lg",
                        tier.highlighted && "text-brand-ink",
                      )}
                    >
                      {tier.name}
                    </span>
                    {tier.highlighted && (
                      <span className="mt-1 block text-[0.62rem] font-semibold uppercase tracking-wide text-brand-ink/70">
                        Most popular
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_GROUPS.map((group) => (
                <GroupRows key={group.group} group={group.group} rows={group.rows} />
              ))}
            </tbody>
          </table>
        </div>

        {/* mobile: one card per tier */}
        <div className="mt-12 hidden gap-5 max-md:grid">
          {TIERS.map((tier) => {
            const key = tier.id;
            return (
              <div
                key={tier.id}
                className={cn(
                  "rounded-2xl border bg-surface p-6",
                  tier.highlighted ? "border-brand/50 ring-1 ring-brand/20" : "border-line",
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="display text-xl">{tier.name}</h3>
                  {tier.highlighted && (
                    <span className="rounded-full bg-brand/12 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-brand-ink">
                      Most popular
                    </span>
                  )}
                </div>
                <dl className="mt-4 divide-y divide-line">
                  {COMPARE_GROUPS.flatMap((g) => g.rows).map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-[0.9rem] text-muted">{row.label}</dt>
                      <dd className="shrink-0 text-right">
                        <CellValue value={row[key]} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function GroupRows({ group, rows }: { group: string; rows: CompareRow[] }) {
  return (
    <>
      <tr className="bg-surface-2/40">
        <th
          scope="colgroup"
          colSpan={4}
          className="px-6 py-3 text-left"
        >
          <span className="credential-meta text-[0.62rem] text-brand-ink">{group}</span>
        </th>
      </tr>
      {rows.map((row) => (
        <tr key={row.label} className="border-t border-line">
          <th scope="row" className="px-6 py-4 text-left text-[0.95rem] font-medium text-ink">
            {row.label}
          </th>
          <td className="px-4 py-4 text-center">
            <CellValue value={row.starter} />
          </td>
          <td className="px-4 py-4 text-center">
            <CellValue value={row.professional} />
          </td>
          <td className="px-4 py-4 text-center">
            <CellValue value={row.agency} />
          </td>
        </tr>
      ))}
    </>
  );
}
