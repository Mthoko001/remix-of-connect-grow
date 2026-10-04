import { supabase } from "@/integrations/supabase/client";
import type { EnquiryRow } from "@/lib/enquiries";

export type AdminEnquiryRow = EnquiryRow & {
  supplier_business_name: string | null;
  supplier_category: string | null;
};

/** Every enquiry across every supplier (any status), newest first. Admin-only via RLS. */
export async function fetchAllEnquiries(): Promise<AdminEnquiryRow[]> {
  const [
    { data: enquiries, error: enquiryError },
    { data: profiles, error: profileError },
    { data: categories, error: categoryError },
  ] = await Promise.all([
    supabase.from("tb_enquiry").select("*").order("created_at", { ascending: false }),
    supabase.from("tb_supplier_profile").select("supplier_account_id, business_name, category_id"),
    supabase.from("tb_category").select("category_id, name"),
  ]);

  if (enquiryError) throw enquiryError;
  if (profileError) throw profileError;
  if (categoryError) throw categoryError;

  const categoryName = new Map((categories ?? []).map((c) => [c.category_id, c.name]));
  const profileByAccount = new Map((profiles ?? []).map((p) => [p.supplier_account_id, p]));

  return (enquiries ?? []).map((row) => {
    const profile = profileByAccount.get(row.supplier_account_id);
    return {
      ...row,
      supplier_business_name: profile?.business_name ?? null,
      supplier_category: profile?.category_id ? (categoryName.get(profile.category_id) ?? null) : null,
    };
  });
}
