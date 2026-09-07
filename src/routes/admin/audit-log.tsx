import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader, Panel } from "@/components/supplier/dashboard-shell";

export const Route = createFileRoute("/admin/audit-log")({
  head: () => ({
    meta: [{ title: "Audit Log — LeadLink Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AuditLogPage,
});

function AuditLogPage() {
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
        title="Audit Log"
        subtitle="A read-only history of every admin action taken on this platform."
      />
      <Panel>
        <div className="px-6 py-12 text-center">
          <History className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Not built yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This will list every logged action with the admin, action type, and affected supplier,
            filterable by type and date.
          </p>
        </div>
      </Panel>
    </AdminShell>
  );
}
