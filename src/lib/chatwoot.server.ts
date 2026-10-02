// Server-only Chatwoot client. Reads CHATWOOT_URL, CHATWOOT_ACCOUNT_ID, CHATWOOT_API_TOKEN.
const INBOX_NAMES = ["growmeonline leads", "leadlink leads"];

export type ChatwootLead = {
  enquiryId: number;
  supplierId: string;
  supplierName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  message: string;
};

function config() {
  const url = process.env["CHATWOOT_URL"]?.replace(/\/+$/, "");
  const accountId = process.env["CHATWOOT_ACCOUNT_ID"];
  const token = process.env["CHATWOOT_API_TOKEN"];
  if (!url || !accountId || !token) throw new Error("Chatwoot is not configured.");
  return { base: `${url}/api/v1/accounts/${accountId}`, token };
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { base, token } = config();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", api_access_token: token, ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`Chatwoot ${init.method ?? "GET"} ${path} failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/** South African numbers to E.164; anything else unusable is dropped. */
function toE164(phone: string): string | undefined {
  const digits = phone.replace(/[^\d+]/g, "");
  if (/^\+\d{8,15}$/.test(digits)) return digits;
  if (/^0\d{9}$/.test(digits)) return `+27${digits.slice(1)}`;
  if (/^27\d{9}$/.test(digits)) return `+${digits}`;
  return undefined;
}

async function findInboxId(): Promise<number> {
  const res = await call<{ payload: { id: number; name: string }[] }>("/inboxes");
  const inbox = res.payload.find((i) => INBOX_NAMES.includes(i.name.trim().toLowerCase()));
  if (!inbox) throw new Error("Chatwoot leads inbox not found.");
  return inbox.id;
}

async function findOrCreateContact(lead: ChatwootLead, inboxId: number): Promise<number> {
  const phone = toE164(lead.customerPhone);
  for (const q of [lead.customerEmail, phone].filter(Boolean) as string[]) {
    const found = await call<{ payload: { id: number; email?: string; phone_number?: string }[] }>(
      `/contacts/search?q=${encodeURIComponent(q)}`,
    );
    const match = found.payload.find(
      (c) => c.email?.toLowerCase() === lead.customerEmail.toLowerCase() || (phone && c.phone_number === phone),
    );
    if (match) return match.id;
  }
  const created = await call<{ payload: { contact: { id: number } } }>("/contacts", {
    method: "POST",
    body: JSON.stringify({
      inbox_id: inboxId,
      name: lead.customerName,
      email: lead.customerEmail,
      ...(phone ? { phone_number: phone } : {}),
    }),
  });
  return created.payload.contact.id;
}

/** Creates a conversation in the LeadLink Leads inbox and posts the enquiry as an incoming message. */
export async function pushLeadToChatwoot(lead: ChatwootLead): Promise<number> {
  const inboxId = await findInboxId();
  const contactId = await findOrCreateContact(lead, inboxId);
  const conversation = await call<{ id: number }>("/conversations", {
    method: "POST",
    body: JSON.stringify({
      inbox_id: inboxId,
      contact_id: contactId,
      additional_attributes: { enquiry_id: lead.enquiryId },
      custom_attributes: { supplier_id: lead.supplierId, supplier_name: lead.supplierName },
    }),
  });
  const content = [
    "NEW LEAD",
    "",
    `Supplier: ${lead.supplierName}`,
    `Supplier ID: ${lead.supplierId}`,
    `Customer: ${lead.customerName}`,
    `Phone: ${lead.customerPhone}`,
    `Email: ${lead.customerEmail}`,
    "",
    "Message:",
    lead.message,
  ].join("\n");
  await call(`/conversations/${conversation.id}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, message_type: "incoming" }),
  });
  try {
    await call(`/conversations/${conversation.id}/labels`, {
      method: "POST",
      body: JSON.stringify({ labels: [`supplier_${lead.supplierId}`.toLowerCase(), "new_lead"] }),
    });
  } catch (err) {
    console.error("Chatwoot labels failed", err);
  }
  return conversation.id;
}
