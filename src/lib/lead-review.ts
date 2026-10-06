import { supabase } from "@/integrations/supabase/client";

/**
 * Lead qualification model.
 * TODO: automated qualification (spam scoring, duplicate detection) can later call the same
 * `review_enquiry` database function with a system reviewer instead of an admin.
 */
export type LeadStatus = "pending_review" | "qualified" | "rejected" | "in_progress" | "closed" | "archived";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  pending_review: "Pending Review",
  qualified: "Qualified",
  rejected: "Rejected",
  in_progress: "In Progress",
  closed: "Closed",
  archived: "Archived",
};

/** Statuses that count toward a supplier's free-lead quota (anything an admin has qualified). */
export const QUOTA_COUNTED_STATUSES: LeadStatus[] = ["qualified", "in_progress", "closed"];

export function countQuotaLeads(statuses: string[]): number {
  return statuses.filter((s) => QUOTA_COUNTED_STATUSES.includes(s as LeadStatus)).length;
}

/** Statuses a supplier is allowed to see. */
export const SUPPLIER_VISIBLE_STATUSES: LeadStatus[] = ["qualified", "in_progress", "closed"];

export const REJECTION_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "duplicate", label: "Duplicate" },
  { value: "wrong_category", label: "Wrong Category" },
  { value: "wrong_supplier", label: "Wrong Supplier" },
  { value: "outside_service_area", label: "Outside Service Area" },
  { value: "incomplete_information", label: "Incomplete Information" },
  { value: "invalid_contact_details", label: "Invalid Contact Details" },
  { value: "other", label: "Other" },
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number]["value"];

/** Labels for reasons used before the reason list changed. */
const LEGACY_REASON_LABELS: Record<string, string> = {
  incorrect_supplier: "Incorrect Supplier",
  invalid_contact_information: "Invalid Contact Information",
  incomplete_enquiry: "Incomplete Enquiry",
  not_relevant: "Not Relevant",
};

export function rejectionReasonLabel(value: string | null | undefined): string {
  return REJECTION_REASONS.find((r) => r.value === value)?.label ?? (value ? LEGACY_REASON_LABELS[value] ?? value : "");
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
  const args: { _enquiry_id: number; _decision: string; _reason?: string; _note?: string } = {
    _enquiry_id: enquiryId,
    _decision: decision.approve ? "approve" : "reject",
  };
  if (!decision.approve) {
    args._reason = decision.reason;
    if (decision.note?.trim()) args._note = decision.note.trim();
  }
  const { error } = await supabase.rpc("review_enquiry", args);
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

/** Admin archives an enquiry (hidden from suppliers; kept for audit). */
export async function archiveEnquiry(enquiryId: number): Promise<void> {
  const { error } = await supabase.rpc("admin_archive_enquiry", { _enquiry_id: enquiryId });
  if (error) throw error;
}

export type EnquiryEdit = {
  customerName: string;
  customerEmail: string;
  customerCell: string;
  message: string;
  subject: string;
};

/** Admin corrects an enquiry's details. Logged in the audit trail. */
export async function editEnquiry(enquiryId: number, edit: EnquiryEdit): Promise<void> {
  const { error } = await supabase.rpc("admin_edit_enquiry", {
    _enquiry_id: enquiryId,
    _customer_name: edit.customerName,
    _customer_email: edit.customerEmail,
    _customer_cell: edit.customerCell,
    _message: edit.message,
    _subject: edit.subject,
  });
  if (error) throw error;
}

export type EnquiryAuditEntry = {
  enquiry_audit_id: number;
  admin_email: string | null;
  action: string;
  original_status: string | null;
  new_status: string | null;
  created_at: string;
};

export async function fetchEnquiryAudit(enquiryId: number): Promise<EnquiryAuditEntry[]> {
  const { data, error } = await supabase
    .from("tb_enquiry_audit")
    .select("enquiry_audit_id, admin_email, action, original_status, new_status, created_at")
    .eq("enquiry_id", enquiryId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
