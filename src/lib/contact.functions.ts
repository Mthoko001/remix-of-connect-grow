import { createServerFn } from "@tanstack/react-start";
import { contactSchema } from "@/lib/contact-schema";

/** Public: stores a website contact message, then emails info@growmeonline.co.za best-effort. */
export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((d) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("tb_contact_message")
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
      })
      .select("contact_message_id")
      .single();
    if (error || !row) {
      console.error("contact insert failed", error);
      throw new Error("Could not send your message. Please try again.");
    }
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("contact-message", "info@growmeonline.co.za", {
        templateData: data,
        idempotencyKey: `contact-message-${row.contact_message_id}`,
      });
    } catch (e) {
      console.error("contact email failed", e);
    }
    return { ok: true as const };
  });
