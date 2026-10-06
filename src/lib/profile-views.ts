import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "gmo_visitor_id";
const BOT_PATTERN = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp/i;

function visitorId(): string {
  let id = window.localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/** Records a public profile view. Dedupe, self/admin exclusion happen in the database. */
export async function recordProfileView(supplierAccountId: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (navigator.webdriver || BOT_PATTERN.test(navigator.userAgent)) return;
  try {
    await supabase.rpc("record_profile_view", {
      _supplier_account_id: supplierAccountId,
      _visitor_id: visitorId(),
    });
  } catch {
    // View tracking must never break the profile page.
  }
}

export type DailyViews = { day: string; views: number };
export type ProfileViewStats = {
  total: number;
  thisMonth: number;
  lastMonth: number;
  thisWeek: number;
  daily: DailyViews[];
};

export async function fetchMyProfileViewStats(): Promise<ProfileViewStats> {
  const { data, error } = await supabase.rpc("get_my_profile_view_stats");
  if (error) throw error;
  const row = data?.[0];
  return {
    total: row?.total_views ?? 0,
    thisMonth: row?.views_this_month ?? 0,
    lastMonth: row?.views_last_month ?? 0,
    thisWeek: row?.views_this_week ?? 0,
    daily: (row?.daily as DailyViews[] | null) ?? [],
  };
}

/** Month-over-month change in %, or null when last month has no data. */
export function monthOverMonth(stats: ProfileViewStats): number | null {
  if (stats.lastMonth === 0) return null;
  return Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100);
}

export type TopViewedSupplier = {
  supplierAccountId: string;
  businessName: string;
  totalViews: number;
  viewsThisMonth: number;
};

export async function fetchTopProfileViews(): Promise<{
  platformTotal: number;
  top: TopViewedSupplier[];
}> {
  const { data, error } = await supabase.rpc("admin_top_profile_views", { _limit: 10 });
  if (error) throw error;
  const rows = data ?? [];
  return {
    platformTotal: rows[0]?.platform_total ?? 0,
    top: rows.map((r) => ({
      supplierAccountId: r.supplier_account_id,
      businessName: r.business_name || "Unnamed supplier",
      totalViews: r.total_views,
      viewsThisMonth: r.views_this_month,
    })),
  };
}
