import { supabase } from "@/integrations/supabase/client";

/**
 * Lead qualification model.
 * TODO: automated qualification (spam scoring, duplicate detection) can later call the same
 * `review_enquiry` database function with a system reviewer instead of an admin.
 */
export type LeadStatus = "pending_review" | "qualified" | "rejected" | "in_progress" | "closed";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  pending_review: "Pending Review",
  qualified: "Qualified",
  rejected: "Rejected",
  in_progress: "In Progress",
  closed: "Closed",
};

/** Statuses a supplier is allowed to see. */
export const SUPPLIER_VISIBLE_STATUSES: LeadStatus[] = ["qualified", "in_progress", "closed"];

export const REJECTION_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "duplicate", label: "Duplicate" },
  { value: "incorrect_supplier", label: "Incorrect Supplier" },
  { value: "outside_service_area", label: "Outside Service Area" },
  { value: "invalid_contact_information", label: "Invalid Contact Information" },
  { value: "incomplete_enquiry", label: "Incomplete Enquiry" },
  { value: "not_relevant", label: "Not Relevant" },
  { value: "other", label: "Other" },
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number]["value"];

export function rejectionReasonLabel(value: string | null | undefined): string {
  return REJECTION_REASONS.find((r) => r.value === value)?.label ?? value ?? "";
}

export function leadStatusLabel(status: string): string {
  return LEAD_STATUS_LABELS[status as LeadStatus] ?? status;
}

export class LeadQuotaExhaustedError extends Error {
  constructor() {
    super(
      "This supplier has used all their free qualified leads and has no active subscription, so this lead can't be released.",
    );
    this.name = "LeadQuotaExhaustedError";
  }
}

/** Admin approves or rejects a pending lead. Enforced server-side in the database. */
export async function reviewEnquiry(
  enquiryId: number,
  decision: { approve: true } | { approve: false; reason: RejectionReason; note?: string },
): Promise<void> {
  const { error } = await supabase.rpc("review_enquiry", {
    _enquiry_id: enquiryId,
    _decision: decision.approve ? "approve" : "reject",
    _reason: decision.approve ? undefined : decision.reason,
    _note: decision.approve ? undefined : decision.note,
  });
  if (!error) return;
  if (error.message.includes("SUPPLIER_QUOTA_EXHAUSTED")) throw new LeadQuotaExhaustedError();
  if (error.message.includes("LEAD_ALREADY_REVIEWED")) {
    throw new Error("This lead has already been reviewed.");
  }
  throw error;
}

export type AdminLeadKpis = {
  pendingReview: number;
  qualified: number;
  rejected: number;
  total: number;
  qualificationRate: number | null;
};

export async function fetchAdminLeadKpis(): Promise<AdminLeadKpis> {
  const { data, error } = await supabase.rpc("admin_lead_kpis");
  if (error) throw error;
  const row = data?.[0];
  const total = row?.total ?? 0;
  const qualified = row?.qualified ?? 0;
  return {
    pendingReview: row?.pending_review ?? 0,
    qualified,
    rejected: row?.rejected ?? 0,
    total,
    qualificationRate: total ? qualified / total : null,
  };
}

export type LeadSummary = {
  pendingReview: number;
  qualified: number;
  inProgress: number;
  closed: number;
};

/** Signed-in supplier's counts per status (counts only — pending lead content stays hidden). */
export async function fetchMyLeadSummary(): Promise<LeadSummary> {
  const { data, error } = await supabase.rpc("get_my_lead_summary");
  if (error) throw error;
  const row = data?.[0];
  return {
    pendingReview: row?.pending_review ?? 0,
    qualified: row?.qualified ?? 0,
    inProgress: row?.in_progress ?? 0,
    closed: row?.closed ?? 0,
  };
}
