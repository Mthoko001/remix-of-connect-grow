import { describe, expect, it } from "vitest";
import { countQuotaLeads } from "@/lib/lead-review";
import { enquirySchema } from "@/lib/enquiry-schema";

const base = {
  supplierAccountId: "11111111-1111-4111-8111-111111111111",
  customerName: "Thabo",
  customerEmail: "thabo@example.com",
  customerCell: "0821234567",
  subject: "Quote for tiling",
  message: "Please quote",
  channel: "in_app" as const,
  imagePath: null,
};

describe("free qualified lead quota", () => {
  it("counts only qualified leads: 3 qualified + 17 rejected = 3", () => {
    const statuses = [...Array(3).fill("qualified"), ...Array(17).fill("rejected")];
    expect(countQuotaLeads(statuses)).toBe(3);
  });
  it("does not count pending review or archived-before-review leads", () => {
    expect(countQuotaLeads(["pending_review", "pending_review", "rejected"])).toBe(0);
  });
});

describe("enquiry subject", () => {
  it("is required", () => {
    expect(enquirySchema.safeParse({ ...base, subject: "  " }).success).toBe(false);
  });
  it("accepts up to 120 characters and rejects 121", () => {
    expect(enquirySchema.safeParse({ ...base, subject: "a".repeat(120) }).success).toBe(true);
    expect(enquirySchema.safeParse({ ...base, subject: "a".repeat(121) }).success).toBe(false);
  });
});
