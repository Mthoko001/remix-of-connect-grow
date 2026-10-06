import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Calculator,
  HardHat,
  Laptop,
  Leaf,
  Megaphone,
  Scale,
  ShoppingBag,
  Sparkles,
  Store,
  Sun,
  Tractor,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { fetchAllCategories, type CategoryRow } from "@/lib/categories";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Construction: HardHat,
  "IT Services": Laptop,
  Marketing: Megaphone,
  Accounting: Calculator,
  Legal: Scale,
  Agriculture: Tractor,
  Farming: Tractor,
  Retail: ShoppingBag,
  Cleaning: Sparkles,
  "Solar & Energy": Sun,
  Landscaping: Leaf,
};

const MAX_CATEGORIES = 10;

/** Live business categories from the database, shown as clickable cards. */
export function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    fetchAllCategories()
      .then((flat) => setCategories(flat.filter((c) => !c.parent_category_id)))
      .catch(() => setCategories([]));
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">
              Categories
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Find the right business for the job
            </h2>
          </div>
          <Link
            to="/suppliers"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            Browse all suppliers
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.slice(0, MAX_CATEGORIES).map((c) => {
            const Icon = CATEGORY_ICONS[c.name] ?? Store;
            return (
              <Link
                key={c.category_id}
                to="/suppliers"
                search={{ q: c.name }}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-foreground">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
