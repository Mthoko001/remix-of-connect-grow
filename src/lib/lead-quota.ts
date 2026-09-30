import { supabase } from "@/integrations/supabase/client";

/** Free enquiries every supplier gets before a subscription is required. Mirrors the database rule. */
export const FREE_ENQUIRY_LIMIT = 5;

export type MonetizationStatus = "free_plan" | "quota_reached" | "subscribed";

export type LeadStatus = {
  totalEnquiries: number;
  freeLimit: number;
  freeUsed: number;
  freeRemaining: number;
  hasActiveSubscription: boolean;
  status: MonetizationStatus;
};

export type SupplierMonetization = {
  supplierAccountId: string;
  totalEnquiries: number;
  hasActiveSubscription: boolean;
  status: MonetizationStatus;
};

export const MONETIZATION_LABELS: Record<MonetizationStatus, string> = {
  free_plan: "Free Plan",
  quota_reached: "Quota Reached",
  subscribed: "Subscribed",
};

export const QUOTA_EXHAUSTED_MESSAGE =
  "This supplier is currently unavailable for new enquiries because their free enquiry allowance has been exhausted.";

/** Error thrown when the database blocks an enquiry because the quota is used up. */
export class SupplierQuotaExhaustedError extends Error {
  constructor() {
    super(QUOTA_EXHAUSTED_MESSAGE);
    this.name = "SupplierQuotaExhaustedError";
  }
}

export function isQuotaExhaustedDbError(error: { message?: string } | null | undefined): boolean {
  return !!error?.message?.includes("SUPPLIER_QUOTA_EXHAUSTED");
}

function toLeadStatus(total: number, active: boolean, freeLimit = FREE_ENQUIRY_LIMIT): LeadStatus {
  const freeUsed = Math.min(total, freeLimit);
  return {
    totalEnquiries: total,
    freeLimit,
    freeUsed,
    freeRemaining: Math.max(freeLimit - total, 0),
    hasActiveSubscription: active,
    status: active ? "subscribed" : total >= freeLimit ? "quota_reached" : "free_plan",
  };
}

/** Signed-in supplier's own quota usage. */
export async function fetchMyLeadStatus(): Promise<LeadStatus> {
  const { data, error } = await supabase.rpc("get_my_lead_status");
  if (error) throw error;
  const row = data?.[0];
  if (!row) return toLeadStatus(0, false);
  return toLeadStatus(row.total_enquiries, row.has_active_subscription, row.free_limit);
}

/** Public check used before any customer contact flow. */
export async function canSupplierReceiveEnquiries(supplierAccountId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("can_supplier_receive_enquiries", {
    _supplier_account_id: supplierAccountId,
  });
  if (error) throw error;
  return data === true;
}

/** Admin-only: monetization status for every supplier account. */
export async function fetchAdminMonetization(): Promise<SupplierMonetization[]> {
  const { data, error } = await supabase.rpc("admin_supplier_monetization");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    supplierAccountId: row.supplier_account_id,
    totalEnquiries: row.total_enquiries,
    hasActiveSubscription: row.has_active_subscription,
    status: row.monetization_status as MonetizationStatus,
  }));
}

export type MonetizationKpis = {
  freePlan: number;
  quotaReached: number;
  subscribed: number;
  total: number;
  conversionRate: number | null;
};

export function computeMonetizationKpis(rows: SupplierMonetization[]): MonetizationKpis {
  const count = (s: MonetizationStatus) => rows.filter((r) => r.status === s).length;
  const subscribed = count("subscribed");
  return {
    freePlan: count("free_plan"),
    quotaReached: count("quota_reached"),
    subscribed,
    total: rows.length,
    conversionRate: rows.length ? subscribed / rows.length : null,
  };
}
