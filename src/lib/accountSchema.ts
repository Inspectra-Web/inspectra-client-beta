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

export const seekerProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name"),
  lastName: z.string().trim().min(1, "Enter your last name"),
  phone: phoneField,
});
export type SeekerProfileValues = z.infer<typeof seekerProfileSchema>;

export const realtorProfileSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  agency: z.string().min(2, "Enter your agency name"),
  email: emailSchema,
  phone: z.string().min(7, "Enter a valid phone number"),
  bio: z.string().max(280, "Keep your bio under 280 characters").optional(),
});
export type RealtorProfileValues = z.infer<typeof realtorProfileSchema>;

// Realtor profile settings. Field names match the server's updateProfileSchema so
// the form submits straight through. Email is not editable here.
export const realtorSettingsSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name'),
  lastName: z.string().trim().min(1, 'Enter your last name'),
  middleName: z.string().trim(),
  bio: z.string().trim().max(600, 'Keep it under 600 characters'),
  address: z.string().trim(),
  city: z.string().trim(),
  state: z.string().trim(),
  country: z.string().trim(),
  phone: phoneField,
  whatsapp: phoneField,
  language: z.string().trim(),
  gender: z.string(),
  jobTitle: z.string().trim(),
  experience: z.string().trim(),
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
