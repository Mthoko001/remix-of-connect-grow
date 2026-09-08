import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const SUPPLIER_MEDIA_BUCKET = "supplier-media";
export const MAX_PRODUCT_IMAGES = 6;

export type SupplierProfileRow = Tables<"tb_supplier_profile">;

/** The editable shape of the profile form. */
export type SupplierProfileDraft = {
  business_name: string;
  business_description: string;
  address: string;
  cell_no: string;
  business_logo: string | null;
  product_images: string[];
};

export const EMPTY_DRAFT: SupplierProfileDraft = {
  business_name: "",
  business_description: "",
  address: "",
  cell_no: "",
  business_logo: null,
  product_images: [],
};

/** Required fields used by the completeness indicator. */
export const REQUIRED_FIELDS = [
  "business_name",
  "business_description",
  "address",
  "cell_no",
] as const satisfies readonly (keyof SupplierProfileDraft)[];

/** Total fields counted for completeness (4 required + logo + product images). */
export const TOTAL_TRACKED_FIELDS = REQUIRED_FIELDS.length + 2;

export function countCompleteFields(draft: SupplierProfileDraft): number {
  let count = REQUIRED_FIELDS.filter(
    (field) => String(draft[field] ?? "").trim().length > 0,
  ).length;
  if (draft.business_logo) count += 1;
  if (draft.product_images.length > 0) count += 1;
  return count;
}

export function toDraft(row: SupplierProfileRow | null): SupplierProfileDraft {
  if (!row) return EMPTY_DRAFT;
  return {
    business_name: row.business_name ?? "",
    business_description: row.business_description ?? "",
    address: row.address ?? "",
    cell_no: row.cell_no ?? "",
    business_logo: row.business_logo,
    product_images: Array.isArray(row.product_images) ? (row.product_images as string[]) : [],
  };
}

export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You must be signed in to edit your business profile.");
  return data.user.id;
}

export async function fetchMyProfile(): Promise<SupplierProfileRow | null> {
  const supplierAccountId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("tb_supplier_profile")
    .select("*")
    .eq("supplier_account_id", supplierAccountId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type SupplierProfileStatus = "draft" | "pending_verification" | "validated" | "rejected";

/**
 * The supplier's own verification status, read from their profile row.
 * A supplier with no profile yet is treated as 'draft'.
 */
export async function fetchMyProfileStatus(): Promise<SupplierProfileStatus> {
  const row = await fetchMyProfile();
  return (row?.status as SupplierProfileStatus) ?? "draft";
}

/**
 * Upserts the supplier's single profile row. Does NOT touch `status` — a
 * brand new row gets the column default ('draft'); an existing row keeps
 * whatever status it currently has, so autosaving edits never silently
 * reverts a submitted, validated, or rejected profile back to draft.
 */
export async function saveProfileDraft(draft: SupplierProfileDraft): Promise<SupplierProfileRow> {
  const supplierAccountId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("tb_supplier_profile")
    .upsert(
      {
        supplier_account_id: supplierAccountId,
        business_name: draft.business_name,
        business_description: draft.business_description || null,
        address: draft.address || null,
        cell_no: draft.cell_no || null,
        business_logo: draft.business_logo,
        product_images: draft.product_images,
        updated_by: supplierAccountId,
        date_updated: new Date().toISOString(),
      },
      { onConflict: "supplier_account_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Moves the supplier's profile from 'draft' into the admin review queue. */
export async function submitProfileForReview(): Promise<void> {
  const supplierAccountId = await getCurrentUserId();
  const { error } = await supabase
    .from("tb_supplier_profile")
    .update({ status: "pending_verification", date_updated: new Date().toISOString() })
    .eq("supplier_account_id", supplierAccountId);
  if (error) throw error;
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
}

/**
 * Uploads a file to supplier-media under `<supplier_account_id>/<kind>/<timestamp>-<name>`
 * and returns the storage path.
 */
export async function uploadSupplierMedia(file: File, kind: "logo" | "products"): Promise<string> {
  const supplierAccountId = await getCurrentUserId();
  const path = `${supplierAccountId}/${kind}/${Date.now()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(SUPPLIER_MEDIA_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function removeSupplierMedia(path: string): Promise<void> {
  await supabase.storage.from(SUPPLIER_MEDIA_BUCKET).remove([path]);
}

/** Signed URL for previewing a private storage object. */
export async function getSignedMediaUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(SUPPLIER_MEDIA_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
