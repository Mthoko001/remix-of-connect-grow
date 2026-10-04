import { rejectionReasonLabel } from "@/lib/lead-review";

// Server-only. All sends are best-effort: email problems never block a lead.
async function send(
  template: string,
  to: string,
  templateData: Record<string, unknown>,
  idempotencyKey: string,
) {
  try {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    await sendTemplateEmail(template, to, { templateData, idempotencyKey });
  } catch (err) {
    console.error(`${template} email failed`, err);
  }
}

/** Customer "Enquiry Received" + admin "New Enquiry Pending Review". */
export async function sendEnquirySubmittedEmails(input: {
  enquiryId: number;
  customerName: string;
  customerEmail: string;
  supplierName: string;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await send(
    "enquiry-received",
    input.customerEmail,
    { customerName: input.customerName },
    `enquiry-received-${input.enquiryId}`,
  );
  const { data: admins } = await supabaseAdmin
    .from("tb_admin_account")
    .select("email")
    .eq("is_active", true);
  for (const admin of admins ?? []) {
    await send(
      "enquiry-pending-review",
      admin.email,
      { supplierName: input.supplierName },
      `enquiry-pending-${input.enquiryId}-${admin.email}`,
    );
  }
}

/** After an admin decision: supplier gets "New Qualified Lead", customer gets "Enquiry Update" on rejection. */
export async function sendLeadDecisionEmails(enquiryId: number) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: enquiry } = await supabaseAdmin
    .from("tb_enquiry")
    .select(
      "enquiry_id, status, supplier_account_id, customer_name, customer_email, rejection_reason, reviewed_at",
    )
    .eq("enquiry_id", enquiryId)
    .maybeSingle();
  if (!enquiry) return { sent: false };

  if (enquiry.status === "qualified") {
    const { data: account } = await supabaseAdmin
      .from("tb_supplier_account")
      .select("email")
      .eq("supplier_account_id", enquiry.supplier_account_id)
      .maybeSingle();
    const { data: profile } = await supabaseAdmin
      .from("tb_supplier_profile")
      .select("business_name")
      .eq("supplier_account_id", enquiry.supplier_account_id)
      .maybeSingle();
    if (!account?.email) return { sent: false };
    await send(
      "lead-qualified",
      account.email,
      { businessName: profile?.business_name },
      `lead-qualified-${enquiryId}`,
    );
    return { sent: true };
  }

  if (enquiry.status === "rejected") {
    await send(
      "enquiry-rejected",
      enquiry.customer_email,
      {
        customerName: enquiry.customer_name,
        reason: rejectionReasonLabel(enquiry.rejection_reason),
      },
      `enquiry-rejected-${enquiryId}`,
    );
    return { sent: true };
  }
  return { sent: false };
}
