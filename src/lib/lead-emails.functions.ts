import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Sends the post-review emails (supplier on approval, customer on rejection). Admin only. */
export const sendLeadDecisionNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ enquiryId: z.number().int().positive() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });
    const { sendLeadDecisionEmails } = await import("@/lib/lead-emails.server");
    return sendLeadDecisionEmails(data.enquiryId);
  });
