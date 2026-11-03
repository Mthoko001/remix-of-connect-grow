import { Link } from "@tanstack/react-router";
import { Check, Search, ShieldCheck, Store } from "lucide-react";

const CUSTOMER_BENEFITS = [
  "Every supplier is verified by our team",
  "Browse by category and location",
  "Send an enquiry in under a minute",
];

const SUPPLIER_BENEFITS = [
  "Your first 5 qualified leads are free",
  "A trusted, verified public profile",
  "Manage enquiries from one dashboard",
];

export function AudienceCta({ verifiedCount }: { verifiedCount: number }) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            Built for both sides of the deal
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Whether you need a supplier or want more customers, start here
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            GrowMeOnline brings verified local businesses and ready-to-buy
            customers together — no fuss, no middleman.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Customers */}
          <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
              <Search className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand">
              Looking for a supplier?
            </p>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
              Find the right supplier, fast
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Browse verified local suppliers and service providers, compare
              profiles, and send one enquiry — no cold-calling.
            </p>
            <ul className="mt-6 space-y-3">
              {CUSTOMER_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-verified/15 text-verified">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-relaxed text-foreground">{benefit}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/suppliers"
                aria-label="Browse verified suppliers on GrowMeOnline"
                className="inline-flex w-full items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:w-auto"
              >
                Browse Suppliers
              </Link>
              <Link
                to="/suppliers"
                aria-label="Explore supplier categories"
                className="inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:w-auto"
              >
                Explore categories
              </Link>
            </div>
          </div>

          {/* Suppliers */}
          <div className="flex h-full flex-col rounded-3xl bg-brand p-8 shadow-2xl shadow-brand/25 transition-all hover:-translate-y-1 hover:shadow-brand/40 sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-glow/20 text-brand-glow">
              <Store className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand-glow">
              Own a business?
            </p>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
              Get found by customers who are ready to buy
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              Create a free profile, get verified, and receive qualified
              customer enquiries in your dashboard.
            </p>
            <ul className="mt-6 space-y-3">
              {SUPPLIER_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-glow text-brand">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-relaxed text-white">{benefit}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/supplier/signup"
                aria-label="List your business on GrowMeOnline"
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand sm:w-auto"
              >
                List My Business
              </Link>
              <Link
                to="/pricing"
                aria-label="See GrowMeOnline pricing"
                className="inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand sm:w-auto"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-center">
          <ShieldCheck className="h-4 w-4 shrink-0 text-verified" aria-hidden="true" />
          <p className="text-sm font-medium text-muted-foreground">
            Join {verifiedCount}+ verified suppliers already on GrowMeOnline
          </p>
        </div>
      </div>
    </section>
  );
}
