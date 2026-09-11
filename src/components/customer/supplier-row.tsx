import type { LucideIcon } from "lucide-react";
import { SupplierCard } from "@/components/customer/supplier-card";
import type { MockSupplier } from "@/lib/mock-suppliers";

export function SupplierRow({
  title,
  icon: Icon,
  suppliers,
}: {
  title: string;
  icon?: LucideIcon | undefined;
  suppliers: MockSupplier[];
}) {
  if (suppliers.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground sm:text-xl">
        {Icon && <Icon className="h-5 w-5 text-brand" />}
        {title}
      </h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {suppliers.map((s) => (
          <SupplierCard key={s.slug} supplier={s} />
        ))}
      </div>
    </section>
  );
}
