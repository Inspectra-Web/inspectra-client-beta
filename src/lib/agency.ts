import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export type CompanyType =
  | "BUSINESS_NAME"
  | "COMPANY"
  | "INCORPORATED_TRUSTEES"
  | "LIMITED_PARTNERSHIP"
  | "LIMITED_LIABILITY_PARTNERSHIP";

export const COMPANY_TYPES: { key: CompanyType; label: string }[] = [
  { key: "BUSINESS_NAME", label: "Business Name" },
  { key: "COMPANY", label: "Limited Company" },
  { key: "INCORPORATED_TRUSTEES", label: "Incorporated Trustees" },
  { key: "LIMITED_PARTNERSHIP", label: "Limited Partnership" },
  { key: "LIMITED_LIABILITY_PARTNERSHIP", label: "Limited Liability Partnership" },
];

export const companyTypeLabel = (type: string): string =>
  COMPANY_TYPES.find((t) => t.key === type)?.label ?? type;

// Mirrors the bounds in server/src/validators/agency.validator.ts.
export const RC_MIN = 4;
export const RC_MAX = 10;

// Mirrors the cap in server/src/services/upload.service.ts.
export const BILL_MAX_MB = 10;
export const BILL_ACCEPT = "image/*,application/pdf";

export interface AgencyCac {
  rcNumber: string;
  companyName: string;
  companyType: string;
  registeredAddress: string;
  registeredOn?: string;
  verified: boolean;
  verifiedOn?: string;
}

/** Same vocabulary as a listing's documents: a person reads the file and says yes or no. */
export type AddressState = "unsubmitted" | "in-review" | "verified" | "flagged";

export interface AgencyAddress {
  meterNumber: string;
  status: AddressState;
  /** The reviewer's line, only ever set while the status is flagged. */
  reason: string;
  submittedOn?: string;
  verifiedOn?: string;
}

export interface Agency {
  cac: AgencyCac;
  address: AgencyAddress;
}

interface AgencyResponse {
  status: string;
  message?: string;
  data: { agency: Agency };
}

export const AGENCY_KEY = ["agency"];

export function rcError(value: string): string | null {
  const digits = value.trim();
  if (!digits) return "Enter your RC number";
  if (!/^\d+$/.test(digits)) return "Numbers only, without the RC or BN prefix";
  if (digits.length < RC_MIN) return "That is too short for an RC number";
  if (digits.length > RC_MAX) return "That is too long for an RC number";
  return null;
}

/** Rejects a file before it goes over the wire. Null means it is fine. */
export function billError(file: File): string | null {
  if (!file.type.startsWith("image/") && file.type !== "application/pdf")
    return "Upload the bill as a photo or a PDF.";

  if (file.size > BILL_MAX_MB * 1024 * 1024)
    return `The bill must be ${BILL_MAX_MB}MB or smaller.`;

  return null;
}

export function meterError(value: string): string | null {
  const meter = value.trim();
  if (!meter) return "Enter the meter or account number";
  if (!/^[A-Za-z0-9-]+$/.test(meter)) return "Letters, numbers and dashes only";
  if (meter.length < 4) return "That is too short for a meter or account number";
  if (meter.length > 20) return "That is too long for a meter or account number";
  return null;
}

export function useAgency() {
  return useQuery({
    queryKey: AGENCY_KEY,
    queryFn: async () => {
      const res = await api.get<AgencyResponse>("/agency/me");
      return res.data.data.agency;
    },
  });
}

export function useVerifyCac() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { rcNumber: string; companyType: CompanyType }) => {
      const res = await api.post<AgencyResponse>("/agency/me/cac", input);
      return res.data.data.agency;
    },
    onSuccess: (agency) => queryClient.setQueryData(AGENCY_KEY, agency),
  });
}

/** Sends the bill to the admin team. There is no automated verdict, so no result yet. */
export function useSubmitAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { bill: File; meterNumber: string }) => {
      const body = new FormData();
      body.append("bill", input.bill);
      body.append("meterNumber", input.meterNumber);
      const res = await api.post<AgencyResponse>("/agency/me/address", body);
      return { agency: res.data.data.agency, message: res.data.message };
    },
    onSuccess: ({ agency }) => queryClient.setQueryData(AGENCY_KEY, agency),
  });
}

/**
 * How far a realtor has got through their checks, in order. Identity gates the other two,
 * so these are a sequence rather than an unordered set of badges.
 */
export type StepState = "done" | "waiting" | "alert" | "todo";

export interface VerificationStep {
  label: string;
  state: StepState;
}

export function verificationSteps(
  identityVerified: boolean,
  agency: Agency | undefined,
): VerificationStep[] {
  const address = agency?.address.status;

  return [
    { label: "Identity", state: identityVerified ? "done" : "todo" },
    { label: "Business", state: agency?.cac.verified ? "done" : "todo" },
    {
      label: "Address",
      state:
        address === "verified"
          ? "done"
          : address === "in-review"
            ? "waiting"
            : address === "flagged"
              ? "alert"
              : "todo",
    },
  ];
}

/** Every rung cleared. The one thing the "Verified realtor" badge is allowed to mean. */
export const fullyVerified = (
  identityVerified: boolean,
  agency: Agency | undefined,
): boolean =>
  verificationSteps(identityVerified, agency).every((step) => step.state === "done");
