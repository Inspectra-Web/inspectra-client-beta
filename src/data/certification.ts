// Single source of truth for the INSPECTRA realtor certification program, shared by the public
// syllabus (CertSyllabus) and the dashboard certification page so the two never drift.

export interface CertModule {
  n: string;
  title: string;
  body: string;
  lessons: number;
  minutes: number;
}

export const CERT_MODULES: CertModule[] = [
  {
    n: "01",
    title: "Title & documents",
    body: "Read and validate a Certificate of Occupancy, Governor's Consent, deed of assignment and survey plan, and spot the red flags before a buyer does.",
    lessons: 5,
    minutes: 90,
  },
  {
    n: "02",
    title: "Land use & the registry",
    body: "How the Land Use Act, state land registries and encumbrances decide who really owns a property, and how to confirm it.",
    lessons: 4,
    minutes: 70,
  },
  {
    n: "03",
    title: "Fee disclosure & ethics",
    body: "Itemize every fee upfront, set fair commission terms, and hold to the conduct standard buyers are promised on INSPECTRA.",
    lessons: 4,
    minutes: 60,
  },
  {
    n: "04",
    title: "Valuation & market reading",
    body: "Price a listing by area with real comparables, read demand honestly, and negotiate in good faith on both sides.",
    lessons: 5,
    minutes: 80,
  },
  {
    n: "05",
    title: "Remote & diaspora buyers",
    body: "Run virtual tours and live walkthroughs, and guide a buyer deciding from abroad all the way to a confident close.",
    lessons: 4,
    minutes: 65,
  },
  {
    n: "06",
    title: "Disputes & accountability",
    body: "Handle flags calmly, keep a clean transaction record, and resolve issues on-platform before they become disputes.",
    lessons: 3,
    minutes: 45,
  },
];

/** The certification exam parameters (mirrors the marketing CertExam / CertPathway copy). */
export const EXAM = { questions: 40, minutes: 60, passMark: 75, retakes: 2 };
