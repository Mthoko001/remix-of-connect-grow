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
  province: string;
  city: string;
  suburb: string;
  postal_code: string;
  street_address: string;
  cell_no: string;
  business_logo: string | null;
  product_images: string[];
  is_service_provider: boolean;
  is_product_seller: boolean;
  service_categories: string[];
  other_service: string;
  products_offered: string[];
  opening_time: string;
  closing_time: string;
};

export const SERVICE_CATEGORIES = [
  "Plumbing", "Electrical", "Construction", "IT Services", "Marketing", "SEO",
  "Graphic Design", "Accounting", "Legal", "Cleaning", "Security", "Other",
] as const;

export const EMPTY_DRAFT: SupplierProfileDraft = {
  business_name: "",
  business_description: "",
  address: "",
  province: "",
  city: "",
  suburb: "",
  postal_code: "",
  street_address: "",
  cell_no: "",
  business_logo: null,
  product_images: [],
  is_service_provider: false,
  is_product_seller: false,
  service_categories: [],
  other_service: "",
  products_offered: [],
  opening_time: "09:00",
  closing_time: "17:00",
};

/** Required fields used by the completeness indicator. */
export const REQUIRED_FIELDS = [
  "business_name",
  "business_description",
  "province",
  "city",
  "suburb",
  "cell_no",
] as const satisfies readonly (keyof SupplierProfileDraft)[];

/** Total fields counted for completeness (required fields + product images). Logo is optional. */
export const TOTAL_TRACKED_FIELDS = REQUIRED_FIELDS.length + 1;

export function countCompleteFields(draft: SupplierProfileDraft): number {
  let count = REQUIRED_FIELDS.filter(
    (field) => String(draft[field] ?? "").trim().length > 0,
  ).length;
  if (draft.product_images.length > 0) count += 1;
  return count;
}

const FIELD_LABELS: Record<string, string> = {
  business_name: "Business Name",
  business_description: "Description",
  province: "Province",
  city: "City / Town",
  suburb: "Suburb / Area",
  cell_no: "Cell Number",
};

/** Human-readable list of what's still missing before the profile can be submitted. */
export function missingFields(draft: SupplierProfileDraft): string[] {
  const missing: string[] = REQUIRED_FIELDS.filter(
    (field) => String(draft[field] ?? "").trim().length === 0,
  ).map((field) => FIELD_LABELS[field] ?? String(field));
  if (draft.product_images.length === 0) missing.push("At least one product image");
  if (!draft.is_service_provider && !draft.is_product_seller) missing.push("Business type");
  if (draft.is_service_provider && draft.service_categories.length === 0)
    missing.push("At least one service category");
  if (draft.is_service_provider && draft.service_categories.includes("Other") && !draft.other_service.trim())
    missing.push("Specify your other service");
  if (draft.is_product_seller && draft.products_offered.length === 0)
    missing.push("At least one product offered");
  if (!draft.opening_time || !draft.closing_time) missing.push("Business hours");
  return missing;
}

export function toDraft(row: SupplierProfileRow | null): SupplierProfileDraft {
  if (!row) return EMPTY_DRAFT;
  return {
    business_name: row.business_name ?? "",
    business_description: row.business_description ?? "",
    address: row.address ?? "",
    province: row.province ?? "",
    city: row.city ?? "",
    suburb: row.suburb ?? "",
    postal_code: row.postal_code ?? "",
    street_address: row.street_address ?? "",
    cell_no: row.cell_no ?? "",
    business_logo: row.business_logo,
    product_images: Array.isArray(row.product_images) ? (row.product_images as string[]) : [],
    is_service_provider: row.is_service_provider,
    is_product_seller: row.is_product_seller,
    service_categories: row.service_categories ?? [],
    other_service: row.other_service ?? "",
    products_offered: row.products_offered ?? [],
    opening_time: (row.opening_time ?? "09:00").slice(0, 5),
    closing_time: (row.closing_time ?? "17:00").slice(0, 5),
  };
}

function composeAddress(d: SupplierProfileDraft): string {
  return [d.street_address, d.suburb, d.city, d.province, d.postal_code]
    .map((v) => v.trim())
    .filter(Boolean)
    .join(", ");
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
        // Legacy single-line address kept in sync for admin views.
        address: composeAddress(draft) || null,
        province: draft.province.trim() || null,
        city: draft.city.trim() || null,
        suburb: draft.suburb.trim() || null,
        postal_code: draft.postal_code.trim() || null,
        street_address: draft.street_address.trim() || null,
        cell_no: draft.cell_no || null,
        business_logo: draft.business_logo,
        product_images: draft.product_images,
        is_service_provider: draft.is_service_provider,
        is_product_seller: draft.is_product_seller,
        service_categories: draft.is_service_provider ? draft.service_categories : [],
        other_service:
          draft.is_service_provider && draft.service_categories.includes("Other")
            ? draft.other_service.trim() || null
            : null,
        products_offered: draft.is_product_seller ? draft.products_offered : [],
        opening_time: draft.opening_time || "09:00",
        closing_time: draft.closing_time || "17:00",
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
/** Moves the supplier's profile into the admin review queue (first submission or resubmission after rejection). */
export async function submitProfileForReview(): Promise<void> {
  const supplierAccountId = await getCurrentUserId();
  const { error } = await supabase
    .from("tb_supplier_profile")
    .update({
      status: "pending_verification",
      rejection_reason: null,
      date_updated: new Date().toISOString(),
    })
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
