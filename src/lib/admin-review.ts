import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type SupplierStatus = "pending" | "verified" | "rejected";

export type SupplierReviewProfile = {
  supplier_profile_id: number;
  business_name: string;
  business_description: string | null;
  address: string | null;
  cell_no: string | null;
  business_logo: string | null;
  product_images: Json;
  notes: string | null;
  date_updated: string;
};

export type SupplierReviewRow = {
  supplier_account_id: string;
  email: string;
  status: SupplierStatus;
  created_at: string;
  profile: SupplierReviewProfile | null;
};

/** Every supplier account + its profile (if any), newest first. Admin-only via RLS. */
export async function fetchSupplierReviewRows(): Promise<SupplierReviewRow[]> {
  const [{ data: accounts, error: accountsError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      supabase
        .from("tb_supplier_account")
        .select("supplier_account_id, email, status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("tb_supplier_profile")
        .select(
          "supplier_profile_id, supplier_account_id, business_name, business_description, address, cell_no, business_logo, product_images, notes, date_updated",
        ),
    ]);

  if (accountsError) throw accountsError;
  if (profilesError) throw profilesError;

  const profileByAccount = new Map((profiles ?? []).map((p) => [p.supplier_account_id, p]));

  return (accounts ?? []).map((row) => ({
    supplier_account_id: row.supplier_account_id,
    email: row.email,
    status: row.status as SupplierStatus,
    created_at: row.created_at,
    profile: profileByAccount.get(row.supplier_account_id) ?? null,
  }));
}

/** Approve or reject a supplier account. Admin-only via RLS. */
export async function setSupplierStatus(
  supplierAccountId: string,
  status: Extract<SupplierStatus, "verified" | "rejected">,
): Promise<void> {
  const { error } = await supabase
    .from("tb_supplier_account")
    .update({ status })
    .eq("supplier_account_id", supplierAccountId);
  if (error) throw error;
}

/** Product image paths are stored as a jsonb array of strings. */
export function productImagePaths(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}
