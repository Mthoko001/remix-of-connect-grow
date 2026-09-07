import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import { DashboardShell, PageHeader, Panel } from "@/components/supplier/dashboard-shell";
import { Button } from "@/components/ui/button";
import { fetchMyAccountStatus, type SupplierAccountStatus } from "@/lib/supplier-profile";

export const Route = createFileRoute("/supplier/subscription")({
  head: () => ({
    meta: [{ title: "Subscription — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierSubscriptionPage,
});

function SupplierSubscriptionPage() {
  const { checking } = useSupplierSession();
  const [status, setStatus] = useState<SupplierAccountStatus | null>(null);

  useEffect(() => {
    if (checking) return;
    fetchMyAccountStatus()
      .then(setStatus)
      .catch(() => setStatus("pending"));
  }, [checking]);

  if (checking || status === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const verified = status === "verified";

  // No real payment processing yet — this just unlocks the button once an
  // admin has verified the profile, matching the "coming soon" pattern used
  // elsewhere in the app until billing is wired up.
  function handlePayNow() {
    toast("Payment is coming soon.", {
      description: "We'll notify you as soon as it's ready.",
    });
  }

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
          <Button
            onClick={verified ? handlePayNow : undefined}
            disabled={!verified}
            className="w-full gap-2 sm:w-auto"
          >
            Pay Now
          </Button>
        </div>

        {status === "pending" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Available once your profile is verified. We're reviewing it now.
          </p>
        )}
        {status === "rejected" && (
          <p className="mt-4 text-sm text-destructive">
            Your profile wasn't approved. Please review and update your Business Profile, then check
            back — you'll be able to subscribe once it's verified.
          </p>
        )}
        {verified && (
          <p className="mt-4 text-sm text-emerald-700">
            Your profile is verified — you're all set to subscribe.
          </p>
        )}
      </Panel>
    </DashboardShell>
  );
}
