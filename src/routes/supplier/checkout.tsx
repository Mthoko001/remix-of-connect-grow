import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import { DashboardShell, PageHeader, Panel } from "@/components/supplier/dashboard-shell";
import { Button } from "@/components/ui/button";
import { fetchMyProfile, type SupplierProfileStatus } from "@/lib/supplier-profile";
import {
  createTestSubscription,
  fetchMySubscription,
  testPlanAmountDisplay,
  type SubscriptionRow,
} from "@/lib/subscription";

export const Route = createFileRoute("/supplier/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierCheckoutPage,
});

function SupplierCheckoutPage() {
  const navigate = useNavigate();
  const { checking, email } = useSupplierSession();
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [status, setStatus] = useState<SupplierProfileStatus>("draft");
  const [existing, setExisting] = useState<SubscriptionRow | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (checking) return;
    Promise.all([fetchMyProfile(), fetchMySubscription()])
      .then(([profile, subscription]) => {
        setBusinessName(profile?.business_name || "");
        setStatus((profile?.status as SupplierProfileStatus) ?? "draft");
        setExisting(subscription);
      })
      .catch(() => setError("Couldn't load your checkout details."))
      .finally(() => setLoading(false));
  }, [checking]);

  async function handleConfirmPay() {
    setPaying(true);
    setError(null);
    try {
      await createTestSubscription();
      setPaid(true);
    } catch {
      setError("Couldn't process the test payment. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  if (checking || loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  // Guard against reaching checkout in an invalid state.
  if (status !== "validated") {
    return (
      <DashboardShell>
        <PageHeader title="Checkout" subtitle="Your profile needs to be verified first." />
        <Panel>
          <p className="text-sm text-muted-foreground">
            You can subscribe once your business profile is verified.
          </p>
          <Link
            to="/supplier/subscription"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Back to Subscription
          </Link>
        </Panel>
      </DashboardShell>
    );
  }

  if (existing?.subscription_status === "paid" && !paid) {
    return (
      <DashboardShell>
        <PageHeader title="Checkout" subtitle="You're already subscribed." />
        <Panel>
          <p className="text-sm text-muted-foreground">
            You already have an active subscription — no need to pay again.
          </p>
          <Link
            to="/supplier/subscription"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Back to Subscription
          </Link>
        </Panel>
      </DashboardShell>
    );
  }

  if (paid) {
    return (
      <DashboardShell>
        <PageHeader title="Checkout" />
        <Panel>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Test payment successful</p>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                Your subscription is now active. This was a test-mode payment (
                {testPlanAmountDisplay()}) — no real money was charged.
              </p>
            </div>
            <Button onClick={() => navigate({ to: "/supplier/subscription" })} className="mt-2">
              Back to Subscription
            </Button>
          </div>
        </Panel>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader title="Checkout" subtitle="Review your order and confirm payment." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Order Summary">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Annual Plan</p>
                  <p className="text-xs text-muted-foreground">
                    1 × LeadLink Supplier Subscription
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">{testPlanAmountDisplay()}</p>
            </div>
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm font-semibold text-foreground">Total</p>
              <p className="text-lg font-bold text-foreground">{testPlanAmountDisplay()}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Test mode price. The real Annual Plan is R1,200/year — this checkout is for testing
              the payment flow only.
            </p>
          </Panel>

          <Panel title="Billing Details">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business</span>
                <span className="font-medium text-foreground">{businessName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{email || "—"}</span>
              </div>
            </div>
          </Panel>
        </div>

        <div>
          <Panel title="Payment">
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-800">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Test mode — no real card details required, no real payment processed.
            </div>
            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
            <Button
              onClick={() => void handleConfirmPay()}
              disabled={paying}
              className="w-full gap-2"
            >
              {paying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {paying ? "Processing…" : `Confirm & Pay ${testPlanAmountDisplay()} (Test Mode)`}
            </Button>
            <Link
              to="/supplier/subscription"
              className="mt-3 block text-center text-xs text-muted-foreground hover:underline"
            >
              Cancel and go back
            </Link>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
