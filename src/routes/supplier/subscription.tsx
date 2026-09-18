import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, ShoppingCart, Trash2 } from "lucide-react";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import { DashboardShell, PageHeader, Panel } from "@/components/supplier/dashboard-shell";
import { Button } from "@/components/ui/button";
import { fetchMyProfile, type SupplierProfileStatus } from "@/lib/supplier-profile";
import {
  fetchMySubscription,
  testPlanAmountDisplay,
  type SubscriptionRow,
} from "@/lib/subscription";

export const Route = createFileRoute("/supplier/subscription")({
  head: () => ({
    meta: [{ title: "Subscription — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierSubscriptionPage,
});

function SupplierSubscriptionPage() {
  const navigate = useNavigate();
  const { checking } = useSupplierSession();
  const [status, setStatus] = useState<SupplierProfileStatus | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    if (checking) return;
    Promise.all([fetchMyProfile(), fetchMySubscription()])
      .then(([profile, sub]) => {
        setStatus((profile?.status as SupplierProfileStatus) ?? "draft");
        setSubscription(sub);
      })
      .catch(() => setStatus("draft"))
      .finally(() => setLoading(false));
  }, [checking]);

  if (checking || loading || status === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const verified = status === "validated";
  const isPaid = subscription?.subscription_status === "paid";

  return (
    <DashboardShell>
      <PageHeader title="Subscription" subtitle="Manage your LeadLink supplier subscription." />

      <Panel>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Annual Plan</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                R1,200<span className="text-sm font-medium text-muted-foreground">/year</span>
              </p>
            </div>
          </div>

          {isPaid ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Active
            </span>
          ) : (
            <Button
              onClick={() => setInCart(true)}
              disabled={!verified || inCart}
              className="w-full gap-2 sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4" />
              {inCart ? "Added to Cart" : "Add to Cart"}
            </Button>
          )}
        </div>

        {(status === "draft" || status === "pending_verification") && (
          <p className="mt-4 text-sm text-muted-foreground">
            Available once your profile is verified.{" "}
            {status === "pending_verification"
              ? "We're reviewing it now."
              : "Submit your Business Profile for review to get started."}
          </p>
        )}
        {status === "rejected" && (
          <p className="mt-4 text-sm text-destructive">
            Your profile wasn't approved. Please review and update your Business Profile, then check
            back — you'll be able to subscribe once it's verified.
          </p>
        )}
        {verified && !isPaid && !inCart && (
          <p className="mt-4 text-sm text-emerald-700">
            Your profile is verified — you're all set to subscribe.
          </p>
        )}
        {isPaid && subscription?.paid_at && (
          <p className="mt-4 text-sm text-muted-foreground">
            Paid{" "}
            {new Date(subscription.paid_at).toLocaleDateString([], {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {subscription.is_test && " — test-mode payment, no real money was charged"}.
          </p>
        )}
      </Panel>

      {inCart && !isPaid && (
        <Panel title="Your Cart" className="mt-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Annual Plan</p>
              <p className="text-xs text-muted-foreground">1 × LeadLink Supplier Subscription</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">
                {testPlanAmountDisplay()}
              </span>
              <button
                type="button"
                onClick={() => setInCart(false)}
                aria-label="Remove from cart"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm font-semibold text-foreground">Total</p>
            <p className="text-lg font-bold text-foreground">{testPlanAmountDisplay()}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Test mode price, for testing the payment flow. The real Annual Plan is R1,200/year.
          </p>
          <Button
            onClick={() => navigate({ to: "/supplier/checkout" })}
            className="mt-4 w-full gap-2 sm:w-auto"
          >
            Proceed to Checkout
          </Button>
        </Panel>
      )}
    </DashboardShell>
  );
}
