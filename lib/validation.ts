import { z } from "zod";

// Shared Zod schemas — used on the client (form UX) AND the server (/api/leads).

export const LANGUAGES = ["French", "Spanish", "German", "IELTS English"] as const;
export const GOALS = ["Canada PR", "Study abroad", "Career", "Travel"] as const;

export const assessmentSchema = z.object({
  type: z.literal("assessment").default("assessment"),
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number.")
    .max(20, "Enter a valid phone number.")
    .regex(/^[+()\d\s-]+$/, "Enter a valid phone number."),
  language: z.enum(LANGUAGES),
  goal: z.enum(GOALS),
  preferredTime: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  // Optional context captured from the URL / page.
  sourcePage: z.string().max(200).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
});

export const newsletterSchema = z.object({
  type: z.literal("newsletter").default("newsletter"),
  email: z.string().trim().email("Enter a valid email address."),
  sourcePage: z.string().max(200).optional(),
});

export const contactSchema = z.object({
  type: z.literal("contact").default("contact"),
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[+()\d\s-]*$/, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  message: z.string().trim().min(5, "Please enter a message.").max(1000),
  sourcePage: z.string().max(200).optional(),
});

// Discriminated union covering every /api/leads payload shape.
export const leadSchema = z.discriminatedUnion("type", [
  assessmentSchema,
  newsletterSchema,
  contactSchema,
]);

export type AssessmentInput = z.infer<typeof assessmentSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
