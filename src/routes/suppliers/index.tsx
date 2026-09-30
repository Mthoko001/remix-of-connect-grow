import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  Flame,
  Leaf,
  PaintBucket,
  Refrigerator,
  Search,
  Sun,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { SupplierRow } from "@/components/customer/supplier-row";
import { SupplierCard } from "@/components/customer/supplier-card";
import { fetchPublicSuppliers } from "@/lib/public-suppliers.functions";
import { getFeaturedSuppliers, groupSuppliersByCategory } from "@/lib/supplier-listing";

export const Route = createFileRoute("/suppliers/")({
  loader: () => fetchPublicSuppliers(),
  validateSearch: z.object({
    q: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Browse Suppliers — GrowMeOnline" },
      {
        name: "description",
        content: "Browse verified suppliers on GrowMeOnline, organized by category.",
      },
    ],
  }),
  component: SuppliersListingPage,
});

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Solar & Energy": Sun,
  Plumbing: Wrench,
  Electrical: Zap,
  Landscaping: Leaf,
  "Appliance Repair": Refrigerator,
  "Painting & Renovations": PaintBucket,
};

function SuppliersListingPage() {
  const liveSuppliers = Route.useLoaderData();
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  useEffect(() => {
    if (q !== undefined) setQuery(q);
  }, [q]);
  const suppliers = liveSuppliers;
  const featured = useMemo(() => getFeaturedSuppliers(6, suppliers), [suppliers]);
  const categoryRows = useMemo(() => groupSuppliersByCategory(suppliers), [suppliers]);

  const trimmedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!trimmedQuery) return [];
    return suppliers.filter(
      (s) =>
        s.verified &&
        (s.name.toLowerCase().includes(trimmedQuery) ||
          s.category.toLowerCase().includes(trimmedQuery) ||
          s.location.toLowerCase().includes(trimmedQuery)),
    );
  }, [suppliers, trimmedQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Browse Suppliers
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Find verified local suppliers, organized by category.
          </p>

          <div className="relative mt-5 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category, or city…"
              className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            />
          </div>
        </div>

        {suppliers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <p className="text-sm font-medium text-foreground">No verified suppliers yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Suppliers appear here as soon as GrowMeOnline verifies them.
            </p>
          </div>
        ) : trimmedQuery ? (
          searchResults.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm font-medium text-foreground">No suppliers found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different name, category, or city.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {searchResults.map((s) => (
                <SupplierCard key={s.slug} supplier={s} />
              ))}
            </div>
          )
        ) : (
          <>
            <SupplierRow title="Featured Suppliers" icon={Flame} suppliers={featured} />
            {categoryRows.map(({ category, suppliers }) => (
              <SupplierRow
                key={category}
                title={category}
                icon={CATEGORY_ICONS[category]}
                suppliers={suppliers}
              />
            ))}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
