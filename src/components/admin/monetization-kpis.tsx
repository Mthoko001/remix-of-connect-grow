import { useEffect, useState } from "react";
import {
  computeMonetizationKpis,
  fetchAdminMonetization,
  type MonetizationKpis,
} from "@/lib/lead-quota";

/** Supplier monetization KPI cards for the admin dashboard. */
export function MonetizationKpiCards() {
  const [kpis, setKpis] = useState<MonetizationKpis | null>(null);

  useEffect(() => {
    let active = true;
    fetchAdminMonetization()
      .then((rows) => active && setKpis(computeMonetizationKpis(rows)))
      .catch(() => active && setKpis(null));
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: "Suppliers on Free Plan", value: kpis ? String(kpis.freePlan) : "—" },
    { label: "Quota Reached", value: kpis ? String(kpis.quotaReached) : "—" },
    { label: "Subscribed Suppliers", value: kpis ? String(kpis.subscribed) : "—" },
    {
      label: "Conversion Rate",
      value:
        kpis?.conversionRate != null ? `${(kpis.conversionRate * 100).toFixed(1)}%` : "—",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
