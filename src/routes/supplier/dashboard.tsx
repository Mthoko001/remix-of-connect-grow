import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import {
  DashboardShell,
  EmptyState,
  MetricCard,
  PageHeader,
  Panel,
} from "@/components/supplier/dashboard-shell";

export const Route = createFileRoute("/supplier/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierDashboardPage,
});

function SupplierDashboardPage() {
  const navigate = useNavigate();
  const { email, checking } = useSupplierSession();

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        title={`Welcome back${email ? `, ${email}` : ""}`}
        subtitle="Here's what's happening with your business on LeadLink."
      />

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-brand/20 bg-brand/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Complete your business profile to get verified
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Verified suppliers get a badge and appear higher in search results.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/supplier/profile" })}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand to-brand-glow px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:shadow-brand/40 hover:brightness-105 active:scale-[0.99]"
        >
          Complete profile
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Profile Views" value="0" />
        <MetricCard label="Enquiries" value="0" />
        <MetricCard label="Conversion Rate" value="—" />
        <MetricCard label="Subscription Status" value="Unpaid" />
      </div>

      <Panel title="Recent enquiries" className="mt-6">
        <EmptyState
          title="No enquiries yet"
          description="When customers reach out, they'll show up here."
        />
      </Panel>
    </DashboardShell>
  );
}
