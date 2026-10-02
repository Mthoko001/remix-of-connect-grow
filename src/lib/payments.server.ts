// Server-only Yoco + subscription activation helpers.
import { createHmac, timingSafeEqual } from "crypto";

const YOCO_API = "https://payments.yoco.com/api";

export function yocoSecretKey(): string {
  const key = process.env["YOCO_SECRET_KEY"];
  if (!key) throw new Error("Online payments aren't set up yet. Please try again later.");
  return key;
}

export async function createYocoCheckout(input: {
  amountCents: number;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
  metadata: Record<string, string>;
  idempotencyKey: string;
}): Promise<{ id: string; redirectUrl: string }> {
  const res = await fetch(`${YOCO_API}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${yoco SecretKeyPlaceholder()}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      amount: input.amountCents,
      currency: "ZAR",
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      failureUrl: input.failureUrl,
      metadata: input.metadata,
    }),
  });
  if (!res.ok) {
    console.error("Yoco checkout failed", res.status, (await res.text()).slice(0, 300));
    throw new Error("We couldn't start the payment. Please try again.");
  }
  const body = (await res.json()) as { id?: string; redirectUrl?: string };
  if (!body.id || !body.redirectUrl) throw new Error("We couldn't start the payment. Please try again.");
  return { id: body.id, redirectUrl: body.redirectUrl };
}

/** Verifies a Yoco (Standard Webhooks) signature. */
export function verifyYocoSignature(headers: Headers, rawBody: string): boolean {
  const secret = process.env["YOCO_WEBHOOK_SECRET"];
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!secret || !id || !timestamp || !signatureHeader) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest("base64");
  const exp = Buffer.from(expected);
  return signatureHeader.split(" ").some((part) => {
    const sig = Buffer.from(part.split(",")[1] ?? "");
    return sig.length === exp.length && timingSafeEqual(sig, exp);
  });
}
