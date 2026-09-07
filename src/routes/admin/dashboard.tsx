import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminMediaView } from "@/components/admin/admin-media-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchSupplierReviewRows,
  productImagePaths,
  setSupplierStatus,
  type SupplierReviewRow,
  type SupplierStatus,
} from "@/lib/admin-review";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDashboardPage,
});

const TABS: { value: "all" | SupplierStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

function AdminDashboardPage() {
  const { email, checking } = useAdminSession();
  const [rows, setRows] = useState<SupplierReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | SupplierStatus>("pending");
  const [selected, setSelected] = useState<SupplierReviewRow | null>(null);
  const [acting, setActing] = useState(false);

  async function loadRows() {
    setLoading(true);
    try {
      setRows(await fetchSupplierReviewRows());
    } catch {
      toast.error("Couldn't load supplier profiles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checking) void loadRows();
  }, [checking]);

  const filtered = useMemo(
    () => (tab === "all" ? rows : rows.filter((r) => r.status === tab)),
    [rows, tab],
  );

  const counts = useMemo(() => {
    const c: Record<"all" | SupplierStatus, number> = {
      all: rows.length,
      pending: 0,
      verified: 0,
      rejected: 0,
    };
    for (const r of rows) c[r.status] += 1;
    return c;
  }, [rows]);

  async function handleDecision(status: Extract<SupplierStatus, "verified" | "rejected">) {
    if (!selected) return;
    setActing(true);
    try {
      await setSupplierStatus(selected.supplier_account_id, status);
      toast.success(status === "verified" ? "Supplier verified." : "Supplier rejected.");
      setSelected(null);
      await loadRows();
    } catch {
      toast.error("Couldn't update this supplier. Try again.");
    } finally {
      setActing(false);
    }
  }

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <AdminShell email={email}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Review supplier profiles and approve them for verification.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-5">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
              {t.label}
              <span className="text-xs text-muted-foreground">{counts[t.value]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading suppliers…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm font-medium text-foreground">No suppliers here</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "pending"
              ? "Nothing is waiting for review right now."
              : "Nothing matches this filter yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row) => (
                <tr key={row.supplier_account_id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.profile?.business_name || (
                      <span className="italic text-muted-foreground">No profile yet</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelected(row)}
                      disabled={!row.profile}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {selected?.profile && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.profile.business_name}</DialogTitle>
                <DialogDescription>{selected.email}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selected.profile.business_logo && (
                  <div className="w-24">
                    <AdminMediaView path={selected.profile.business_logo} alt="Business logo" />
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm text-foreground">
                    {selected.profile.business_description || "—"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Address
                    </p>
                    <p className="text-sm text-foreground">{selected.profile.address || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Cell Number
                    </p>
                    <p className="text-sm text-foreground">{selected.profile.cell_no || "—"}</p>
                  </div>
                </div>

                {productImagePaths(selected.profile.product_images).length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Product Images
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {productImagePaths(selected.profile.product_images).map((path) => (
                        <AdminMediaView key={path} path={path} alt="Product" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  variant="outline"
                  onClick={() => void handleDecision("rejected")}
                  disabled={acting}
                  className="gap-1.5"
                >
                  {acting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={() => void handleDecision("verified")}
                  disabled={acting}
                  className="gap-1.5"
                >
                  {acting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Verify
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function StatusBadge({ status }: { status: SupplierStatus }) {
  if (status === "verified") {
    return (
      <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
        Verified
      </Badge>
    );
  }
  if (status === "rejected") {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  return <Badge variant="secondary">Pending</Badge>;
}
