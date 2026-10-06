import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Starts a Yoco checkout for an active package. The subscription row is
 * created as 'pending' here and only becomes 'paid' via the verified webhook.
 */
export const startPackageCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ packageId: z.number().int().positive() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("tb_supplier_profile")
      .select("status")
      .eq("supplier_account_id", userId)
      .maybeSingle();
    if (profile?.status !== "validated") {
      throw new Error("You can subscribe once your business profile is verified.");
    }

    const { data: pkg } = await supabase
      .from("tb_package")
      .select("package_id, name, price, is_active")
      .eq("package_id", data.packageId)
      .eq("is_active", true)
      .maybeSingle();
    if (!pkg) throw new Error("That package is no longer available.");

    const amount = Number(pkg.price);
    const amountCents = Math.round(amount * 100);
    if (amountCents < 200) throw new Error("This package price is too low to charge online.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createYocoCheckout } = await import("@/lib/payments.server");

    const { data: sub, error } = await supabaseAdmin
      .from("tb_subscription")
      .insert({
        supplier_account_id: userId,
        package_id: pkg.package_id,
        amount,
        subscription_status: "pending",
        is_test: false,
        gateway: "yoco",
      })
      .select("subscription_id")
      .single();
    if (error || !sub) throw new Error("We couldn't start the payment. Please try again.");

    const origin = new URL(getRequest().url).origin;
    const ref = `GMO-${sub.subscription_id}`;
    try {
      const checkout = await createYocoCheckout({
        amountCents,
        successUrl: `${origin}/payment/success?ref=${sub.subscription_id}`,
        cancelUrl: `${origin}/payment/failed?ref=${sub.subscription_id}&reason=cancelled`,
        failureUrl: `${origin}/payment/failed?ref=${sub.subscription_id}`,
        metadata: { subscriptionId: String(sub.subscription_id), supplierAccountId: userId, reference: ref },
        idempotencyKey: ref,
      });
      await supabaseAdmin
        .from("tb_subscription")
        .update({ gateway_reference: checkout.id, payment_reference: ref, updated_at: new Date().toISOString() })
        .eq("subscription_id", sub.subscription_id);
      return { redirectUrl: checkout.redirectUrl };
    } catch (err) {
      await supabaseAdmin
        .from("tb_subscription")
        .update({ subscription_status: "failed", failure_reason: "Checkout could not be created" })
        .eq("subscription_id", sub.subscription_id);
      throw err;
    }
  });
