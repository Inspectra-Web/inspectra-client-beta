// What is left of the mock seeker. The dashboard itself is wired to the API now, so the
// saved ids and the activity feed that used to live here are gone; `seeker` and
// `inquiries` survive only because data/admin.ts still totals them for the mock admin
// KPIs. Property (p*) and realtor (r*) ids reference mock.ts so avatars resolve.

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

export const seeker: SeekerProfile = {
  name: "Amara Okeke",
  email: "amara.okeke@gmail.com",
  phone: "+234 803 555 0142",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80",
  city: "Lagos",
  memberSince: "March 2025",
};

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
