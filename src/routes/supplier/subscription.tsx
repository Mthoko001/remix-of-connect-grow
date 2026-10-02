import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, CheckCircle2, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import {
  DashboardShell,
  EmptyState,
  MetricCard,
  PageHeader,
  Panel,
} from "@/components/supplier/dashboard-shell";
import { Button } from "@/components/ui/button";
import { usePackages } from "@/hooks/use-packages";
import { formatDuration, formatRand } from "@/lib/packages";
import { fetchMyProfile, type SupplierProfileStatus } from "@/lib/supplier-profile";
import {
  currentSubscription,
  daysRemaining,
  fetchMySubscriptions,
  formatDate,
  STATE_LABELS,
  subscriptionState,
  type SubscriptionRow,
} from "@/lib/subscription";
import { startPackageCheckout } from "@/lib/payments.functions";

export const Route = createFileRoute("/supplier/subscription")({
  head: () => ({
    meta: [{ title: "Subscription — GrowMeOnline" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierSubscriptionPage,
});

function SupplierSubscriptionPage() {
  const { checking } = useSupplierSession();
  const [status, setStatus] = useState<SupplierProfileStatus | null>(null);
  const [history, setHistory] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const { packages } = usePackages({ enabled: !checking });
  const startCheckout = useServerFn(startPackageCheckout);

  useEffect(() => {
    if (checking) return;
    Promise.all([fetchMyProfile(), fetchMySubscriptions()])
      .then(([profile, subs]) => {
        setStatus((profile?.status as SupplierProfileStatus) ?? "draft");
        setHistory(subs);
      })
      .catch(() => setStatus("draft"))
      .finally(() => setLoading(false));
  }, [checking]);

  async function choose(packageId: number) {
    setPayingId(packageId);
    try {
      const { redirectUrl } = await startCheckout({ data: { packageId } });
      window.location.href = redirectUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We couldn't start the payment.");
      setPayingId(null);
    }
  }

  if (checking || loading || status === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const verified = status === "validated";
  const current = currentSubscription(history);
  const lastPaid = history.find((h) => h.subscription_status === "paid");
  const expired = !current && lastPaid;

  return (
    <DashboardShell>
      <PageHeader
        title="Subscription"
        subtitle="Your first 5 customer enquiries are free. After that, an active subscription is needed to keep receiving new enquiries."
      />

      {current ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Current Plan" value={current.tb_package?.name ?? "Subscription"} />
          <MetricCard label="Status" value="Active" />
          <MetricCard label="Expiry Date" value={formatDate(current.expires_at)} hint={`Started ${formatDate(current.starts_at)}`} />
          <MetricCard label="Days Remaining" value={String(daysRemaining(current.expires_at) ?? "—")} />
        </div>
      ) : expired ? (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-foreground">
          Your subscription expired on {formatDate(lastPaid.expires_at)}. Renew below to keep receiving new enquiries.
        </div>
      ) : null}

      {!verified && (
        <p className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {status === "rejected"
            ? "Your profile wasn't approved. Update your Business Profile and resubmit — you can subscribe once it's verified."
            : "Packages become available once your business profile is verified."}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <div
            key={pkg.packageId}
            className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm ${
              pkg.isRecommended ? "border-brand ring-1 ring-brand" : "border-border/60"
            }`}
          >
            {pkg.isRecommended && (
              <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-brand-foreground">
                <Star className="h-3 w-3" /> Recommended
              </span>
            )}
            <p className="text-base font-semibold text-foreground">{pkg.name}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {formatRand(pkg.price)}
              <span className="text-sm font-medium text-muted-foreground">/{formatDuration(pkg.durationMonths)}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Billed once · valid for {pkg.durationMonths} {pkg.durationMonths === 1 ? "month" : "months"}
            </p>
            {pkg.description && <p className="mt-3 text-sm text-muted-foreground">{pkg.description}</p>}
            <ul className="mt-4 flex-1 space-y-2">
              {pkg.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {b}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full gap-2"
              disabled={!verified || payingId !== null}
              onClick={() => void choose(pkg.packageId)}
            >
              {payingId === pkg.packageId && <Loader2 className="h-4 w-4 animate-spin" />}
              {payingId === pkg.packageId ? "Redirecting to payment…" : current ? "Renew / extend" : "Choose package"}
            </Button>
          </div>
        ))}
      </div>
      {packages.length === 0 && (
        <EmptyState title="No packages available" description="Please check back soon." />
      )}

      <Panel title="Subscription history" className="mt-6">
        {history.length === 0 ? (
          <EmptyState title="No payments yet" description="Your subscription payments will show here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4">Package</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Paid</th>
                  <th className="py-2">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((h) => {
                  const state = subscriptionState(h);
                  return (
                    <tr key={h.subscription_id}>
                      <td className="py-2 pr-4 text-foreground">{h.tb_package?.name ?? "Subscription"}</td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center gap-1 text-foreground">
                          {state === "active" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                          {STATE_LABELS[state]}
                          {h.is_test && " (test)"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-foreground">{formatRand(Number(h.amount))}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{formatDate(h.paid_at)}</td>
                      <td className="py-2 text-muted-foreground">{formatDate(h.expires_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </DashboardShell>
  );
}
