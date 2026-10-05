import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";

// Mirrors the length checked in server/src/validators/identity.validator.ts.
export const ID_LENGTH = 11;

export interface Identity {
  verified: boolean;
  /** Step one passed: names, date of birth and liveness. The BVN is still to come. */
  ninVerified: boolean;
  firstName: string;
  middleName: string;
  lastName: string;
  /** The name matched against the NIN, then the BVN. */
  legalName: string;
  ninLast4: string;
  bvnLast4: string;
  /** The face that matched the ID. Never the profile avatar. */
  verifiedPhoto: string;
  verifiedOn?: string;
  /** One budget shared by both steps. */
  attemptsLeft: number;
  maxAttempts: number;
  /** What the profile still lacks. Verification cannot start until this is empty. */
  profileMissing: string[];
}

interface IdentityResponse {
  status: string;
  message?: string;
  data: { identity: Omit<Identity, "profileMissing">; profileMissing?: string[] };
}

export const IDENTITY_KEY = ["identity"];

/** "NIN ending 1234 and BVN ending 5678". Checks from before both were required carry one. */
export const idEndings = (identity: Pick<Identity, "ninLast4" | "bvnLast4">): string =>
  [
    identity.ninLast4 && `NIN ending ${identity.ninLast4}`,
    identity.bvnLast4 && `BVN ending ${identity.bvnLast4}`,
  ]
    .filter(Boolean)
    .join(" and ");

export function idError(value: string, label: "NIN" | "BVN"): string | null {
  const digits = value.trim();

  if (!digits) return `Enter your ${label}`;
  if (!/^\d+$/.test(digits)) return "Numbers only";
  if (digits.length !== ID_LENGTH) return `A ${label} is ${ID_LENGTH} digits`;

  return null;
}

export function useIdentity() {
  return useQuery({
    queryKey: IDENTITY_KEY,
    queryFn: async () => {
      const res = await api.get<IdentityResponse>("/identity/me");
      const { identity, profileMissing = [] } = res.data.data;
      return { ...identity, profileMissing };
    },
  });
}

// A failed step spends an attempt, so either mutation re-reads the count on error.
export function useVerifyNin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { nin: string; selfie: File }) => {
      const body = new FormData();
      body.append("nin", input.nin);
      body.append("selfie", input.selfie);

      const res = await api.post<IdentityResponse>("/identity/me/nin", body);
      return res.data.data.identity;
    },
    onSuccess: (identity) =>
      queryClient.setQueryData<Identity>(IDENTITY_KEY, (prev) => ({
        ...identity,
        profileMissing: prev?.profileMissing ?? [],
      })),
    onError: () => queryClient.invalidateQueries({ queryKey: IDENTITY_KEY }),
  });
}

export function useVerifyBvn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bvn: string) => {
      const res = await api.post<IdentityResponse>("/identity/me/bvn", { bvn });
      return res.data.data.identity;
    },
    onSuccess: (identity) =>
      queryClient.setQueryData<Identity>(IDENTITY_KEY, (prev) => ({
        ...identity,
        profileMissing: prev?.profileMissing ?? [],
      })),
    onError: () => queryClient.invalidateQueries({ queryKey: IDENTITY_KEY }),
  });
}
