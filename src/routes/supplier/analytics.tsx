import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, LineChart } from "lucide-react";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import {
  DashboardShell,
  MetricCard,
  PageHeader,
  Panel,
} from "@/components/supplier/dashboard-shell";

export const Route = createFileRoute("/supplier/analytics")({
  head: () => ({
    meta: [{ title: "Analytics — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierAnalyticsPage,
});

function SupplierAnalyticsPage() {
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
        title="Analytics"
        subtitle="Track how customers are finding and engaging with your business."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Profile Views" value="0" />
        <MetricCard label="Enquiries" value="0" />
        <MetricCard label="Conversion Rate" value="—" />
        <MetricCard label="Response Rate" value="—" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Profile views over time">
          <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-center">
            <LineChart className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Chart data will appear here</p>
          </div>
        </Panel>
        <Panel title="Enquiries by month">
          <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-center">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Chart data will appear here</p>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
