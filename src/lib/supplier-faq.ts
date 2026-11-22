import { z } from "zod";

/** One question-and-answer pair shown on a public supplier profile. */
export type SupplierFaq = { question: string; answer: string };

const faqListSchema = z.array(
  z.object({
    question: z.string().trim().min(1),
    answer: z.string().trim().min(1),
  }),
);

/**
 * Reads the stored `faq` jsonb value. Anything blank or malformed is dropped
 * rather than rendered, so a bad row can never break a public profile page.
 */
export function parseFaqs(value: unknown): SupplierFaq[] {
  const parsed = faqListSchema.safeParse(value);
  if (!parsed.success) return [];
  return parsed.data;
}
