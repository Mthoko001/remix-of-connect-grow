import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Store } from "lucide-react";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchAdminSuppliers,
  type AdminSupplierRow,
  type SupplierProfileStatus,
} from "@/lib/admin-review";
import {
  fetchAdminMonetization,
  FREE_ENQUIRY_LIMIT,
  type SupplierMonetization,
} from "@/lib/lead-quota";
import { MonetizationBadge } from "@/components/supplier/lead-status";

export const Route = createFileRoute("/admin/suppliers")({
  head: () => ({
    meta: [{ title: "Live Suppliers — LeadLink Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: LiveSuppliersPage,
});

type SupplierFilter = "all" | "paid" | "unpaid" | "rejected";

const FILTERS: { value: SupplierFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid & Live" },
  { value: "unpaid", label: "Validated but Unpaid" },
  { value: "rejected", label: "Rejected" },
];

function LiveSuppliersPage() {
  const { email, checking } = useAdminSession();
  const [rows, setRows] = useState<AdminSupplierRow[]>([]);
  const [monetization, setMonetization] = useState<Map<string, SupplierMonetization>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SupplierFilter>("all");
  const [search, setSearch] = useState("");

  async function loadRows() {
    setLoading(true);
    setError(null);
    try {
      const [supplierRows, monetizationRows] = await Promise.all([
        fetchAdminSuppliers(),
        fetchAdminMonetization(),
      ]);
      setRows(supplierRows);
      setMonetization(new Map(monetizationRows.map((m) => [m.supplierAccountId, m])));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load suppliers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checking) void loadRows();
  }, [checking]);

  const counts = useMemo<Record<SupplierFilter, number>>(
    () => ({
      all: rows.length,
      paid: rows.filter(
        (row) =>
          row.profile_status === "validated" && row.subscription?.subscription_status === "paid",
      ).length,
      unpaid: rows.filter(
        (row) =>
          row.profile_status === "validated" && row.subscription?.subscription_status !== "paid",
      ).length,
      rejected: rows.filter((row) => row.profile_status === "rejected").length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "paid" &&
          row.profile_status === "validated" &&
          row.subscription?.subscription_status === "paid") ||
        (filter === "unpaid" &&
          row.profile_status === "validated" &&
          row.subscription?.subscription_status !== "paid") ||
        (filter === "rejected" && row.profile_status === "rejected");
      const matchesSearch =
        !normalizedSearch ||
        row.business_name.toLowerCase().includes(normalizedSearch) ||
        row.email.toLowerCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [filter, rows, search]);

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <AdminShell email={email}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Live Suppliers
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Validated suppliers and their latest subscription status.
        </p>
      </div>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as SupplierFilter)}
        className="mb-5"
      >
        <TabsList className="h-auto flex-wrap">
          {FILTERS.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="gap-1.5">
              {item.label}
              <span className="text-xs text-muted-foreground">{counts[item.value]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search business or email"
          aria-label="Search suppliers by business name or email"
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading suppliers…</p>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">Couldn’t load suppliers</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button type="button" variant="outline" onClick={() => void loadRows()} className="mt-4">
            Try again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <Store className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {rows.length === 0 ? "No validated or rejected suppliers yet" : "No suppliers found"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length === 0
              ? "Suppliers will appear here after their profiles are reviewed."
              : "Try another filter or search term."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Supplier email</th>
                  <th className="px-4 py-3">Profile</th>
                  <th className="px-4 py-3">Subscription</th>
                  <th className="px-4 py-3">Total Enquiries</th>
                  <th className="px-4 py-3">Free Usage</th>
                  <th className="px-4 py-3">Monetization</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((row) => (
                  <tr key={row.supplier_account_id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{row.business_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
                    <td className="px-4 py-3">
                      <ProfileStatusBadge status={row.profile_status} />
                    </td>
                    <td className="px-4 py-3">
                      <SubscriptionStatus row={row} />
                    </td>
                    <MonetizationCells m={monetization.get(row.supplier_account_id)} />
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {new Date(row.account_created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function ProfileStatusBadge({ status }: { status: SupplierProfileStatus }) {
  if (status === "validated") {
    return (
      <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
        Validated
      </Badge>
    );
  }
  return <Badge variant="destructive">Rejected</Badge>;
}

function SubscriptionStatus({ row }: { row: AdminSupplierRow }) {
  if (!row.subscription) return <Badge variant="outline">No subscription</Badge>;
  if (row.subscription.subscription_status === "paid") {
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
          Paid
        </Badge>
        {row.subscription.is_test && <Badge variant="outline">Test</Badge>}
      </span>
    );
  }
  const label = row.subscription.subscription_status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
  return <Badge variant="secondary">{label}</Badge>;
}

function MonetizationCells({ m }: { m: SupplierMonetization | undefined }) {
  const total = m?.totalEnquiries ?? 0;
  return (
    <>
      <td className="px-4 py-3 text-foreground">{total}</td>
      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
        {m?.hasActiveSubscription
          ? "Active"
          : `${Math.min(total, FREE_ENQUIRY_LIMIT)}/${FREE_ENQUIRY_LIMIT}`}
      </td>
      <td className="px-4 py-3">
        <MonetizationBadge status={m?.status ?? "free_plan"} />
      </td>
    </>
  );
}
