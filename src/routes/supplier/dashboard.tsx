import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { useSupplierSession } from "@/hooks/use-supplier-session";
import {
  DashboardShell,
  EmptyState,
  MetricCard,
  PageHeader,
  Panel,
} from "@/components/supplier/dashboard-shell";
import {
  countCompleteFields,
  fetchMyProfile,
  toDraft,
  TOTAL_TRACKED_FIELDS,
  type SupplierProfileStatus,
} from "@/lib/supplier-profile";
import { fetchMyEnquiries, type EnquiryRow } from "@/lib/enquiries";

export const Route = createFileRoute("/supplier/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: SupplierDashboardPage,
});

function SupplierDashboardPage() {
  const navigate = useNavigate();
  const { email, checking } = useSupplierSession();
  const [completeFields, setCompleteFields] = useState<number | null>(null);
  const [status, setStatus] = useState<SupplierProfileStatus | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);

  useEffect(() => {
    if (checking) return;
    let active = true;
    fetchMyProfile()
      .then((row) => {
        if (!active) return;
        setCompleteFields(countCompleteFields(toDraft(row)));
        setStatus((row?.status as SupplierProfileStatus) ?? "draft");
      })
      .catch(() => {
        if (!active) return;
        setCompleteFields(0);
        setStatus("draft");
      });
    fetchMyEnquiries()
      .then((rows) => {
        if (active) setEnquiries(rows);
      })
      .catch(() => {
        if (active) setEnquiries([]);
      });
    return () => {
      active = false;
    };
  }, [checking]);

  const profileComplete = completeFields === TOTAL_TRACKED_FIELDS;

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        title={`Welcome back${email ? `, ${email}` : ""}`}
        subtitle="Here's what's happening with your business on LeadLink."
      />

      {status === "validated" ? (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Your business profile is verified
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You're all set — head to Subscription to activate your plan.
            </p>
          </div>
        </div>
      ) : status === "rejected" ? (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-foreground">Your profile wasn't approved</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Please review and update your business profile, then we'll take another look.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/supplier/profile" })}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted/60 active:scale-[0.99]"
          >
            Update profile
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : status === "pending_verification" ? (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-5 sm:p-6">
          <Clock className="h-5 w-5 shrink-0 text-brand" />
          <div>
            <p className="text-sm font-semibold text-foreground">Submitted for review</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We're reviewing your business profile — we'll notify you once you're verified.
            </p>
          </div>
        </div>
      ) : profileComplete ? (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Your business profile is complete
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Submit it for review from your Business Profile page to get verified.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/supplier/profile" })}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand to-brand-glow px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:shadow-brand/40 hover:brightness-105 active:scale-[0.99]"
          >
            Go to Business Profile
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-brand/20 bg-brand/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Complete your business profile to get verified
              {completeFields !== null && ` (${completeFields}/${TOTAL_TRACKED_FIELDS})`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified suppliers get a badge and appear higher in search results.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/supplier/profile" })}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand to-brand-glow px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:shadow-brand/40 hover:brightness-105 active:scale-[0.99]"
          >
            Complete profile
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Profile Views" value="0" />
        <MetricCard label="Enquiries" value={String(enquiries.length)} />
        <MetricCard label="Conversion Rate" value="—" />
        <MetricCard label="Subscription Status" value="Unpaid" />
      </div>

      <Panel title="Recent enquiries" className="mt-6">
        {enquiries.length === 0 ? (
          <EmptyState
            title="No enquiries yet"
            description="When customers reach out, they'll show up here."
          />
        ) : (
          <div className="divide-y divide-border">
            {enquiries.slice(0, 5).map((enquiry) => (
              <div
                key={enquiry.enquiry_id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {enquiry.customer_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{enquiry.message}</p>
                </div>
                <span className="shrink-0 pl-3 text-xs text-muted-foreground">
                  {new Date(enquiry.created_at).toLocaleDateString([], {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </DashboardShell>
  );
}
