import { z } from "zod";
import { emailSchema, passwordSchema } from "@/lib/authSchemas";

// Account page validation (mock, client-side only). Reuses the auth field rules.

export const profileSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: emailSchema,
  phone: z.string().min(7, "Enter a valid phone number"),
});
export type ProfileValues = z.infer<typeof profileSchema>;

// Matches the server's updateProfileSchema: names are separate fields there, and
// email is not editable (changing it has to re-run verification).
const phoneField = z
  .string()
  .trim()
  .refine((v) => v === '' || v.length >= 7, 'Enter a valid phone number');


// Mirrors the server: at least 18, under 120. Empty means not given yet, and is not sent.
const MIN_AGE = 18;
const MAX_AGE = 120;

const yearsAgo = (years: number): string => {
  const today = new Date();
  return new Date(
    Date.UTC(today.getFullYear() - years, today.getMonth(), today.getDate()),
  )
    .toISOString()
    .slice(0, 10);
};

const dateOfBirthField = z
  .string()
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date of birth")
  .refine((v) => v === "" || v <= yearsAgo(MIN_AGE), `You must be at least ${MIN_AGE} years old`)
  .refine((v) => v === "" || v > yearsAgo(MAX_AGE), "Enter a valid date of birth");

export const identityProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name"),
  lastName: z.string().trim().min(1, "Enter your last name"),
  phone: phoneField,
});
export type IdentityProfileValues = z.infer<typeof identityProfileSchema>;

export const realtorProfileSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  agency: z.string().min(2, "Enter your agency name"),
  email: emailSchema,
  phone: z.string().min(7, "Enter a valid phone number"),
  bio: z.string().optional(),
});
export type RealtorProfileValues = z.infer<typeof realtorProfileSchema>;

// Realtor profile settings. Field names match the server's updateProfileSchema so
// the form submits straight through. Email is not editable here.
export const realtorSettingsSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name'),
  lastName: z.string().trim().min(1, 'Enter your last name'),
  middleName: z.string().trim(),
  // Uncapped, matching the server: the realtor writes their own trust copy.
  bio: z.string().trim(),
  address: z.string().trim(),
  city: z.string().trim(),
  state: z.string().trim(),
  country: z.string().trim(),
  phone: phoneField,
  whatsapp: phoneField,
  gender: z.string(),
  dateOfBirth: dateOfBirthField,
  specialization: z.array(z.string()),
  agencyName: z.string().trim(),
  region: z.string().trim(),
  agencyAddress: z.string().trim(),
  availabilityStatus: z.string(),
  contactMeans: z.string(),
  socials: z.object({
    instagram: z.string().trim(),
    linkedin: z.string().trim(),
    facebook: z.string().trim(),
    x: z.string().trim(),
  }),
});
export type RealtorSettingsValues = z.infer<typeof realtorSettingsSchema>;

export const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type SecurityValues = z.infer<typeof securitySchema>;
