import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ImageIcon, Mail, MessageCircle, Phone } from "lucide-react";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import {
  DashboardShell,
  EmptyState,
  PageHeader,
  Panel,
} from "@/components/supplier/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import {
  fetchMyEnquiries,
  getEnquiryImageUrl,
  markEnquiryStatus,
  type EnquiryRow,
} from "@/lib/enquiries";

export const Route = createFileRoute("/supplier/enquiries")({
  head: () => ({
    meta: [{ title: "Enquiries — LeadLink" }, { name: "robots", content: "noindex" }],
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

  async function handleOpen(enquiry: EnquiryRow) {
    if (enquiry.status === "new") {
      await markEnquiryStatus(enquiry.enquiry_id, "read");
      setEnquiries((prev) =>
        prev.map((e) => (e.enquiry_id === enquiry.enquiry_id ? { ...e, status: "read" } : e)),
      );
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
        subtitle="Messages from customers interested in your business."
      />

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading enquiries…</p>
      ) : enquiries.length === 0 ? (
        <Panel>
          <EmptyState
            title="No enquiries yet"
            description="Enquiries from customers will appear here once your profile goes live."
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <EnquiryCard key={enquiry.enquiry_id} enquiry={enquiry} onOpen={handleOpen} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

function EnquiryCard({
  enquiry,
  onOpen,
}: {
  enquiry: EnquiryRow;
  onOpen: (enquiry: EnquiryRow) => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (enquiry.image_path) {
      void getEnquiryImageUrl(enquiry.image_path).then(setImageUrl);
    }
  }, [enquiry.image_path]);

  return (
    <section
      className="cursor-pointer rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-colors hover:bg-muted/30 sm:p-6"
      onClick={() => onOpen(enquiry)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{enquiry.customer_name}</p>
            {enquiry.status === "new" && (
              <Badge className="border-transparent bg-brand/10 text-brand hover:bg-brand/10">
                New
              </Badge>
            )}
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
          <p className="mt-2 whitespace-pre-line text-sm text-foreground">{enquiry.message}</p>
          {imageUrl && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              View attached photo
            </a>
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
