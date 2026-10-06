import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Info } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { MetricCard, Panel } from "@/components/supplier/dashboard-shell";
import {
  fetchMyProfileViewStats,
  monthOverMonth,
  type ProfileViewStats,
} from "@/lib/profile-views";

const HELP =
  "Profile views represent the number of times your public supplier profile has been viewed by potential customers.";

export function useProfileViewStats(enabled: boolean) {
  const [stats, setStats] = useState<ProfileViewStats | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetchMyProfileViewStats()
      .then((s) => active && setStats(s))
      .catch(() => active && setStats(null));
    return () => {
      active = false;
    };
  }, [enabled]);
  return stats;
}

export function ProfileViewMetrics({ stats }: { stats: ProfileViewStats | null }) {
  const v = (n?: number) => (stats ? String(n ?? 0) : "—");
  return (
    <div className="mt-6">
      <p className="mb-3 flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {HELP}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Total Profile Views" value={v(stats?.total)} />
        <MetricCard label="Views This Month" value={v(stats?.thisMonth)} />
        <MetricCard label="Views This Week" value={v(stats?.thisWeek)} />
      </div>
    </div>
  );
}

export function ProfileViewsChart({ stats }: { stats: ProfileViewStats | null }) {
  const [range, setRange] = useState<7 | 30>(7);
  const data = useMemo(
    () =>
      (stats?.daily ?? []).slice(-range).map((d) => ({
        label: new Date(d.day).toLocaleDateString([], { day: "numeric", month: "short" }),
        views: d.views,
      })),
    [stats, range],
  );

  const change = stats ? monthOverMonth(stats) : null;

  return (
    <Panel className="mt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Profile Performance</h2>
        <div className="inline-flex rounded-lg border border-border p-0.5 text-xs">
          {([7, 30] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-md px-3 py-1.5 font-medium ${
                range === r ? "bg-brand/10 text-brand" : "text-muted-foreground"
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </div>
      {stats && (
        <div className="mb-4 space-y-1 text-sm text-foreground">
          <p>
            Your profile was viewed {stats.thisMonth} {stats.thisMonth === 1 ? "time" : "times"} this
            month.
          </p>
          {change !== null && (
            <p className="text-muted-foreground">
              Profile views {change >= 0 ? "increased" : "decreased"} by {Math.abs(change)}%
              compared to last month.
            </p>
          )}
        </div>
      )}
      <ChartContainer
        config={{ views: { label: "Views", color: "var(--brand)" } }}
        className="h-56 w-full"
      >
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="views" fill="var(--color-views)" radius={4} />
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}
