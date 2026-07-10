import { z } from "zod";
import { emailSchema, passwordSchema } from "@/lib/authSchemas";

// Account page validation (mock, client-side only). Reuses the auth field rules.

export const profileSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: emailSchema,
  phone: z.string().min(7, "Enter a valid phone number"),
});
export type ProfileValues = z.infer<typeof profileSchema>;

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
