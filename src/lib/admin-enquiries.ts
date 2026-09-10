import { supabase } from "@/integrations/supabase/client";
import type { EnquiryRow } from "@/lib/enquiries";

export type AdminEnquiryRow = EnquiryRow & { supplier_business_name: string | null };

/** Every enquiry across every supplier, newest first. Admin-only via RLS. */
export async function fetchAllEnquiries(): Promise<AdminEnquiryRow[]> {
  const [{ data: enquiries, error: enquiryError }, { data: profiles, error: profileError }] =
    await Promise.all([
      supabase.from("tb_enquiry").select("*").order("created_at", { ascending: false }),
      supabase.from("tb_supplier_profile").select("supplier_account_id, business_name"),
    ]);

  if (enquiryError) throw enquiryError;
  if (profileError) throw profileError;

  const nameByAccount = new Map(
    (profiles ?? []).map((p) => [p.supplier_account_id, p.business_name]),
  );

  return (enquiries ?? []).map((row) => ({
    ...row,
    supplier_business_name: nameByAccount.get(row.supplier_account_id) ?? null,
  }));
}
