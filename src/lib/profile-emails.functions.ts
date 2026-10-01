import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Sends the "profile submitted" email to the signed-in supplier.
 * Recipient and template are fixed server-side; only sends when the profile
 * really is pending review.
 */
export const sendProfileSubmittedEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const { data: profile } = await supabase
      .from("tb_supplier_profile")
      .select("business_name, status, date_updated")
      .eq("supplier_account_id", userId)
      .maybeSingle();
    const email = (claims as { email?: string }).email;
    if (!profile || profile.status !== "pending_verification" || !email) return { sent: false };
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    try {
      const res = await sendTemplateEmail("profile-submitted", email, {
        templateData: { businessName: profile.business_name },
        idempotencyKey: `profile-submitted-${userId}-${profile.date_updated}`,
      });
      return { sent: res.sent };
    } catch (err) {
      console.error("profile-submitted email failed", err);
      return { sent: false };
    }
  });

/** Sends the approve/reject email after an admin decision. Caller must be an admin. */
export const sendProfileDecisionEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ supplierAccountId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    const { data: profile } = await supabase
      .from("tb_supplier_profile")
      .select("business_name, status, rejection_reason, date_updated")
      .eq("supplier_account_id", data.supplierAccountId)
      .maybeSingle();
    const { data: account } = await supabase
      .from("tb_supplier_account")
      .select("email")
      .eq("supplier_account_id", data.supplierAccountId)
      .maybeSingle();
    if (!profile || !account?.email) return { sent: false };
    if (profile.status !== "validated" && profile.status !== "rejected") return { sent: false };

    const template = profile.status === "validated" ? "profile-approved" : "profile-rejected";
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    try {
      const res = await sendTemplateEmail(template, account.email, {
        templateData: {
          businessName: profile.business_name,
          reason: profile.rejection_reason ?? undefined,
        },
        idempotencyKey: `${template}-${data.supplierAccountId}-${profile.date_updated}`,
      });
      return { sent: res.sent };
    } catch (err) {
      console.error(`${template} email failed`, err);
      return { sent: false };
    }
  });
