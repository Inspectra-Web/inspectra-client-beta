// Mock data for the signed-in seeker (buyer/client) dashboard. Everything here references
// existing property (p*) and realtor (r*) ids from mock.ts so cards and avatars resolve.
// UI over mock data (Phase 6): no backend, no persistence.

export interface SeekerProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  city: string;
  memberSince: string;
}

export type InquiryStatus = "new" | "responded";
export interface Inquiry {
  id: string;
  propertyId: string;
  realtorId: string;
  message: string;
  sentAt: string;
  status: InquiryStatus;
  reply?: string;
}

export type ActivityKind = "saved" | "inquiry" | "inspection" | "viewed";
export interface Activity {
  id: string;
  kind: ActivityKind;
  propertyId?: string;
  realtorId?: string;
  label: string;
  at: string;
}

export const seeker: SeekerProfile = {
  name: "Amara Okeke",
  email: "amara.okeke@gmail.com",
  phone: "+234 803 555 0142",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80",
  city: "Lagos",
  memberSince: "March 2025",
};

// Seed for the Saved page (all verified, mixed cities).
export const savedPropertyIds: string[] = ["p1", "p6", "p10", "p18"];

export const inquiries: Inquiry[] = [
  {
    id: "q1",
    propertyId: "p3",
    realtorId: "r1",
    message:
      "Hi, is this apartment still available for a move-in next month? I'd love to know if the service charge is annual.",
    sentAt: "2 hours ago",
    status: "new",
  },
  {
    id: "q2",
    propertyId: "p13",
    realtorId: "r1",
    message:
      "Could you share the full title documents for the penthouse before I schedule a viewing?",
    sentAt: "Yesterday",
    status: "responded",
    reply:
      "Absolutely, Amara. The Certificate of Occupancy and survey are verified and attached to the listing. Happy to walk you through them.",
  },
  {
    id: "q3",
    propertyId: "p5",
    realtorId: "r2",
    message:
      "Is the price negotiable for the semi-detached? And does it come with a fitted kitchen?",
    sentAt: "3 days ago",
    status: "responded",
    reply:
      "There is some room on price for a serious buyer, and yes, the kitchen is fully fitted. Let's set up a viewing.",
  },
  {
    id: "q4",
    propertyId: "p8",
    realtorId: "r2",
    message:
      "I'm relocating to Abuja and this duplex looks perfect. What are the next steps to reserve it?",
    sentAt: "5 days ago",
    status: "new",
  },
];

export const activity: Activity[] = [
  {
    id: "a1",
    kind: "saved",
    propertyId: "p18",
    label: "You saved",
    at: "3h ago",
  },
  {
    id: "a2",
    kind: "inquiry",
    propertyId: "p3",
    realtorId: "r1",
    label: "You messaged",
    at: "2h ago",
  },
  {
    id: "a3",
    kind: "inspection",
    propertyId: "p1",
    realtorId: "r1",
    label: "Inspection booked for",
    at: "Yesterday",
  },
  {
    id: "a4",
    kind: "viewed",
    propertyId: "p13",
    label: "You viewed",
    at: "Yesterday",
  },
  {
    id: "a5",
    kind: "inquiry",
    propertyId: "p5",
    realtorId: "r2",
    label: "Realtor replied on",
    at: "3d ago",
  },
  {
    id: "a6",
    kind: "saved",
    propertyId: "p6",
    label: "You saved",
    at: "4d ago",
  },
];

export const inquiryById = (id: string) => inquiries.find((q) => q.id === id);
