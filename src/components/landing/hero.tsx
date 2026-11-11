import { Link } from "@tanstack/react-router";
import type { SupplierListing } from "@/lib/supplier-listing";
import heroIllustration from "@/assets/hero-illustration.png.asset.json";

const TRUST = ["Verified Suppliers", "Qualified Enquiries", "South African Businesses", "First 5 Leads Free"];

// liveSuppliers kept for API compatibility with the homepage loader.
export function Hero(_props: { liveSuppliers?: SupplierListing[] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand/5 via-background to-background" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 lg:py-16 lg:px-8 [&>*]:min-w-0">
        <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[3rem]">
            Find <span className="text-brand">Trusted Suppliers</span>. Get{" "}
            <span className="text-brand">More Customers</span>. Grow Online.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Find reliable suppliers with confidence, or showcase your business and receive
            qualified customer enquiries. All on one trusted platform.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/suppliers"
              className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-brand-foreground shadow-xl shadow-brand/25 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-brand/30"
            >
              Find a Supplier
            </Link>
            <Link
              to="/supplier/signup"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-accent"
            >
              List My Business
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground sm:grid-cols-2">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-verified" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-in fade-in duration-1000">
          <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-brand/10 transition-transform duration-300 hover:-translate-y-1 hover:shadow-brand/20">
            <img
              src={heroIllustration.url}
              alt="GrowMeOnline connecting trusted suppliers with customers across South Africa"
              width={1536}
              height={777}
              className="h-auto w-full rounded-xl object-contain"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
