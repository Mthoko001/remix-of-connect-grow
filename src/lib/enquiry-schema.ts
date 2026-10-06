import { z } from "zod";

/** Validation for a customer enquiry submission (shared by server function and tests). */
export const enquirySchema = z.object({
  supplierAccountId: z.string().uuid(),
  customerName: z.string().trim().min(1).max(100),
  customerEmail: z.string().trim().email().max(255),
  customerCell: z.string().trim().min(6).max(30),
  subject: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(2000),
  channel: z.literal("in_app"),
  imagePath: z.string().max(300).nullable(),
});
