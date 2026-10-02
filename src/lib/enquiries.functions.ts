import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const enquirySchema = z.object({
  supplierAccountId: z.string().uuid(),
  customerName: z.string().trim().min(1).max(100),
  customerEmail: z.string().trim().email().max(255),
  customerCell: z.string().trim().min(6).max(30),
  message: z.string().trim().min(1).max(2000),
  channel: z.enum(["whatsapp", "in_app"]),
  imagePath: z.string().max(300).nullable(),
});

/**
 * Public: saves a customer enquiry (the database quota trigger still applies)
 * and forwards it to Chatwoot. Chatwoot failures never block the enquiry.
 */
export const createEnquiry = createServerFn({ method: "POST" })
  .inputValidator((d) => enquirySchema.parse(d))
  .handler(async ({ data }) => {
    if (data.imagePath && !data.imagePath.startsWith(`${data.supplierAccountId}/`)) {
      throw new Error("Invalid attachment.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("tb_supplier_profile")
      .select("business_name, status")
      .eq("supplier_account_id", data.supplierAccountId)
      .maybeSingle();
    if (profile?.status !== "validated") throw new Error("This supplier isn't accepting enquiries.");

    const { data: row, error } = await supabaseAdmin
      .from("tb_enquiry")
      .insert({
        supplier_account_id: data.supplierAccountId,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_cell: data.customerCell,
        message: data.message,
        channel: data.channel,
        image_path: data.imagePath,
        status: "new",
      })
      .select("enquiry_id")
      .single();
    if (error?.message?.includes("SUPPLIER_QUOTA_EXHAUSTED")) return { ok: false as const, quotaExhausted: true };
    if (error || !row) {
      console.error("enquiry insert failed", error);
      throw new Error("We couldn't send your enquiry. Please try again.");
    }

    try {
      const { pushLeadToChatwoot } = await import("@/lib/chatwoot.server");
      const conversationId = await pushLeadToChatwoot({
        enquiryId: row.enquiry_id,
        supplierId: data.supplierAccountId,
        supplierName: profile.business_name,
        customerName: data.customerName,
        customerPhone: data.customerCell,
        customerEmail: data.customerEmail,
        message: data.message,
      });
      await supabaseAdmin
        .from("tb_enquiry")
        .update({ chatwoot_conversation_id: conversationId })
        .eq("enquiry_id", row.enquiry_id);
    } catch (err) {
      console.error("Chatwoot forwarding failed", err);
    }
    return { ok: true as const, quotaExhausted: false };
  });
