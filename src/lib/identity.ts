import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";

export type IdDocument = "nin" | "bvn";

export const ID_DOCUMENTS: { key: IdDocument; label: string; full: string }[] = [
  { key: "nin", label: "NIN", full: "National Identity Number" },
  { key: "bvn", label: "BVN", full: "Bank Verification Number" },
];

// Mirrors the length checked in server/src/validators/identity.validator.ts.
export const ID_LENGTH = 11;

export const documentLabel = (doc: IdDocument) =>
  ID_DOCUMENTS.find((d) => d.key === doc)?.full ?? "";

export interface Identity {
  verified: boolean;
  document?: IdDocument;
  /** The name on the record we matched against. */
  legalName: string;
  last4: string;
  /** The face that matched the ID. Never the profile avatar. */
  verifiedPhoto: string;
  verifiedOn?: string;
}

interface IdentityResponse {
  status: string;
  message?: string;
  data: { identity: Identity };
}

export const IDENTITY_KEY = ["identity"];

export function idError(value: string, doc: IdDocument): string | null {
  const digits = value.trim();

  if (!digits) return `Enter your ${doc.toUpperCase()}`;
  if (!/^\d+$/.test(digits)) return "Numbers only";
  if (digits.length !== ID_LENGTH) return `A ${doc.toUpperCase()} is ${ID_LENGTH} digits`;

  return null;
}

export function useIdentity() {
  return useQuery({
    queryKey: IDENTITY_KEY,
    queryFn: async () => {
      const res = await api.get<IdentityResponse>("/identity/me");
      return res.data.data.identity;
    },
  });
}

export function useVerifyIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { document: IdDocument; number: string; selfie: File }) => {
      const body = new FormData();
      body.append("document", input.document);
      body.append("number", input.number);
      body.append("selfie", input.selfie);

      const res = await api.post<IdentityResponse>("/identity/me", body);
      return res.data.data.identity;
    },
    onSuccess: (identity) => queryClient.setQueryData(IDENTITY_KEY, identity),
  });
}
