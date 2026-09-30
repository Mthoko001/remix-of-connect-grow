import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useAdminSession } from "@/hooks/use-admin-session";
import { usePackages } from "@/hooks/use-packages";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createPackage,
  formatDuration,
  formatRand,
  updatePackage,
  type PackageInput,
  type SubscriptionPackage,
} from "@/lib/packages";

export const Route = createFileRoute("/admin/packages")({
  head: () => ({
    meta: [{ title: "Packages — GrowMeOnline Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPackagesPage,
});

const EMPTY: PackageInput = {
  name: "",
  description: "",
  price: 0,
  durationMonths: 12,
  benefits: [],
  isActive: true,
  sortOrder: 0,
};

function AdminPackagesPage() {
  const { email, checking } = useAdminSession();
  const { packages, loading, error, reload } = usePackages({ all: true, enabled: !checking });
  const [editing, setEditing] = useState<SubscriptionPackage | "new" | null>(null);

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <AdminShell email={email}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Packages
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Subscription packages and prices shown to suppliers. Changes apply immediately.
          </p>
        </div>
        <Button onClick={() => setEditing("new")} className="gap-2">
          <Plus className="h-4 w-4" /> New package
        </Button>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading packages…</p>
      ) : error ? (
        <p className="py-12 text-center text-sm text-destructive">{error}</p>
      ) : packages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No packages yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {packages.map((p) => (
            <div key={p.packageId} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {formatRand(p.price)}
                    <span className="text-sm font-medium text-muted-foreground">
                      {" "}
                      / {formatDuration(p.durationMonths)}
                    </span>
                  </p>
                </div>
                {p.isActive ? (
                  <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
              {p.description && (
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                {p.benefits.length} benefits · Created{" "}
                {new Date(p.dateCreated).toLocaleDateString()} · Updated{" "}
                {new Date(p.dateUpdated).toLocaleString()}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => setEditing(p)}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <PackageDialog
          pkg={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void reload();
          }}
        />
      )}
    </AdminShell>
  );
}

function PackageDialog({
  pkg,
  onClose,
  onSaved,
}: {
  pkg: SubscriptionPackage | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<PackageInput>(pkg ? { ...pkg } : EMPTY);
  const [benefitsText, setBenefitsText] = useState((pkg?.benefits ?? []).join("\n"));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function set<K extends keyof PackageInput>(key: K, value: PackageInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!form.name.trim()) return setFormError("Enter a package name.");
    if (!Number.isFinite(form.price) || form.price < 0) return setFormError("Enter a valid price.");
    if (!Number.isInteger(form.durationMonths) || form.durationMonths < 1)
      return setFormError("Duration must be at least 1 month.");
    setFormError(null);
    setSaving(true);
    const input: PackageInput = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      benefits: benefitsText
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
    };
    try {
      if (pkg) await updatePackage(pkg.packageId, input);
      else await createPackage(input);
      toast.success(pkg ? "Package updated." : "Package created.");
      onSaved();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't save package.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{pkg ? "Edit package" : "New package"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pk_name">Name</Label>
            <Input id="pk_name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pk_desc">Description</Label>
            <Textarea
              id="pk_desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pk_price">Price (R)</Label>
              <Input
                id="pk_price"
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pk_dur">Months</Label>
              <Input
                id="pk_dur"
                type="number"
                min={1}
                value={form.durationMonths}
                onChange={(e) => set("durationMonths", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pk_sort">Order</Label>
              <Input
                id="pk_sort"
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pk_benefits">Benefits (one per line)</Label>
            <Textarea
              id="pk_benefits"
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="pk_active"
              checked={form.isActive}
              onCheckedChange={(v) => set("isActive", v)}
            />
            <Label htmlFor="pk_active">Active (visible to suppliers)</Label>
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
