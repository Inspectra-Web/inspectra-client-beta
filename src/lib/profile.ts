import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";
import { ME_KEY, type AuthUser } from "./auth";

export type Gender = "Female" | "Male" | "Other" | "Prefer not to say";
export type AvailabilityStatus = "Available" | "Busy" | "Away";
export type ContactMeans = "Phone" | "WhatsApp" | "Email" | "Phone & WhatsApp";

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  bio: string;
  gender?: Gender;
  address: string;
  city: string;
  state: string;
  country: string;
  whatsapp: string;
  language: string;
  jobTitle: string;
  agencyName: string;
  agencyAddress: string;
  region: string;
  experience: string;
  specialization: string[];
  availabilityStatus: AvailabilityStatus;
  contactMeans: ContactMeans;
  socials: { instagram: string; linkedin: string; facebook: string; x: string };
  certified: boolean;
  preferredCity: string;
  propertyCategories: string[];
  propertyInterests: string[];
  createdAt: string;
  updatedAt: string;
}

/** Every field optional: each panel of the account page saves only its own section. */
export type ProfileUpdate = Partial<
  Omit<Profile, "id" | "certified" | "createdAt" | "updatedAt"> & { phone: string }
>;

interface ProfileResponse {
  status: string;
  message?: string;
  data: { user: AuthUser; profile: Profile };
}

interface UserResponse {
  status: string;
  message?: string;
  data: { user: AuthUser };
}

export const PROFILE_KEY = ["profile"];

// Mirrors the cap in server/src/services/upload.service.ts.
export const AVATAR_MAX_MB = 2;

/** Rejects a file before it goes over the wire. Null means it is fine. */
export function avatarError(file: File): string | null {
  if (!file.type.startsWith("image/"))
    return "Upload an image file (JPG, PNG or WebP).";

  if (file.size > AVATAR_MAX_MB * 1024 * 1024)
    return `Image must be ${AVATAR_MAX_MB}MB or smaller.`;

  return null;
}

/** The server stores slugs; these are the labels the seeker picks from. */
export const PROPERTY_INTERESTS = [
  { slug: "apartment", label: "Apartment" },
  { slug: "duplex", label: "Duplex" },
  { slug: "terrace", label: "Terrace" },
  { slug: "bungalow", label: "Bungalow" },
  { slug: "penthouse", label: "Penthouse" },
  { slug: "land", label: "Land" },
];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const res = await api.get<ProfileResponse>("/profile/me");
      return res.data.data.profile;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ProfileUpdate) => {
      const res = await api.patch<ProfileResponse>("/profile/me", values);
      return res.data.data;
    },
    // A name or phone change lands on the user, which the sidebar and topbar read.
    onSuccess: ({ user, profile }) => {
      queryClient.setQueryData(ME_KEY, user);
      queryClient.setQueryData(PROFILE_KEY, profile);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("avatar", file);

      const res = await api.post<UserResponse>("/profile/me/avatar", body);
      return res.data.data.user;
    },
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.delete<UserResponse>("/profile/me/avatar");
      return res.data.data.user;
    },
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  });
}
