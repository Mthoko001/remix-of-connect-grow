import { createFileRoute } from "@tanstack/react-router";

type YocoEvent = {
  id?: string;
  type?: string;
  payload?: {
    id?: string;
    amount?: number;
    status?: string;
    metadata?: Record<string, string>;
  };
};

/** Yoco webhook: the only place a subscription becomes 'paid'. */
export const Route = createFileRoute("/api/public/yoco-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const { verifyYocoSignature } = await import("@/lib/payments.server");
        if (!verifyYocoSignature(request.headers, raw)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: YocoEvent;
        try {
          event = JSON.parse(raw) as YocoEvent;
        } catch {
          return new Response("Bad payload", { status: 400 });
        }
        const checkoutId = event.payload?.metadata?.["checkoutId"];
        const subscriptionId = Number(event.payload?.metadata?.["subscriptionId"]);
        if (!checkoutId && !Number.isSafeInteger(subscriptionId)) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let query = supabaseAdmin
          .from("tb_subscription")
          .select("subscription_id, supplier_account_id, amount, subscription_status, package_id, gateway_reference");
        query = checkoutId ? query.eq("gateway_reference", checkoutId) : query.eq("subscription_id", subscriptionId);
        const { data: sub } = await query.maybeSingle();
        if (!sub) return new Response("ok");
        if (sub.subscription_status === "paid") return new Response("ok"); // idempotent

        const { data: account } = await supabaseAdmin
          .from("tb_supplier_account")
          .select("email")
          .eq("supplier_account_id", sub.supplier_account_id)
          .maybeSingle();
        const { data: pkg } = await supabaseAdmin
          .from("tb_package")
          .select("name, duration_months")
          .eq("package_id", sub.package_id ?? -1)
          .maybeSingle();
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");

        if (event.type === "payment.succeeded") {
          if (event.payload?.amount !== Math.round(Number(sub.amount) * 100)) {
            console.error("Yoco amount mismatch for subscription", sub.subscription_id);
            return new Response("Amount mismatch", { status: 400 });
          }
          // Renewals extend from the current expiry if still active.
          const { data: current } = await supabaseAdmin
            .from("tb_subscription")
            .select("expires_at")
            .eq("supplier_account_id", sub.supplier_account_id)
            .eq("subscription_status", "paid")
            .gt("expires_at", new Date().toISOString())
            .order("expires_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          const now = new Date();
          const start = current?.expires_at ? new Date(current.expires_at) : now;
          const expires = new Date(start);
          expires.setMonth(expires.getMonth() + (pkg?.duration_months ?? 12));

          await supabaseAdmin
            .from("tb_subscription")
            .update({
              subscription_status: "paid",
              paid_at: now.toISOString(),
              starts_at: start.toISOString(),
              expires_at: expires.toISOString(),
              payment_reference: event.payload?.id ?? null,
              failure_reason: null,
              updated_at: now.toISOString(),
            })
            .eq("subscription_id", sub.subscription_id);

          if (account?.email) {
            await sendTemplateEmail("subscription-activated", account.email, {
              templateData: {
                packageName: pkg?.name,
                amount: Number(sub.amount).toFixed(2),
                expiresAt: expires.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }),
              },
              idempotencyKey: `subscription-activated-${sub.subscription_id}`,
            }).catch((e) => console.error("activation email failed", e));
          }
        } else if (event.type === "payment.failed") {
          await supabaseAdmin
            .from("tb_subscription")
            .update({ subscription_status: "failed", failure_reason: "Payment declined", updated_at: new Date().toISOString() })
            .eq("subscription_id", sub.subscription_id);
          if (account?.email) {
            await sendTemplateEmail("payment-failed", account.email, {
              templateData: { packageName: pkg?.name },
              idempotencyKey: `payment-failed-${sub.subscription_id}`,
            }).catch((e) => console.error("failure email failed", e));
          }
        }
        return new Response("ok");
      },
    },
  },
});
