/**
 * All customer WhatsApp enquiries currently route to a single LeadLink
 * number rather than each supplier's own number — the supplier's identity
 * is captured in the message text instead, since the receiving number
 * alone can't tell you which listing the enquiry was about.
 */
export const LEADLINK_WHATSAPP_NUMBER = "27818680007"; // 081 868 0007, intl format, no "+"

export type WhatsAppEnquiryDetails = {
  supplierName: string;
  customerName: string;
  email: string;
  cell: string;
  issue: string;
  hasImage: boolean;
};

/**
 * WhatsApp's click-to-chat links can only pre-fill text — there is no way
 * to attach a file via the URL. If the customer picked an image, we note
 * that in the message so the recipient expects it, and the customer attaches
 * it themselves once the chat opens.
 */
export function buildWhatsAppEnquiryMessage(details: WhatsAppEnquiryDetails): string {
  const lines = [
    `New enquiry via LeadLink for: ${details.supplierName}`,
    "",
    `Name: ${details.customerName}`,
    `Email: ${details.email}`,
    `Cell: ${details.cell}`,
    "",
    `Issue: ${details.issue}`,
  ];
  if (details.hasImage) {
    lines.push("", "📎 I have a photo of the issue — attaching it in this chat.");
  }
  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${LEADLINK_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
