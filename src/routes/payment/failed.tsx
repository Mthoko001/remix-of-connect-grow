import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { z } from "zod";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import { DashboardShell, Panel } from "@/components/supplier/dashboard-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment/failed")({
  validateSearch: z.object({ ref: z.coerce.number().optional(), reason: z.string().optional() }),
  head: () => ({
    meta: [{ title: "Payment Failed — GrowMeOnline" }, { name: "robots", content: "noindex" }],
  }),
  component: PaymentFailedPage,
});

function PaymentFailedPage() {
  const { reason } = Route.useSearch();
  useSupplierSession();
  return (
    <DashboardShell>
      <Panel>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-destructive/10">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Payment Failed</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            {reason === "cancelled"
              ? "You cancelled the payment, so your subscription was not activated."
              : "Your payment was not completed. No subscription was activated and no money was taken."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/supplier/subscription">Retry Payment</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/supplier/subscription">Back to Subscription</Link>
            </Button>
          </div>
        </div>
      </Panel>
    </DashboardShell>
  );
}
