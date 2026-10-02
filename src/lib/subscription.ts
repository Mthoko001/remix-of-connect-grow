import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SubscriptionRow = Tables<"tb_subscription"> & {
  tb_package: { name: string } | null;
};

export type SubscriptionState = "active" | "expired" | "pending" | "failed" | "cancelled";

export function subscriptionState(row: Tables<"tb_subscription">): SubscriptionState {
  if (row.subscription_status === "paid") {
    const exp = row.expires_at ?? (row.paid_at ? addYear(row.paid_at) : null);
    return exp && new Date(exp) > new Date() ? "active" : "expired";
  }
  if (row.subscription_status === "failed") return "failed";
  if (row.subscription_status === "cancelled") return "cancelled";
  return "pending";
}

function addYear(iso: string): string {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

export const STATE_LABELS: Record<SubscriptionState, string> = {
  active: "Active",
  expired: "Expired",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function daysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

const SELECT = "*, tb_package(name)";

/** All of the signed-in supplier's subscription records, newest first. */
export async function fetchMySubscriptions(): Promise<SubscriptionRow[]> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in.");
  const { data, error } = await supabase
    .from("tb_subscription")
    .select(SELECT)
    .eq("supplier_account_id", u.user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SubscriptionRow[];
}

export async function fetchSubscriptionById(id: number): Promise<SubscriptionRow | null> {
  const { data, error } = await supabase
    .from("tb_subscription")
    .select(SELECT)
    .eq("subscription_id", id)
    .maybeSingle();
  if (error) throw error;
  return data as SubscriptionRow | null;
}

/** The currently active subscription, if any. */
export function currentSubscription(rows: SubscriptionRow[]): SubscriptionRow | null {
  return (
    rows
      .filter((r) => subscriptionState(r) === "active")
      .sort((a, b) => (b.expires_at ?? "").localeCompare(a.expires_at ?? ""))[0] ?? null
  );
}

/** Admin-only via RLS: every subscription with package name. */
export async function fetchAllSubscriptions(): Promise<SubscriptionRow[]> {
  const { data, error } = await supabase
    .from("tb_subscription")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SubscriptionRow[];
}
