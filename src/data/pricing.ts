// Single source of truth for the realtor subscription plans. Consumed by both the
// PricingTiers cards and the PricingCompare table so the two never drift.
// Numbers are the agreed starting point (Professional anchored at 25k/mo, annual = 10 months)
// and are easy to tune here in one place. Payments are mock/marketing only in this phase.

export type BillingCadence = "monthly" | "annual";

export type Tier = {
  id: "starter" | "professional" | "max";
  name: string;
  tagline: string;
  /** Naira per month. 0 means free. */
  monthly: number;
  /** Naira per year. Set to monthly * 10 so a year costs ten months (two months free). */
  annual: number;
  highlighted: boolean;
  ctaLabel: string;
  /** Concise feature list for the tier card check-rows. */
  features: string[];
};

export const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Get certified, get listed, and start building a verified track record.",
    monthly: 0,
    annual: 0,
    highlighted: false,
    ctaLabel: "Start free",
    features: [
      "3 active listings",
      "Dual-verified listings (property plus your certified badge)",
      "Trust-ranked placement in buyer search",
      "Basic inquiry inbox",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "For the working realtor who lists often and wants to be found first.",
    monthly: 25_000,
    annual: 250_000,
    highlighted: true,
    ctaLabel: "Choose Professional",
    features: [
      "30 active listings",
      "Featured, boosted placement in search",
      "Listing analytics: views, inquiries, conversion",
      "Priority verification for faster go-live",
      "Everything in Starter",
    ],
  },
  {
    id: "max",
    name: "Max",
    tagline: "For the high-volume realtor running a serious listing pipeline.",
    monthly: 60_000,
    annual: 600_000,
    highlighted: false,
    ctaLabel: "Go Max",
    features: [
      "100 active listings",
      "Featured, top-priority placement",
      "Advanced analytics with exports",
      "Top-priority verification",
      "Priority support",
      "Everything in Professional",
    ],
  },
];

/** Cell value in the comparison table: a checkmark (true), an omission (false), or text. */
export type CompareValue = boolean | string;

export type CompareRow = {
  label: string;
  starter: CompareValue;
  professional: CompareValue;
  max: CompareValue;
};

export const COMPARE_GROUPS: { group: string; rows: CompareRow[] }[] = [
  {
    group: "Listings and visibility",
    rows: [
      { label: "Active listings", starter: "3", professional: "30", max: "100" },
      { label: "Dual-verified listings", starter: true, professional: true, max: true },
      { label: "Trust-ranked placement", starter: true, professional: true, max: true },
      { label: "Featured, boosted placement", starter: false, professional: true, max: "Priority" },
    ],
  },
  {
    group: "Leads and insight",
    rows: [
      { label: "Inquiry inbox", starter: "Basic", professional: "Full, with lead capture", max: "Full, with lead capture" },
      { label: "Listing analytics", starter: false, professional: "Standard", max: "Advanced, with export" },
    ],
  },
  {
    group: "Verification",
    rows: [
      { label: "Verification queue", starter: "Standard", professional: "Priority", max: "Top priority" },
    ],
  },
  {
    group: "Support and extras",
    rows: [
      { label: "Branded storefront", starter: false, professional: false, max: true },
      { label: "Priority support", starter: false, professional: true, max: "Dedicated" },
    ],
  },
];
