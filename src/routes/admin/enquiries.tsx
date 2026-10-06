import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Archive, Check, ImageIcon, Loader2, Mail, Pencil, Phone, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllEnquiries, type AdminEnquiryRow } from "@/lib/admin-enquiries";
import { getEnquiryImageUrl } from "@/lib/enquiries";
import {
  REJECTION_REASONS,
  leadStatusLabel,
  rejectionReasonLabel,
  reviewEnquiry,
  archiveEnquiry,
  editEnquiry,
  fetchEnquiryAudit,
  type EnquiryAuditEntry,
  type LeadStatus,
  type RejectionReason,
} from "@/lib/lead-review";
import { sendLeadDecisionNotifications } from "@/lib/lead-emails.functions";

export const Route = createFileRoute("/admin/enquiries")({
  head: () => ({
    meta: [
      { title: "Lead Qualification Queue — GrowMeOnline Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLeadQueuePage,
});

type Tab = "all" | LeadStatus;

const TABS: { value: Tab; label: string }[] = [
  { value: "pending_review", label: "Pending Review" },
  { value: "qualified", label: "Qualified" },
  { value: "in_progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminLeadQueuePage() {
  const { email, checking } = useAdminSession();
  const [rows, setRows] = useState<AdminEnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending_review");
  const [selected, setSelected] = useState<AdminEnquiryRow | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState<RejectionReason | "">("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [audit, setAudit] = useState<EnquiryAuditEntry[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ customerName: "", customerEmail: "", customerCell: "", message: "", subject: "" });

  async function loadRows() {
    setLoading(true);
    try {
      setRows(await fetchAllEnquiries());
    } catch {
      toast.error("Couldn't load leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checking) void loadRows();
  }, [checking]);

  useEffect(() => {
    setImageUrl(null);
    setRejecting(false);
    setReason("");
    setNote("");
    setEditing(false);
    setAudit([]);
    if (selected) {
      setDraft({
        customerName: selected.customer_name,
        customerEmail: selected.customer_email,
        customerCell: selected.customer_cell,
        message: selected.message,
        subject: selected.subject ?? "",
      });
      void fetchEnquiryAudit(selected.enquiry_id).then(setAudit).catch(() => setAudit([]));
    }
    if (selected?.image_path) {
      void getEnquiryImageUrl(selected.image_path).then(setImageUrl);
    }
  }, [selected?.enquiry_id, selected?.image_path]);

  const filtered = useMemo(
    () => {
      const q = search.trim().toLowerCase();
      return rows.filter((r) => {
        if (tab !== "all" && r.status !== tab) return false;
        if (!q) return true;
        return [r.customer_name, r.customer_email, r.customer_cell, r.subject, r.message, r.supplier_business_name, r.supplier_category, r.supplier_location]
          .some((v) => v?.toLowerCase().includes(q));
      });
    },
    [rows, tab, search],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  async function handleDecision(decision: { approve: true } | { approve: false; reason: RejectionReason; note?: string }) {
    if (!selected) return;
    setActing(true);
    try {
      await reviewEnquiry(selected.enquiry_id, decision);
      // Notification emails are best-effort and never undo the decision.
      void sendLeadDecisionNotifications({ data: { enquiryId: selected.enquiry_id } }).catch(
        () => undefined,
      );
      toast.success(decision.approve ? "Lead approved and released to the supplier." : "Lead rejected.");
      setSelected(null);
      await loadRows();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't review this lead.");
    } finally {
      setActing(false);
    }
  }

  async function handleArchive() {
    if (!selected) return;
    setActing(true);
    try {
      await archiveEnquiry(selected.enquiry_id);
      toast.success("Enquiry archived.");
      setSelected(null);
      await loadRows();
    } catch {
      toast.error("Couldn't archive this enquiry.");
    } finally {
      setActing(false);
    }
  }

  async function handleSaveEdit() {
    if (!selected) return;
    if (!draft.customerName.trim() || !draft.customerEmail.trim() || !draft.customerCell.trim() || !draft.message.trim() || !draft.subject.trim()) {
      toast.error("All fields are required.");
      return;
    }
    setActing(true);
    try {
      await editEnquiry(selected.enquiry_id, draft);
      toast.success("Enquiry updated.");
      const fresh = await fetchAllEnquiries();
      setRows(fresh);
      setSelected(fresh.find((r) => r.enquiry_id === selected.enquiry_id) ?? null);
    } catch {
      toast.error("Couldn't save changes.");
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
          Lead Qualification Queue
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Review each customer enquiry before it is released to the supplier. Only approved leads
          count towards a supplier's free leads.
        </p>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer, supplier, message…"
          className="pl-9"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mb-5 overflow-x-auto">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
              {t.label}
              <span className="text-xs text-muted-foreground">{counts[t.value] ?? 0}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading leads…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm font-medium text-foreground">No leads here</p>
          <p className="mt-1 text-sm text-muted-foreground">Nothing matches this filter yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[1300px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date Submitted</th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone Number</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row) => (
                <tr key={row.enquiry_id} className="align-top hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDateTime(row.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{row.customer_name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.customer_email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{row.customer_cell}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.supplier_category ?? "—"}</td>
                  <td className="max-w-[160px] px-4 py-3 text-muted-foreground">
                    <p className="line-clamp-2">{row.supplier_location || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.supplier_business_name || <span className="italic">Unknown</span>}
                  </td>
                  <td className="max-w-[180px] px-4 py-3 font-medium text-foreground">
                    <p className="line-clamp-2">{row.subject || "—"}</p>
                  </td>
                  <td className="max-w-[220px] px-4 py-3 text-muted-foreground">
                    <p className="line-clamp-2">{row.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant={row.status === "pending_review" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelected(row)}
                    >
                      {row.status === "pending_review" ? "Review" : "View"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.customer_name}</DialogTitle>
                <DialogDescription>
                  Enquiry for {selected.supplier_business_name || "Unknown supplier"}
                  {selected.supplier_category ? ` · ${selected.supplier_category}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <StatusBadge status={selected.status} />
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {selected.customer_email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {selected.customer_cell}
                  </span>
                </div>

                {editing ? (
                  <div className="space-y-3 rounded-lg border border-border p-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit_name">Customer name</Label>
                      <Input id="edit_name" maxLength={100} value={draft.customerName} onChange={(e) => setDraft({ ...draft, customerName: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit_email">Email</Label>
                      <Input id="edit_email" type="email" maxLength={255} value={draft.customerEmail} onChange={(e) => setDraft({ ...draft, customerEmail: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit_cell">Contact number</Label>
                      <Input id="edit_cell" maxLength={30} value={draft.customerCell} onChange={(e) => setDraft({ ...draft, customerCell: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit_subject">Subject</Label>
                      <Input id="edit_subject" maxLength={120} value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit_msg">Message</Label>
                      <Textarea id="edit_msg" rows={4} maxLength={2000} value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={acting}>Cancel</Button>
                      <Button size="sm" onClick={() => void handleSaveEdit()} disabled={acting}>Save changes</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Message
                    </p>
                    <p className="text-sm font-semibold text-foreground">{selected.subject || "No subject"}</p>
                    <p className="whitespace-pre-line text-sm text-foreground">{selected.message}</p>
                  </div>
                )}

                {imageUrl && (
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                  >
                    <ImageIcon className="h-4 w-4" />
                    View attached photo
                  </a>
                )}

                <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
                  <p className="mb-2 font-medium uppercase tracking-wide text-muted-foreground">
                    Lead history
                  </p>
                  <dl className="space-y-1 text-muted-foreground">
                    <HistoryRow label="Submitted" value={formatDateTime(selected.created_at)} />
                    <HistoryRow
                      label="Reviewed"
                      value={selected.reviewed_at ? formatDateTime(selected.reviewed_at) : "Not yet"}
                    />
                    {selected.reviewed_at && (
                      <>
                        <HistoryRow label="Reviewed by" value={selected.reviewed_by_email ?? "System (legacy)"} />
                        <HistoryRow
                          label="Action"
                          value={selected.status === "rejected" ? "Rejected" : "Approved"}
                        />
                      </>
                    )}
                    {selected.rejection_reason && (
                      <HistoryRow label="Reason" value={rejectionReasonLabel(selected.rejection_reason)} />
                    )}
                    {selected.rejection_note && (
                      <HistoryRow label="Note" value={selected.rejection_note} />
                    )}
                  </dl>
                  {audit.length > 0 && (
                    <div className="mt-3 border-t border-border pt-2">
                      <p className="mb-1.5 font-medium uppercase tracking-wide text-muted-foreground">
                        Audit trail
                      </p>
                      <ul className="space-y-1.5">
                        {audit.map((a) => (
                          <li key={a.enquiry_audit_id} className="text-muted-foreground">
                            <span className="text-foreground">{formatDateTime(a.created_at)}</span> ·{" "}
                            {a.admin_email ?? "Unknown admin"} · <span className="capitalize">{a.action}</span> ·{" "}
                            {leadStatusLabel(a.original_status ?? "")} → {leadStatusLabel(a.new_status ?? "")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {selected.status === "pending_review" && rejecting && (
                  <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="reject_reason">Rejection reason (required)</Label>
                      <Select value={reason} onValueChange={(v) => setReason(v as RejectionReason)}>
                        <SelectTrigger id="reject_reason">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {REJECTION_REASONS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reject_note">Internal note (optional)</Label>
                      <Textarea
                        id="reject_note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={500}
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>

              {!editing && !rejecting && (
                <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditing(true)} disabled={acting}>
                    <Pencil className="h-4 w-4" />
                    Edit Enquiry
                  </Button>
                  {selected.status !== "archived" && (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => void handleArchive()} disabled={acting}>
                      <Archive className="h-4 w-4" />
                      Archive Enquiry
                    </Button>
                  )}
                </div>
              )}

              {selected.status === "pending_review" && !editing && (
                <DialogFooter className="gap-2 sm:gap-2">
                  {rejecting ? (
                    <>
                      <Button variant="outline" onClick={() => setRejecting(false)} disabled={acting}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={!reason || acting}
                        onClick={() =>
                          reason && void handleDecision({ approve: false, reason, note })
                        }
                        className="gap-1.5"
                      >
                        {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        Confirm rejection
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setRejecting(true)} disabled={acting} className="gap-1.5">
                        <X className="h-4 w-4" />
                        Reject Lead
                      </Button>
                      <Button onClick={() => void handleDecision({ approve: true })} disabled={acting} className="gap-1.5">
                        {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve Lead
                      </Button>
                    </>
                  )}
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function HistoryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = leadStatusLabel(status);
  if (status === "qualified") {
    return (
      <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
        {label}
      </Badge>
    );
  }
  if (status === "rejected") return <Badge variant="destructive">{label}</Badge>;
  if (status === "pending_review") {
    return (
      <Badge className="border-transparent bg-amber-400/20 text-amber-700 hover:bg-amber-400/20 dark:text-amber-300">
        {label}
      </Badge>
    );
  }
  if (status === "archived") {
    return <Badge className="border-transparent bg-muted text-muted-foreground hover:bg-muted">{label}</Badge>;
  }
  return <Badge variant="secondary">{label}</Badge>;
}
