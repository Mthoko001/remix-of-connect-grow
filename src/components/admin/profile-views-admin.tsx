import { useEffect, useState } from "react";
import { fetchTopProfileViews, type TopViewedSupplier } from "@/lib/profile-views";

/** Admin: platform profile views and top 10 most viewed suppliers. */
export function AdminProfileViews() {
  const [data, setData] = useState<{ platformTotal: number; top: TopViewedSupplier[] } | null>(
    null,
  );
  useEffect(() => {
    let active = true;
    fetchTopProfileViews()
      .then((d) => active && setData(d))
      .catch(() => active && setData({ platformTotal: 0, top: [] }));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total Platform Profile Views
        </p>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {data ? data.platformTotal : "—"}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Top 10 Most Viewed Suppliers
        </p>
        {data && data.top.length === 0 ? (
          <p className="text-sm text-muted-foreground">No profile views yet.</p>
        ) : (
          <ol className="divide-y divide-border text-sm">
            {(data?.top ?? []).map((s, i) => (
              <li key={s.supplierAccountId} className="flex items-center justify-between py-2">
                <span className="min-w-0 truncate text-foreground">
                  {i + 1}. {s.businessName}
                </span>
                <span className="shrink-0 pl-3 text-muted-foreground">
                  {s.totalViews} total · {s.viewsThisMonth} this month
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
