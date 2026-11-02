import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().trim().min(5, "Give the course a title"),
  subtitle: z.string().trim().min(5, "Add a one-line subtitle"),
  description: z.string().trim().min(20, "Describe what the realtor gets from it"),
  cover: z.string().min(1, "Add a cover image"),
  videoUrl: z.string().trim().min(1, "Add the video"),
  minutes: z
    .number({ error: "Enter the length" })
    .int("Whole minutes only")
    .min(1, "At least 1 minute"),
  price: z
    .number({ error: "Enter a price" })
    .int("Whole naira only")
    .min(100, "At least ₦100"),
});

export type CourseValues = z.infer<typeof courseSchema>;

export const enrollSchema = z.object({
  fullname: z.string().trim().min(3, "Enter your full name"),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
});

export type EnrollValues = z.infer<typeof enrollSchema>;
