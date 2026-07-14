import { z } from "zod";
import { emailSchema, passwordSchema } from "@/lib/authSchemas";

// Account page validation (mock, client-side only). Reuses the auth field rules.

export const profileSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: emailSchema,
  phone: z.string().min(7, "Enter a valid phone number"),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const realtorProfileSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  agency: z.string().min(2, "Enter your agency name"),
  email: emailSchema,
  phone: z.string().min(7, "Enter a valid phone number"),
  bio: z.string().max(280, "Keep your bio under 280 characters").optional(),
});
export type RealtorProfileValues = z.infer<typeof realtorProfileSchema>;

// Full realtor profile settings (image_2). Most fields optional; identity + contact required.
export const realtorSettingsSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name"),
  lastName: z.string().trim().min(1, "Enter your last name"),
  middleName: z.string().trim().optional(),
  selfDescription: z.string().trim().max(600, "Keep it under 600 characters").optional(),
  email: emailSchema,
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  telephone: z.string().trim().min(7, "Enter a valid phone number"),
  whatsapp: z.string().trim().optional(),
  language: z.string().trim().optional(),
  gender: z.string().optional(),
  experience: z.string().trim().optional(),
  specialization: z.array(z.string()),
  agencyName: z.string().trim().optional(),
  region: z.string().trim().optional(),
  agencyAddress: z.string().trim().optional(),
  availabilityStatus: z.string().optional(),
  contactMeans: z.string().optional(),
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
