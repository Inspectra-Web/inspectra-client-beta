// Single source of truth for the INSPECTRA certification program, shared by the public
// syllabus (CertSyllabus) and the dashboard certification page so the two never drift.
// Every fact here comes from the CREPON comprehensive program document: the curriculum,
// the two study tracks and their fees, the assessment structure and the discounts.
// Nothing is invented, so lesson counts and durations the document does not state are
// absent rather than filled in. Bodies are one line each: this is a scannable grid,
// not a prospectus.

export interface CertModule {
  n: string;
  title: string;
  body: string;
}

export const CERT_MODULES: CertModule[] = [
  {
    n: "01",
    title: "Introduction to real estate",
    body: "The shape of the Nigerian market, and where a realtor actually adds value.",
  },
  {
    n: "02",
    title: "Legal framework of real estate",
    body: "How ownership is created, transferred and proven, from the Land Use Act to the registry.",
  },
  {
    n: "03",
    title: "Real estate ethics",
    body: "The code every certified practitioner signs, taught through deals that went wrong.",
  },
  {
    n: "04",
    title: "Marketing and sales",
    body: "Position a property honestly, qualify a prospect, and close without overpromising.",
  },
  {
    n: "05",
    title: "Digital marketing in real estate",
    body: "Listings, content and paid reach that bring the right buyers to you.",
  },
  {
    n: "06",
    title: "Financing and investment",
    body: "Mortgages, off-plan structures and returns, so you can price a deal honestly.",
  },
  {
    n: "07",
    title: "Facility management",
    body: "What keeps a building worth what it sold for, and what running it costs.",
  },
  {
    n: "08",
    title: "Property valuation techniques",
    body: "Price by evidence: comparables, cost and income methods on stock actually trading.",
  },
  {
    n: "09",
    title: "Principles of project management",
    body: "Read a build schedule, track milestones, and hold developers to them.",
  },
  {
    n: "10",
    title: "Interpreting technical drawings",
    body: "Survey plans and working drawings, and what they tell you about the land.",
  },
  {
    n: "11",
    title: "The business of a realtor",
    body: "Run the practice, not just the deal: registration, records, pricing, pipeline.",
  },
  {
    n: "12",
    title: "HSSE for realtors",
    body: "Health, safety, security and environment, on site and in the facilities you manage.",
  },
  {
    n: "13",
    title: "Professional development",
    body: "The workshops, webinars and seminars that keep you current after certification.",
  },
];

export interface CertTrack {
  id: "full-time" | "executive";
  name: string;
  schedule: string;
  blurb: string;
  /** Naira. Rendered in CertEnroll only: see the price guardrail in CLAUDE.md. */
  fee: number;
}

/** One level of certification, taken on either schedule. The track changes the duration. */
export const CERT_TRACKS: CertTrack[] = [
  {
    id: "full-time",
    name: "Full-time",
    schedule: "Weekdays",
    blurb: "The weekday program, online, for realtors who can give it their working days.",
    fee: 150000,
  },
  {
    id: "executive",
    name: "Executive",
    schedule: "Weekends",
    blurb: "The weekend program, online, for practitioners already carrying a full desk.",
    fee: 200000,
  },
];

/** Percentages off the enrollment fee. Rendered in CertEnroll only. */
export const CERT_DISCOUNTS = { early: 15, bulk: 30 };

/** How a candidate is assessed, in the order it happens. */
export const ASSESSMENT = [
  {
    title: "Weekly assessments",
    body: "Measured as you go, so gaps surface while there is still time to close them.",
  },
  {
    title: "One month internship",
    body: "A month on real transactions before anyone calls you certified.",
  },
  {
    title: "Certification exam",
    body: "Built on real-life scenarios rather than recall, sat online like the rest.",
  },
  {
    title: "Transparent grading",
    body: "A published grading system, with study materials issued upfront.",
  },
];
