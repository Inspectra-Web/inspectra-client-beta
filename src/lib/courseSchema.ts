import { z } from "zod";

import { passwordSchema } from "./authSchemas";

export const courseSchema = z.object({
  title: z.string().trim().min(5, "Give the course a title"),
  subtitle: z.string().trim().min(5, "Add a one-line subtitle"),
  description: z.string().trim().min(20, "Describe what the realtor gets from it"),
  cover: z.string().min(1, "Add a cover image"),
  price: z
    .number({ error: "Enter a price" })
    .int("Whole naira only")
    .min(14_286, "At least ₦14,286, so the realtor's reward stays above ₦10,000"),
});

export type CourseValues = z.infer<typeof courseSchema>;

export const lessonSchema = z.object({
  title: z.string().trim().min(3, "Give the lesson a title").max(200),
  summary: z.string().trim().max(500, "Keep it to a line or two"),
  /** The link, when the lesson plays from one. Checked by the dialog, which knows the mode. */
  videoUrl: z.string().trim(),
  minutes: z
    .number({ error: "Enter the length" })
    .int("Whole minutes only")
    .min(1, "At least 1 minute")
    .max(600),
});

export type LessonValues = z.infer<typeof lessonSchema>;

/** The course checkout, which opens the realtor account in the same submit. */
export const joinCourseSchema = z
  .object({
    fullname: z.string().trim().min(3, "Enter your full name"),
    email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
    phone: z.string().trim().min(7, "Enter a valid phone number"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type JoinCourseValues = z.infer<typeof joinCourseSchema>;
