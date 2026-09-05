import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import { DashboardShell, PageHeader, Panel } from "@/components/supplier/dashboard-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/supplier/subscription")({
  head: () => ({
    meta: [{ title: "Subscription — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierSubscriptionPage,
});

function SupplierSubscriptionPage() {
  const { checking } = useSupplierSession();

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
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
          <Button disabled className="w-full sm:w-auto">
            Pay Now
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Available once your profile is verified.
        </p>
      </Panel>
    </DashboardShell>
  );
}
