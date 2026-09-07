import { createFileRoute } from "@tanstack/react-router";
import { Tags } from "lucide-react";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader, Panel } from "@/components/supplier/dashboard-shell";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [{ title: "Categories — LeadLink Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
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
        title="Categories"
        subtitle="Manage the categories suppliers and search use to organize listings."
      />
      <Panel>
        <div className="px-6 py-12 text-center">
          <Tags className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Not built yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This will let you add, edit, and nest categories, and will feed the Business Profile
            form and Search page filters once wired up.
          </p>
        </div>
      </Panel>
    </AdminShell>
  );
}
