import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
} from "@/lib/supplier-profile";

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

  useEffect(() => {
    let active = true;
    fetchMyProfile()
      .then((row) => {
        if (active) setCompleteFields(countCompleteFields(toDraft(row)));
      })
      .catch(() => {
        if (active) setCompleteFields(0);
      });
    return () => {
      active = false;
    };
  }, []);

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

      {profileComplete ? (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Your business profile is complete
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              It's now ready for review. We'll notify you once you're verified.
            </p>
          </div>
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
        <MetricCard label="Enquiries" value="0" />
        <MetricCard label="Conversion Rate" value="—" />
        <MetricCard label="Subscription Status" value="Unpaid" />
      </div>

      <Panel title="Recent enquiries" className="mt-6">
        <EmptyState
          title="No enquiries yet"
          description="When customers reach out, they'll show up here."
        />
      </Panel>
    </DashboardShell>
  );
}
