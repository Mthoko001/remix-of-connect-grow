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
  is_service_provider: boolean;
  is_product_seller: boolean;
  service_categories: string[];
  other_service: string | null;
  products_offered: string[];
  opening_time: string;
  closing_time: string;
  category_id: number | null;
  cover_image: string | null;
  category_review_required: boolean;
  province: string | null;
  city: string | null;
  suburb: string | null;
};

export type SupplierReviewRow = {
  supplier_account_id: string;
  email: string;
  account_created_at: string;
  profile: SupplierReviewProfile | null;
};

export type AdminSupplierRow = {
  supplier_account_id: string;
  email: string;
  business_name: string;
  profile_status: SupplierProfileStatus;
  account_created_at: string;
  subscription: {
    subscription_status: string;
    amount: number;
    paid_at: string | null;
    is_test: boolean;
  } | null;
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
          "supplier_profile_id, supplier_account_id, business_name, business_description, address, cell_no, business_logo, product_images, notes, status, rejection_reason, date_updated, is_service_provider, is_product_seller, service_categories, other_service, products_offered, opening_time, closing_time, category_id, cover_image, category_review_required, province, city, suburb",
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

/** Validated and rejected suppliers with their latest subscription status. */
export async function fetchAdminSuppliers(): Promise<AdminSupplierRow[]> {
  const [supplierRows, { data: subscriptions, error: subscriptionsError }] = await Promise.all([
    fetchSupplierReviewRows(),
    supabase
      .from("tb_subscription")
      .select("supplier_account_id, subscription_status, amount, paid_at, is_test, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (subscriptionsError) throw subscriptionsError;

  const latestSubscriptionByAccount = new Map<
    string,
    NonNullable<AdminSupplierRow["subscription"]>
  >();
  for (const subscription of subscriptions ?? []) {
    if (!latestSubscriptionByAccount.has(subscription.supplier_account_id)) {
      latestSubscriptionByAccount.set(subscription.supplier_account_id, {
        subscription_status: subscription.subscription_status,
        amount: subscription.amount,
        paid_at: subscription.paid_at,
        is_test: subscription.is_test,
      });
    }
  }

  return supplierRows.flatMap((row) => {
    const profile = row.profile;
    if (!profile || (profile.status !== "validated" && profile.status !== "rejected")) return [];

    return [
      {
        supplier_account_id: row.supplier_account_id,
        email: row.email,
        business_name: profile.business_name,
        profile_status: profile.status,
        account_created_at: row.account_created_at,
        subscription: latestSubscriptionByAccount.get(row.supplier_account_id) ?? null,
      },
    ];
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

/** Updates only the supplier's public-facing business description. */
export async function updateSupplierBusinessDescription(
  supplierAccountId: string,
  description: string,
): Promise<void> {
  const { error } = await supabase
    .from("tb_supplier_profile")
    .update({
      business_description: description.trim() || null,
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

/** Emails the supplier the approve/reject decision. Best-effort; never undoes the status change. */
export async function notifySupplierOfDecision(input: {
  supplierAccountId: string;
}): Promise<{ sent: boolean }> {
  try {
    const { sendProfileDecisionEmail } = await import("@/lib/profile-emails.functions");
    return await sendProfileDecisionEmail({ data: { supplierAccountId: input.supplierAccountId } });
  } catch (err) {
    console.error("Could not send supplier notification email:", err);
    return { sent: false };
  }
}

export type AdminProfilePatch = Partial<{
  category_id: number | null;
  cover_image: string | null;
  business_logo: string | null;
  product_images: string[];
  opening_time: string;
  closing_time: string;
  cell_no: string | null;
  service_categories: string[];
  products_offered: string[];
}>;

/** Admin edits to a supplier profile during review (admin UPDATE policy on tb_supplier_profile). */
export async function adminUpdateSupplierProfile(
  supplierAccountId: string,
  patch: AdminProfilePatch,
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("tb_supplier_profile")
    .update({
      ...patch,
      ...(patch.category_id ? { category_review_required: false } : {}),
      updated_by: auth.user?.id ?? null,
      date_updated: new Date().toISOString(),
    })
    .eq("supplier_account_id", supplierAccountId);
  if (error) throw error;
}

/** Uploads an admin-provided image into the supplier's own media folder. */
export async function adminUploadSupplierMedia(
  supplierAccountId: string,
  file: File,
  kind: "logo" | "cover" | "products",
): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
  const path = `${supplierAccountId}/${kind}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage
    .from("supplier-media")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}
