import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import { DashboardShell, Panel } from "@/components/supplier/dashboard-shell";
import { formatRand } from "@/lib/packages";
import { fetchSubscriptionById, formatDate, type SubscriptionRow } from "@/lib/subscription";

export const Route = createFileRoute("/payment/success")({
  validateSearch: z.object({ ref: z.coerce.number().optional() }),
  head: () => ({
    meta: [{ title: "Payment Successful — GrowMeOnline" }, { name: "robots", content: "noindex" }],
  }),
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const { ref } = Route.useSearch();
  const { checking } = useSupplierSession();
  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [gaveUp, setGaveUp] = useState(false);

  // The payment is confirmed by the gateway in the background — poll until it lands.
  useEffect(() => {
    if (checking || !ref) return;
    let tries = 0;
    let active = true;
    const tick = async () => {
      const row = await fetchSubscriptionById(ref).catch(() => null);
      if (!active) return;
      setSub(row);
      if (row?.subscription_status === "paid" || row?.subscription_status === "failed") return;
      if (++tries >= 20) return setGaveUp(true);
      setTimeout(() => void tick(), 3000);
    };
    void tick();
    return () => {
      active = false;
    };
  }, [checking, ref]);

  const paid = sub?.subscription_status === "paid";

  return (
    <DashboardShell>
      <Panel>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          {paid ? (
            <>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Payment Successful</h1>
              <p className="text-sm text-muted-foreground">Your subscription has been activated successfully.</p>
              <dl className="mt-4 grid w-full max-w-md grid-cols-2 gap-3 text-left text-sm">
                <dt className="text-muted-foreground">Package</dt>
                <dd className="font-medium text-foreground">{sub?.tb_package?.name ?? "Subscription"}</dd>
                <dt className="text-muted-foreground">Amount Paid</dt>
                <dd className="font-medium text-foreground">{formatRand(Number(sub?.amount ?? 0))}</dd>
                <dt className="text-muted-foreground">Start Date</dt>
                <dd className="font-medium text-foreground">{formatDate(sub?.starts_at)}</dd>
                <dt className="text-muted-foreground">Expiry Date</dt>
                <dd className="font-medium text-foreground">{formatDate(sub?.expires_at)}</dd>
              </dl>
            </>
          ) : sub?.subscription_status === "failed" ? (
            <>
              <h1 className="text-xl font-bold text-foreground">Payment Failed</h1>
              <p className="text-sm text-muted-foreground">Your payment was not completed.</p>
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <h1 className="text-lg font-semibold text-foreground">Confirming your payment…</h1>
              <p className="max-w-sm text-sm text-muted-foreground">
                {gaveUp
                  ? "This is taking longer than usual. Your subscription will activate automatically once the payment is confirmed — check your Subscription page shortly."
                  : "This usually takes a few seconds."}
              </p>
            </>
          )}
          <Link to="/supplier/subscription" className="mt-4 text-sm font-semibold text-brand hover:underline">
            Go to Subscription
          </Link>
        </div>
      </Panel>
    </DashboardShell>
  );
}
