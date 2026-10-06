import { createServerFn } from "@tanstack/react-start";
import { enquirySchema } from "@/lib/enquiry-schema";


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
        subject: data.subject,
        channel: data.channel,
        image_path: data.imagePath,
        status: "pending_review",
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
        subject: data.subject,
      });
      await supabaseAdmin
        .from("tb_enquiry")
        .update({ chatwoot_conversation_id: conversationId })
        .eq("enquiry_id", row.enquiry_id);
    } catch (err) {
      console.error("Chatwoot forwarding failed", err);
    }
    try {
      const { sendEnquirySubmittedEmails } = await import("@/lib/lead-emails.server");
      await sendEnquirySubmittedEmails({
        enquiryId: row.enquiry_id,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        supplierName: profile.business_name,
      });
    } catch (err) {
      console.error("Enquiry emails failed", err);
    }
    return { ok: true as const, quotaExhausted: false };
  });
