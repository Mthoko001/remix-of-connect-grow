import { createFileRoute } from "@tanstack/react-router";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import {
  DashboardShell,
  EmptyState,
  PageHeader,
  Panel,
} from "@/components/supplier/dashboard-shell";

export const Route = createFileRoute("/supplier/reviews")({
  head: () => ({
    meta: [{ title: "Reviews — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierReviewsPage,
});

function SupplierReviewsPage() {
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
      <PageHeader title="Reviews" subtitle="See what customers are saying about your business." />

      <Panel>
        <EmptyState
          title="No reviews yet"
          description="Customer reviews will show up here once you start receiving them."
        />
      </Panel>
    </DashboardShell>
  );
}
