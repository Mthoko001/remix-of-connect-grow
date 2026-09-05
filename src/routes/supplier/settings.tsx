import { createFileRoute } from "@tanstack/react-router";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import { DashboardShell, PageHeader, Panel } from "@/components/supplier/dashboard-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/supplier/settings")({
  head: () => ({
    meta: [{ title: "Settings — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierSettingsPage,
});

function SupplierSettingsPage() {
  const { email, checking } = useSupplierSession();

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <DashboardShell>
      <PageHeader title="Settings" subtitle="Manage your account." />

      <Panel title="Account">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="account_email">Email</Label>
            <Input id="account_email" value={email ?? ""} disabled readOnly />
          </div>
          <div>
            <Button variant="outline" disabled>
              Change password
            </Button>
          </div>
        </div>
      </Panel>
    </DashboardShell>
  );
}
