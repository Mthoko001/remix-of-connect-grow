import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const ENQUIRY_MEDIA_BUCKET = "enquiry-media";

export type EnquiryRow = Tables<"tb_enquiry">;
export type EnquiryChannel = "whatsapp" | "in_app";
export type EnquiryStatus = "new" | "read" | "replied";

export type SubmitEnquiryInput = {
  supplierAccountId: string;
  customerName: string;
  customerEmail: string;
  customerCell: string;
  message: string;
  channel: EnquiryChannel;
  image?: File | null;
};

/**
 * Stores a customer enquiry. Callable by anonymous visitors — no login
 * required. Best-effort: callers should not block their primary action
 * (e.g. opening WhatsApp) on this succeeding.
 *
 * IMPORTANT: do not chain `.select()` after this insert. The SELECT RLS
 * policy on tb_enquiry only covers `authenticated` (the owning supplier or
 * an admin), not `anon` — asking PostgREST to return the inserted row
 * triggers a SELECT-policy check as part of that RETURNING clause, which
 * anon fails, and the whole insert gets rejected as a false-positive RLS
 * violation even though the INSERT itself was allowed. A bare insert with
 * no returned row (the default supabase-js behavior) works correctly.
 */
export async function submitEnquiry(input: SubmitEnquiryInput): Promise<void> {
  let imagePath: string | null = null;

  if (input.image) {
    const safeName = input.image.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${input.supplierAccountId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(ENQUIRY_MEDIA_BUCKET)
      .upload(path, input.image);
    if (!uploadError) imagePath = path;
  }

  const { error } = await supabase.from("tb_enquiry").insert({
    supplier_account_id: input.supplierAccountId,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_cell: input.customerCell,
    message: input.message,
    channel: input.channel,
    image_path: imagePath,
  });
  if (error) throw error;
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in.");
  return data.user.id;
}

/** The signed-in supplier's own enquiries, newest first. */
export async function fetchMyEnquiries(): Promise<EnquiryRow[]> {
  const supplierAccountId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("tb_enquiry")
    .select("*")
    .eq("supplier_account_id", supplierAccountId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markEnquiryStatus(
  enquiryId: number,
  status: Extract<EnquiryStatus, "read" | "replied">,
): Promise<void> {
  const { error } = await supabase
    .from("tb_enquiry")
    .update({ status })
    .eq("enquiry_id", enquiryId);
  if (error) throw error;
}

/** Signed URL for previewing an enquiry's attached photo. */
export async function getEnquiryImageUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(ENQUIRY_MEDIA_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
