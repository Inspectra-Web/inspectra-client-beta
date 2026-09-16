// Single source of truth for the realtor subscription plans. Consumed by the PricingTiers
// cards, the PricingCompare table and the realtor console's Subscription page, so none of
// the three can drift. Payments are mock/marketing only in this phase.
//
// Every price derives from the tier's monthly rate: a cadence bills its months up front and
// takes a discount off that total, so the quarterly and annual columns cannot disagree with
// the monthly one. Refreshes are an ACCOUNT allowance, not a per-listing one, and they move a
// listing in the recency sort only: placement itself stays trust-ranked and unbuyable.

export type BillingCadence = "monthly" | "quarterly" | "annual";

export type TierId = "starter" | "professional" | "business" | "elite";

export const CADENCES: BillingCadence[] = ["monthly", "quarterly", "annual"];

/** Months billed up front per cadence. */
export const CADENCE_MONTHS: Record<BillingCadence, number> = {
  monthly: 1,
  quarterly: 3,
  annual: 12,
};

/** Discount taken off the undiscounted multi-month total. */
export const CADENCE_DISCOUNT: Record<BillingCadence, number> = {
  monthly: 0,
  quarterly: 0.1,
  annual: 0.2,
};

/** What one charge covers, for the price suffix: "₦67,500 /quarter". */
export const CADENCE_PER: Record<BillingCadence, string> = {
  monthly: "/month",
  quarterly: "/quarter",
  annual: "/year",
};

export const CADENCE_ADVERB: Record<BillingCadence, string> = {
  monthly: "monthly",
  quarterly: "quarterly",
  annual: "annually",
};

export type Tier = {
  id: TierId;
  name: string;
  tagline: string;
  /** Naira per month at monthly cadence. 0 means free. */
  monthly: number;
  /** Active listings the plan allows. */
  listings: number;
  /** Account-level listing refreshes per month. 0 means the plan has none. */
  refreshes: number;
  highlighted: boolean;
  ctaLabel: string;
  /** Concise feature list for the tier card check-rows. */
  features: string[];
};

export const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Build a verified profile and a track record buyers can check.",
    monthly: 0,
    listings: 3,
    refreshes: 0,
    highlighted: false,
    ctaLabel: "Start free",
    features: [
      "3 verified listings",
      "Verified public profile you can share anywhere",
      "Trust-ranked placement in buyer search",
      "See when a lead arrives, upgrade to reply",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "For the working realtor who lists often and wants to answer every buyer.",
    monthly: 15_000,
    listings: 30,
    refreshes: 2,
    highlighted: true,
    ctaLabel: "Choose Professional",
    features: [
      "30 verified listings",
      "Full lead inbox: reply, and see buyer contact details",
      "Listing refresh every 2 weeks",
      "Priority document review, so listings go live sooner",
      "Listing analytics: views and inquiries",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "For the realtor running a steady pipeline across several neighbourhoods.",
    monthly: 35_000,
    listings: 60,
    refreshes: 4,
    highlighted: false,
    ctaLabel: "Choose Business",
    features: [
      "60 verified listings",
      "Weekly listing refresh",
      "Top-priority document review",
      "Analytics with conversion by listing",
      "Everything in Professional",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "For the high-volume realtor whose listings are the whole business.",
    monthly: 60_000,
    listings: 100,
    refreshes: 8,
    highlighted: false,
    ctaLabel: "Go Elite",
    features: [
      "100 verified listings",
      "Listing refresh twice a week",
      "Advanced analytics with export",
      "Priority support",
      "Everything in Business",
    ],
  },
];

/** What one charge costs at a cadence: the months up front, less that cadence's discount. */
export function tierPrice(tier: Tier, cadence: BillingCadence): number {
  const full = tier.monthly * CADENCE_MONTHS[cadence];
  return full - full * CADENCE_DISCOUNT[cadence];
}

/** Naira saved against paying the same span monthly. 0 for the monthly cadence itself. */
export function cadenceSavings(tier: Tier, cadence: BillingCadence): number {
  return tier.monthly * CADENCE_MONTHS[cadence] - tierPrice(tier, cadence);
}

/** The effective monthly rate a cadence works out to, for the "works out at" line. */
export function tierMonthlyRate(tier: Tier, cadence: BillingCadence): number {
  return tierPrice(tier, cadence) / CADENCE_MONTHS[cadence];
}

/** "Save 20%" for the cadence toggle. Empty for monthly, the undiscounted baseline. */
export function discountLabel(cadence: BillingCadence): string {
  const off = CADENCE_DISCOUNT[cadence];
  return off === 0 ? "" : `Save ${Math.round(off * 100)}%`;
}

/**
 * A refresh allowance as the realtor experiences it. Derived rather than stored beside the
 * number, so the card copy and the comparison table cannot disagree about what 4 means.
 */
export function refreshLabel(refreshes: number): string {
  if (refreshes >= 8) return "Twice a week";
  if (refreshes >= 4) return "Weekly";
  if (refreshes >= 2) return "Every 2 weeks";
  return "";
}

/** Cell value in the comparison table: a checkmark (true), an omission (false), or text. */
export type CompareValue = boolean | string;

export type CompareRow = {
  label: string;
  values: Record<TierId, CompareValue>;
};

/**
 * Builds a comparison row by reading each tier, so a row that restates tier data (the
 * listing allowance, the refresh allowance) cannot fall out of step with the cards.
 * Rows that are pure prose stay written out below.
 */
function rowFromTiers(label: string, read: (tier: Tier) => CompareValue): CompareRow {
  const values = {} as Record<TierId, CompareValue>;
  for (const tier of TIERS) values[tier.id] = read(tier);
  return { label, values };
}

export const COMPARE_GROUPS: { group: string; rows: CompareRow[] }[] = [
  {
    group: "Listings and reach",
    rows: [
      rowFromTiers("Active listings", (tier) => String(tier.listings)),
      {
        label: "Dual-verified listings",
        values: { starter: true, professional: true, business: true, elite: true },
      },
      {
        label: "Trust-ranked placement",
        values: { starter: true, professional: true, business: true, elite: true },
      },
      rowFromTiers("Listing refresh", (tier) => refreshLabel(tier.refreshes) || false),
    ],
  },
  {
    group: "Leads",
    rows: [
      {
        label: "New lead alerts",
        values: { starter: true, professional: true, business: true, elite: true },
      },
      {
        label: "Reply to buyers",
        values: { starter: false, professional: true, business: true, elite: true },
      },
      {
        label: "Buyer contact details",
        values: { starter: false, professional: true, business: true, elite: true },
      },
      {
        label: "Listing analytics",
        values: {
          starter: false,
          professional: "Views and inquiries",
          business: "Plus conversion",
          elite: "Advanced, with export",
        },
      },
    ],
  },
  {
    group: "Verification",
    rows: [
      {
        label: "Document review queue",
        values: {
          starter: "Standard",
          professional: "Priority",
          business: "Top priority",
          elite: "Top priority",
        },
      },
    ],
  },
  {
    group: "Billing and support",
    rows: [
      {
        label: "Monthly, quarterly or annual",
        values: { starter: "Free", professional: true, business: true, elite: true },
      },
      {
        label: "Support",
        values: {
          starter: "Email",
          professional: "Priority email",
          business: "Priority email",
          elite: "Dedicated",
        },
      },
    ],
  },
];
