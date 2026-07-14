import type { Property, Realtor } from "@/types";
import { LISTING_INTENT_LABEL, isRecurringLet } from "@/lib/listing";

/**
 * Derives the rich detail a listing page needs (gallery, dossier checks, fees,
 * specs, description) from the lean mock Property, so every listing has a full,
 * believable detail view without hand-authoring it in mock.ts. Deterministic per
 * property id, so a given home always renders the same content.
 */

const photo = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

const idOf = (url: string) => url.match(/photo-([\w-]+)/)?.[1] ?? url;

// Known-good Unsplash ids, split by what they show.
const INTERIORS = [
  "1522708323590-d24dbb6b0267",
  "1567767292278-a4f21aa2d36e",
  "1570129477492-45c003edd2be",
  "1493809842364-78817add7ffb",
  "1600566753086-00f18fb6b3ea",
  "1512918728675-ed5a9ecdebfd",
];
const EXTERIORS = [
  "1613977257363-707ba9348227",
  "1600585154340-be6161a56a0c",
  "1568605114967-8130f3a36994",
  "1512917774080-9991f1c4c750",
  "1600607687939-ce8a6c25118c",
  "1613490493576-7fde63acd811",
  "1576941089067-2de3c901e126",
  "1449844908441-8829872d2607",
  "1600585152220-90363fe7e115",
];
const LAND_POOL = [
  "1500382017468-9049fed747ef",
  "1512917774080-9991f1c4c750",
  "1568605114967-8130f3a36994",
];

const hashOf = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dateFrom = (h: number, i: number) => `${1 + ((h + i * 7) % 27)} ${MONTHS[(h + i * 5) % 10]} 2024`;

const naira = (n: number) => Math.round(n / 1000) * 1000;

export type CheckState = "passed" | "pending" | "flagged";
export interface VerificationCheck {
  label: string;
  result: string;
  state: CheckState;
  date?: string;
}
export interface FeeLine {
  label: string;
  amount: number;
  note?: string;
}
export interface SpecLine {
  label: string;
  value: string;
}
export interface NearbyLine {
  label: string;
  distance: string;
}

export interface ListingDetail {
  gallery: string[];
  description: string[];
  specs: SpecLine[];
  features: string[];
  amenities: string[];
  checks: VerificationCheck[];
  checksPassed: number;
  checksTotal: number;
  fees: FeeLine[];
  feesTotal: number;
  feesTotalLabel: string;
  feesNote: string;
  nearby: NearbyLine[];
  titleDoc: string;
}

// Features describe the home itself (layout, finishes); amenities are the
// facilities and services around it (power, water, security, parking).
const FEATURES: Record<Property["type"], string[]> = {
  Apartment: ["Fitted kitchen", "All rooms en-suite", "Fitted wardrobes", "Private balcony", "Floor-to-ceiling windows"],
  Duplex: ["All rooms en-suite", "Fitted kitchen with island", "Family lounge", "Boys' quarters", "Fitted wardrobes"],
  Terrace: ["En-suite bedrooms", "Fitted kitchen", "Private balcony", "Fitted wardrobes", "Open-plan living"],
  Bungalow: ["En-suite master", "Fitted kitchen", "Spacious compound", "Single-floor living", "Fitted wardrobes"],
  Penthouse: ["Panoramic city views", "Private roof terrace", "Fitted kitchen", "Smart-home controls", "Floor-to-ceiling windows"],
  Land: ["Dry, sand-filled plot", "Fenced perimeter", "Good natural drainage", "Rectangular, buildable shape"],
};

const AMENITIES: Record<Property["type"], string[]> = {
  Apartment: ["24/7 power (inverter + generator)", "Treated borehole water", "Air conditioning", "Elevator access", "Covered parking", "CCTV & access control"],
  Duplex: ["24/7 power", "Borehole & water treatment", "Gatehouse & CCTV", "Ample parking", "Estate security"],
  Terrace: ["24/7 power", "Estate security", "Covered parking", "Shared green courtyard", "Treated water"],
  Bungalow: ["24/7 power", "Treated borehole water", "Ample parking", "Fenced & gated", "Perimeter security"],
  Penthouse: ["24/7 power", "Elevator access", "Concierge & security", "Covered parking", "Backup water treatment"],
  Land: ["Motorable tarred access", "Free from government acquisition", "Within a gated estate", "Close to a major road"],
};

