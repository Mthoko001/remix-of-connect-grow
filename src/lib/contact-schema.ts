import { z } from "zod";

export const CONTACT_SUBJECTS = ["General Enquiry", "Supplier Support", "Customer Question", "Billing", "Other"] as const;

export const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || /^[+\d][\d\s-]{7,18}$/.test(v), "Enter a valid phone number")
    .optional()
    .default(""),
  subject: z.enum(CONTACT_SUBJECTS),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;
