import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Panel } from "@/components/supplier/dashboard-shell";
import { MONETIZATION_LABELS, type LeadStatus, type MonetizationStatus } from "@/lib/lead-quota";
import type { LeadSummary } from "@/lib/lead-review";

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
            You have reached your free qualified lead limit.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Activate a subscription to continue receiving qualified customer leads.
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

export function LeadGenerationStatusCard({
  leadStatus,
  summary,
}: {
  leadStatus: LeadStatus;
  summary?: LeadSummary | null;
}) {
  const pct = (leadStatus.freeUsed / leadStatus.freeLimit) * 100;
  return (
    <Panel title="Lead Generation Status" className="mt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">Status</span>
        <MonetizationBadge status={leadStatus.status} />
      </div>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Qualified leads received" value={String(leadStatus.totalEnquiries)} />
        <Stat
          label="Qualified Leads Used"
          value={`${leadStatus.freeUsed} / ${leadStatus.freeLimit}`}
        />
        <Stat
          label="Remaining Free Leads"
          value={leadStatus.hasActiveSubscription ? "Unlimited" : String(leadStatus.freeRemaining)}
        />
        <Stat
          label="Subscription"
          value={leadStatus.hasActiveSubscription ? "Active" : "Not active"}
        />
      </dl>
      <div className="mt-5">
        <Progress value={pct} aria-label="Qualified Leads Used" />
        <p className="mt-2 text-xs text-muted-foreground">
          {leadStatus.hasActiveSubscription
            ? "Your subscription is active — qualified leads are unlimited."
            : `${leadStatus.freeUsed} of ${leadStatus.freeLimit} first qualified leads used (free).`}
        </p>
      </div>
      {summary && (
        <div className="mt-5 border-t border-border/60 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lead status summary
          </p>
          <dl className="grid grid-cols-3 gap-4">
            <Stat label="Qualified" value={String(summary.qualified)} />
            <Stat label="In Progress" value={String(summary.inProgress)} />
            <Stat label="Closed" value={String(summary.closed)} />
          </dl>
        </div>
      )}
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
