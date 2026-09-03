type Supplier = {
  initials: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
};

const SUPPLIERS: Supplier[] = [
  { initials: "BS", name: "Bright Solar Solutions", category: "Solar & Energy", rating: 4.9, reviews: 128, location: "Cape Town" },
  { initials: "AP", name: "Apex Plumbing Co.", category: "Plumbing", rating: 4.8, reviews: 94, location: "Johannesburg" },
  { initials: "LE", name: "Lumen Electrical", category: "Electrical", rating: 4.9, reviews: 76, location: "Durban" },
  { initials: "GL", name: "GreenLeaf Landscaping", category: "Landscaping", rating: 4.7, reviews: 58, location: "Pretoria" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={i < Math.round(rating) ? "text-amber-500" : "text-border"}
          aria-hidden="true"
        >
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
        </svg>
      ))}
    </span>
  );
}

export function FeaturedListings() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">
              Featured Suppliers
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Trusted by customers across the country
            </h2>
          </div>
          <a
            href="/search"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            Browse all suppliers
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPLIERS.map((s) => (
            <a
              key={s.name}
              href="/search"
              className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/10"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-glow text-base font-bold text-brand-foreground">
                  {s.initials}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-verified/10 px-2 py-0.5 text-xs font-semibold text-verified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 12 2 2 4-4" />
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                  Verified
                </span>
              </div>

              <h3 className="mt-4 min-w-0 truncate text-base font-bold text-foreground">
                {s.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.category}</p>

              <div className="mt-3 flex items-center gap-1.5">
                <StarRating rating={s.rating} />
                <span className="text-sm font-semibold text-foreground">{s.rating}</span>
                <span className="text-xs text-muted-foreground">({s.reviews})</span>
              </div>

              <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {s.location}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
