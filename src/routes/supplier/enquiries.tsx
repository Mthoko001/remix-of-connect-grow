import { createFileRoute } from "@tanstack/react-router";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import {
  DashboardShell,
  EmptyState,
  PageHeader,
  Panel,
} from "@/components/supplier/dashboard-shell";

export const Route = createFileRoute("/supplier/enquiries")({
  head: () => ({
    meta: [{ title: "Enquiries — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierEnquiriesPage,
});

function SupplierEnquiriesPage() {
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
      <PageHeader
        title="Enquiries"
        subtitle="Messages from customers interested in your business."
      />

      <Panel>
        <EmptyState
          title="No enquiries yet"
          description="Enquiries from customers will appear here once your profile goes live."
        />
      </Panel>
    </DashboardShell>
  );
}
