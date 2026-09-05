import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Upload } from "lucide-react";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import { DashboardShell, PageHeader, Panel } from "@/components/supplier/dashboard-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/supplier/profile")({
  head: () => ({
    meta: [{ title: "Business Profile — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierProfilePage,
});

// NOTE: This form is a static visual layout only. Fields are disabled and
// there is no save/upload logic yet — that's a later prompt.
function SupplierProfilePage() {
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
        title="Business Profile"
        subtitle="This information appears on your public listing once you're verified."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Business details">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="business_name">Business Name</Label>
                <Input id="business_name" placeholder="e.g. Acme Plumbing Co." disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="business_description">Description</Label>
                <Textarea
                  id="business_description"
                  placeholder="Tell customers what you do and what makes you different."
                  disabled
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Street, suburb, city" disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cell_no">Cell Number</Label>
                <Input id="cell_no" placeholder="e.g. 082 123 4567" disabled />
              </div>
            </div>
          </Panel>

          <div className="flex justify-end">
            <Button disabled className="gap-2">
              Save changes
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Panel title="Business logo">
            <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="px-4 text-xs text-muted-foreground">Drag and drop or click to upload</p>
            </div>
          </Panel>

          <Panel title="Product images">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30"
                >
                  <ImagePlus className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Up to 6 images.</p>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