function buildGallery(property: Property, h: number): string[] {
  const own = property.image;
  const ownId = idOf(own);
  const pick = (pool: string[], count: number, seed: number) => {
    const out: string[] = [];
    for (let i = 0; out.length < count && i < pool.length * 2; i++) {
      const id = pool[(seed + i) % pool.length];
      if (id !== ownId && !out.includes(id)) out.push(id);
    }
    return out;
  };
  if (property.type === "Land") {
    return [own, ...pick(LAND_POOL, 3, h).map((id) => photo(id))];
  }
  // Weave interiors and exteriors into a longer set so a full home has a proper reel.
  const ints = pick(INTERIORS, 6, h);
  const exts = pick(EXTERIORS, 6, h + 3);
  const woven: string[] = [];
  for (let i = 0; i < 6; i++) {
    if (ints[i]) woven.push(ints[i]);
    if (exts[i]) woven.push(exts[i]);
  }
  return [own, ...woven.map((id) => photo(id))].slice(0, 12);
}

function buildDescription(property: Property, titleName: string, h: number): string[] {
  const typeLower = property.type.toLowerCase();
  const bed = property.beds ? `${property.beds}-bedroom ` : "";
  const area = property.areaSqm ? ` across ${property.areaSqm} m²` : "";
  const opens = [
    `A ${bed}${typeLower} in ${property.location}, one of ${property.city}'s most sought-after neighbourhoods.`,
    `Set in ${property.location}, this ${bed}${typeLower} brings calm, considered living to ${property.city}.`,
    `Tucked into ${property.location}, ${property.city}, this ${bed}${typeLower} is built for how you actually live.`,
  ];
  const body =
    property.type === "Land"
      ? `The plot is dry, fenced and ready to build on, with motorable access right to the gate${area}. Beacons are in place and the title is clean.`
      : `Rooms are generous and light-filled${area}, finished to a standard you can move straight into — fitted kitchen, en-suite bedrooms and round-the-clock power.`;
  const assurance =
    property.status === "verified"
      ? `Before it reached you, INSPECTRA authenticated the ${titleName}, matched the survey and traced the ownership. What you see is what you can trust.`
      : property.status === "pending"
        ? `INSPECTRA is finishing its checks on this home — a few items are still in review. Track exactly where things stand in the verification dossier below.`
        : `A claim was raised on this title, so new inspections are paused while INSPECTRA resolves it. The verification dossier below has the details.`;
  return [`${opens[h % opens.length]} ${body}`, assurance];
}

function buildSpecs(property: Property, h: number, titleDoc: string): SpecLine[] {
  const specs: SpecLine[] = [{ label: "Property type", value: property.type }];
  if (property.type !== "Land") {
    specs.push({ label: "Year built", value: String(2015 + (h % 9)) });
    specs.push({
      label: "Furnishing",
      value: isRecurringLet(property.listingFor)
        ? h % 2
          ? "Fully furnished"
          : "Serviced, part-furnished"
        : h % 2
          ? "Unfurnished"
          : "Semi-furnished",
    });
    specs.push({ label: "Parking", value: `${1 + (h % 3)} cars` });
  }
  if (property.areaSqm)
    specs.push({ label: property.type === "Land" ? "Plot size" : "Total area", value: `${property.areaSqm} m²` });
  specs.push({ label: "Title", value: titleDoc });
  specs.push({ label: "Listing", value: LISTING_INTENT_LABEL[property.listingFor] });
  return specs;
}

function buildFees(property: Property): { fees: FeeLine[]; total: number; label: string; note: string } {
  const p = property.price;
  if (property.listingFor === "shortlet") {
    const nights = 3;
    const stay = p * nights;
    const cleaning = naira(p * 0.4);
    const service = naira(stay * 0.1);
    const caution = naira(p * 2);
    const fees: FeeLine[] = [
      { label: `Nightly rate × ${nights} nights`, amount: stay },
      { label: "Cleaning fee", amount: cleaning },
      { label: "Service fee", amount: service, note: "10%" },
      { label: "Caution deposit", amount: caution, note: "refundable" },
    ];
    return {
      fees,
      total: stay + cleaning + service + caution,
      label: "Estimated for a 3-night stay",
      note: "The caution deposit is refunded after check-out in good standing.",
    };
  }
  if (property.listingFor === "rent" || property.listingFor === "lease") {
    const isLease = property.listingFor === "lease";
    const agency = naira(p * 0.1);
    const legal = naira(p * 0.1);
    const caution = naira(p * 0.1);
    const serviced = property.type === "Apartment" || property.type === "Penthouse";
    const service = serviced ? naira(p * 0.15) : 0;
    const fees: FeeLine[] = [
      { label: isLease ? "Annual lease" : "Annual rent", amount: p },
      { label: "Agency fee", amount: agency, note: "10%" },
      { label: "Legal & agreement", amount: legal, note: "10%" },
      { label: "Caution deposit", amount: caution, note: "refundable" },
      ...(service ? [{ label: "Service charge (yearly)", amount: service }] : []),
    ];
    return {
      fees,
      total: p + agency + legal + caution + service,
      label: "Estimated move-in cost",
      note: "The caution deposit is refunded when you move out in good standing.",
    };
  }
  const agency = naira(p * 0.05);
  const legal = naira(p * 0.05);
  const docs = naira(p * 0.02);
  return {
    fees: [
      { label: "Purchase price", amount: p },
      { label: "Agency fee", amount: agency, note: "5%" },
      { label: "Legal fee", amount: legal, note: "5%" },
      { label: "Documentation & perfection", amount: docs, note: "≈2%" },
    ],
    total: p + agency + legal + docs,
    label: "Estimated total payable",
    note: "Perfection covers Governor's consent, stamp duty and registration.",
  };
}

