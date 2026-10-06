import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ImageIcon, Mail, MessageCircle, Phone } from "lucide-react";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import {
  DashboardShell,
  EmptyState,
  PageHeader,
  Panel,
} from "@/components/supplier/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { leadStatusLabel } from "@/lib/lead-review";
import {
  fetchMyEnquiries,
  getEnquiryImageUrl,
  markEnquiryStatus,
  type EnquiryRow,
} from "@/lib/enquiries";

export const Route = createFileRoute("/supplier/enquiries")({
  head: () => ({
    meta: [{ title: "Enquiries — GrowMeOnline" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierEnquiriesPage,
});

function SupplierEnquiriesPage() {
  const { checking } = useSupplierSession();
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checking) return;
    fetchMyEnquiries()
      .then(setEnquiries)
      .catch(() => setEnquiries([]))
      .finally(() => setLoading(false));
  }, [checking]);

  async function handleStatus(enquiry: EnquiryRow, status: "in_progress" | "closed") {
    try {
      await markEnquiryStatus(enquiry.enquiry_id, status);
      setEnquiries((prev) =>
        prev.map((e) => (e.enquiry_id === enquiry.enquiry_id ? { ...e, status } : e)),
      );
    } catch {
      toast.error("Couldn't update this lead.");
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
    <DashboardShell>
      <PageHeader
        title="Enquiries"
        subtitle="Qualified leads: customer enquiries reviewed by our team and released to you."
      />

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading enquiries…</p>
      ) : enquiries.length === 0 ? (
        <Panel>
          <EmptyState
            title="No qualified leads yet"
            description="Customer enquiries appear here once our team has reviewed and approved them."
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <EnquiryCard key={enquiry.enquiry_id} enquiry={enquiry} onStatus={handleStatus} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

function EnquiryCard({
  enquiry,
  onStatus,
}: {
  enquiry: EnquiryRow;
  onStatus: (enquiry: EnquiryRow, status: "in_progress" | "closed") => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (enquiry.image_path) {
      void getEnquiryImageUrl(enquiry.image_path).then(setImageUrl);
    }
  }, [enquiry.image_path]);

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{enquiry.customer_name}</p>
            <Badge
              className={
                enquiry.status === "qualified"
                  ? "border-transparent bg-brand/10 text-brand hover:bg-brand/10"
                  : undefined
              }
              variant={enquiry.status === "qualified" ? "default" : "secondary"}
            >
              {leadStatusLabel(enquiry.status)}
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs font-normal">
              <MessageCircle className="h-3 w-3" />
              {enquiry.channel === "whatsapp" ? "WhatsApp" : "In-app"}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {enquiry.customer_email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {enquiry.customer_cell}
            </span>
          </div>
          {enquiry.subject && <p className="mt-2 text-sm font-semibold text-foreground">{enquiry.subject}</p>}
          <p className="mt-2 whitespace-pre-line text-sm text-foreground">{enquiry.message}</p>
          {imageUrl && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              View attached photo
            </a>
          )}
          {enquiry.status !== "closed" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {enquiry.status === "qualified" && (
                <Button size="sm" onClick={() => onStatus(enquiry, "in_progress")}>
                  Start working
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => onStatus(enquiry, "closed")}>
                Mark closed
              </Button>
            </div>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {new Date(enquiry.created_at).toLocaleDateString([], {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </section>
  );
}
