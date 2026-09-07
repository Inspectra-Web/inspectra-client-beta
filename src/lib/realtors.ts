import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api } from "./api";

/**
 * A realtor as the public site sees them. No email, phone or address: a listing
 * in the directory is not a reason to publish someone's contact details.
 */
export interface PublicRealtor {
  id: string;
  /** Stored lowercased by the API. Run it through displayName() to render. */
  fullname: string;
  avatar: string;
  city: string;
  state: string;
  agencyName: string;
  jobTitle: string;
  experience: string;
  region: string;
  bio: string;
  specialization: string[];
  /** Passed the enablement programme. */
  certified: boolean;
  /** NIN or BVN face-matched against the person. */
  identityVerified: boolean;
  createdAt: string;
}

export type RealtorSort = "recommended" | "newest" | "name";

export interface PublicRealtorQuery {
  q: string;
  city: string;
  sort: RealtorSort;
  page: number;
}

export interface PublicRealtorPage {
  realtors: PublicRealtor[];
  /** Every city with an eligible realtor, so the filter can be built from the data. */
  cities: string[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface RealtorsResponse {
  status: string;
  data: PublicRealtorPage;
}

export const REALTORS_KEY = ["realtors"];

// Mirrors the default in server/src/validators/realtor.validator.ts.
export const PAGE_SIZE = 12;

export function usePublicRealtors(query: PublicRealtorQuery) {
  return useQuery({
    queryKey: [...REALTORS_KEY, query],
    queryFn: async () => {
      const res = await api.get<RealtorsResponse>("/realtors", {
        params: { ...query, limit: PAGE_SIZE },
      });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

/** The line under the name on a card: what they do, and where. */
export function realtorTagline(realtor: PublicRealtor): string {
  const role = realtor.jobTitle || "Realtor";
  const patch = realtor.region || realtor.city;

  return patch ? `${role} across ${patch}` : role;
}

/** One realtor's public profile: the directory row plus what only the page needs. */
export interface RealtorProfile extends PublicRealtor {
  agencyAddress: string;
  availabilityStatus: string;
  contactMeans: string;
  socials: { instagram: string; linkedin: string; facebook: string; x: string };
}

interface RealtorResponse {
  status: string;
  data: { realtor: RealtorProfile };
}

export function usePublicRealtor(id: string) {
  return useQuery({
    queryKey: [...REALTORS_KEY, id],
    queryFn: async () => {
      const res = await api.get<RealtorResponse>(`/realtors/${id}`);
      return res.data.data.realtor;
    },
    staleTime: 5 * 60 * 1000,
  });
}
