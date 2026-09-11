import { Link } from "@tanstack/react-router";
import { MapPin, ShieldCheck, Star } from "lucide-react";
import type { MockSupplier } from "@/lib/mock-suppliers";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "fill-amber-500 text-amber-500" : "text-border"}`}
        />
      ))}
    </span>
  );
}

/** A single supplier card, sized for both horizontal rows and flat grids. */
export function SupplierCard({ supplier }: { supplier: MockSupplier }) {
  return (
    <Link
      to="/suppliers/$slug"
      params={{ slug: supplier.slug }}
      className="group flex h-full w-60 shrink-0 snap-start flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/10 sm:w-64"
    >
      <div className="flex items-center justify-between">
        <span
          className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${supplier.gradient} text-sm font-bold text-white`}
        >
          {supplier.initials}
        </span>
        {supplier.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-verified/10 px-2 py-0.5 text-[11px] font-semibold text-verified">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
        )}
      </div>

      <h3 className="mt-3 min-w-0 truncate text-sm font-bold text-foreground">{supplier.name}</h3>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{supplier.category}</p>

      <div className="mt-2 flex items-center gap-1.5">
        <StarRating rating={supplier.rating} />
        <span className="text-xs font-semibold text-foreground">{supplier.rating}</span>
        <span className="text-[11px] text-muted-foreground">({supplier.reviews})</span>
      </div>

      <div className="mt-3 flex items-center gap-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <MapPin className="h-3 w-3" />
        <span className="truncate">{supplier.location}</span>
      </div>
    </Link>
  );
}
