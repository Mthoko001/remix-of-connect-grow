import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Loader2, Save, Sparkles, X } from "lucide-react";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { MonetizationKpiCards } from "@/components/admin/monetization-kpis";
import { AdminProfileViews } from "@/components/admin/profile-views-admin";
import { AdminMediaView } from "@/components/admin/admin-media-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { suggestBusinessDescription } from "@/lib/admin-description-ai.functions";
import {
  fetchSupplierReviewRows,
  notifySupplierOfDecision,
  productImagePaths,
  setSupplierProfileStatus,
  updateSupplierBusinessDescription,
  type SupplierReviewRow,
  type SupplierProfileStatus,
} from "@/lib/admin-review";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — GrowMeOnline" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDashboardPage,
});

type TabValue = "all" | SupplierProfileStatus;

const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending_verification", label: "Pending Review" },
  { value: "validated", label: "Validated" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
];

/** A row with no profile yet is treated as 'draft' for filtering/display. */
function rowStatus(row: SupplierReviewRow): SupplierProfileStatus {
  return row.profile?.status ?? "draft";
}

function AdminDashboardPage() {
  const { email, checking } = useAdminSession();
  const [rows, setRows] = useState<SupplierReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabValue>("pending_verification");
  const [selected, setSelected] = useState<SupplierReviewRow | null>(null);
  const [acting, setActing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [suggestedDescription, setSuggestedDescription] = useState("");
  const [suggestingDescription, setSuggestingDescription] = useState(false);

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
    () => (tab === "all" ? rows : rows.filter((r) => rowStatus(r) === tab)),
    [rows, tab],
  );

  const counts = useMemo(() => {
    const c: Record<TabValue, number> = {
      all: rows.length,
      draft: 0,
      pending_verification: 0,
      validated: 0,
      rejected: 0,
    };
    for (const r of rows) c[rowStatus(r)] += 1;
    return c;
  }, [rows]);

  function openRow(row: SupplierReviewRow) {
    setSelected(row);
    setRejecting(false);
    setRejectionReason("");
    setBusinessDescription(row.profile?.business_description ?? "");
    setSuggestedDescription("");
  }

  async function handleSuggestDescription() {
    const description = businessDescription.trim();
    if (!description) {
      toast.error("Add a business description before asking Gemini to improve it.");
      return;
    }

    setSuggestingDescription(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (error || !accessToken) {
        throw new Error("Your session has expired. Please sign in again.");
      }
      const suggestion = await suggestBusinessDescription({
        data: { accessToken, description },
      });
      setSuggestedDescription(suggestion);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't generate a description suggestion.",
      );
    } finally {
      setSuggestingDescription(false);
    }
  }

  async function handleSaveDescription() {
    if (!selected?.profile) return;
    setActing(true);
    try {
      const description = businessDescription.trim();
      await updateSupplierBusinessDescription(selected.supplier_account_id, description);
      const updatedRow: SupplierReviewRow = {
        ...selected,
        profile: { ...selected.profile, business_description: description || null },
      };
      setRows((current) =>
        current.map((row) =>
          row.supplier_account_id === selected.supplier_account_id ? updatedRow : row,
        ),
      );
      setSelected(updatedRow);
      toast.success("Business description saved.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? `Couldn't save description: ${err.message}`
          : "Couldn't save description.",
      );
    } finally {
      setActing(false);
    }
  }

  async function handleApprove() {
    if (!selected) return;
    setActing(true);
    try {
      await setSupplierProfileStatus(selected.supplier_account_id, "validated");
      toast.success("Supplier validated.");
      setSelected(null);
      await loadRows();
      const { sent } = await notifySupplierOfDecision({ supplierAccountId: selected.supplier_account_id });
      if (!sent) {
        toast.warning("Supplier validated, but the notification email couldn't be sent.");
      }
    } catch {
      toast.error("Couldn't update this supplier. Try again.");
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (!selected) return;
    if (!rejectionReason.trim()) {
      toast.error("Add a reason so the supplier knows what to fix.");
      return;
    }
    setActing(true);
    try {
      await setSupplierProfileStatus(selected.supplier_account_id, "rejected", rejectionReason);
      toast.success("Supplier rejected.");
      setSelected(null);
      await loadRows();
      const { sent } = await notifySupplierOfDecision({ supplierAccountId: selected.supplier_account_id });
      if (!sent) {
        toast.warning("Supplier rejected, but the notification email couldn't be sent.");
      }
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

      <MonetizationKpiCards />
      <AdminProfileViews />

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="mb-5">
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
            {tab === "pending_verification"
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
                    <StatusBadge status={rowStatus(row)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRow(row)}
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
                  <div className="flex justify-center">
                    <AdminMediaView
                      path={selected.profile.business_logo}
                      alt="Business logo"
                      variant="logo"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label
                    htmlFor="business_description"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Business Description
                  </Label>
                  <Textarea
                    id="business_description"
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="Describe the supplier's services, experience, and what makes their business stand out."
                    maxLength={1000}
                    className="min-h-[120px]"
                    disabled={acting || suggestingDescription}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      This appears on the public listing. The description is sent to Gemini for a
                      suggestion; review it before applying.
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {businessDescription.length}/1000
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleSuggestDescription()}
                    disabled={acting || suggestingDescription || !businessDescription.trim()}
                    className="mt-2 gap-1.5"
                  >
                    {suggestingDescription ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {suggestingDescription ? "Generating…" : "Improve with Gemini"}
                  </Button>

                  {suggestedDescription && (
                    <div className="space-y-3 rounded-lg border border-brand/20 bg-brand/5 p-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Suggested description
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                          {suggestedDescription}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setBusinessDescription(suggestedDescription);
                            setSuggestedDescription("");
                          }}
                          disabled={acting || suggestingDescription}
                        >
                          Use Suggestion
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSuggestedDescription("")}
                          disabled={acting || suggestingDescription}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleSaveDescription()}
                    disabled={
                      acting ||
                      businessDescription === (selected.profile.business_description ?? "")
                    }
                    className="mt-2 gap-1.5"
                  >
                    {acting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Description
                  </Button>
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

                {selected.profile.status === "rejected" && selected.profile.rejection_reason && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-destructive">
                      Previous rejection reason
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {selected.profile.rejection_reason}
                    </p>
                  </div>
                )}

                {rejecting && (
                  <div className="space-y-1.5">
                    <Label htmlFor="rejection_reason">Reason for rejection</Label>
                    <Textarea
                      id="rejection_reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Let the supplier know what to fix, e.g. missing product photos or an incomplete description."
                      className="min-h-[80px]"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                {rejecting ? (
                  <>
                    <Button variant="ghost" onClick={() => setRejecting(false)} disabled={acting}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => void handleReject()}
                      disabled={acting}
                      className="gap-1.5"
                    >
                      {acting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      Confirm Reject
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setRejecting(true)}
                      disabled={acting}
                      className="gap-1.5"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => void handleApprove()}
                      disabled={acting}
                      className="gap-1.5"
                    >
                      {acting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Validate
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function StatusBadge({ status }: { status: SupplierProfileStatus }) {
  if (status === "validated") {
    return (
      <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
        Validated
      </Badge>
    );
  }
  if (status === "rejected") {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  if (status === "pending_verification") {
    return (
      <Badge className="border-transparent bg-brand/10 text-brand hover:bg-brand/10">
        Pending Review
      </Badge>
    );
  }
  return <Badge variant="secondary">Draft</Badge>;
}
