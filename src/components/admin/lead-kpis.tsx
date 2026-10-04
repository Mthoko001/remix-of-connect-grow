import { useEffect, useState } from "react";
import { fetchAdminLeadKpis, type AdminLeadKpis } from "@/lib/lead-review";

/** Lead qualification KPI cards for the admin dashboard. */
export function LeadKpiCards() {
  const [kpis, setKpis] = useState<AdminLeadKpis | null>(null);

  useEffect(() => {
    let active = true;
    fetchAdminLeadKpis()
      .then((k) => active && setKpis(k))
      .catch(() => active && setKpis(null));
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: "Pending Review Leads", value: kpis ? String(kpis.pendingReview) : "—" },
    { label: "Qualified Leads", value: kpis ? String(kpis.qualified) : "—" },
    { label: "Rejected Leads", value: kpis ? String(kpis.rejected) : "—" },
    { label: "Total Leads Submitted", value: kpis ? String(kpis.total) : "—" },
    {
      label: "Lead Qualification Rate",
      value: kpis?.qualificationRate != null ? `${(kpis.qualificationRate * 100).toFixed(1)}%` : "—",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {c.label}
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
