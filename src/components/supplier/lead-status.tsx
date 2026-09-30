import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Panel } from "@/components/supplier/dashboard-shell";
import { MONETIZATION_LABELS, type LeadStatus, type MonetizationStatus } from "@/lib/lead-quota";

export function MonetizationBadge({ status }: { status: MonetizationStatus }) {
  const label = MONETIZATION_LABELS[status];
  if (status === "subscribed") {
    return (
      <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
        {label}
      </Badge>
    );
  }
  if (status === "quota_reached") return <Badge variant="destructive">{label}</Badge>;
  return <Badge variant="secondary">{label}</Badge>;
}

export function QuotaExhaustedBanner() {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Your free enquiry allowance has been used.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            You have already received 5 customer enquiries through LeadLink.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Activate your subscription to continue receiving new customer enquiries.
          </p>
        </div>
      </div>
      <Link
        to="/supplier/subscription"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand to-brand-glow px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:brightness-105"
      >
        Activate Subscription
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function LeadGenerationStatusCard({ leadStatus }: { leadStatus: LeadStatus }) {
  const pct = (leadStatus.freeUsed / leadStatus.freeLimit) * 100;
  return (
    <Panel title="Lead Generation Status" className="mt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">Status</span>
        <MonetizationBadge status={leadStatus.status} />
      </div>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total enquiries" value={String(leadStatus.totalEnquiries)} />
        <Stat
          label="Free enquiries used"
          value={`${leadStatus.freeUsed} / ${leadStatus.freeLimit}`}
        />
        <Stat
          label="Free remaining"
          value={leadStatus.hasActiveSubscription ? "Unlimited" : String(leadStatus.freeRemaining)}
        />
        <Stat
          label="Subscription"
          value={leadStatus.hasActiveSubscription ? "Active" : "Not active"}
        />
      </dl>
      <div className="mt-5">
        <Progress value={pct} aria-label="Free enquiries used" />
        <p className="mt-2 text-xs text-muted-foreground">
          {leadStatus.hasActiveSubscription
            ? "Your subscription is active — enquiries are unlimited."
            : `${leadStatus.freeUsed} of ${leadStatus.freeLimit} free enquiries used.`}
        </p>
      </div>
    </Panel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}
