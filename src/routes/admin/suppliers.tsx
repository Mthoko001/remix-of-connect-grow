import { createFileRoute } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader, Panel } from "@/components/supplier/dashboard-shell";

export const Route = createFileRoute("/admin/suppliers")({
  head: () => ({
    meta: [{ title: "Live Suppliers — LeadLink Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: LiveSuppliersPage,
});

function LiveSuppliersPage() {
  const { email, checking } = useAdminSession();

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <AdminShell email={email}>
      <PageHeader
        title="Live Suppliers"
        subtitle="Manage validated suppliers, their subscription status, and visibility."
      />
      <Panel>
        <div className="px-6 py-12 text-center">
          <Store className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Not built yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This will list validated suppliers with filters (All / Paid & Live / Validated but
            Unpaid / Rejected) and Suspend / Reinstate actions.
          </p>
        </div>
      </Panel>
    </AdminShell>
  );
}
