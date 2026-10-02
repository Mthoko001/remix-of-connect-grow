import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { formatRand } from "@/lib/packages";
import {
  fetchAllSubscriptions,
  formatDate,
  STATE_LABELS,
  subscriptionState,
  type SubscriptionRow,
  type SubscriptionState,
} from "@/lib/subscription";

export const Route = createFileRoute("/admin/subscriptions")({
  head: () => ({
    meta: [{ title: "Subscriptions — GrowMeOnline Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminSubscriptionsPage,
});

type Filter = "all" | SubscriptionState;

function AdminSubscriptionsPage() {
  const { email, checking } = useAdminSession();
  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checking) return;
    Promise.all([
      fetchAllSubscriptions(),
      supabase.from("tb_supplier_profile").select("supplier_account_id, business_name, status"),
    ])
      .then(([subs, { data: profiles }]) => {
        setRows(subs);
        setNames(new Map((profiles ?? []).map((p) => [p.supplier_account_id, p.business_name])));
        setVerifiedCount((profiles ?? []).filter((p) => p.status === "validated").length);
      })
      .finally(() => setLoading(false));
  }, [checking]);

  const kpis = useMemo(() => {
    const real = rows.filter((r) => r.subscription_status === "paid" && !r.is_test);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const total = real.reduce((s, r) => s + Number(r.amount), 0);
    const monthly = real
      .filter((r) => r.paid_at && new Date(r.paid_at) >= monthStart)
      .reduce((s, r) => s + Number(r.amount), 0);
    const bySupplier = new Map<string, SubscriptionState>();
    for (const r of rows.filter((x) => x.subscription_status === "paid")) {
      const st = subscriptionState(r);
      if (st === "active" || !bySupplier.has(r.supplier_account_id)) bySupplier.set(r.supplier_account_id, st);
    }
    const active = [...bySupplier.values()].filter((s) => s === "active").length;
    const expired = [...bySupplier.values()].filter((s) => s === "expired").length;
    const payers = new Set(real.map((r) => r.supplier_account_id)).size;
    return {
      total,
      monthly,
      active,
      expired,
      conversion: verifiedCount ? `${((active / verifiedCount) * 100).toFixed(1)}%` : "—",
      arps: payers ? total / payers : 0,
    };
  }, [rows, verifiedCount]);

  const visible = rows.filter((r) => filter === "all" || subscriptionState(r) === filter);

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const cards = [
    { label: "Total Revenue", value: formatRand(kpis.total) },
    { label: "Revenue This Month", value: formatRand(kpis.monthly) },
    { label: "Active Subscribers", value: String(kpis.active) },
    { label: "Expired Subscribers", value: String(kpis.expired) },
    { label: "Conversion Rate", value: kpis.conversion },
    { label: "Avg Revenue / Supplier", value: formatRand(Math.round(kpis.arps)) },
  ];

  return (
    <AdminShell email={email}>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Subscriptions</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Supplier payments and subscription status. Revenue excludes test payments.
      </p>

      <div className="my-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mb-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment Date</th>
              <th className="px-4 py-3">Expiry Date</th>
              <th className="px-4 py-3">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((r) => (
              <tr key={r.subscription_id}>
                <td className="px-4 py-3 text-foreground">{names.get(r.supplier_account_id) || "—"}</td>
                <td className="px-4 py-3 text-foreground">{r.tb_package?.name ?? "—"}</td>
                <td className="px-4 py-3 text-foreground">
                  {STATE_LABELS[subscriptionState(r)]}
                  {r.is_test && " (test)"}
                </td>
                <td className="px-4 py-3 text-foreground">{formatRand(Number(r.amount))}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(r.paid_at)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(r.expires_at)}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {r.payment_reference ?? r.gateway_reference ?? "—"}
                </td>
              </tr>
            ))}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No subscriptions here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
