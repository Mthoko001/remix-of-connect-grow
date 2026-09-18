import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SubscriptionRow = Tables<"tb_subscription">;

const TEST_PLAN_AMOUNT = 5.0; // R5 — test-mode price. Real price: R1,200/year.

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in.");
  return data.user.id;
}

/** The supplier's most recent subscription record, if any. */
export async function fetchMySubscription(): Promise<SubscriptionRow | null> {
  const supplierAccountId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("tb_subscription")
    .select("*")
    .eq("supplier_account_id", supplierAccountId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Creates a TEST-MODE "paid" subscription record — no real payment gateway
 * involved, no real money moves. is_test stays true so this is always
 * distinguishable from a real transaction once a real gateway is wired up.
 */
export async function createTestSubscription(): Promise<SubscriptionRow> {
  const supplierAccountId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("tb_subscription")
    .insert({
      supplier_account_id: supplierAccountId,
      amount: TEST_PLAN_AMOUNT,
      subscription_status: "paid",
      is_test: true,
      paid_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export function testPlanAmountDisplay(): string {
  return `R${TEST_PLAN_AMOUNT.toFixed(2)}`;
}
