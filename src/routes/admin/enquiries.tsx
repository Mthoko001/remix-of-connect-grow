import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, ImageIcon, Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
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
import { fetchAllEnquiries, type AdminEnquiryRow } from "@/lib/admin-enquiries";
import { getEnquiryImageUrl, markEnquiryStatus, type EnquiryStatus } from "@/lib/enquiries";

export const Route = createFileRoute("/admin/enquiries")({
  head: () => ({
    meta: [{ title: "Enquiries — LeadLink Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminEnquiriesPage,
});

const TABS: { value: "all" | EnquiryStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
];

function AdminEnquiriesPage() {
  const { email, checking } = useAdminSession();
  const [rows, setRows] = useState<AdminEnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | EnquiryStatus>("all");
  const [selected, setSelected] = useState<AdminEnquiryRow | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  async function loadRows() {
    setLoading(true);
    try {
      setRows(await fetchAllEnquiries());
    } catch {
      toast.error("Couldn't load enquiries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checking) void loadRows();
  }, [checking]);

  useEffect(() => {
    setImageUrl(null);
    if (selected?.image_path) {
      void getEnquiryImageUrl(selected.image_path).then(setImageUrl);
    }
  }, [selected]);

  const filtered = useMemo(
    () => (tab === "all" ? rows : rows.filter((r) => r.status === tab)),
    [rows, tab],
  );

  const counts = useMemo(() => {
    const c: Record<"all" | EnquiryStatus, number> = {
      all: rows.length,
      new: 0,
      read: 0,
      replied: 0,
    };
    for (const r of rows) c[r.status as EnquiryStatus] += 1;
    return c;
  }, [rows]);

  async function handleOpen(row: AdminEnquiryRow) {
    setSelected(row);
    if (row.status === "new") {
      await markEnquiryStatus(row.enquiry_id, "read");
      setRows((prev) =>
        prev.map((r) => (r.enquiry_id === row.enquiry_id ? { ...r, status: "read" } : r)),
      );
    }
  }

  async function handleMarkReplied() {
    if (!selected) return;
    setActing(true);
    try {
      await markEnquiryStatus(selected.enquiry_id, "replied");
      setRows((prev) =>
        prev.map((r) => (r.enquiry_id === selected.enquiry_id ? { ...r, status: "replied" } : r)),
      );
      setSelected(null);
      toast.success("Marked as replied.");
    } catch {
      toast.error("Couldn't update this enquiry.");
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Enquiries</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Every customer enquiry across all suppliers, newest first.
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
        <p className="py-12 text-center text-sm text-muted-foreground">Loading enquiries…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm font-medium text-foreground">No enquiries here</p>
          <p className="mt-1 text-sm text-muted-foreground">Nothing matches this filter yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row) => (
                <tr key={row.enquiry_id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{row.customer_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.supplier_business_name || <span className="italic">Unknown</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="gap-1 text-xs font-normal">
                      <MessageCircle className="h-3 w-3" />
                      {row.channel === "whatsapp" ? "WhatsApp" : "In-app"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status as EnquiryStatus} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString([], {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => void handleOpen(row)}>
                      View
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
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
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

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Message
                  </p>
                  <p className="whitespace-pre-line text-sm text-foreground">{selected.message}</p>
                </div>

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
              </div>

              <DialogFooter>
                <Button
                  onClick={() => void handleMarkReplied()}
                  disabled={acting || selected.status === "replied"}
                  className="gap-1.5"
                >
                  {acting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {selected.status === "replied" ? "Already replied" : "Mark as replied"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function StatusBadge({ status }: { status: EnquiryStatus }) {
  if (status === "replied") {
    return (
      <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
        Replied
      </Badge>
    );
  }
  if (status === "read") {
    return <Badge variant="secondary">Read</Badge>;
  }
  return <Badge className="border-transparent bg-brand/10 text-brand hover:bg-brand/10">New</Badge>;
}
