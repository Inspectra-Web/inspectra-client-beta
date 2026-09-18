// Single source of truth for the INSPECTRA certification program, shared by the public
// syllabus (CertSyllabus) and the dashboard certification page so the two never drift.
// Every fact here comes from the CREPON comprehensive program document: the curriculum,
// the two study tracks and their fees, the assessment structure and the discounts.
// Nothing is invented, so lesson counts and durations the document does not state are
// absent rather than filled in.

export interface CertModule {
  n: string;
  title: string;
  body: string;
}

export const CERT_MODULES: CertModule[] = [
  {
    n: "01",
    title: "Introduction to real estate",
    body: "The shape of the Nigerian market: the asset classes, who does what in a transaction, and where a realtor actually adds value.",
  },
  {
    n: "02",
    title: "Legal framework of real estate",
    body: "How ownership is created, transferred and proven, from the Land Use Act to the title instruments and the registry behind them.",
  },
  {
    n: "03",
    title: "Real estate ethics",
    body: "The code of conduct every certified practitioner signs, taught through case studies of the deals that went wrong and why.",
  },
  {
    n: "04",
    title: "Marketing and sales",
    body: "Position a property honestly, qualify a prospect, and carry a sale through to close without overpromising to get there.",
  },
  {
    n: "05",
    title: "Digital marketing in real estate",
    body: "Listings, content and paid reach that bring the right buyers to you rather than sending you chasing the wrong ones.",
  },
  {
    n: "06",
    title: "Financing and investment",
    body: "Mortgages, off-plan structures and returns, so you can tell a client what a deal is really worth before they commit.",
  },
  {
    n: "07",
    title: "Facility management",
    body: "What keeps a building worth what it sold for, and what an owner needs to hear about running costs before handover.",
  },
  {
    n: "08",
    title: "Property valuation techniques",
    body: "Price by evidence: comparables, cost and income methods applied to the stock actually trading in your area.",
  },
  {
    n: "09",
    title: "Principles of project management",
    body: "Read a build schedule, track milestones, and hold a credible conversation with developers and with the client waiting on them.",
  },
  {
    n: "10",
    title: "Interpreting technical drawings",
    body: "Survey plans and construction working drawings, and what each one tells you about the land before you market it.",
  },
  {
    n: "11",
    title: "The business of a realtor",
    body: "Run the practice, not just the deal: registration, records, pricing your service and building a pipeline that lasts.",
  },
  {
    n: "12",
    title: "HSSE for realtors",
    body: "Health, safety, security and environment, on an active site and across the facilities you manage after handover.",
  },
  {
    n: "13",
    title: "Professional development",
    body: "Stay current after certification through the workshops, webinars and seminars INSPECTRA runs for certified practitioners.",
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
    body: "You are measured as you go rather than on one day at the end, so gaps surface while there is still time to close them.",
  },
  {
    title: "One month internship",
    body: "A month putting the curriculum into practice on real transactions before anyone calls you certified.",
  },
  {
    title: "Certification exam",
    body: "A final exam built on real-life scenarios rather than recall, sat online like the rest of the program.",
  },
  {
    title: "Transparent grading",
    body: "A published, fair grading system, with study materials issued upfront so nothing on the paper is a surprise.",
  },
];
