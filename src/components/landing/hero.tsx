// Placeholder CTAs use plain <a href> because the target route files
// (/supplier/signup, /search) are not built yet — avoids TanStack type-safe
// link errors. Swap to <Link> when the routes exist.

const HERO_LISTINGS = [
  { initials: "BS", name: "Bright Solar Solutions", category: "Solar & Energy", location: "Cape Town" },
  { initials: "AP", name: "Apex Plumbing Co.", category: "Plumbing", location: "Johannesburg" },
  { initials: "LE", name: "Lumen Electrical", category: "Electrical", location: "Durban" },
];

function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-verified/10 px-2 py-0.5 text-xs font-semibold text-verified ${className}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m9 12 2 2 4-4" />
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      </svg>
      Verified
    </span>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-brand/20 via-brand-glow/10 to-transparent blur-2xl" />
      <div className="rounded-2xl border border-border bg-card p-3 shadow-2xl shadow-brand/10">
        {/* browser-style top bar */}
        <div className="flex items-center gap-2 border-b border-border px-2 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <div className="ml-3 flex h-8 flex-1 items-center gap-2 rounded-lg bg-muted px-3 text-xs text-muted-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Search verified suppliers…
          </div>
        </div>

        {/* listing rows */}
        <div className="space-y-2.5 p-2">
          {HERO_LISTINGS.map((row) => (
            <div
              key={row.name}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-glow text-sm font-bold text-brand-foreground">
                {row.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{row.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {row.category} · {row.location}
                </p>
              </div>
              <VerifiedBadge />
            </div>
          ))}
        </div>
      </div>

      {/* floating enquiry badge */}
      <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-border bg-card p-3 shadow-xl sm:block">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-verified/15 text-verified">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">New enquiry received</p>
            <p className="text-[11px] text-muted-foreground">via WhatsApp · just now</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand/5 via-background to-background" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:py-24 lg:px-8">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-verified" />
            Trusted local suppliers, verified by LeadLink
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Find trusted local suppliers for your next project
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            LeadLink connects customers directly with verified businesses — no
            middlemen, no guesswork. Compare trusted suppliers and reach out
            instantly via WhatsApp or in-app chat.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/supplier/signup"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand to-brand-glow px-6 py-3.5 text-base font-semibold text-brand-foreground shadow-xl shadow-brand/25 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-brand/30"
            >
              List My Business
            </a>
            <a
              href="/search"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-accent"
            >
              Find a Supplier
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-verified" aria-hidden="true">
                <path d="m9 12 2 2 4-4" />
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              Every supplier verified
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-verified" aria-hidden="true">
                <path d="m9 12 2 2 4-4" />
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              No middleman fees
            </div>
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