function buildNearby(h: number): NearbyLine[] {
  return [
    { label: "Supermarket", distance: `${2 + (h % 6)} min drive` },
    { label: "Schools", distance: `${3 + (h % 5)} min drive` },
    { label: "Hospital", distance: `${5 + (h % 8)} min drive` },
    { label: "Restaurants & cafés", distance: `${2 + (h % 5)} min walk` },
    { label: "Major highway", distance: `${4 + (h % 7)} min drive` },
    { label: "Airport", distance: `${20 + (h % 25)} min drive` },
  ];
}

function buildChecks(property: Property, realtor: Realtor | undefined, h: number, titleName: string): VerificationCheck[] {
  const docs = property.documents;
  const rows: { label: string; passed: string; pending: string; flagged?: string }[] = [
    {
      label: "Title document",
      passed: `${titleName} on file and authenticated with the state land registry.`,
      pending: `${titleName} submitted — authentication with the land registry is in progress.`,
      flagged: `A competing claim was raised against the ${titleName}. Inspections are paused while INSPECTRA resolves it.`,
    },
    ...(docs.includes("Survey Plan")
      ? [{ label: "Survey plan", passed: "Beacon coordinates match the survey filed at the surveyor-general's office.", pending: "Survey received — coordinates are being checked against state records." }]
      : []),
    ...(docs.includes("Deed of Assignment")
      ? [{ label: "Ownership chain", passed: "The deed traces a clean, unbroken transfer to the current owner.", pending: "Ownership documents received — the transfer history is being traced." }]
      : []),
    { label: "Encumbrance check", passed: "No liens, court cases or competing claims found on record.", pending: "Encumbrance search requested from the registry." },
    { label: "Fees & charges", passed: "Agency and legal fees are disclosed upfront — nothing is added at signing.", pending: "The fee schedule is under review." },
    { label: "Certified realtor", passed: realtor?.certified ? `Listed by ${realtor.name}, a certified INSPECTRA realtor.` : "Certification confirmed.", pending: "The realtor's certification is being confirmed." },
  ];

  const inReview = new Set(["Title document", "Survey plan", "Ownership chain", "Encumbrance check"]);

  return rows.map((r, i) => {
    let state: CheckState;
    let result: string;
    if (r.label === "Certified realtor") {
      state = realtor?.certified ? "passed" : "pending";
      result = realtor?.certified ? r.passed : r.pending;
    } else if (property.status === "disputed" && r.label === "Title document") {
      state = "flagged";
      result = r.flagged!;
    } else if (property.status === "pending" && inReview.has(r.label)) {
      state = "pending";
      result = r.pending;
    } else {
      state = "passed";
      result = r.passed;
    }
    return { label: r.label, result, state, date: state === "passed" ? dateFrom(h, i) : undefined };
  });
}

export function buildListingDetail(property: Property, realtor?: Realtor): ListingDetail {
  const h = hashOf(property.id);
  const docs = property.documents;
  const titleName = docs.includes("C of O")
    ? "Certificate of Occupancy"
    : docs.includes("Governor's Consent")
      ? "Governor's Consent"
      : docs.includes("Deed of Assignment")
        ? "Deed of Assignment"
        : "title";
  const titleDoc = docs.includes("C of O")
    ? "Certificate of Occupancy (C of O)"
    : docs.includes("Governor's Consent")
      ? "Governor's Consent"
      : docs.includes("Deed of Assignment")
        ? "Registered Deed of Assignment"
        : (docs[0] ?? "Title documents");

  const checks = buildChecks(property, realtor, h, titleName);
  const fee = buildFees(property);

  return {
    gallery: buildGallery(property, h),
    description: buildDescription(property, titleName, h),
    specs: buildSpecs(property, h, titleDoc),
    features: FEATURES[property.type] ?? [],
    amenities: AMENITIES[property.type] ?? [],
    checks,
    checksPassed: checks.filter((c) => c.state === "passed").length,
    checksTotal: checks.length,
    fees: fee.fees,
    feesTotal: fee.total,
    feesTotalLabel: fee.label,
    feesNote: fee.note,
    nearby: buildNearby(h),
    titleDoc,
  };
}
