import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader, Panel } from "@/components/supplier/dashboard-shell";

export const Route = createFileRoute("/admin/verification")({
  head: () => ({
    meta: [
      { title: "Verification Queue — LeadLink Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerificationQueuePage,
});

function VerificationQueuePage() {
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
        title="Verification Queue"
        subtitle="Review pending supplier profiles and approve or reject them."
      />
      <Panel>
        <div className="px-6 py-12 text-center">
          <ClipboardCheck className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Not built yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This will list every pending profile, oldest first, with a detail view and Approve /
            Reject actions.
          </p>
        </div>
      </Panel>
    </AdminShell>
  );
}
