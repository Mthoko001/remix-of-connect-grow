import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

/**
 * The single source of truth for verification status, read and written on
 * both the admin and supplier sides. Do not confuse with the older,
 * now-unused tb_supplier_account.status column.
 */
export type SupplierProfileStatus = "draft" | "pending_verification" | "validated" | "rejected";

export type SupplierReviewProfile = {
  supplier_profile_id: number;
  business_name: string;
  business_description: string | null;
  address: string | null;
  cell_no: string | null;
  business_logo: string | null;
  product_images: Json;
  notes: string | null;
  status: SupplierProfileStatus;
  rejection_reason: string | null;
  date_updated: string;
};

export type SupplierReviewRow = {
  supplier_account_id: string;
  email: string;
  account_created_at: string;
  profile: SupplierReviewProfile | null;
};

/** Every supplier account + its profile (if any), newest first. Admin-only via RLS. */
export async function fetchSupplierReviewRows(): Promise<SupplierReviewRow[]> {
  const [{ data: accounts, error: accountsError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      supabase
        .from("tb_supplier_account")
        .select("supplier_account_id, email, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("tb_supplier_profile")
        .select(
          "supplier_profile_id, supplier_account_id, business_name, business_description, address, cell_no, business_logo, product_images, notes, status, rejection_reason, date_updated",
        ),
    ]);

  if (accountsError) throw accountsError;
  if (profilesError) throw profilesError;

  const profileByAccount = new Map((profiles ?? []).map((p) => [p.supplier_account_id, p]));

  return (accounts ?? []).map((row) => {
    const rawProfile = profileByAccount.get(row.supplier_account_id) ?? null;
    return {
      supplier_account_id: row.supplier_account_id,
      email: row.email,
      account_created_at: row.created_at,
      profile: rawProfile
        ? { ...rawProfile, status: rawProfile.status as SupplierProfileStatus }
        : null,
    };
  });
}

/**
 * Approve or reject a supplier's profile. Writes tb_supplier_profile.status
 * — the same field the supplier's Overview/Subscription/Business Profile
 * pages read — so verifying here actually unlocks Subscription for them.
 * Rejecting clears any previous reason and sets the new one; approving
 * clears it (a stale rejection reason shouldn't linger after approval).
 */
export async function setSupplierProfileStatus(
  supplierAccountId: string,
  status: Extract<SupplierProfileStatus, "validated" | "rejected">,
  rejectionReason?: string,
): Promise<void> {
  const { error } = await supabase
    .from("tb_supplier_profile")
    .update({
      status,
      rejection_reason: status === "rejected" ? rejectionReason?.trim() || null : null,
      date_updated: new Date().toISOString(),
    })
    .eq("supplier_account_id", supplierAccountId);
  if (error) throw error;
}

/** Product image paths are stored as a jsonb array of strings. */
export function productImagePaths(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

/**
 * Emails the supplier that their profile was verified or rejected. Best-
 * effort: the caller should not block the approve/reject action on this
 * succeeding — it fails gracefully (e.g. RESEND_API_KEY not configured
 * yet) without undoing the status change.
 */
export async function notifySupplierOfDecision(input: {
  email: string;
  businessName: string;
  status: Extract<SupplierProfileStatus, "validated" | "rejected">;
  rejectionReason?: string;
}): Promise<{ sent: boolean }> {
  try {
    const { error } = await supabase.functions.invoke("send-supplier-status-email", {
      body: {
        email: input.email,
        businessName: input.businessName,
        status: input.status,
        rejectionReason: input.rejectionReason,
        siteUrl: window.location.origin,
      },
    });
    if (error) throw error;
    return { sent: true };
  } catch (err) {
    console.error("Could not send supplier notification email:", err);
    return { sent: false };
  }
}
